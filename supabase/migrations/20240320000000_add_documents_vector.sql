-- Enable the pgvector extension to work with embedding vectors
create extension if not exists vector;

-- Create a table to store document embeddings
create table if not exists documents (
  id bigserial primary key,
  content text, -- The document text
  metadata jsonb, -- Metadata about the document
  embedding vector(1536) -- OpenAI embeddings are 1536 dimensions
);

-- Create a function to match documents based on embedding similarity
create or replace function match_documents (
  query_embedding vector(1536),
  match_count int DEFAULT 5
) returns table (
  id bigint,
  content text,
  metadata jsonb,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    id,
    content,
    metadata,
    1 - (documents.embedding <=> query_embedding) as similarity
  from documents
  order by documents.embedding <=> query_embedding
  limit match_count;
end;
$$; 