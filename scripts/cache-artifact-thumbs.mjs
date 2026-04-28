import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";

const DATA_PATH = new URL("../data/song-huizong-artifacts-core-plus.json", import.meta.url);
const PUBLIC_DATA_PATH = new URL("../public/song-huizong-artifacts-core-plus.json", import.meta.url);
const THUMB_DIR = new URL("../public/artifacts/thumbs/", import.meta.url);
const LIMIT = Number(process.env.THUMB_LIMIT ?? 120);
const WIDTH = Number(process.env.THUMB_WIDTH ?? 360);

function hashUrl(url) {
  return createHash("sha1").update(url).digest("hex").slice(0, 16);
}

async function fetchBuffer(url) {
  const response = await fetch(url, {
    headers: { "User-Agent": "song-huizong-visualization-prototype/0.1" },
  });
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}: ${url}`);
  return Buffer.from(await response.arrayBuffer());
}

function pickCentral(records) {
  return (
    records.find((item) => /芙蓉锦鸡|芙蓉錦雞|Songhuizong4/i.test(item.title)) ??
    records.find((item) => /枇杷山鸟|梅花绣眼|山鳥|繡眼/i.test(item.title)) ??
    records.find((item) => /Finches and bamboo|竹禽/i.test(item.title)) ??
    records.find((item) => /Auspicious Cranes|瑞/i.test(item.title)) ??
    records[0]
  );
}

function pickDisplayRecords(records) {
  const central = pickCentral(records);
  const huizong = records.filter((item) => item.related_to_huizong && item.id !== central.id).slice(0, 46);
  const peripheral = records
    .filter((item) => item.id !== central.id && !huizong.some((core) => core.id === item.id))
    .slice(0, LIMIT - 1 - huizong.length);
  return [central, ...huizong, ...peripheral].filter(Boolean);
}

async function main() {
  await mkdir(THUMB_DIR, { recursive: true });
  const payload = JSON.parse(await readFile(DATA_PATH, "utf8"));
  const display = pickDisplayRecords(payload.records);
  const displayIds = new Set(display.map((item) => item.id));
  const localMap = new Map();

  for (const [index, record] of display.entries()) {
    const source = record.image_thumb ?? record.image_url;
    const name = `${hashUrl(source)}.jpg`;
    const outUrl = new URL(name, THUMB_DIR);
    const publicPath = `/artifacts/thumbs/${name}`;

    try {
      const widthParam = source.includes("wikimedia.org") && !source.includes("/thumb/")
        ? source
        : source.replace(/\/\d+px-([^/]+)$/i, `/${WIDTH}px-$1`);
      const buffer = await fetchBuffer(widthParam);
      await writeFile(outUrl, buffer);
      localMap.set(record.id, publicPath);
      console.error(`[${index + 1}/${display.length}] cached ${record.title}`);
    } catch (error) {
      console.error(`[skip] ${record.title}: ${error.message}`);
    }
  }

  const updated = {
    ...payload,
    records: payload.records.map((record) =>
      localMap.has(record.id)
        ? {
            ...record,
            local_thumb: localMap.get(record.id),
          }
        : record,
    ),
  };

  await writeFile(PUBLIC_DATA_PATH, JSON.stringify(updated, null, 2));
  console.log(JSON.stringify({ cached: localMap.size, target: display.length }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
