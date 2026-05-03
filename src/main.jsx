import React, { useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  BookOpen,
  Bookmark,
  Brush,
  ChevronLeft,
  ChevronRight,
  CircleDot,
  Compass,
  Crosshair,
  Download,
  ExternalLink,
  Feather,
  Heart,
  ImagePlus,
  Layers,
  List,
  Maximize2,
  Menu,
  Minus,
  Plus,
  RotateCw,
  Search,
  Share2,
  Sparkles,
  X,
} from "lucide-react";
import "./styles.css";

/* ================================================================
 * 宋代审美银河 / Song Dynasty Aesthetic Galaxy
 * 数字展陈式首页 + 拖拽 3D 侧视 + 花鸟星系 + 列表 + 详情 + Demo Mode
 * ================================================================ */

/* ---------- 1. 常量 & 元数据 ---------- */

const SITE_TITLE = "宋代审美银河";
const SITE_SUBTITLE = "以宋徽宗之眼，观照一个时代的审美宇宙";

// 五大星系——首页 4 个围绕 C 位 + 1 个祥瑞 = C 位
const galaxyConfig = {
  inscription: {
    label: "书法星河",
    seal: "书",
    short: "书法",
    tag: "瘦金 · 题跋",
    count: 64,
    color: "#d8c7a1",
    slot: "tl",
    icon: Brush,
    blurb: "瘦金一笔，把图像变成可被认证的对象。",
    introTitle: "书法星河",
    introSub: "一笔之间，建立帝王的视觉秩序",
    introBody: "瘦金题跋、御札、千字文，宋代书法把帝王身份写进每一寸纸绢。",
  },
  collection: {
    label: "典藏空间",
    seal: "藏",
    short: "收藏",
    tag: "宣和 · 内府",
    count: 84,
    color: "#b99a69",
    slot: "tr",
    icon: BookOpen,
    blurb: "宣和内府不只是收藏，是给图像编号的王朝数据库。",
    introTitle: "典藏空间",
    introSub: "宣和内府的视觉档案",
    introBody: "图像被命名、题写、登录，进入一座可被检索的帝王收藏。",
  },
  vessel: {
    label: "器物之美",
    seal: "器",
    short: "器用",
    tag: "宋瓷 · 清供",
    count: 76,
    color: "#9fb8a9",
    slot: "bl",
    icon: CircleDot,
    blurb: "釉色与器形收住所有喧哗，把日常变成可触的光。",
    introTitle: "器物之美",
    introSub: "宋瓷、茶器与清供之间",
    introBody: "克制、留白、单色釉——宋人把审美放进手的动作里。",
  },
  nature: {
    label: "花鸟世界",
    seal: "物",
    short: "花鸟画",
    tag: "格物 · 写生",
    count: 89,
    color: "#cfa65e",
    slot: "br",
    icon: Feather,
    blurb: "宋人笔下的自然与心境。一枝一羽即宇宙。",
    introTitle: "花鸟世界",
    introSub: "宋人笔下的自然与心境",
    introBody:
      "以花鸟观照万物，寄托性灵。宋人于尺素绢帛之间，构建出一片静谧而生机盎然的精神世界。",
  },
};

const galaxyOrder = ["inscription", "collection", "vessel", "nature"];

// 每个星系的策展筛选铭牌（per-galaxy curatorial labels）
const listFiltersByGalaxy = {
  nature: [
    { id: "all", label: "全部" },
    { id: "bird", label: "禽鸟", match: /bird|finch|parakeet|crane|magpie|禽|鸟|鳥/i },
    { id: "flower", label: "花卉", match: /flower|bloom|peach|peony|plum|花|梅|莲|lotus|blossom/i },
    { id: "bamboo", label: "竹石", match: /bamboo|rock|竹|石|stone/i },
    { id: "insect", label: "草虫", match: /insect|butterfly|bee|cricket|蝶|虫|蟲/i },
    { id: "water", label: "水禽", match: /water|pond|fish|lotus|莲|池|水|魚|鱼/i },
    { id: "court", label: "宫廷", match: /palace|imperial|court|宫|宮|huizong|emperor/i },
  ],
  inscription: [
    { id: "all", label: "全部" },
    { id: "shoujin", label: "瘦金", match: /瘦金|huizong|徽宗|slender gold|thin gold/i },
    { id: "title", label: "题跋", match: /inscription|题跋|inscript|colophon/i },
    { id: "letter", label: "御札", match: /letter|御札|札|imperial letter/i },
    { id: "poem", label: "诗书画印", match: /poem|quatrain|诗|verse|seal|印/i },
    { id: "court", label: "宫廷", match: /palace|imperial|court|宫|宮/i },
  ],
  vessel: [
    { id: "all", label: "全部" },
    { id: "porcelain", label: "宋瓷", match: /porcelain|ceramic|ware|瓷|釉/i },
    { id: "tea", label: "茶器", match: /tea|teabowl|bowl|茶|盏/i },
    { id: "study", label: "文房", match: /brush|inkstone|washer|笔|墨|砚|文房/i },
    { id: "ritual", label: "礼器", match: /ritual|bronze|jade|礼|青铜|玉/i },
    { id: "vase", label: "瓶罐", match: /vase|jar|meiping|瓶|罐|尊/i },
  ],
  collection: [
    { id: "all", label: "全部" },
    { id: "literary", label: "文会", match: /literary|gathering|文会|文會/i },
    { id: "music", label: "听琴", match: /music|qin|zither|聽琴|听琴|琴/i },
    { id: "court", label: "雅集", match: /scholar|雅集|elegant|gathering/i },
    { id: "lady", label: "宫娥", match: /lady|court ladies|宫娥|宫女|silk|捣练/i },
    { id: "ancient", label: "古画", match: /ancient|copy|摹|tang|唐|early/i },
  ],
};

const timelineByGalaxy = {
  nature: ["10世纪", "11世纪", "12世纪", "13世纪"],
  inscription: ["北宋初", "宣和", "南宋", "元初"],
  vessel: ["五代", "北宋", "南宋", "元"],
  collection: ["北宋", "宣和", "南宋", "后世"],
};

const relationLabels = {
  huizong_work: "徽宗相关作品",
  huizong_attributed: "传为徽宗",
  huizong_inscribed: "徽宗题跋 / 收藏线索",
  related_style: "宋代审美参照",
};

/* ---------- 2. 数据 / 数据派生 ---------- */

function useArtifacts() {
  const [data, setData] = useState([]);
  useEffect(() => {
    fetch("/song-huizong-artifacts-core-plus.json")
      .then((r) => r.json())
      .then((p) => setData(p.records ?? []))
      .catch(() => setData([]));
  }, []);
  return data;
}

function cleanText(value, fallback = "") {
  if (!value) return fallback;
  return (
    String(value)
      .replace(/<div\b[^>]*>.*$/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;|&#160;/gi, " ")
      .replace(/&amp;/gi, "&")
      .replace(/\s+/g, " ")
      .trim() || fallback
  );
}

function formatDate(value) {
  const text = cleanText(value);
  const between = text.match(/between\s+circa\s+(\d{3,4})\s+and\s+circa\s+(\d{3,4})/i);
  if (between) return `约 ${between[1]}-${between[2]}`;
  const circa = text.match(/circa\s+(\d{3,4})/i);
  if (circa) return `约 ${circa[1]}`;
  const century =
    text.match(/(\d+)\s*(?:th|st|nd|rd)?\s*centur/i) || text.match(/(\d+)\s+сто/i);
  if (century) return `${century[1]} 世纪`;
  const yearRange = text.match(/^(\d{3,4})\s*[-–—]\s*(\d{3,4})$/);
  if (yearRange) return `${yearRange[1]}-${yearRange[2]}`;
  const single = text.match(/^(\d{3,4})$/);
  if (single) return single[1];
  return text || "宋代";
}

function inferDomain(item) {
  if (!item) return "collection";
  const text = [
    item.title,
    item.artist,
    item.medium,
    item.period,
    item.tags?.join(" "),
    item.huizong_relation,
    item.category,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  if (
    /auspicious|crane|瑞|鶴|鹤|parakeet|five-colored|五色|祥瑞|端门/.test(text)
  )
    return "nature"; // 把瑞鹤图相关也归在 nature 旁，但是 isCrane 单独标
  if (
    item.category === "calligraphy" ||
    /calligraphy|poem|瘦金|诗|書|书|题跋|inscription|楷书|千字文|赵佶等法书/.test(
      text,
    )
  )
    return "inscription";
  if (
    item.category === "porcelain" ||
    item.category === "object" ||
    /ceramic|porcelain|glaze|bronze|jade|vessel|bowl|dish|jar|釉|瓷|青铜|古器|茶|器|盏|瓶|炉/.test(
      text,
    )
  )
    return "vessel";
  if (
    item.category === "flower_bird" ||
    /bird|flower|bamboo|finch|禽|花|鸟|鳥|竹|写生|magpie|peach|plum|bloom/.test(
      text,
    )
  )
    return "nature";
  return "collection";
}

function isCraneHero(item) {
  const t = (item?.title || "") + " " + (item?.tags || []).join(" ");
  return /Auspicious Cranes|瑞[鶴鹤]圖|瑞[鶴鹤]图/i.test(t);
}

function artworkImage(item, mode = "thumb") {
  if (!item) return "";
  if (mode === "full")
    return (
      item.image_full ||
      item.image_url ||
      item.local_thumb ||
      item.image_thumb ||
      ""
    );
  return item.local_thumb || item.image_thumb || item.image_url || item.image_full || "";
}

function displayArtworkTitle(item, fallback = "未命名作品") {
  if (!item) return fallback;
  const title = cleanText(item.title, fallback);
  const aliases = [
    // —— 徽宗核心
    [/Auspicious Cranes/i, "瑞鹤图"],
    [/瑞[鶴鹤][圖图]/, "瑞鹤图"],
    [/Copy.*Cranes|Cranes.*Copy/i, "瑞鹤图（摹本）"],
    [/Five-colou?red parakeet/i, "五色鹦鹉图"],
    [/Finches and bamboo|竹禽/i, "竹禽图"],
    [/赵佶芙蓉锦鸡|芙蓉锦鸡|芙蓉錦雞|Songhuizong4$/i, "芙蓉锦鸡图"],
    [/^Songhuizong3$/i, "枇杷山鸟图"],
    [/^Songhuizong5$/i, "梅花绣眼图"],
    [/^Songhuizong6$/i, "腊梅山禽图"],
    [/^Songhuizong7$/i, "桃鸠图"],
    [/^Songhuizong8$/i, "写生珍禽图"],
    [/^Songhuizong9$/i, "池塘秋晚图"],
    [/^Songhuizong10$/i, "竹禽图"],
    [/^Songhuizong11$/i, "祥龙石图"],
    [/^Songhuizong12$/i, "听琴图"],
    [/^Songhuizong13$/i, "文会图"],
    [/Songhuizong\d+/i, "徽宗花鸟册"],
    [/^Songhuizong$/i, "徽宗书画"],
    [/Sketching of Rare Birds|写生珍禽/i, "写生珍禽图"],
    [/Ink Bamboo|墨竹/i, "墨竹图"],
    [/Bird on a Flowering Branch|花枝鸟/i, "花枝栖鸟图"],
    [/Magpie on Branch|喜鹊/i, "喜鹊登梅图"],
    [/Loquat|枇杷/i, "枇杷山鸟图"],
    [/Plum Blossom|梅花/i, "梅花图"],
    [/Peony|牡丹/i, "牡丹图"],
    [/Lotus|莲|蓮/i, "莲花图"],
    [/Bamboo and Rocks|竹石/i, "竹石图"],
    [/Pine|松/i, "松石图"],

    // —— 书法
    [/Huizong-Literary Gathering|文会|文會/i, "文会图"],
    [/Huizong-Calligraphy/i, "瘦金书帖"],
    [/Huizong 1102|闰中秋|闰[中-]秋月/i, "闰中秋月诗帖"],
    [/楷书千字文|Thousand Character/i, "楷书千字文"],
    [/赵佶等法书/i, "宋徽宗法书"],
    [/Quatrain on Spring|春词|Quatrain/i, "春词诗帖"],
    [/Couplet|对联/i, "御书对联"],
    [/Summer poem|夏景诗/i, "夏景诗帖"],
    [/Nongfang|秾芳/i, "秾芳诗帖"],
    [/Round fan/i, "团扇题诗"],
    [/^Poem$/i, "御题诗"],
    [/Calligraphy/i, "瘦金书"],
    [/Inscription/i, "御题"],

    // —— 收藏 / 人物
    [/听琴|聽琴|cropped.*赵佶|赵佶听琴/i, "听琴图"],
    [/捣练|Preparing.*Silk|pounding silk|Newly-Woven/i, "捣练图"],
    [/Court Ladies|宫娥|宫女/i, "宫娥图"],
    [/Zhang Xuan Huizong|徽宗摹张萱/i, "徽宗摹张萱图"],
    [/Eighteen Scholars|十八学士/i, "十八学士图"],
    [/Spring Outing|春游/i, "虢国夫人游春图"],
    [/Palace Landscape|宫苑/i, "宫苑图"],
    [/West Lake|西湖/i, "西湖图"],
    [/Narcissus|水仙/i, "水仙图"],

    // —— 器物
    [/Tea Bowl|Teabowl|茶[盏盏]/i, "建窑茶盏"],
    [/Brush Washer|笔洗/i, "笔洗"],
    [/Cup and Stand|盏托/i, "盏托"],
    [/Meiping|梅瓶/i, "梅瓶"],
    [/Imperial Tribute|供御/i, "官窑贡器"],
    [/Black-Glazed/i, "黑釉茶碗"],
    [/Ru ware|汝窑|汝窯/i, "汝窑瓷器"],
    [/Guan ware|官窑|官窯/i, "官窑瓷器"],
    [/Ding ware|定窑|定窯/i, "定窑瓷器"],
    [/Jun ware|钧窑|鈞窯/i, "钧窑瓷器"],
    [/Ge ware|哥窑|哥窯/i, "哥窑瓷器"],
    [/Yaozhou/i, "耀州窑瓷器"],
    [/Qingbai/i, "青白瓷"],
    [/Cizhou/i, "磁州窑瓷器"],
    [/Jianyao|建窑/i, "建窑瓷器"],
    [/Vase|花瓶/i, "宋代瓷瓶"],
    [/Bowl|碗/i, "宋代瓷碗"],
    [/Dish|盘/i, "宋代瓷盘"],
    [/Jar|罐/i, "宋代瓷罐"],
    [/Censer|香炉|爐/i, "宋代香炉"],
    [/Bronze/i, "宋代青铜器"],
    [/Jade|玉/i, "宋代玉器"],
    [/Lacquer|漆/i, "宋代漆器"],
    [/Ink Stone|砚/i, "宋代砚"],
  ];
  for (const [re, alias] of aliases) {
    if (re.test(title)) return alias;
  }
  // 启发式：纯英文标题——尝试根据内容推断中文短名
  if (/^[A-Za-z\s,;:.\-()\d]+$/.test(title)) {
    if (/bird/i.test(title)) return "宋代花鸟";
    if (/calligraph|writing/i.test(title)) return "宋代书法";
    if (/painting/i.test(title)) return "宋代绘画";
    if (/ceram|porcelain|ware/i.test(title)) return "宋代瓷器";
    if (/scroll/i.test(title)) return "宋代卷轴";
    if (/album/i.test(title)) return "宋代册页";
    return "宋代藏品";
  }
  return title;
}

function localizeArtist(name) {
  if (!name) return "佚名";
  const t = String(name);
  const aliases = [
    [/Huizong|徽宗|Zhao Ji|赵佶|趙佶/i, "宋徽宗 赵佶"],
    [/Gaozong|高宗/i, "宋高宗 赵构"],
    [/Lizong|理宗/i, "宋理宗 赵昀"],
    [/Emperor.*Song|Song Emperor/i, "宋代帝王"],
    [/Zhang Xuan|张萱/i, "张萱"],
    [/Zhao Mengfu/i, "赵孟頫"],
    [/Mi Fu/i, "米芾"],
    [/Su Shi|Su Dongpo/i, "苏轼"],
    [/Fan Kuan|范宽/i, "范宽"],
    [/Guo Xi/i, "郭熙"],
    [/Ma Yuan/i, "马远"],
    [/Xia Gui/i, "夏圭"],
    [/Li Tang/i, "李唐"],
    [/Liu Songnian/i, "刘松年"],
    [/Cui Bo/i, "崔白"],
    [/Wen Tong/i, "文同"],
    [/Wang Ximeng/i, "王希孟"],
    [/Wang Xizhi/i, "王羲之"],
    [/Anonymous|Unknown/i, "佚名"],
    [/^attributed to/i, "传"],
  ];
  for (const [re, alias] of aliases) {
    if (re.test(t)) return alias;
  }
  // 脏数据 / 长描述清理
  if (/wikimedia|commons|wikipedia|google art|metadata|details on/i.test(t)) return "宋代";
  // 移除括号或破折号之后的英文注释（保留首段）
  let firstPart = t;
  for (const sep of ["(", "（", " - ", " – "]) {
    const idx = firstPart.indexOf(sep);
    if (idx > 0) firstPart = firstPart.slice(0, idx).trim();
  }
  const stripped = cleanText(firstPart, t);
  // 太长的英文串——回退到"宋代"
  if (stripped.length > 32 && /[A-Za-z]/.test(stripped)) return "宋代";
  return cleanText(stripped, "佚名");
}

function shortLineOf(item) {
  if (!item) return "宋代审美的某一种切片";
  if (isCraneHero(item))
    return "群鹤翔集，紫宸增辉，天心景命，宋祚绵长。";
  const d = inferDomain(item);
  if (d === "nature") return "一枝一羽被放大成宇宙尺度，宋人的观看安静而精密。";
  if (d === "inscription") return "笔画像星轨穿过画面，题跋为图像建立身份。";
  if (d === "vessel") return "釉色与器形收住所有喧哗，把日常变成可触的光。";
  if (d === "collection") return "宣和内府里被命名、收藏、再观看的一颗星。";
  return "宋代审美在暗处发光，连接图像、材质与观看者。";
}

function tourScore(item) {
  const r =
    item.huizong_relation === "huizong_work"
      ? 4
      : item.related_to_huizong
      ? 3
      : 1;
  const c =
    { flower_bird: 5, calligraphy: 4, painting: 3, landscape: 2, porcelain: 1 }[
      item.category
    ] ?? 0;
  return r * 10 + c + (item.relevance_score ?? 0) / 100;
}

function findCraneRecord(records) {
  return (
    records.find((x) => /^Auspicious Cranes$/i.test(x.title || "")) ||
    records.find((x) => /Auspicious Cranes/i.test(x.title || "")) ||
    records.find((x) => /瑞[鶴鹤][圖图]/.test(x.title || "")) ||
    records[0] ||
    null
  );
}

function findGalaxyHero(records, galaxy) {
  if (!records?.length) return null;
  // 优先匹配语义关键词
  const priority = {
    inscription: [
      /楷书千字文/i,
      /Huizong-Calligraphy/i,
      /瘦金/i,
      /Poem|calligraphy|inscription|题跋|书|書/i,
    ],
    collection: [
      /Literary Gathering|文会|文會/i,
      /听琴|聽琴/i,
      /Court Ladies|捣练|Preparing/i,
      /palace|literary/i,
    ],
    vessel: [
      /Ru ware|汝窑/i,
      /Black-Glazed Teabowl|建窑/i,
      /Meiping|梅瓶/i,
      /Tea Bowl|Brush Washer|Cup and Stand|tea|porcelain|ceramic|瓷|碗|瓶/i,
    ],
    nature: [
      /赵佶芙蓉锦鸡|Songhuizong4|Five-colored|parakeet/i,
      /Finches and bamboo|竹禽|枇杷山鸟|梅花绣眼|繡眼/i,
      /flower|bird|bamboo|禽|鸟|鳥|花/i,
    ],
  }[galaxy] ?? [];
  const candidates = records
    .filter((x) => inferDomain(x) === galaxy && !isCraneHero(x))
    .sort((a, b) => {
      const la = Number(Boolean(a.local_thumb)) - Number(Boolean(b.local_thumb));
      if (la !== 0) return -la;
      return tourScore(b) - tourScore(a);
    });
  for (const re of priority) {
    const m = candidates.find((x) =>
      re.test(
        [x.title, x.artist, x.tags?.join(" "), x.medium, x.period].filter(Boolean).join(" "),
      ),
    );
    if (m) return m;
  }
  return candidates[0] || null;
}

function getGalaxyShowcase(records, galaxy, n = 6) {
  const hero = findGalaxyHero(records, galaxy);
  const all = records
    .filter((x) => inferDomain(x) === galaxy && !isCraneHero(x))
    .filter((x) => x.id !== hero?.id)
    .sort((a, b) => {
      const la = Number(Boolean(a.local_thumb)) - Number(Boolean(b.local_thumb));
      if (la !== 0) return -la;
      const ia = Number(Boolean(a.image_thumb || a.image_url)) - Number(Boolean(b.image_thumb || b.image_url));
      if (ia !== 0) return -ia;
      return tourScore(b) - tourScore(a);
    });
  return [hero, ...all].filter(Boolean).slice(0, n);
}

function getGalaxyAll(records, galaxy) {
  return records
    .filter((x) => inferDomain(x) === galaxy && !isCraneHero(x))
    .sort((a, b) => {
      const la = Number(Boolean(a.local_thumb)) - Number(Boolean(b.local_thumb));
      if (la !== 0) return -la;
      return tourScore(b) - tourScore(a);
    });
}

function getRelated(records, item, n = 4) {
  if (!item) return [];
  const same = records
    .filter((x) => x.id !== item.id)
    .filter((x) => inferDomain(x) === inferDomain(item) || x.category === item.category)
    .sort((a, b) => tourScore(b) - tourScore(a));
  return same.slice(0, n);
}

function detailTags(item) {
  if (!item) return [];
  const out = [];
  const d = inferDomain(item);
  const map = {
    nature: ["花鸟", "工笔重彩", "珍禽", "皇家审视"],
    inscription: ["瘦金", "题跋", "御笔", "诗书画印"],
    collection: ["宣和收藏", "宫廷图像", "雅集", "内府"],
    vessel: ["宋瓷", "釉色", "清供", "器用"],
  };
  out.push(...(map[d] || ["宋代审美"]));
  if (item.related_to_huizong) out.push("徽宗参照");
  return out.slice(0, 4);
}

function localizeMedium(med) {
  if (!med) return "绢本设色";
  const t = String(med).toLowerCase();
  if (/silk.*color|color.*silk|绢本设色/i.test(t)) return "绢本设色";
  if (/silk.*ink|ink.*silk/i.test(t)) return "绢本水墨";
  if (/paper.*color/i.test(t)) return "纸本设色";
  if (/paper.*ink|ink.*paper/i.test(t)) return "纸本水墨";
  if (/ru ware|汝窑/i.test(t)) return "汝窑青瓷";
  if (/jun ware|钧窑/i.test(t)) return "钧窑瓷";
  if (/ding ware|定窑/i.test(t)) return "定窑白瓷";
  if (/guan ware|官窑/i.test(t)) return "官窑青瓷";
  if (/ge ware|哥窑/i.test(t)) return "哥窑瓷";
  if (/jian ware|建窑|black-glazed/i.test(t)) return "建窑黑釉";
  if (/qingbai/i.test(t)) return "青白瓷";
  if (/cizhou/i.test(t)) return "磁州窑瓷";
  if (/porcelain|stoneware|ware|瓷/i.test(t)) return "宋代瓷器";
  if (/bronze|青铜/i.test(t)) return "青铜";
  if (/jade|玉/i.test(t)) return "玉";
  if (/lacquer|漆/i.test(t)) return "漆器";
  if (/calligraphy|ink/i.test(t)) return "墨笔";
  if (/handscroll|长卷/i.test(t)) return "长卷";
  if (/album|册/i.test(t)) return "册页";
  if (/hanging scroll|立轴|挂轴/i.test(t)) return "立轴";
  if (/fan|团扇/i.test(t)) return "团扇";
  return cleanText(med, "绢本设色").slice(0, 24);
}

function localizeCategory(cat) {
  return ({
    flower_bird: "花鸟画",
    porcelain: "宋瓷",
    object: "宋代器物",
    calligraphy: "书法 · 题跋",
    painting: "宋代绘画",
    landscape: "山水画",
    figure: "人物雅集",
  }[cat] ?? "宋代审美");
}

function localizeSource(src) {
  if (!src) return "馆藏数据";
  const t = String(src);
  const aliases = [
    [/Wikimedia|wikipedia/i, "Wikimedia 共享资料库"],
    [/Metropolitan|MET/i, "纽约大都会艺术博物馆"],
    [/National Palace Museum|故宫|NPM/i, "故宫博物院"],
    [/Palace Museum, Beijing|北京故宫/i, "北京故宫博物院"],
    [/Liaoning|辽宁省博物馆/i, "辽宁省博物馆"],
    [/Shanghai Museum|上海博物馆/i, "上海博物馆"],
    [/British Museum|大英博物馆/i, "大英博物馆"],
    [/Boston|MFA/i, "波士顿美术博物馆"],
    [/Cleveland/i, "克利夫兰艺术博物馆"],
    [/Smithsonian|Freer/i, "史密森学会"],
    [/Google Art/i, "Google 艺术与文化"],
  ];
  for (const [re, alias] of aliases) {
    if (re.test(t)) return alias;
  }
  return cleanText(t, "馆藏数据");
}

function metaPairs(item) {
  if (!item) return [];
  return [
    ["收藏机构", localizeSource(item.source)],
    ["尺寸", item.width && item.height ? `${item.width} × ${item.height}` : "未注录"],
    ["材质", cleanText(item.medium, "绢本设色")],
    ["分类", localizeCategory(item.category)],
    ["来源", item.public_domain ? "公共领域 · Public Domain" : cleanText(item.license, "馆藏授权")],
  ];
}

/* ---------- 3. UI 局部组件 ---------- */

function Sidebar({ activeView, activeGalaxy, onHome, onPickGalaxy }) {
  return (
    <aside className="lhs-rail">
      <button
        type="button"
        className={`rail-mark ${activeView === "overview" ? "active" : ""}`}
        onClick={onHome}
        title="回到银河总览"
      >
        宋
      </button>
      <div className="rail-stack">
        {galaxyOrder.map((id) => {
          const g = galaxyConfig[id];
          const isOn = activeGalaxy === id;
          return (
            <button
              type="button"
              key={id}
              className={`rail-tool ${isOn ? "active" : ""}`}
              onClick={() => onPickGalaxy(id)}
              title={`进入 ${g.label}`}
              aria-label={g.label}
            >
              <b>{g.seal}</b>
              <span>{g.short}</span>
            </button>
          );
        })}
      </div>
      <button type="button" className="rail-foot" onClick={onHome} title="总览">
        <Menu size={14} />
        <small>总览</small>
      </button>
    </aside>
  );
}

function TopCapsule({ scope, name, count, onSearch, onMenu }) {
  return (
    <header className="top-bar">
      <div className="top-capsule">
        <span>{scope}</span>
        <i />
        <strong>{name}</strong>
        <i />
        <em>{count}</em>
      </div>
      <div className="top-actions">
        <button type="button" onClick={onMenu} title="导览">
          <Compass size={14} />
          导览
        </button>
        <button type="button" onClick={onSearch} title="搜索">
          <Search size={14} />
          搜索
        </button>
        <div className="top-emperor">
          <Sparkles size={13} />
          宋徽宗 · 赵佶
        </div>
      </div>
    </header>
  );
}

function TitleBlock({ title, subtitle }) {
  return (
    <div className="hero-title">
      <h1>{title}</h1>
      <p>{subtitle}</p>
    </div>
  );
}

/* ---------- 飞鹤 SVG silhouette（宋代写意） ---------- */
function CraneSvg({ className, style }) {
  return (
    <svg
      className={className}
      style={style}
      viewBox="0 0 100 32"
      xmlns="http://www.w3.org/2000/svg"
      fill="currentColor"
      aria-hidden="true"
    >
      {/* 身体（细长流线型） */}
      <path d="M 6 16 Q 12 14 22 14 Q 38 13 56 14 L 78 14 Q 88 14 92 15 L 96 15 L 96 17 L 92 17 Q 86 18 76 18 L 56 18 Q 38 19 22 18 Q 12 18 6 16 Z" />
      {/* 头 + 喙 */}
      <circle cx="97.5" cy="16" r="1.6" />
      <path d="M 99 15.5 L 100 16 L 99 16.5 Z" />
      {/* 上翅 */}
      <path d="M 30 14 Q 36 6 46 4 Q 56 3 62 6 Q 68 9 70 14 L 62 14 Q 56 11 48 11 Q 40 12 34 14 Z" />
      {/* 下翅 */}
      <path
        d="M 34 18 Q 42 22 52 23 Q 60 23 66 21 L 64 19 Q 58 20 52 20 Q 44 19 38 18 Z"
        opacity="0.7"
      />
      {/* 拖腿 */}
      <line x1="12" y1="18" x2="2" y2="24" stroke="currentColor" strokeWidth="0.7" strokeLinecap="round" />
      <line x1="14" y1="18" x2="4" y2="25" stroke="currentColor" strokeWidth="0.7" strokeLinecap="round" />
    </svg>
  );
}

/* ---------- FlyingCranes：5-6 只独立飞鹤层 ---------- */
function FlyingCranes() {
  const cranes = [
    { id: 1, left: "9%",   top: "62%",   width: 124, opacity: 0.58, rotate: -10, flip: false, delay: -2,  duration: 14 },
    { id: 2, right: "13%", top: "16%",   width: 92,  opacity: 0.46, rotate: 6,   flip: true,  delay: -5,  duration: 16 },
    { id: 3, left: "44%",  bottom: "8%", width: 76,  opacity: 0.34, rotate: 4,   flip: false, delay: -8,  duration: 11 },
    { id: 4, right: "8%",  top: "52%",   width: 96,  opacity: 0.5,  rotate: -8,  flip: true,  delay: -3,  duration: 13 },
    { id: 5, left: "16%",  top: "26%",   width: 64,  opacity: 0.32, rotate: 3,   flip: false, delay: -10, duration: 12 },
    { id: 6, left: "70%",  top: "8%",    width: 52,  opacity: 0.26, rotate: -4,  flip: false, delay: -6,  duration: 18 },
  ];
  return (
    <div className="flying-cranes" aria-hidden="true">
      {cranes.map((c) => (
        <CraneSvg
          key={c.id}
          className={`crane crane-${c.id} ${c.flip ? "flip" : ""}`}
          style={{
            left: c.left,
            right: c.right,
            top: c.top,
            bottom: c.bottom,
            width: `${c.width}px`,
            opacity: c.opacity,
            "--rot": `${c.rotate}deg`,
            "--delay": `${c.delay}s`,
            "--dur": `${c.duration}s`,
          }}
        />
      ))}
    </div>
  );
}

/* ---------- SongGalaxyAtmosphere：氛围层 / 黑金宋代星图 ---------- */
function SongGalaxyAtmosphere({ rotation = 0 }) {
  // 用 rotation 做轻微视差（飞鹤层稳定，SVG 微动）
  const parallaxX = rotation * 0.4;
  return (
    <div
      className="atmosphere-layer"
      style={{ "--stage-rotation": `${rotation}deg`, "--parallax-x": `${parallaxX}px` }}
      aria-hidden="true"
    >
      {/* 1) 5 处暗金光雾 */}
      <div className="atmos-fog">
        <span className="fog fog-center" />
        <span className="fog fog-tl" />
        <span className="fog fog-tr" />
        <span className="fog fog-bl" />
        <span className="fog fog-br" />
      </div>

      {/* 2) 三层星尘 + 宣纸纹理 */}
      <div className="atmos-stars">
        <span className="dust dust-far" />
        <span className="dust dust-mid" />
        <span className="dust dust-near" />
      </div>

      {/* 3) SVG：椭圆轨道 + 贝塞尔流线 + 行星光点 */}
      <svg
        className="atmos-svg"
        viewBox="0 0 1000 600"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <filter id="goldGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2.4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <radialGradient id="orbitFade" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(232,196,119,0.45)" />
            <stop offset="100%" stopColor="rgba(232,196,119,0)" />
          </radialGradient>
          {/* 椭圆路径 —— 给沿轨道运行的光点用 */}
          <path id="orbitPath1" d="M 320 300 a 180 110 0 1 0 360 0 a 180 110 0 1 0 -360 0" />
          <path id="orbitPath2" d="M 230 300 a 270 165 0 1 0 540 0 a 270 165 0 1 0 -540 0" />
          {/* 4 条贝塞尔流线 */}
          <path id="flowTL" d="M 500 300 C 380 240, 270 180, 170 110" />
          <path id="flowTR" d="M 500 300 C 620 240, 730 180, 830 110" />
          <path id="flowBL" d="M 500 300 C 380 380, 260 460, 170 500" />
          <path id="flowBR" d="M 500 300 C 620 380, 740 460, 830 500" />
        </defs>

        {/* —— 椭圆轨道层（中央亮 / 外围淡） —— */}
        <ellipse cx="500" cy="300" rx="140" ry="86"  fill="none" stroke="rgba(232,196,119,0.42)" strokeWidth="0.9" strokeDasharray="3 10" filter="url(#goldGlow)" />
        <ellipse cx="500" cy="300" rx="180" ry="112" fill="none" stroke="rgba(216,181,109,0.32)" strokeWidth="0.7" strokeDasharray="8 16" />
        <ellipse cx="500" cy="300" rx="225" ry="138" fill="none" stroke="rgba(216,181,109,0.24)" strokeWidth="0.6" strokeDasharray="1 12" />
        <ellipse cx="500" cy="300" rx="280" ry="172" fill="none" stroke="rgba(216,181,109,0.18)" strokeWidth="0.6" strokeDasharray="4 10" />
        <ellipse cx="500" cy="300" rx="340" ry="208" fill="none" stroke="rgba(216,181,109,0.13)" strokeWidth="0.6" strokeDasharray="2 18" />
        <ellipse cx="500" cy="300" rx="410" ry="248" fill="none" stroke="rgba(216,181,109,0.10)" strokeWidth="0.5" strokeDasharray="1 14" />
        <ellipse cx="500" cy="300" rx="490" ry="295" fill="none" stroke="rgba(216,181,109,0.06)" strokeWidth="0.5" strokeDasharray="3 22" />

        {/* —— 中央光圈（最亮内圈） —— */}
        <circle cx="500" cy="300" r="48" fill="url(#orbitFade)" opacity="0.5" />
        <circle cx="500" cy="300" r="118" fill="none" stroke="rgba(232,196,119,0.42)" strokeWidth="0.7" strokeDasharray="2 6" filter="url(#goldGlow)" />

        {/* —— 4 条贝塞尔流线（C 位 → 4 星系，dashoffset 流动）—— */}
        <path d="M 500 300 C 380 240, 270 180, 170 110" stroke="rgba(216,181,109,0.36)" strokeWidth="0.7" strokeDasharray="4 8" fill="none" filter="url(#goldGlow)">
          <animate attributeName="stroke-dashoffset" from="0" to="-120" dur="14s" repeatCount="indefinite" />
        </path>
        <path d="M 500 300 C 620 240, 730 180, 830 110" stroke="rgba(216,181,109,0.36)" strokeWidth="0.7" strokeDasharray="4 8" fill="none" filter="url(#goldGlow)">
          <animate attributeName="stroke-dashoffset" from="0" to="-120" dur="16s" repeatCount="indefinite" />
        </path>
        <path d="M 500 300 C 380 380, 260 460, 170 500" stroke="rgba(216,181,109,0.36)" strokeWidth="0.7" strokeDasharray="4 8" fill="none" filter="url(#goldGlow)">
          <animate attributeName="stroke-dashoffset" from="0" to="-120" dur="18s" repeatCount="indefinite" />
        </path>
        <path d="M 500 300 C 620 380, 740 460, 830 500" stroke="rgba(216,181,109,0.36)" strokeWidth="0.7" strokeDasharray="4 8" fill="none" filter="url(#goldGlow)">
          <animate attributeName="stroke-dashoffset" from="0" to="-120" dur="15s" repeatCount="indefinite" />
        </path>

        {/* —— 关键节点小金点（C 位 + 4 角）—— */}
        <circle cx="500" cy="300" r="2.6" fill="#f3d792" filter="url(#goldGlow)">
          <animate attributeName="r" values="2.6; 3.4; 2.6" dur="3.6s" repeatCount="indefinite" />
        </circle>
        <circle cx="170" cy="110" r="2" fill="#e8c477" filter="url(#goldGlow)">
          <animate attributeName="opacity" values="0.6;1;0.6" dur="4.2s" repeatCount="indefinite" />
        </circle>
        <circle cx="830" cy="110" r="2" fill="#e8c477" filter="url(#goldGlow)">
          <animate attributeName="opacity" values="0.6;1;0.6" dur="3.8s" repeatCount="indefinite" />
        </circle>
        <circle cx="170" cy="500" r="2" fill="#e8c477" filter="url(#goldGlow)">
          <animate attributeName="opacity" values="0.6;1;0.6" dur="4.6s" repeatCount="indefinite" />
        </circle>
        <circle cx="830" cy="500" r="2" fill="#e8c477" filter="url(#goldGlow)">
          <animate attributeName="opacity" values="0.6;1;0.6" dur="4s" repeatCount="indefinite" />
        </circle>

        {/* —— 沿椭圆轨道运行的"御览光点" —— */}
        <circle r="2.2" fill="#f5d796" filter="url(#goldGlow)">
          <animateMotion dur="22s" repeatCount="indefinite" rotate="auto">
            <mpath href="#orbitPath1" />
          </animateMotion>
        </circle>
        <circle r="1.8" fill="#e8c477" filter="url(#goldGlow)">
          <animateMotion dur="34s" repeatCount="indefinite" rotate="auto" begin="-8s">
            <mpath href="#orbitPath2" />
          </animateMotion>
        </circle>
        <circle r="1.6" fill="#e8c477" filter="url(#goldGlow)">
          <animateMotion dur="28s" repeatCount="indefinite" rotate="auto" begin="-12s">
            <mpath href="#orbitPath2" />
          </animateMotion>
        </circle>

        {/* —— 沿流线运行的小光点（御览路线） —— */}
        <circle r="1.6" fill="#f3d792" filter="url(#goldGlow)">
          <animateMotion dur="14s" repeatCount="indefinite">
            <mpath href="#flowTL" />
          </animateMotion>
        </circle>
        <circle r="1.4" fill="#f3d792" filter="url(#goldGlow)">
          <animateMotion dur="16s" repeatCount="indefinite" begin="-4s">
            <mpath href="#flowTR" />
          </animateMotion>
        </circle>
        <circle r="1.6" fill="#f3d792" filter="url(#goldGlow)">
          <animateMotion dur="15s" repeatCount="indefinite" begin="-8s">
            <mpath href="#flowBR" />
          </animateMotion>
        </circle>
        <circle r="1.4" fill="#f3d792" filter="url(#goldGlow)">
          <animateMotion dur="18s" repeatCount="indefinite" begin="-2s">
            <mpath href="#flowBL" />
          </animateMotion>
        </circle>
      </svg>

      {/* 4) 飞鹤层 —— 独立元素，不写死在背景里 */}
      <FlyingCranes />
    </div>
  );
}

function StarBackdrop() {
  // 兼容其他视图（galaxy/list/detail）继续使用
  return (
    <div className="star-backdrop" aria-hidden="true">
      <div className="star-far" />
      <div className="star-mid" />
      <div className="star-near" />
      <div className="nebula" />
    </div>
  );
}

function BottomFocusCard({ artwork, dim, onOpen }) {
  if (!artwork) return null;
  const title = displayArtworkTitle(artwork, "宋代审美");
  const date = formatDate(artwork.date || artwork.period || artwork.dynasty);
  const author = localizeArtist(artwork.artist);
  const medium = cleanText(artwork.medium, "绢本设色");
  const tags = detailTags(artwork);
  const line = shortLineOf(artwork);
  return (
    <aside className={`focus-card ${dim ? "dim" : ""}`}>
      <div className="focus-thumb">
        <img src={artworkImage(artwork)} alt={title} />
      </div>
      <div className="focus-body">
        <div className="focus-head">
          <strong>{title}</strong>
          <span className="focus-pill">当前焦点</span>
        </div>
        <p className="focus-meta">
          {author} · {date} · {medium}
        </p>
        <div className="focus-tags">
          {tags.map((t) => (
            <span key={t}>{t}</span>
          ))}
        </div>
        <p className="focus-line">{line}</p>
      </div>
      <button type="button" className="focus-cta" onClick={() => onOpen(artwork)}>
        查看详情
        <ChevronRight size={14} />
      </button>
    </aside>
  );
}

function BottomControls({
  autoplay,
  onToggleAutoplay,
  speed,
  onChangeSpeed,
  onLocate,
  hint,
}) {
  return (
    <div className="bottom-controls">
      <button
        type="button"
        className={`bc-play ${autoplay ? "on" : ""}`}
        onClick={onToggleAutoplay}
        aria-label="自动导览"
        title="自动导览"
      >
        <i />
      </button>
      <div className="bc-block">
        <small>自动导览</small>
        <span className={autoplay ? "on" : ""}>{autoplay ? "进行中" : "已暂停"}</span>
      </div>
      <div className="bc-block bc-speed">
        <small>速度</small>
        <input
          type="range"
          min="0.5"
          max="2"
          step="0.1"
          value={speed}
          onChange={(e) => onChangeSpeed(Number(e.target.value))}
        />
        <b>{speed.toFixed(1)}x</b>
      </div>
      <button type="button" className="bc-locate" onClick={onLocate} title="重置视角">
        <Crosshair size={14} />
        定位
      </button>
      {hint && <span className="bc-hint">{hint}</span>}
    </div>
  );
}

/* ---------- 4. OverviewStage ：首页主舞台 ---------- */

function OverviewStage({
  artifacts,
  rotation,
  setRotation,
  hovered,
  setHovered,
  onEnterGalaxy,
  onOpenArtwork,
  isDragging,
  onDragStart,
  onDragEnd,
  onCenterArtworkChange,
}) {
  const stageRef = useRef(null);
  const dragRef = useRef(null);

  const crane = useMemo(() => findCraneRecord(artifacts), [artifacts]);

  // 「瑞鹤图系列」3-4 个相关作品，作为 C 位周围的小卫星（很轻、很淡）
  const craneSeries = useMemo(() => {
    if (!artifacts.length || !crane) return [];
    const candidates = artifacts
      .filter((x) => x.id !== crane.id)
      .filter((x) => {
        const t = `${x.title || ""} ${(x.tags || []).join(" ")}`;
        return /Cranes|crane|鹤|鶴|Huizong|徽宗|auspicious|祥瑞|parakeet|five-color|bird/i.test(t);
      })
      .sort((a, b) => {
        const la = Number(Boolean(a.local_thumb)) - Number(Boolean(b.local_thumb));
        if (la !== 0) return -la;
        return tourScore(b) - tourScore(a);
      })
      .slice(0, 4);
    return candidates;
  }, [artifacts, crane]);

  // 通知 App C 位是 crane（用于 focus card 同步）
  useEffect(() => {
    if (crane && onCenterArtworkChange) onCenterArtworkChange(crane);
  }, [crane, onCenterArtworkChange]);

  const islands = useMemo(() => {
    return galaxyOrder.map((id) => ({
      id,
      cfg: galaxyConfig[id],
      hero: findGalaxyHero(artifacts, id),
      cards: getGalaxyShowcase(artifacts, id, 5),
    }));
  }, [artifacts]);

  const beginDrag = (e) => {
    if (e.button != null && e.button !== 0) return;
    dragRef.current = { x: e.clientX, base: rotation };
    onDragStart?.();
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };
  const moveDrag = (e) => {
    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.x;
    const next = Math.max(-38, Math.min(38, dragRef.current.base + dx * 0.18));
    setRotation(next);
  };
  const endDrag = (e) => {
    if (!dragRef.current) return;
    dragRef.current = null;
    onDragEnd?.();
    // 吸附到最近的"可读"角度
    const cur = rotation;
    const nearest = [-28, 0, 28].reduce(
      (b, v) => (Math.abs(v - cur) < Math.abs(b - cur) ? v : b),
      0,
    );
    if (Math.abs(nearest - cur) > 6 && Math.abs(nearest - cur) < 18) {
      setRotation(nearest);
    } else if (Math.abs(cur) < 6) {
      setRotation(0);
    }
  };

  // 键盘 ← →
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowLeft") setRotation((r) => Math.max(-38, r - 8));
      else if (e.key === "ArrowRight") setRotation((r) => Math.min(38, r + 8));
      else if (e.key === "Home") setRotation(0);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setRotation]);

  return (
    <section
      ref={stageRef}
      className={`overview-stage ${isDragging ? "dragging" : ""}`}
      onPointerDown={beginDrag}
      onPointerMove={moveDrag}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      style={{ "--rot": `${rotation}deg` }}
    >
      {/* 氛围层（背景层 / 黑金宋代星图 / 飞鹤）—— 不参与 stage-3d 旋转 */}
      <SongGalaxyAtmosphere rotation={rotation} />

      <div className="stage-3d">
        {/* C 位永远是瑞鹤图 + 三层光场 + 系列卫星 */}
        {crane && (
          <div className="hero-cluster">
            {/* 展台 halo + 光环 */}
            <div className="hero-stage" aria-hidden="true">
              <span className="hero-halo" />
              <span className="hero-pedestal" />
              <span className="hero-rotline" />
              <span className="hero-rotline outer" />
            </div>
            {/* 瑞鹤图系列卫星 — 围绕 C 位 4 个小卡 */}
            {craneSeries.map((sat, i) => (
              <button
                key={sat.id}
                type="button"
                className={`hero-satellite sat-${i}`}
                onPointerDown={(e) => e.stopPropagation()}
                onMouseEnter={() => setHovered(sat)}
                onMouseLeave={() => setHovered(null)}
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenArtwork(sat);
                }}
                title={displayArtworkTitle(sat)}
                style={{ "--si": i }}
              >
                <img src={artworkImage(sat)} alt="" loading="lazy" />
              </button>
            ))}
            {/* 主卡 */}
            <button
              type="button"
              className={`crane-hero ${hovered?.id === crane.id ? "hovered" : ""}`}
              onPointerDown={(e) => e.stopPropagation()}
              onMouseEnter={() => setHovered(crane)}
              onMouseLeave={() => setHovered(null)}
              onClick={(e) => {
                e.stopPropagation();
                onOpenArtwork(crane);
              }}
              title="瑞鹤图"
              aria-label="打开 瑞鹤图"
            >
              <div className="crane-frame">
                <img src={artworkImage(crane, "full")} alt="瑞鹤图" />
                <span className="frame-glow" />
                <span className="frame-corner tl" />
                <span className="frame-corner tr" />
                <span className="frame-corner bl" />
                <span className="frame-corner br" />
              </div>
              <div className="crane-plaque">
                <span className="plaque-stamp">瑞</span>
                <div>
                  <strong>瑞鹤图</strong>
                  <small>传宋徽宗赵佶 · 天命 · 祥瑞</small>
                </div>
              </div>
            </button>
          </div>
        )}

        {/* 4 个星系岛屿 */}
        {islands.map((isle) => (
          <button
            type="button"
            key={isle.id}
            className={`galaxy-island slot-${isle.cfg.slot}`}
            onPointerDown={(e) => e.stopPropagation()}
            onMouseEnter={() => isle.hero && setHovered(isle.hero)}
            onMouseLeave={() => setHovered(null)}
            onClick={(e) => {
              e.stopPropagation();
              onEnterGalaxy(isle.id);
            }}
            style={{ "--accent": isle.cfg.color }}
            aria-label={`进入 ${isle.cfg.label}`}
          >
            <div className="island-cluster">
              {isle.cards.slice(0, 5).map((card, i) => (
                <span
                  key={card?.id || i}
                  className={`island-thumb thumb-${i}`}
                  style={{ "--ti": i }}
                >
                  {card && (
                    <img
                      src={artworkImage(card)}
                      alt=""
                      loading="lazy"
                      decoding="async"
                    />
                  )}
                </span>
              ))}
            </div>
            <div className="island-label">
              <isle.cfg.icon size={13} />
              <strong>{isle.cfg.label}</strong>
              <em>
                {isle.cfg.count}件 · {isle.cfg.short}
              </em>
            </div>
          </button>
        ))}
      </div>

      {/* 拖拽提示 */}
      <div className="drag-hint" aria-hidden="true">
        <RotateCw size={12} />
        拖动 或 使用 ← → 键浏览
      </div>
    </section>
  );
}

/* ---------- 5. GalaxyOrbitView ：进入花鸟世界 / 任意星系 ---------- */

function GalaxyOrbitView({
  galaxy,
  artifacts,
  hovered,
  setHovered,
  onOpenArtwork,
  onSwitchMode,
  onBack,
  mode,
}) {
  const cfg = galaxyConfig[galaxy];
  const works = useMemo(() => getGalaxyShowcase(artifacts, galaxy, 9), [artifacts, galaxy]);
  const hero = works[0];
  const ring = works.slice(1, 9);

  return (
    <section className="galaxy-stage">
      <StarBackdrop />
      <div className="orbital-rings galaxy-rings" aria-hidden="true">
        <span className="ring r1" />
        <span className="ring r2" />
        <span className="ring r3" />
      </div>

      <div className="galaxy-info">
        <button type="button" className="g-back" onClick={onBack}>
          <ChevronLeft size={14} /> 返回银河
        </button>
        <h1 className="g-title">{cfg.introTitle}</h1>
        <p className="g-sub">{cfg.introSub}</p>
        <p className="g-blurb">{cfg.introBody}</p>
        <button
          type="button"
          className="g-explore"
          onClick={() => onSwitchMode("list")}
        >
          探索此星系 <ChevronRight size={14} />
        </button>
      </div>

      <div className="galaxy-toggle">
        <button
          type="button"
          className={mode === "galaxy" ? "on" : ""}
          onClick={() => onSwitchMode("galaxy")}
        >
          <Layers size={13} />
          星系视图
        </button>
        <button
          type="button"
          className={mode === "list" ? "on" : ""}
          onClick={() => onSwitchMode("list")}
        >
          <List size={13} />
          列表览图
        </button>
      </div>

      <div className="galaxy-orbit galaxy-orbit-3d">
        {/* 椭圆透视轨道线 + 金色展台 */}
        <div className="g-pedestal" aria-hidden="true">
          <span className="g-pedestal-halo" />
          <span className="g-pedestal-disc" />
          <span className="g-orbit-ring r1" />
          <span className="g-orbit-ring r2" />
          <span className="g-orbit-ring r3" />
        </div>

        {hero && (
          <button
            type="button"
            className="g-hero"
            onMouseEnter={() => setHovered(hero)}
            onMouseLeave={() => setHovered(null)}
            onClick={() => onOpenArtwork(hero)}
            style={{ "--accent": cfg.color }}
            title={displayArtworkTitle(hero)}
          >
            <div className="g-hero-frame">
              <img src={artworkImage(hero, "full")} alt={displayArtworkTitle(hero)} />
              <span className="frame-glow" />
              <span className="frame-corner tl" />
              <span className="frame-corner tr" />
              <span className="frame-corner bl" />
              <span className="frame-corner br" />
            </div>
            <div className="g-hero-cap">
              <span className="g-hero-stamp">{cfg.seal}</span>
              <div>
                <strong>{displayArtworkTitle(hero)}</strong>
                <small>{cfg.tag}</small>
              </div>
            </div>
          </button>
        )}

        {ring.map((work, i) => {
          const total = Math.max(ring.length, 1);
          const angle = (i / total) * Math.PI * 2 - Math.PI / 2 + 0.22;
          // 透视轨道：x 大、y 小（椭圆扁平），加深度因子 z 模拟前后
          const rx = 38;
          const ry = 18; // 比之前更扁——透视感更强
          const x = 50 + Math.cos(angle) * rx;
          const y = 50 + Math.sin(angle) * ry;
          // sin(angle) > 0 -> 卡在前方（更大 / 更亮）；< 0 -> 后方（缩小 / 暗）
          const depth = Math.sin(angle); // -1..1
          const scale = 0.82 + (depth + 1) / 2 * 0.36; // 0.82..1.18
          const opacity = 0.62 + (depth + 1) / 2 * 0.38; // 0.62..1
          const tilt = Math.cos(angle) * -8; // 左右翻转 rotateY
          return (
            <button
              type="button"
              key={work.id}
              className="g-orbit-card"
              style={{
                "--gx": `${x}%`,
                "--gy": `${y}%`,
                "--gi": i,
                "--gscale": scale,
                "--gopacity": opacity,
                "--gtilt": `${tilt}deg`,
                zIndex: Math.round((depth + 1) * 50) + 10,
              }}
              onMouseEnter={() => setHovered(work)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => onOpenArtwork(work)}
              title={displayArtworkTitle(work)}
            >
              <div className="g-thumb">
                <img src={artworkImage(work)} alt="" />
              </div>
              <span className="g-tag">{displayArtworkTitle(work)}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

/* ---------- 6. GalleryListView ：列表览图 ---------- */

function GalleryListView({
  galaxy,
  artifacts,
  onOpenArtwork,
  onBack,
  onSwitchMode,
}) {
  const cfg = galaxyConfig[galaxy];
  const all = useMemo(() => getGalaxyAll(artifacts, galaxy), [artifacts, galaxy]);
  const filters = listFiltersByGalaxy[galaxy] || listFiltersByGalaxy.nature;
  const timeline = timelineByGalaxy[galaxy] || timelineByGalaxy.nature;
  const [filter, setFilter] = useState("all");
  const filtered = useMemo(() => {
    if (filter === "all") return all;
    const f = filters.find((x) => x.id === filter);
    if (!f?.match) return all;
    return all.filter((x) =>
      f.match.test(
        [x.title, x.tags?.join(" "), x.medium, x.period].filter(Boolean).join(" "),
      ),
    );
  }, [all, filter, filters]);

  return (
    <section className="scroll-hall">
      <StarBackdrop />
      {/* 顶部展览分区头 */}
      <header className="hall-head">
        <button type="button" className="g-back hall-back" onClick={onBack}>
          <ChevronLeft size={14} /> 返回银河
        </button>
        <div className="hall-title-row">
          <div className="hall-title-block">
            <h1 className="hall-title">{cfg.introTitle}</h1>
            <p className="hall-sub">{cfg.introSub}</p>
            <p className="hall-blurb">{cfg.introBody}</p>
            <p className="hall-meta">
              <i className="hall-stamp">{cfg.seal}</i>
              共 <b>{all.length}</b> 件相关作品 · 当前筛选 <b>{filters.find((f) => f.id === filter)?.label}</b>
            </p>
          </div>
          <div className="hall-toggle">
            <button type="button" onClick={() => onSwitchMode("galaxy")}>
              <Layers size={13} />
              <span>星系视图</span>
            </button>
            <button type="button" className="on">
              <List size={13} />
              <span>列表览图</span>
            </button>
          </div>
        </div>

        {/* 策展铭牌筛选 */}
        <div className="curator-tags" role="group" aria-label="策展筛选">
          {filters.map((f) => (
            <button
              type="button"
              key={f.id}
              className={`ct-chip ${filter === f.id ? "on" : ""}`}
              onClick={() => setFilter(f.id)}
            >
              <span className="ct-mark" />
              <em>{f.label}</em>
            </button>
          ))}
        </div>
      </header>

      {/* 卷轴陈列网格 */}
      <div className="scroll-grid">
        {filtered.map((work) => {
          const t = displayArtworkTitle(work);
          const d = formatDate(work.date || work.period || work.dynasty);
          const a = localizeArtist(work.artist);
          const m = inferDomain(work);
          const medium = localizeMedium(work.medium);
          const tagLabel = ({
            inscription: "书法",
            collection: "收藏",
            vessel: "器用",
            nature: "花鸟",
          }[m] ?? "宋代");
          const subTags = [tagLabel, medium].filter(Boolean).slice(0, 2);
          return (
            <button
              type="button"
              key={work.id}
              className="scroll-card"
              onClick={() => onOpenArtwork(work)}
              title={t}
            >
              {/* 左轴 */}
              <span className="scroll-rod left" aria-hidden="true">
                <i className="rod-cap" />
                <i className="rod-body" />
                <i className="rod-cap bottom" />
              </span>
              {/* 卷面 */}
              <span className="scroll-body">
                <span className="scroll-image">
                  <img src={artworkImage(work)} alt="" loading="lazy" />
                  <span className="scroll-shine" />
                </span>
                <span className="scroll-info">
                  <strong className="scroll-title">{t}</strong>
                  <small className="scroll-author">{a}</small>
                  <em className="scroll-date">{d}</em>
                  <span className="scroll-tags">
                    {subTags.map((tag) => (
                      <i key={tag}>{tag}</i>
                    ))}
                  </span>
                </span>
                {/* 角落收藏徽标 */}
                <span className="scroll-seal" aria-hidden="true">
                  {work.related_to_huizong ? "宣和" : cfg.seal}
                </span>
              </span>
              {/* 右轴 */}
              <span className="scroll-rod right" aria-hidden="true">
                <i className="rod-cap" />
                <i className="rod-body" />
                <i className="rod-cap bottom" />
              </span>
            </button>
          );
        })}
      </div>

      {/* 底部时间轴 */}
      <footer className="hall-timeline">
        <span className="hall-time-line" />
        {timeline.map((t, i) => (
          <span key={t} className="hall-time-stop">
            <i />
            <em>{t}</em>
          </span>
        ))}
      </footer>
    </section>
  );
}

/* ---------- 7. ArtworkDetailView ：作品详情 ---------- */

function ArtworkDetailView({ artwork, artifacts, onBack, onOpenArtwork }) {
  const [zoom, setZoom] = useState(1);
  const [activeThumb, setActiveThumb] = useState(0);

  const related = useMemo(() => getRelated(artifacts, artwork, 6), [artifacts, artwork]);
  const tags = detailTags(artwork);
  const meta = metaPairs(artwork);

  if (!artwork) return null;
  const title = displayArtworkTitle(artwork);
  const author = localizeArtist(artwork.artist);
  const date = formatDate(artwork.date || artwork.period || artwork.dynasty);
  const medium = cleanText(artwork.medium, "绢本设色");
  const blurb = shortLineOf(artwork);

  const thumbStrip = [artwork, ...related.slice(0, 3)].filter(Boolean);

  // Esc 退出
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onBack();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onBack]);

  const fitZoom = () => setZoom(1);
  const zoomIn = () => setZoom((z) => Math.min(3, z + 0.2));
  const zoomOut = () => setZoom((z) => Math.max(0.6, z - 0.2));

  return (
    <section className="detail-stage">
      <StarBackdrop />
      <button type="button" className="d-close" onClick={onBack} aria-label="关闭">
        <X size={18} />
      </button>

      <button type="button" className="d-back" onClick={onBack}>
        <ChevronLeft size={14} /> 返回银河
      </button>

      <div className="d-shell">
        <div className="d-image-area">
          <div className="d-image-stage" style={{ "--z": zoom }}>
            <img
              src={artworkImage(thumbStrip[activeThumb] ?? artwork, "full")}
              alt={title}
            />
          </div>

          {/* 缩略图条 */}
          <div className="d-thumb-strip">
            {thumbStrip.map((it, i) => (
              <button
                type="button"
                key={`${it.id}-${i}`}
                className={i === activeThumb ? "on" : ""}
                onClick={() => setActiveThumb(i)}
                aria-label={`细节 ${i + 1}`}
              >
                <img src={artworkImage(it)} alt="" />
              </button>
            ))}
          </div>

          {/* 缩放控制 */}
          <div className="d-zoom">
            <button type="button" onClick={zoomOut} aria-label="缩小">
              <Minus size={13} />
            </button>
            <span>{Math.round(zoom * 100)}%</span>
            <button type="button" onClick={zoomIn} aria-label="放大">
              <Plus size={13} />
            </button>
            <button type="button" onClick={fitZoom} className="d-fit" aria-label="适应屏幕">
              <Maximize2 size={13} />
              重置
            </button>
          </div>

          {/* 角落 mini-map（仅 zoom > 1.05 时出现） */}
          {zoom > 1.05 && (
            <div className="d-minimap" aria-hidden="true">
              <img src={artworkImage(thumbStrip[activeThumb] ?? artwork)} alt="" />
              <span className="vp" style={{ "--zv": zoom }} />
            </div>
          )}
        </div>

        <aside className="d-info">
          <div className="d-info-head">
            <div className="d-title-row">
              <span className="d-stamp">{galaxyConfig[inferDomain(artwork)]?.seal ?? "宋"}</span>
              <div>
                <h1>{title}</h1>
                <p className="d-author">{author}</p>
              </div>
            </div>
            <p className="d-meta">
              {date} · {localizeMedium(artwork.medium)}
            </p>
            <div className="d-tags">
              {tags.map((t) => (
                <span key={t}>{t}</span>
              ))}
            </div>
          </div>

          <div className="d-curator">
            <small className="d-curator-label">策展手记</small>
            <p className="d-blurb">{blurb}</p>
          </div>

          <div className="d-info-grid">
            {meta.map(([k, v]) => (
              <div key={k}>
                <small>{k}</small>
                <b>{v}</b>
              </div>
            ))}
          </div>

          <div className="d-actions">
            <button type="button">
              <Heart size={13} /> 收藏
            </button>
            <button type="button">
              <Download size={13} /> 下载
            </button>
            <button type="button">
              <Share2 size={13} /> 分享
            </button>
            <button type="button">
              <Bookmark size={13} /> 学术笔记
            </button>
          </div>

          {artwork.source_url && (
            <a
              href={artwork.source_url}
              target="_blank"
              rel="noreferrer"
              className="d-source"
            >
              <ExternalLink size={13} /> 查看馆藏来源
            </a>
          )}
        </aside>

        {/* 相关作品 */}
        <aside className="d-related">
          <small>相关作品</small>
          <div className="d-related-list">
            {related.slice(0, 4).map((it) => (
              <button
                type="button"
                key={it.id}
                onClick={() => onOpenArtwork(it)}
                title={displayArtworkTitle(it)}
              >
                <div className="r-thumb">
                  <img src={artworkImage(it)} alt="" />
                </div>
                <div className="r-info">
                  <strong>{displayArtworkTitle(it)}</strong>
                  <small>{localizeArtist(it.artist)}</small>
                  <em>
                    {{
                      inscription: "书法",
                      collection: "收藏",
                      vessel: "器用",
                      nature: "花鸟",
                    }[inferDomain(it)] ?? "宋代"}
                  </em>
                </div>
              </button>
            ))}
          </div>
          <button type="button" className="d-related-more" onClick={onBack}>
            查看全部相关作品 <ChevronRight size={14} />
          </button>
        </aside>
      </div>
    </section>
  );
}

/* ---------- 8. DemoPlayer ---------- */

const DEMO_SCRIPT = [
  { t: 0, action: "overview" },
  { t: 4000, action: "rotate", value: 28 },
  { t: 7000, action: "rotate", value: 0 },
  { t: 8000, action: "enter_galaxy", value: "nature" },
  { t: 13000, action: "switch_list" },
  { t: 17000, action: "open_hero" },
  { t: 22000, action: "back_overview" },
];

function useDemoMode({
  isDemo,
  setView,
  setActiveGalaxy,
  setActiveArtwork,
  setRotation,
  setListMode,
  artifacts,
  setSpeed,
}) {
  useEffect(() => {
    if (!isDemo || !artifacts.length) return undefined;
    setSpeed(1);
    const timers = DEMO_SCRIPT.map((step) =>
      window.setTimeout(() => {
        switch (step.action) {
          case "overview":
            setView("overview");
            setActiveArtwork(null);
            setActiveGalaxy(null);
            setRotation(0);
            break;
          case "rotate":
            setRotation(step.value);
            break;
          case "enter_galaxy":
            setView("galaxy");
            setActiveGalaxy(step.value);
            setListMode("galaxy");
            break;
          case "switch_list":
            setListMode("list");
            break;
          case "open_hero": {
            const hero = findGalaxyHero(artifacts, "nature");
            if (hero) {
              setActiveArtwork(hero);
              setView("detail");
            }
            break;
          }
          case "back_overview":
            setActiveArtwork(null);
            setView("overview");
            setActiveGalaxy(null);
            setRotation(0);
            break;
          default:
            break;
        }
      }, step.t),
    );
    // 循环
    const loopT = window.setTimeout(() => {
      // 触发再播一次：通过设置状态使依赖变化（简化：reload 第一帧）
      setView("overview");
      setActiveGalaxy(null);
      setActiveArtwork(null);
      setRotation(0);
    }, 26000);
    return () => {
      timers.forEach(window.clearTimeout);
      window.clearTimeout(loopT);
    };
  }, [isDemo, artifacts, setView, setActiveGalaxy, setActiveArtwork, setRotation, setListMode, setSpeed]);
}

/* ---------- 9. App ---------- */

function App() {
  const artifacts = useArtifacts();

  // view router
  const [view, setView] = useState("overview"); // overview | galaxy | list | detail
  const [activeGalaxy, setActiveGalaxy] = useState(null);
  const [activeArtwork, setActiveArtwork] = useState(null);
  const [listMode, setListMode] = useState("galaxy"); // galaxy | list (内部 toggle)

  // overview 拖拽旋转
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  // 控制条
  const [autoplay, setAutoplay] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [hovered, setHovered] = useState(null);

  // demo 模式
  const isDemo = useMemo(() => {
    if (typeof window === "undefined") return false;
    return new URLSearchParams(window.location.search).get("demo") === "1";
  }, []);

  useDemoMode({
    isDemo,
    setView,
    setActiveGalaxy,
    setActiveArtwork,
    setRotation,
    setListMode,
    artifacts,
    setSpeed,
  });

  // 自动导览（非 demo 模式下，每隔几秒切换星系）
  useEffect(() => {
    if (!autoplay || isDemo) return undefined;
    if (view !== "overview") return undefined;
    const interval = window.setInterval(() => {
      setRotation((r) => {
        const next = r + 9 * speed;
        return next > 38 ? -38 : next;
      });
    }, 1200 / speed);
    return () => window.clearInterval(interval);
  }, [autoplay, speed, view, isDemo]);

  // 焦点 artwork（用于底部 focus card）
  const crane = useMemo(() => findCraneRecord(artifacts), [artifacts]);
  const [centerHero, setCenterHero] = useState(null); // 跟随中央 C 位轮播
  const focusArtwork =
    hovered ||
    activeArtwork ||
    (view === "overview"
      ? centerHero || crane
      : view === "galaxy" || view === "list"
      ? findGalaxyHero(artifacts, activeGalaxy)
      : null);

  // 顶部胶囊文案
  const capsule = useMemo(() => {
    if (view === "overview") {
      return { scope: "宇宙", name: "宋代审美银河", count: `${artifacts.length || 300}件 · 五域` };
    }
    if (view === "detail" && activeArtwork) {
      const g = inferDomain(activeArtwork);
      const cfg = galaxyConfig[g];
      return {
        scope: cfg ? "星系" : "宇宙",
        name: cfg ? cfg.label : "宋代审美银河",
        count: displayArtworkTitle(activeArtwork),
      };
    }
    if (activeGalaxy) {
      const cfg = galaxyConfig[activeGalaxy];
      const count = artifacts.filter((x) => inferDomain(x) === activeGalaxy && !isCraneHero(x))
        .length;
      return { scope: "星系", name: cfg.label, count: `${count}件 · ${cfg.short}` };
    }
    return { scope: "宇宙", name: "宋代审美银河", count: "300件 · 五域" };
  }, [view, activeArtwork, activeGalaxy, artifacts]);

  const goHome = () => {
    setView("overview");
    setActiveGalaxy(null);
    setActiveArtwork(null);
    setListMode("galaxy");
    setRotation(0);
  };
  const enterGalaxy = (id) => {
    setActiveGalaxy(id);
    setView("galaxy");
    setListMode("galaxy");
    setActiveArtwork(null);
  };
  const openArtwork = (a) => {
    setActiveArtwork(a);
    setView("detail");
  };
  const handleSwitchMode = (m) => {
    setListMode(m);
    if (m === "list") setView("list");
    else setView("galaxy");
  };
  const backFromDetail = () => {
    setActiveArtwork(null);
    if (activeGalaxy) {
      setView(listMode === "list" ? "list" : "galaxy");
    } else {
      setView("overview");
    }
  };

  const dim =
    view === "detail" || (view === "list" && hovered) ? false : false;

  return (
    <main className={`app-shell view-${view} ${isDemo ? "demo-mode" : ""}`}>
      <Sidebar
        activeView={view}
        activeGalaxy={activeGalaxy}
        onHome={goHome}
        onPickGalaxy={enterGalaxy}
      />

      {view !== "detail" && (
        <TitleBlock
          title={
            view === "overview"
              ? SITE_TITLE
              : galaxyConfig[activeGalaxy]?.introTitle ?? SITE_TITLE
          }
          subtitle={
            view === "overview"
              ? SITE_SUBTITLE
              : galaxyConfig[activeGalaxy]?.introSub ?? SITE_SUBTITLE
          }
        />
      )}

      <TopCapsule
        scope={capsule.scope}
        name={capsule.name}
        count={capsule.count}
        onSearch={() => {}}
        onMenu={goHome}
      />

      {view === "overview" && (
        <OverviewStage
          artifacts={artifacts}
          rotation={rotation}
          setRotation={setRotation}
          hovered={hovered}
          setHovered={setHovered}
          onEnterGalaxy={enterGalaxy}
          onOpenArtwork={openArtwork}
          isDragging={isDragging}
          onDragStart={() => setIsDragging(true)}
          onDragEnd={() => setIsDragging(false)}
          onCenterArtworkChange={setCenterHero}
        />
      )}

      {view === "galaxy" && activeGalaxy && (
        <GalaxyOrbitView
          galaxy={activeGalaxy}
          artifacts={artifacts}
          hovered={hovered}
          setHovered={setHovered}
          onOpenArtwork={openArtwork}
          onSwitchMode={handleSwitchMode}
          onBack={goHome}
          mode={listMode}
        />
      )}

      {view === "list" && activeGalaxy && (
        <GalleryListView
          galaxy={activeGalaxy}
          artifacts={artifacts}
          onOpenArtwork={openArtwork}
          onBack={goHome}
          onSwitchMode={handleSwitchMode}
        />
      )}

      {view === "detail" && activeArtwork && (
        <ArtworkDetailView
          artwork={activeArtwork}
          artifacts={artifacts}
          onBack={backFromDetail}
          onOpenArtwork={openArtwork}
        />
      )}

      {view !== "detail" && view !== "list" && (
        <BottomFocusCard artwork={focusArtwork} dim={dim} onOpen={openArtwork} />
      )}

      {view === "overview" && (
        <BottomControls
          autoplay={autoplay}
          onToggleAutoplay={() => setAutoplay((v) => !v)}
          speed={speed}
          onChangeSpeed={setSpeed}
          onLocate={() => setRotation(0)}
          hint={isDemo ? "Demo 自动播放中" : null}
        />
      )}
    </main>
  );
}

createRoot(document.getElementById("root")).render(<App />);
