# Illinois Statutes MVP — Hackathon Scope

## Goal

Build the initial Illinois Compiled Statutes (ILCS) data pipeline for the Illinois Law Chatbot.

For the **initial hackathon MVP**, only scrape these two ILCS chapters:

* **Chapter 625 — Vehicles**
* **Chapter 720 — Criminal Offenses**

Do **not** scrape the entire Illinois Compiled Statutes database yet.

The goal is to prove the complete pipeline:

```text
ILGA
 ↓
Scraper
 ↓
CSV
 ↓
Search
 ↓
OpenAI
 ↓
Chatbot Response
```

---

# Initial Data Scope

## Chapter 625 — Vehicles

Source:

https://www.ilga.gov/Legislation/ILCS/Chapters/625

This chapter should provide information about Illinois vehicle and traffic laws.

Potential demo questions include:

* "What is the speed limit in Illinois?"
* "What happens if someone is caught driving under the influence?"
* "What are Illinois distracted driving laws?"
* "What are the requirements for a driver's license?"
* "What are Illinois seat belt laws?"

---

## Chapter 720 — Criminal Offenses

Source:

https://www.ilga.gov/Legislation/ILCS/Chapters/720

This chapter should provide information about Illinois criminal law.

Potential demo questions include:

* "What is considered battery in Illinois?"
* "What is the law around theft?"
* "What is the penalty for burglary?"
* "What does Illinois law say about assault?"
* "What are Illinois laws regarding trespassing?"

---

# Scraper Requirements

The scraper should start at:

```text
https://www.ilga.gov/Legislation/ILCS/Chapters
```

It should automatically discover the links for:

```text
625 — Vehicles
720 — Criminal Offenses
```

Do **not** hardcode individual Act or Section URLs.

Once the two chapters are identified, recursively follow their links to discover the available Acts and individual statutes.

```text
ILCS Chapters
     |
     +---- 625 — Vehicles
     |        |
     |        +---- Acts
     |               |
     |               +---- Sections
     |
     +---- 720 — Criminal Offenses
              |
              +---- Acts
                     |
                     +---- Sections
```

---

# Output

Generate:

```text
data/statutes.csv
```

The CSV should contain:

```text
chapter,
chapterName,
act,
actName,
section,
title,
text,
url
```

Example:

```csv
chapter,chapterName,act,actName,section,title,text,url
720,Criminal Offenses,720 ILCS 5,Criminal Code of 2012,12-3,Battery,"...","https://www.ilga.gov/..."
```

---

# Development Mode

The scraper should support scraping a single chapter during development.

For example:

```bash
npm run scrape -- --chapter=720
```

and:

```bash
npm run scrape -- --chapter=625
```

The full MVP scrape should be:

```bash
npm run scrape
```

which scrapes:

```text
625 — Vehicles
720 — Criminal Offenses
```

---

# Important Constraints

For this MVP:

### Use

* TypeScript
* Axios
* Cheerio
* CSV

### Do not use

* Playwright
* PostgreSQL
* pgvector
* Pinecone
* Chroma
* Embeddings
* Vector search

Keep the implementation simple.

---

# MVP Architecture

```text
                  ILGA
                   |
          +--------+--------+
          |                 |
          v                 v
     Chapter 625       Chapter 720
      Vehicles       Criminal Offenses
          |                 |
          +--------+--------+
                   |
                   v
              TypeScript
                Scraper
                   |
                   v
             statutes.csv
                   |
                   v
             Simple Search
                   |
                   v
              OpenAI API
                   |
                   v
               Chatbot
```

---

# Definition of Done

The initial MVP is complete when:

* [ ] Scraper can discover Chapter 625
* [ ] Scraper can discover Chapter 720
* [ ] Chapter 625 Acts are discovered automatically
* [ ] Chapter 720 Acts are discovered automatically
* [ ] Individual statute sections are discovered
* [ ] Statute text is extracted
* [ ] ILCS citation is preserved
* [ ] Source URL is preserved
* [ ] Statute text is cleaned
* [ ] Duplicate statutes are removed
* [ ] Requests are rate-limited
* [ ] Failed requests are logged without crashing the scraper
* [ ] `data/statutes.csv` is generated
* [ ] CSV contains only Chapters 625 and 720
* [ ] CSV can be loaded by the TypeScript backend
* [ ] Basic keyword search works
* [ ] Search results can be passed to the existing OpenAI integration
* [ ] Chatbot can answer questions using the retrieved statutes
* [ ] Chatbot responses identify the relevant ILCS section

---

# Future Expansion

Once the hackathon MVP works, additional chapters can be added without changing the core architecture.

For example:

```text
625 — Vehicles              ← MVP
720 — Criminal Offenses    ← MVP

750 — Families             ← Future
765 — Property             ← Future
820 — Employment           ← Future
```

The scraper should therefore be written so that adding another chapter later requires minimal code changes.

For example:

```bash
npm run scrape -- --chapter=750
```

should eventually be possible without rewriting the scraper.

The immediate goal, however, is simply:

**625 + 720 → CSV → Search → OpenAI → Chatbot**
