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
import { Loader2, Globe, FileText, Languages, Database } from "lucide-react";
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) {
      toast.error("Please enter a valid blog URL");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch("/api/summarize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      });
      if (!response.ok) {
        throw new Error("Failed to process blog");
      }
      const data = await response.json();
      setResult(data);
      toast.success("Blog summarized and saved successfully!");
    } catch (error) {
      toast.error("Failed to process the blog. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4 pt-8">
          <h1 className="text-4xl font-bold text-gray-900">Blog Summarizer</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Enter a blog URL to automatically scrape, summarize, and translate
            content to Urdu
          </p>
        </div>

        {/* Input Form */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Enter Blog URL
            </CardTitle>
            <CardDescription>
              Paste the URL of the blog post you want to summarize
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex gap-2">
                <Input
                  type="url"
                  placeholder="https://example.com/blog-post"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="flex-1"
                  disabled={loading}
                />
                <Button type="submit" disabled={loading || !url.trim()}>
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Processing...
                    </>
                  ) : (
                    "Summarize"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Processing Steps */}
        {loading && (
          <Card className="shadow-lg">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                  <span>Scraping blog content...</span>
                </div>
                <div className="flex items-center gap-3">
                  <FileText className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-500">Generating summary...</span>
                </div>
                <div className="flex items-center gap-3">
                  <Languages className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-500">Translating to Urdu...</span>
                </div>
                <div className="flex items-center gap-3">
                  <Database className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-500">Saving to databases...</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-6">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  {result.title}
                </CardTitle>
                <CardDescription>
                  <a
                    href={result.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {result.url}
                  </a>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* English Summary */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="secondary">English Summary</Badge>
                  </div>
                  <Textarea
                    value={result.summary}
                    readOnly
                    className="min-h-[120px] resize-none"
                  />
                </div>

                <Separator />

                {/* Urdu Translation */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="outline">اردو ترجمہ</Badge>
                  </div>
                  <Textarea
                    value={result.summaryUrdu}
                    readOnly
                    className="min-h-[120px] resize-none text-right"
                    dir="rtl"
                  />
                </div>

                <Separator />

                {/* Storage Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Database className="h-4 w-4" />
                    <span>Summary saved to Supabase</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Database className="h-4 w-4" />
                    <span>Full text saved to MongoDB</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-sm text-gray-500 pb-8">
          Built with Next.js, Supabase, MongoDB, and ShadCN UI
        </div>
      </div>
    </div>
  );
}
