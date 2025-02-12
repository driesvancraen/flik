-- Enable the pgvector extension to work with embedding vectors
create extension if not exists vector;

-- Create a table to store document embeddings
create table if not exists langchain_vectors (
  id uuid primary key default gen_random_uuid(),
  content text,
  metadata jsonb,
  embedding vector(1536)
);

-- Create a function to match documents based on embedding similarity
create or replace function match_documents (
  query_embedding vector(1536),
  match_count int DEFAULT 5,
  filter jsonb DEFAULT '{}'
) returns table (
  id uuid,
  content text,
  metadata jsonb,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    langchain_vectors.id,
    langchain_vectors.content,
    langchain_vectors.metadata,
    1 - (langchain_vectors.embedding <=> query_embedding) as similarity
  from langchain_vectors
  where langchain_vectors.metadata @> filter
  order by langchain_vectors.embedding <=> query_embedding
  limit match_count;
end;
$$; 