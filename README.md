# Flik - AI Agent Management Platform

Create, manage, and share your AI agents with ease.

## Features

- Create and customize AI agents with different LLM providers (OpenAI, Anthropic)
- Upload documents to create a knowledge base for your agents
- Chat with your agents and get responses based on their knowledge
- Share your agents with others using secure links

## Setup

### 1. Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database
DATABASE_URL=your_database_url

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Auth
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000

# LLM Providers
OPENAI_API_KEY=your_openai_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key
```

### 2. Supabase Setup for Document Embeddings

1. Go to your Supabase project dashboard
2. Click on "SQL Editor" in the left sidebar
3. Create a new query
4. Copy and paste the following SQL code:

```sql
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
```

5. Click "Run" to execute the SQL commands

This will set up the necessary database structure for storing and querying document embeddings using pgvector.

### 3. Installation

```bash
# Install dependencies
npm install

# Run the development server
npm run dev
```

## Development

The application will be available at `http://localhost:3000`.

## License

MIT
