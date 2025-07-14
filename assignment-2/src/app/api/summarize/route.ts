import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { MongoClient } from "mongodb";

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
async function simulateBlogScraping(url: string) {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return {
    title: "Understanding Modern Web Development",
    content: `Modern web development has evolved significantly over the past decade. 
    With the rise of frameworks like React, Vue, and Angular, developers now have powerful tools 
    to create dynamic and interactive user interfaces. The introduction of server-side rendering 
    and static site generation has improved performance and SEO capabilities. 
    
    Cloud computing and serverless architectures have revolutionized how we deploy and scale applications. 
    Developers can now focus more on writing code rather than managing infrastructure. 
    
    The JavaScript ecosystem continues to grow with new libraries and tools being released regularly. 
    Package managers like npm and yarn have made it easier to manage dependencies and share code. 
    
    Mobile-first design and responsive web development have become standard practices as more users 
    access websites from mobile devices. Progressive Web Apps (PWAs) bridge the gap between web 
    and native mobile applications.
    
    Security considerations have become more important than ever, with developers needing to 
    understand concepts like HTTPS, CORS, and content security policies. 
    
    The future of web development looks promising with emerging technologies like WebAssembly, 
    AI integration, and improved browser APIs continuing to push the boundaries of what's possible on the web.`,
  };
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
    const blogData = await simulateBlogScraping(url);
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
