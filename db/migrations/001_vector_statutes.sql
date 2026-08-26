CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS statute_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter TEXT NOT NULL,
  chapter_name TEXT NOT NULL,
  act TEXT NOT NULL,
  act_name TEXT NOT NULL,
  section TEXT NOT NULL,
  title TEXT NOT NULL,
  text TEXT NOT NULL,
  source_url TEXT NOT NULL,
  content_hash TEXT NOT NULL UNIQUE,
  source_updated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS statute_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES statute_documents(id) ON DELETE CASCADE,
  chunk_index INTEGER NOT NULL,
  content TEXT NOT NULL,
  content_hash TEXT NOT NULL,
  embedding VECTOR(768) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (document_id, chunk_index)
);

CREATE INDEX IF NOT EXISTS statute_documents_chapter_idx ON statute_documents (chapter);
CREATE INDEX IF NOT EXISTS statute_documents_section_idx ON statute_documents (section);
CREATE INDEX IF NOT EXISTS statute_chunks_document_idx ON statute_chunks (document_id);
CREATE INDEX IF NOT EXISTS statute_chunks_embedding_idx
  ON statute_chunks USING hnsw (embedding vector_cosine_ops);