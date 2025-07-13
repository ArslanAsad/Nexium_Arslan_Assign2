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

interface SummaryResult {
  title: string;
  summary: string;
  summaryUrdu: string;
  fullText: string;
  url: string;
}

export default function BlogSummarizer() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4 pt-8">
          <h1 className="text-4xl font-bold text-gray-900">Blog Summarizer</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Enter a blog URL to automatically scrape, summarize, and translate
            content to Urdu
          </p>
        </div>
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
          <CardContent></CardContent>
        </Card>
        <div className="text-center text-sm text-gray-500 pb-8">
          Built with Next.js, Supabase, MongoDB, and ShadCN UI
        </div>
      </div>
    </div>
  );
}
