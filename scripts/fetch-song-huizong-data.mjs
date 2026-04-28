import { writeFile, mkdir } from "node:fs/promises";

const OUT_DIR = new URL("../data/", import.meta.url);
const CLEVELAND_API = "https://openaccess-api.clevelandart.org/api/artworks/";
const MET_API = "https://collectionapi.metmuseum.org/public/collection/v1";

const TARGET_LIMIT = Number(process.env.LIMIT ?? 900);
const MET_DETAIL_LIMIT = Number(process.env.MET_DETAIL_LIMIT ?? 260);
const REQUEST_TIMEOUT_MS = Number(process.env.REQUEST_TIMEOUT_MS ?? 12000);

const CATEGORY_RULES = [
  ["painting", /painting|album|handscroll|hanging scroll|fan/i],
  ["porcelain", /porcelain|ceramic|stoneware|earthenware|celadon|bowl|vase|dish|ewer|jar|cup|plate/i],
  ["calligraphy", /calligraphy|inscription|sutra|poem|script/i],
  ["landscape", /landscape|mountain|river|waterfall/i],
  ["flower_bird", /flower|bird|finch|crane|bamboo|plum|orchid|lotus|peony|hawk|falcon|duck|goose/i],
  ["object", /jade|bronze|lacquer|textile|silk|robe|mirror|box|sculpture|figure/i],
];

const HUIZONG_TERMS = /huizong|hui-tsung|xuanhe|hsuan-ho|slender gold|finches and bamboo|emperor huizong/i;
const SONG_TERMS = /song dynasty|sung dynasty|northern song|southern song|n\.?\s*song|s\.?\s*sung|960|1127|1279|11th century|12th century|13th century/i;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchJson(url, retries = 3) {
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
      const response = await fetch(url, {
        headers: { "User-Agent": "song-huizong-visualization-prototype/0.1" },
        signal: controller.signal,
      });
      if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
      return await response.json();
    } catch (error) {
      if (attempt === retries) throw new Error(`${url}\n${error.message}`);
      await sleep(800 * (attempt + 1));
    } finally {
      clearTimeout(timeout);
    }
  }
}

function parseCentury(text = "") {
  const match = text.match(/(\d{1,2})(?:st|nd|rd|th) century/i);
  if (!match) return null;
  return (Number(match[1]) - 1) * 100 + 50;
}

function parseYear(...texts) {
  const joined = texts.filter(Boolean).join(" ");
  const explicit = joined.match(/\b(9[6-9]\d|10\d{2}|11\d{2}|12[0-7]\d)\b/);
  if (explicit) return Number(explicit[1]);
  return parseCentury(joined);
}

function inferCategory(record) {
  const haystack = [
    record.title,
    record.type,
    record.classification,
    record.medium,
    record.materials,
    record.description,
    record.tags?.join(" "),
  ]
    .filter(Boolean)
    .join(" ");

  for (const [category, rule] of CATEGORY_RULES) {
    if (rule.test(haystack)) return category;
  }
  return "object";
}

function relevanceScore(record) {
  const haystack = [
    record.title,
    record.artist,
    record.date,
    record.period,
    record.dynasty,
    record.medium,
    record.description,
    record.tags?.join(" "),
  ]
    .filter(Boolean)
    .join(" ");

  let score = 0;
  if (HUIZONG_TERMS.test(haystack)) score += 100;
  if (/northern song/i.test(haystack)) score += 35;
  if (/song dynasty|sung dynasty/i.test(haystack)) score += 28;
  if (/southern song/i.test(haystack)) score += 18;
  if (/chinese|china/i.test(haystack)) score += 16;
  if (/painting|handscroll|hanging scroll|album/i.test(haystack)) score += 12;
  if (/porcelain|ceramic|celadon|stoneware/i.test(haystack)) score += 10;
  if (/bird|flower|bamboo|plum|crane|finch/i.test(haystack)) score += 12;
  return score;
}

function compact(record) {
  const year = parseYear(record.date, record.period, record.dynasty);
  const category = inferCategory(record);
  const score = relevanceScore(record);
  return {
    id: record.id,
    source: record.source,
    source_url: record.source_url,
    title: record.title,
    artist: record.artist ?? "",
    date: record.date ?? "",
    year,
    dynasty: record.dynasty ?? "",
    period: record.period ?? "",
    category,
    medium: record.medium ?? "",
    department: record.department ?? "",
    culture: record.culture ?? "",
    image_url: record.image_url,
    image_thumb: record.image_thumb ?? record.image_url,
    credit_line: record.credit_line ?? "",
    public_domain: Boolean(record.public_domain),
    tags: record.tags ?? [],
    related_to_huizong: HUIZONG_TERMS.test(
      [record.title, record.artist, record.date, record.period, record.description, record.tags?.join(" ")]
        .filter(Boolean)
        .join(" "),
    ),
    relevance_score: score,
  };
}

function isUseful(record) {
  const haystack = [
    record.title,
    record.artist,
    record.date,
    record.period,
    record.dynasty,
    record.culture,
    record.medium,
    record.description,
    record.tags?.join(" "),
  ]
    .filter(Boolean)
    .join(" ");

  if (!record.image_url) return false;
  if (!/china|chinese|song|huizong|celadon|porcelain/i.test(haystack)) return false;
  if (!/song|sung|huizong|northern song|southern song|960|1127|1279|11th century|12th century|13th century|celadon/i.test(haystack)) return false;
  return true;
}

function isCoreSong(record) {
  const haystack = [record.title, record.artist, record.date, record.period, record.dynasty, record.medium, record.tags?.join(" ")]
    .filter(Boolean)
    .join(" ");
  const inSongRange = record.year == null || (record.year >= 960 && record.year <= 1300);
  const explicitlySong = SONG_TERMS.test(haystack);
  return record.related_to_huizong || (inSongRange && explicitlySong);
}

async function fetchCleveland() {
  const queries = [
    "Chinese Song Dynasty",
    "Northern Song China",
    "Southern Song China",
    "Song dynasty porcelain",
    "Song dynasty painting",
    "Chinese celadon Song",
    "Huizong",
  ];

  const records = [];
  for (const query of queries) {
    console.error(`[cma] query: ${query}`);
    const url = new URL(CLEVELAND_API);
    url.searchParams.set("q", query);
    url.searchParams.set("has_image", "1");
    url.searchParams.set("cc0", "1");
    url.searchParams.set("limit", "100");
    url.searchParams.set("skip", "0");

    const json = await fetchJson(url);
    for (const item of json.data ?? []) {
      records.push({
        id: `cma-${item.id}`,
        source: "Cleveland Museum of Art",
        source_url: item.url,
        title: item.title,
        artist: item.creators?.map((creator) => creator.description).join("; "),
        date: item.creation_date,
        dynasty: item.dynasty,
        culture: item.culture?.join?.("; ") ?? item.culture,
        medium: item.technique ?? item.medium,
        department: item.department,
        description: item.description,
        credit_line: item.creditline,
        public_domain: item.share_license_status === "CC0" || item.share_license_status === "cc0",
        image_url: item.images?.web?.url ?? item.images?.print?.url ?? item.images?.full?.url,
        image_thumb: item.images?.web?.url,
        tags: [item.type, item.tombstone, ...(item.fun_fact ? [item.fun_fact] : [])].filter(Boolean),
      });
    }
  }
  return records;
}

async function fetchMetObjectIds() {
  const searches = [
    "Song dynasty China",
    "Northern Song China",
    "Southern Song China",
    "Huizong",
    "Chinese celadon Song",
    "Song dynasty porcelain",
    "Song dynasty painting",
  ];

  const ids = new Set();
  for (const search of searches) {
    const url = new URL(`${MET_API}/search`);
    url.searchParams.set("hasImages", "true");
    url.searchParams.set("isPublicDomain", "true");
    url.searchParams.set("q", search);
    const json = await fetchJson(url);
    for (const id of json.objectIDs ?? []) ids.add(id);
  }
  return [...ids];
}

async function fetchMet() {
  const ids = await fetchMetObjectIds();
  console.error(`[met] candidate object ids: ${ids.length}; fetching first ${Math.min(ids.length, MET_DETAIL_LIMIT)}`);
  const records = [];
  for (const [index, id] of ids.slice(0, MET_DETAIL_LIMIT).entries()) {
    if (index > 0 && index % 50 === 0) console.error(`[met] fetched ${index}/${Math.min(ids.length, MET_DETAIL_LIMIT)} details`);
    if (index > 0 && index % 25 === 0) await sleep(250);
    const item = await fetchJson(`${MET_API}/objects/${id}`, 2).catch(() => null);
    if (!item?.primaryImageSmall && !item?.primaryImage) continue;
    records.push({
      id: `met-${item.objectID}`,
      source: "The Metropolitan Museum of Art",
      source_url: item.objectURL,
      title: item.title,
      artist: item.artistDisplayName,
      date: item.objectDate,
      dynasty: item.dynasty,
      period: item.period,
      culture: item.culture,
      medium: item.medium,
      department: item.department,
      description: item.objectName,
      credit_line: item.creditLine,
      public_domain: item.isPublicDomain,
      image_url: item.primaryImageSmall || item.primaryImage,
      image_thumb: item.primaryImageSmall || item.primaryImage,
      tags: [item.objectName, item.classification, item.tags?.map((tag) => tag.term).join("; ")].filter(Boolean),
    });
  }
  return records;
}

function summarize(records) {
  const bySource = {};
  const byCategory = {};
  let huizong = 0;
  for (const record of records) {
    bySource[record.source] = (bySource[record.source] ?? 0) + 1;
    byCategory[record.category] = (byCategory[record.category] ?? 0) + 1;
    if (record.related_to_huizong) huizong += 1;
  }
  return {
    total: records.length,
    related_to_huizong: huizong,
    by_source: bySource,
    by_category: byCategory,
    top_examples: records.slice(0, 12).map(({ title, source, date, category, image_url, source_url, relevance_score }) => ({
      title,
      source,
      date,
      category,
      relevance_score,
      image_url,
      source_url,
    })),
  };
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  const [cleveland, met] = await Promise.all([fetchCleveland(), fetchMet()]);
  const seen = new Set();
  const records = [...cleveland, ...met]
    .filter(isUseful)
    .map(compact)
    .filter((record) => {
      const key = `${record.source}:${record.title}:${record.date}:${record.image_url}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => b.relevance_score - a.relevance_score || (a.year ?? 9999) - (b.year ?? 9999))
    .slice(0, TARGET_LIMIT);

  const candidatesPayload = {
    generated_at: new Date().toISOString(),
    project: "Song Huizong Aesthetic Universe",
    note: "Open-access candidate dataset for a Three.js artifact-star-map prototype. Includes Song-related, celadon, and later comparison records. Verify individual records before publication.",
    records,
  };

  const coreRecords = records.filter(isCoreSong);
  const corePayload = {
    generated_at: new Date().toISOString(),
    project: "Song Huizong Aesthetic Universe",
    note: "Strict first-pass dataset: Song/Sung dynasty, Northern/Southern Song, or directly Huizong-related records with public image URLs.",
    records: coreRecords,
  };

  const summary = {
    core: summarize(coreRecords),
    candidates: summarize(records),
  };
  await writeFile(new URL("song-huizong-artifacts-core.json", OUT_DIR), JSON.stringify(corePayload, null, 2));
  await writeFile(new URL("song-huizong-artifacts-candidates.json", OUT_DIR), JSON.stringify(candidatesPayload, null, 2));
  await writeFile(new URL("song-huizong-artifacts-summary.json", OUT_DIR), JSON.stringify(summary, null, 2));

  console.log(JSON.stringify(summary, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
