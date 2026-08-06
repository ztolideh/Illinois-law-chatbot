# Illinois Law Chatbot — Legal Knowledge Pipeline

## Overview

This project is an AI-powered chatbot that answers questions about Illinois laws. The application combines multiple data sources to provide users with accurate, up-to-date legal information in natural language.

The chatbot uses:

* **OpenAI** for natural language understanding and response generation
* **OpenStates API** for current bills, sponsors, votes, and legislative status
* **Illinois Compiled Statutes (ILCS)** as the source of current Illinois law
* **Vector Search (RAG)** to retrieve relevant statutes before generating responses

---

# High-Level Architecture

```text
React Frontend
       │
       ▼
TypeScript Backend (Express / Next.js)
       │
       ├───────────────┐
       │               │
       ▼               ▼
 OpenAI API      Illinois Law Search
                      │
          ┌───────────┴───────────┐
          │                       │
          ▼                       ▼
   OpenStates API         Illinois Compiled Statutes
   (Current Bills)             (Current Law)
```

---

# Why Not Scrape on Every Request?

Although it is technically possible to scrape the Illinois Compiled Statutes website every time a user asks a question, doing so has several drawbacks:

* Slow response times
* Increased load on the ILGA website
* More opportunities for failures
* Difficult to scale

Instead, this project follows a **crawl once, search many** architecture.

```text
Scrape ILCS Website
        │
        ▼
Store Statutes Locally
        │
        ▼
Generate Embeddings
        │
        ▼
Semantic Search
        │
        ▼
LLM Generates Final Response
```

This approach allows responses to be returned in milliseconds rather than waiting for a live scrape.

---

# Scraping the Illinois Compiled Statutes

## Recommended Libraries

Since the ILCS website is rendered as static HTML, a browser automation framework like Playwright is unnecessary.

Instead, use:

* Axios — Download HTML pages
* Cheerio — Parse HTML and extract content

This approach is:

* Faster
* Simpler
* Less resource-intensive
* Easier to maintain

---

# Crawling Strategy

The Illinois Compiled Statutes website is organized hierarchically.

```text
Chapters
    │
    ▼
Acts
    │
    ▼
Sections
    │
    ▼
Statute Text
```

The crawler should:

1. Download the Chapters page.
2. Extract all chapter links.
3. Visit each chapter.
4. Extract all Act links.
5. Visit each Act.
6. Extract every statute section.
7. Store the statute text in a local database.

---

# Suggested Database Schema

Each statute should be stored as an individual record.

| Column  | Description       |
| ------- | ----------------- |
| id      | Primary key       |
| chapter | Chapter number    |
| act     | ILCS Act          |
| section | Section number    |
| title   | Section title     |
| body    | Full statute text |
| url     | Original ILGA URL |

Example:

```json
{
  "chapter": "Chapter 720",
  "act": "720 ILCS 5",
  "section": "5/12-3",
  "title": "Battery",
  "body": "A person commits battery if...",
  "url": "https://..."
}
```

---

# Retrieval-Augmented Generation (RAG)

Rather than sending every statute to the LLM, each statute should be split into smaller chunks and embedded into a vector database.

Example:

```text
720 ILCS 5/12-3

Chunk 1

Chunk 2

Chunk 3
```

When a user asks a question:

```text
User Question
      │
      ▼
Generate Query Embedding
      │
      ▼
Vector Search
      │
      ▼
Retrieve Relevant Statutes
      │
      ▼
Provide Context to OpenAI
      │
      ▼
Generate Final Answer
```

This significantly reduces token usage while improving response accuracy.

---

# Vector Database Options

Recommended vector databases include:

* pgvector (PostgreSQL)
* Chroma
* Pinecone
* Qdrant
* FAISS

For this project, **pgvector** is recommended if PostgreSQL is already being used.

---

# Updating Statutes

The Illinois Compiled Statutes change over time.

Instead of re-scraping the entire website for every request, schedule a periodic update.

```text
Nightly Job
     │
     ▼
Detect Changed Pages
     │
     ▼
Update Database
     │
     ▼
Re-embed Updated Statutes
```

This keeps the chatbot current while minimizing unnecessary network requests.

---

# OpenStates Integration

OpenStates and the Illinois Compiled Statutes serve different purposes and should remain separate data sources.

| Source                     | Purpose                                                |
| -------------------------- | ------------------------------------------------------ |
| OpenStates API             | Bills in progress, sponsors, votes, legislative status |
| Illinois Compiled Statutes | Current Illinois law                                   |
| OpenAI                     | Explain and reason about legal information             |
| Vector Database            | Retrieve the most relevant statutes                    |

Example questions:

**Current Bills**

> "What bills regarding education are currently being considered?"

→ OpenStates API

---

**Current Law**

> "What does Illinois law say about recording a phone call?"

→ Vector Search + ILCS

---

**Bill Comparison**

> "How would House Bill XXXX change current law?"

→ OpenStates API + ILCS + OpenAI

---

# Recommended Tech Stack

## Frontend

* React
* TypeScript

## Backend

* Express.js or Next.js API Routes
* TypeScript

## Web Scraping

* Axios
* Cheerio

## Database

* PostgreSQL (recommended)
* SQLite (development)

## Vector Database

* pgvector
* Chroma

## AI

* OpenAI Responses API
* OpenAI Embeddings API

---

# Future Improvements

* Support legal citations in responses
* Highlight the exact statute sections used to answer each question
* Compare proposed legislation with current law automatically
* Add conversation memory for follow-up legal questions
* Expand support to additional states
* Integrate court opinions and administrative regulations

---

# Summary

This project combines structured legal data, semantic search, and large language models to create an intelligent Illinois law assistant.

Instead of scraping statutes during each user request, the application maintains a local, searchable knowledge base of the Illinois Compiled Statutes. By combining this with OpenStates legislative data and Retrieval-Augmented Generation (RAG), the chatbot can answer questions about both current law and pending legislation quickly, accurately, and efficiently.
