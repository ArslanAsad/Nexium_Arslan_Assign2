-- create summaries table in supabase
CREATE TABLE IF NOT EXISTS summaries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  blog_url TEXT NOT NULL,
  title TEXT,
  summary TEXT NOT NULL,
  summary_urdu TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- create index for faster queries
CREATE INDEX IF NOT EXISTS idx_summaries_created_at ON summaries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_summaries_url ON summaries(blog_url);