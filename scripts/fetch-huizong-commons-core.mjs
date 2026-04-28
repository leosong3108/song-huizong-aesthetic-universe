import { mkdir, readFile, writeFile } from "node:fs/promises";

const OUT_DIR = new URL("../data/", import.meta.url);
const COMMONS_API = "https://commons.wikimedia.org/w/api.php";
const CATEGORY = "Category:Works_of_Emperor_Huizong_of_Song";

const CATEGORY_MAP = [
  ["calligraphy", /calligraphy|poem|詩|诗|帖|書|书|千字文|法書|writting|writing/i],
  ["flower_bird", /bird|crane|parakeet|finch|pheasant|bamboo|goose|珍禽|瑞鶴|瑞鹤|竹禽|芙蓉|锦鸡|錦雞|鸚鵡|鹦鹉|白鹅|山鸟|繡眼|绣眼|枇杷|梅花/i],
  ["figure", /ladies|silk|literary gathering|文會|文会|听琴|聽琴|elegant party|court ladies/i],
  ["landscape", /landscape|雪江|山水|归棹|歸棹|summer|autumn|winter/i],
];

const TITLE_CLEANUPS = [
  [/^File:/, ""],
  [/\.(jpg|jpeg|png|webp)$/i, ""],
  [/_/g, " "],
];

function commonsUrl(title) {
  return `https://commons.wikimedia.org/wiki/${encodeURIComponent(title.replaceAll(" ", "_"))}`;
}

function cleanTitle(title) {
  return TITLE_CLEANUPS.reduce((value, [pattern, replacement]) => value.replace(pattern, replacement), title).trim();
}

function inferCategory(title, description = "") {
  const haystack = `${title} ${description}`;
  for (const [category, rule] of CATEGORY_MAP) {
    if (rule.test(haystack)) return category;
  }
  return "painting";
}

function inferRelation(title, description = "") {
  const haystack = `${title} ${description}`;
  if (/传|傳|attributed/i.test(haystack)) return "attributed_to_huizong";
  if (/copy|after|meister nach|Zhang Xuan|張萱|捣练|搗練/i.test(haystack)) return "copy_or_after";
  if (/文會|文会|聽琴|听琴/i.test(haystack)) return "traditionally_attributed";
  return "huizong_work";
}

function inferYear(title, description = "") {
  const haystack = `${title} ${description}`;
  const explicit = haystack.match(/\b(10\d{2}|11[0-3]\d)\b/);
  if (explicit) return Number(explicit[1]);
  if (/1125|鸚鵡|鹦鹉|parakeet/i.test(haystack)) return 1125;
  if (/瑞鶴|瑞鹤|cranes/i.test(haystack)) return 1112;
  if (/12th century|宋徽宗|Huizong|赵佶|趙佶/i.test(haystack)) return 1120;
  return null;
}

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: { "User-Agent": "song-huizong-visualization-prototype/0.1" },
  });
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}: ${url}`);
  return response.json();
}

async function getCategoryFiles() {
  const files = [];
  let cmcontinue;
  do {
    const url = new URL(COMMONS_API);
    url.searchParams.set("action", "query");
    url.searchParams.set("list", "categorymembers");
    url.searchParams.set("cmtitle", CATEGORY);
    url.searchParams.set("cmtype", "file");
    url.searchParams.set("cmlimit", "100");
    url.searchParams.set("format", "json");
    if (cmcontinue) url.searchParams.set("cmcontinue", cmcontinue);

    const json = await fetchJson(url);
    files.push(...(json.query?.categorymembers ?? []));
    cmcontinue = json.continue?.cmcontinue;
  } while (cmcontinue);
  return files;
}

async function getImageInfo(titles) {
  const records = [];
  for (let index = 0; index < titles.length; index += 25) {
    const batch = titles.slice(index, index + 25);
    const url = new URL(COMMONS_API);
    url.searchParams.set("action", "query");
    url.searchParams.set("prop", "imageinfo");
    url.searchParams.set("iiprop", "url|size|mime|extmetadata");
    url.searchParams.set("iiurlwidth", "1000");
    url.searchParams.set("titles", batch.join("|"));
    url.searchParams.set("format", "json");

    const json = await fetchJson(url);
    for (const page of Object.values(json.query?.pages ?? {})) {
      const info = page.imageinfo?.[0];
      if (!info?.url) continue;
      const ext = info.extmetadata ?? {};
      const description = ext.ImageDescription?.value?.replace(/<[^>]*>/g, " ") ?? "";
      const artist = ext.Artist?.value?.replace(/<[^>]*>/g, " ") ?? "Emperor Huizong of Song";
      const title = page.title;
      const displayTitle = cleanTitle(title);
      records.push({
        id: `commons-${page.pageid}`,
        source: "Wikimedia Commons",
        source_url: commonsUrl(title),
        title: displayTitle,
        artist,
        date: ext.DateTimeOriginal?.value ?? ext.DateTime?.value ?? "Northern Song dynasty / 12th century",
        year: inferYear(displayTitle, description),
        dynasty: "Northern Song",
        period: "Huizong reign / Xuanhe aesthetic system",
        category: inferCategory(displayTitle, description),
        medium: ext.Medium?.value?.replace(/<[^>]*>/g, " ") ?? "",
        department: "",
        culture: "Chinese",
        image_url: info.thumburl ?? info.url,
        image_full: info.url,
        image_thumb: info.thumburl ?? info.url,
        width: info.width,
        height: info.height,
        credit_line: ext.CreditLine?.value?.replace(/<[^>]*>/g, " ") ?? "",
        license: ext.LicenseShortName?.value ?? "",
        public_domain: /public domain|pd|cc0/i.test(`${ext.LicenseShortName?.value ?? ""} ${ext.Copyrighted?.value ?? ""}`),
        tags: ["Song Huizong", "Zhao Ji", "core Huizong layer", inferRelation(displayTitle, description)],
        related_to_huizong: true,
        huizong_relation: inferRelation(displayTitle, description),
        relevance_score: inferRelation(displayTitle, description) === "huizong_work" ? 250 : 220,
      });
    }
  }
  return records;
}

function dedupe(records) {
  const seen = new Set();
  return records.filter((record) => {
    const normalized = record.title
      .replace(/\s+/g, "")
      .replace(/宋徽宗|赵佶|趙佶|EmperorHuizongofSong/gi, "")
      .toLowerCase();
    const key = `${normalized}:${record.width}x${record.height}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function summarize(records) {
  const byCategory = {};
  const byRelation = {};
  for (const record of records) {
    byCategory[record.category] = (byCategory[record.category] ?? 0) + 1;
    byRelation[record.huizong_relation] = (byRelation[record.huizong_relation] ?? 0) + 1;
  }
  return {
    total: records.length,
    by_category: byCategory,
    by_relation: byRelation,
    top_examples: records.slice(0, 12).map(({ title, category, huizong_relation, image_url, source_url, width, height }) => ({
      title,
      category,
      huizong_relation,
      width,
      height,
      image_url,
      source_url,
    })),
  };
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  const files = await getCategoryFiles();
  const records = dedupe(await getImageInfo(files.map((file) => file.title))).sort((a, b) => {
    if (a.huizong_relation !== b.huizong_relation) return a.huizong_relation.localeCompare(b.huizong_relation);
    return b.relevance_score - a.relevance_score;
  });

  const payload = {
    generated_at: new Date().toISOString(),
    project: "Song Huizong Aesthetic Universe",
    note: "Curated core layer from Wikimedia Commons Category:Works of Emperor Huizong of Song. Includes direct, attributed, copy/after, and traditionally attributed records; verify relation labels before publication.",
    records,
  };

  await writeFile(new URL("huizong-core-commons.json", OUT_DIR), JSON.stringify(payload, null, 2));

  const summary = summarize(records);
  await writeFile(new URL("huizong-core-commons-summary.json", OUT_DIR), JSON.stringify(summary, null, 2));

  const existingPath = new URL("song-huizong-artifacts-core.json", OUT_DIR);
  const existing = JSON.parse(await readFile(existingPath, "utf8"));
  const existingKeys = new Set(existing.records.map((record) => record.source_url));
  const merged = [...records.filter((record) => !existingKeys.has(record.source_url)), ...existing.records].sort(
    (a, b) => b.relevance_score - a.relevance_score,
  );
  await writeFile(
    new URL("song-huizong-artifacts-core-plus.json", OUT_DIR),
    JSON.stringify({ ...existing, note: `${existing.note} Supplemented with Huizong core records from Wikimedia Commons.`, records: merged }, null, 2),
  );

  console.log(JSON.stringify({ commons_core: summary, core_plus_total: merged.length }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
