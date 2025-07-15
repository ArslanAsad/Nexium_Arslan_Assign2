import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { MongoClient } from "mongodb";
import * as cheerio from "cheerio";

// Urdu dictionary file fetched from GitHub repo
import urduDictionary from "@/data/urdu-dictionary.json";

// initialize supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// initialize mongodb connection
const mongoClient = new MongoClient(process.env.MONGODB_URI!);

const translationDict: Record<string, string> = {};
urduDictionary.words.forEach((word) => {
  translationDict[word.englishWord.toLowerCase()] = word.targetWord;
});

// translate using dictionary
function translateToUrdu(text: string): string {
  const words = text.toLowerCase().split(/\s+/);
  const translatedWords = words.map((word) => {
    const punctuation = word.match(/[^\w]/g)?.join("") || "";
    const cleanWord = word.replace(/[^\w]/g, "");
    const translation = translationDict[cleanWord] || word;
    return translation + punctuation;
  });
  return translatedWords.join(" ");
}

// simulate blog scraping
// async function simulateBlogScraping(url: string) {
//   await new Promise((resolve) => setTimeout(resolve, 1000));
//   return {
//     title: "Understanding Modern Web Development",
//     content: `Modern web development has evolved significantly over the past decade.
//     With the rise of frameworks like React, Vue, and Angular, developers now have powerful tools
//     to create dynamic and interactive user interfaces. The introduction of server-side rendering
//     and static site generation has improved performance and SEO capabilities.

//     Cloud computing and serverless architectures have revolutionized how we deploy and scale applications.
//     Developers can now focus more on writing code rather than managing infrastructure.

//     The JavaScript ecosystem continues to grow with new libraries and tools being released regularly.
//     Package managers like npm and yarn have made it easier to manage dependencies and share code.

//     Mobile-first design and responsive web development have become standard practices as more users
//     access websites from mobile devices. Progressive Web Apps (PWAs) bridge the gap between web
//     and native mobile applications.

//     Security considerations have become more important than ever, with developers needing to
//     understand concepts like HTTPS, CORS, and content security policies.

//     The future of web development looks promising with emerging technologies like WebAssembly,
//     AI integration, and improved browser APIs continuing to push the boundaries of what's possible on the web.`,
//   };
// }

//blog scraping
async function scrapeBlogContent(url: string) {
  try {
    // Validate URL
    const urlObj = new URL(url);
    if (!["http:", "https:"].includes(urlObj.protocol)) {
      throw new Error("Invalid URL protocol");
    }

    // Fetch the webpage with proper headers
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "Accept-Encoding": "gzip, deflate",
        Connection: "keep-alive",
        "Upgrade-Insecure-Requests": "1",
      },
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Extract title from multiple possible sources
    let title =
      $("h1").first().text().trim() ||
      $("title").text().trim() ||
      $('meta[property="og:title"]').attr("content") ||
      $('meta[name="twitter:title"]').attr("content") ||
      "Untitled Article";

    // Clean up title
    title = title.replace(/\s+/g, " ").trim();

    // Try multiple content selectors in order of preference
    const contentSelectors = [
      // Common article selectors
      "article",
      '[role="main"]',
      ".post-content",
      ".entry-content",
      ".article-content",
      ".content",
      ".post-body",
      ".article-body",

      // Medium-specific
      ".section-content",

      // WordPress-specific
      ".entry",
      ".post",

      // Generic content areas
      "main",
      "#content",
      ".main-content",

      // Fallback to common containers
      ".container",
      "#main",
    ];

    let content = "";

    for (const selector of contentSelectors) {
      const element = $(selector).first();
      if (element.length > 0) {
        // Remove unwanted elements
        element
          .find(
            "script, style, nav, header, footer, aside, .sidebar, .navigation, .menu, .ads, .advertisement, .social-share, .comments, .related-posts"
          )
          .remove();

        // Get text content
        const textContent = element.text().trim();

        // Check if we found substantial content
        if (textContent.length > 200) {
          content = textContent;
          break;
        }
      }
    }

    // If no content found with selectors, try to extract from paragraphs
    if (!content || content.length < 200) {
      const paragraphs = $("p")
        .map((_, el) => $(el).text().trim())
        .get();
      content = paragraphs.filter((p) => p.length > 50).join(" ");
    }

    // Final fallback - get all text from body but clean it up
    if (!content || content.length < 200) {
      $("script, style, nav, header, footer, aside").remove();
      content = $("body").text().trim();
    }

    // Clean up the content
    content = content
      .replace(/\s+/g, " ") // Replace multiple whitespace with single space
      .replace(/\n+/g, " ") // Replace newlines with spaces
      .trim();

    // Validate content length
    if (content.length < 100) {
      throw new Error("Insufficient content found on the page");
    }

    // Limit content length to prevent overly long processing
    if (content.length > 10000) {
      content = content.substring(0, 10000) + "...";
    }

    return {
      title: title,
      content: content,
      url: url,
    };
  } catch (error) {
    console.error("Blog scraping error:", error);

    // Provide more specific error messages
    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new Error(
        "Unable to fetch the webpage. Please check the URL and try again."
      );
    } else if (error instanceof Error && error.name === "TimeoutError") {
      throw new Error("The webpage took too long to load. Please try again.");
    } else if (
      error instanceof Error &&
      error.message.includes("Invalid URL")
    ) {
      throw new Error("Please provide a valid HTTP or HTTPS URL.");
    } else {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      throw new Error(`Failed to scrape content: ${errorMessage}`);
    }
  }
}

// generate summary using static logic
function generateSummary(content: string): string {
  const sentences = content.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  if (sentences.length === 0) return "No content available for summarization.";
  const firstSentence = sentences[0]?.trim();
  const lastSentence = sentences[sentences.length - 1]?.trim();
  const longestSentence = sentences
    .reduce(
      (longest, current) =>
        current.length > longest.length ? current : longest,
      ""
    )
    .trim();
  const summaryParts = [firstSentence, longestSentence, lastSentence].filter(
    (sentence, index, array) =>
      sentence && array.indexOf(sentence) === index && sentence.length > 20
  );
  return summaryParts.join(". ") + ".";
}

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();
    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }
    const blogData = await scrapeBlogContent(url);
    const summary = generateSummary(blogData.content);
    const summaryUrdu = translateToUrdu(summary);

    const { data: supabaseData, error: supabaseError } = await supabase
      .from("summaries")
      .insert({
        blog_url: url,
        title: blogData.title,
        summary: summary,
        summary_urdu: summaryUrdu,
      })
      .select()
      .single();
    if (supabaseError) {
      console.error("Supabase error:", supabaseError);
      throw new Error("Failed to save summary to Supabase");
    }

    try {
      await mongoClient.connect();
      const db = mongoClient.db("blog_summarizer");
      const collection = db.collection("full_texts");
      await collection.insertOne({
        blog_url: url,
        title: blogData.title,
        full_text: blogData.content,
        summary_id: supabaseData.id,
        created_at: new Date(),
      });
    } catch (mongoError) {
      console.error("MongoDB error:", mongoError);
    } finally {
      await mongoClient.close();
    }

    return NextResponse.json({
      title: blogData.title,
      summary: summary,
      summaryUrdu: summaryUrdu,
      fullText: blogData.content,
      url: url,
    });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Failed to process blog" },
      { status: 500 }
    );
  }
}
