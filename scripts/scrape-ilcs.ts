import fs from "fs";
import path from "path";
import axios from "axios";
import * as cheerio from "cheerio";

const OUTPUT_DIR = path.join(process.cwd(), "data");
const OUTPUT_FILE = path.join(OUTPUT_DIR, "statutes.csv");

interface StatuteRecord {
  chapter: string;
  chapterName: string;
  act: string;
  actName: string;
  section: string;
  title: string;
  text: string;
  url: string;
}

function toText(value: string | null | undefined) {
  return (value || "").replace(/\s+/g, " ").trim();
}

function cleanText(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function uniqueRecords(records: StatuteRecord[]) {
  const seen = new Set<string>();
  return records.filter((record) => {
    const key = `${record.chapter}|${record.act}|${record.section}|${record.url}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

async function fetchHtml(url: string) {
  const response = await axios.get(url, {
    headers: {
      "User-Agent": "Mozilla/5.0",
    },
    timeout: 20000,
  });
  return response.data as string;
}

function extractActLinks(html: string) {
  const $ = cheerio.load(html);
  const links: Array<{ name: string; href: string }> = [];

  $("a").each((_, el) => {
    const href = $(el).attr("href") || "";
    const text = toText($(el).text());
    if (!href || !text) return;

    if (/ILCS\/Articles\?/i.test(href) && /ILCS\s*\d+/i.test(text)) {
      links.push({ name: text, href });
    }
  });

  return links;
}

function extractSectionLinks(html: string) {
  const $ = cheerio.load(html);
  const links: Array<{ name: string; href: string }> = [];

  $("a").each((_, el) => {
    const href = $(el).attr("href") || "";
    const text = toText($(el).text());
    if (!href || !text) return;

    if (/^\d+\s*\/\s*\d+/.test(text) || /Section/i.test(text)) {
      links.push({ name: text, href });
    }
  });

  return links;
}

function extractSectionText(html: string) {
  const $ = cheerio.load(html);
  const bodyText = $("body").text();
  const startIndex = bodyText.search(/\(\d+\s*ILCS/i);
  const statuteText = startIndex >= 0 ? bodyText.slice(startIndex) : bodyText;
  const normalized = cleanText(statuteText);
  return normalized;
}

async function scrapeChapter(chapterNumber: string, chapterName: string, chapterUrl: string) {
  const chapterHtml = await fetchHtml(chapterUrl);
  const chapterLinks = extractActLinks(chapterHtml);
  const records: StatuteRecord[] = [];

  for (const [index, actLink] of chapterLinks.slice(0, 100).entries()) {
    const actUrl = new URL(actLink.href, chapterUrl).toString();
    const printUrl = new URL(actUrl);
    printUrl.searchParams.set("Print", "True");

    try {
      const actHtml = await fetchHtml(printUrl.toString());
      const actName = actLink.name || "Unknown Act";
      const sectionText = extractSectionText(actHtml);

      if (sectionText.length < 120) continue;

      const sectionLabel = actLink.name;
      const cleanedText = sectionText.replace(/\s+/g, " ").trim();
      records.push({
        chapter: chapterNumber,
        chapterName,
        act: actLink.name,
        actName,
        section: sectionLabel,
        title: sectionLabel,
        text: cleanedText,
        url: actUrl,
      });
    } catch (error) {
      console.error(`Failed act ${actUrl}`, error);
    }

    if (index < 9) {
      await delay(900);
    }
  }

  return records;
}

function toCsv(records: StatuteRecord[]) {
  const header = ["chapter", "chapterName", "act", "actName", "section", "title", "text", "url"].join(",");
  const lines = records.map((record) => {
    const values = [
      record.chapter,
      record.chapterName,
      record.act,
      record.actName,
      record.section,
      record.title,
      `"${record.text.replace(/"/g, '""')}"`,
      record.url,
    ];
    return values.join(",");
  });
  return [header, ...lines].join("\n");
}

async function main() {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const chapters = [
    {
      number: "625",
      name: "Vehicles",
      url: "https://www.ilga.gov/Legislation/ILCS/Acts?ChapterID=48&ChapterNumber=625&Chapter=VEHICLES&MajorTopic=TRANSPORTATION",
    },
    {
      number: "720",
      name: "Criminal Offenses",
      url: "https://www.ilga.gov/Legislation/ILCS/Acts?ChapterID=53&ChapterNumber=720&Chapter=CRIMINAL%20OFFENSES&MajorTopic=RIGHTS%20AND%20REMEDIES",
    },
  ];

  const selectedChapter = process.argv.find((arg) => arg.startsWith("--chapter="))?.split("=")[1];
  const selectedChapters = selectedChapter
    ? chapters.filter((chapter) => chapter.number === selectedChapter)
    : chapters;

  const allRecords: StatuteRecord[] = [];
  for (const chapter of selectedChapters) {
    const chapterRecords = await scrapeChapter(chapter.number, chapter.name, chapter.url);
    allRecords.push(...chapterRecords);
  }

  const deduped = uniqueRecords(allRecords);
  fs.writeFileSync(OUTPUT_FILE, toCsv(deduped), "utf8");
  console.log(`Wrote ${deduped.length} statutes to ${OUTPUT_FILE}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
