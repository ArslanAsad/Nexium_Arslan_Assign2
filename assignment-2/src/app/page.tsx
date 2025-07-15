"use client";

import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Loader2,
  Globe,
  FileText,
  Languages,
  Database,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { toast } from "sonner";

interface SummaryResult {
  title: string;
  summary: string;
  summaryUrdu: string;
  fullText: string;
  url: string;
}

export default function BlogSummarizer() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SummaryResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) {
      toast.error("Please enter a valid blog URL");
      return;
    }

    try {
      new URL(url);
    } catch {
      toast.error("Please enter a valid URL (including http:// or https://)");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/summarize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: url }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to process blog");
      }
      setResult(data);
      toast.success("Blog summarized and saved successfully!");
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to process the blog. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleTryExample = () => {
    setUrl("https://blog.vercel.com/what-is-next-js");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6 lg:p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-10">
        {/* Header */}
        <div className="text-center space-y-4 pt-8 pb-4">
          <h1 className="text-5xl font-extrabold text-gray-900 tracking-tight">
            Blog Summarizer
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Effortlessly scrape, summarize, and translate blog content to Urdu
            with AI.
          </p>
        </div>

        {/* Input Form */}
        <Card className="shadow-xl border-none rounded-xl overflow-hidden transition-all duration-300 hover:shadow-2xl">
          <CardHeader className="bg-gray-50 p-6 border-b border-gray-200">
            <CardTitle className="flex items-center gap-3 text-2xl font-bold text-gray-800">
              <Globe className="h-6 w-6 text-blue-600" />
              Enter Blog URL
            </CardTitle>
            <CardDescription className="text-gray-500 text-base mt-2">
              Paste the URL of the blog post you want to summarize. Works with
              most blog platforms.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-3">
                <Input
                  type="url"
                  placeholder="https://example.com/blog-post"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="flex-1 h-12 text-base px-4 rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200"
                  disabled={loading}
                />
                <Button
                  type="submit"
                  disabled={loading || !url.trim()}
                  className="h-12 px-6 text-base font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-all duration-200 ease-in-out transform hover:-translate-y-0.5"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                      Processing...
                    </>
                  ) : (
                    "Summarize"
                  )}
                </Button>
              </div>
              <div className="flex items-center gap-3 text-gray-500">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleTryExample}
                  disabled={loading}
                  className="h-10 px-4 text-sm rounded-lg border-gray-300 hover:bg-gray-100 transition-all duration-200 bg-transparent"
                >
                  Try Example
                </Button>
                <span className="text-sm">
                  or paste any blog URL to get started
                </span>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Processing Steps */}
        {loading && (
          <Card className="shadow-lg border-none rounded-xl animate-fade-in">
            <CardContent className="pt-6 pb-4">
              <div className="space-y-4 text-gray-700">
                <div className="flex items-center gap-3 animate-pulse-fast">
                  <Loader2 className="h-5 w-5 text-blue-600" />
                  <span>Fetching and parsing blog content...</span>
                </div>
                <div className="flex items-center gap-3 opacity-75 animate-pulse-slow">
                  <FileText className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-500">Generating summary...</span>
                </div>
                <div className="flex items-center gap-3 opacity-50 animate-pulse-slower">
                  <Languages className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-500">Translating to Urdu...</span>
                </div>
                <div className="flex items-center gap-3 opacity-25 animate-pulse-slowest">
                  <Database className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-500">Saving to databases...</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error Display */}
        {error && (
          <Alert
            variant="destructive"
            className="rounded-lg shadow-md animate-fade-in"
          >
            <AlertCircle className="h-5 w-5" />
            <AlertDescription className="text-base">{error}</AlertDescription>
          </Alert>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-6 animate-slide-up">
            <Alert className="rounded-lg shadow-md bg-green-50 border-green-200 text-green-800 animate-fade-in">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <AlertDescription className="text-base">
                Successfully processed and saved the blog content!
              </AlertDescription>
            </Alert>

            <Card className="shadow-xl border-none rounded-xl overflow-hidden transition-all duration-300 hover:shadow-2xl">
              <CardHeader className="bg-gray-50 p-6 border-b border-gray-200">
                <CardTitle className="flex items-center gap-3 text-2xl font-bold text-gray-800">
                  <FileText className="h-6 w-6 text-blue-600" />
                  {result.title}
                </CardTitle>
                <CardDescription className="text-gray-500 text-base mt-2">
                  <a
                    href={result.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline break-all transition-colors duration-200"
                  >
                    {result.url}
                  </a>
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-8">
                {/* English Summary */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Badge
                      variant="secondary"
                      className="px-3 py-1 text-sm rounded-full bg-blue-100 text-blue-700"
                    >
                      English Summary
                    </Badge>
                  </div>
                  <Textarea
                    value={result.summary}
                    readOnly
                    className="min-h-[150px] resize-y text-base p-4 rounded-lg border-gray-300 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                  />
                </div>

                <Separator className="bg-gray-200" />

                {/* Urdu Translation */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Badge
                      variant="outline"
                      className="px-3 py-1 text-sm rounded-full border-gray-300 text-gray-700"
                    >
                      اردو ترجمہ
                    </Badge>
                  </div>
                  <Textarea
                    value={result.summaryUrdu}
                    readOnly
                    className="min-h-[150px] resize-y text-base p-4 rounded-lg border-gray-300 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 text-right"
                    dir="rtl"
                  />
                </div>

                <Separator className="bg-gray-200" />

                {/* Content Preview */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Badge
                      variant="outline"
                      className="px-3 py-1 text-sm rounded-full border-gray-300 text-gray-700"
                    >
                      Content Preview
                    </Badge>
                    <span className="text-sm text-gray-500">
                      ({result.fullText.length} characters)
                    </span>
                  </div>
                  <Textarea
                    value={
                      result.fullText.substring(0, 500) +
                      (result.fullText.length > 500 ? "..." : "")
                    }
                    readOnly
                    className="min-h-[120px] resize-y text-sm p-4 rounded-lg border-gray-300 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                  />
                </div>

                <Separator className="bg-gray-200" />

                {/* Storage Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-600">
                  <div className="flex items-center gap-2 text-sm">
                    <Database className="h-4 w-4 text-gray-500" />
                    <span>Summary saved to Supabase</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Database className="h-4 w-4 text-gray-500" />
                    <span>Full text saved to MongoDB</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-sm text-gray-500 pb-8 pt-4">
          Built with Next.js, Supabase, MongoDB, and ShadCN UI • Real-time blog
          scraping with Cheerio
        </div>
      </div>
    </div>
  );
}
