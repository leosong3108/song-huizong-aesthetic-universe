import React, { useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { BookOpen, Brush, ChevronLeft, ChevronRight, CircleDot, ExternalLink, Feather, Mountain, Search, Sparkles, Waves, X } from "lucide-react";
import "./styles.css";

const categoryMeta = {
  flower_bird: { label: "花鸟", color: "#d6b36e", icon: Feather, center: [-4.7, 1.45, -0.8] },
  porcelain: { label: "宋瓷", color: "#9fb8a9", icon: CircleDot, center: [-4.45, -2.05, -1.1] },
  calligraphy: { label: "书法", color: "#d4c3a1", icon: Brush, center: [4.6, 1.7, -1.0] },
  landscape: { label: "山水", color: "#b8a17a", icon: Mountain, center: [4.1, -0.45, -1.2] },
  figure: { label: "雅集", color: "#c7a16b", icon: BookOpen, center: [2.45, 1.9, -1.4] },
  object: { label: "器物", color: "#b48a57", icon: Sparkles, center: [3.85, -2.35, -1.2] },
  painting: { label: "画卷", color: "#c9aa75", icon: Waves, center: [-2.25, 1.72, -1.0] },
};

const defaultMeta = { label: "文物", color: "#bda16b", icon: Sparkles, center: [0, 0, -1] };

const domainMeta = {
  omen: {
    label: "天象祥瑞",
    short: "祥瑞",
    seal: "瑞",
    color: "#d8b56f",
    icon: Sparkles,
    tag: "天命叙事",
    angle: -0.38,
    radius: 3.25,
    y: 1.12,
    depth: 560,
    note: "瑞鹤、彩云、宫门与题诗构成徽宗的天命叙事",
  },
  nature: {
    label: "格物花鸟",
    short: "花鸟",
    seal: "物",
    color: "#cfa65e",
    icon: Feather,
    tag: "画院写生",
    angle: -2.5,
    radius: 4.8,
    y: 0.76,
    depth: 470,
    note: "以细密观看自然，建立画院的写生与传神标准",
  },
  inscription: {
    label: "瘦金题跋",
    short: "书法",
    seal: "书",
    color: "#d8c7a1",
    icon: Brush,
    tag: "诗书画印",
    angle: 0.78,
    radius: 4.65,
    y: 0.92,
    depth: 510,
    note: "诗、书、题签、印章把图像纳入帝王观看秩序",
  },
  collection: {
    label: "宣和收藏",
    short: "收藏",
    seal: "藏",
    color: "#b99a69",
    icon: BookOpen,
    tag: "内府秩序",
    angle: 2.55,
    radius: 4.55,
    y: -1.03,
    depth: 500,
    note: "古画、宫廷图像与雅集共同组成宣和内府的收藏系统",
  },
  vessel: {
    label: "复古器用",
    short: "器用",
    seal: "器",
    color: "#9fb8a9",
    icon: CircleDot,
    tag: "清供礼制",
    angle: 1.55,
    radius: 5.05,
    y: -1.55,
    depth: 570,
    note: "宋瓷、茶器与古器物把清供、礼制和复古趣味连成一体",
  },
};

const domainOrder = ["omen", "nature", "inscription", "collection", "vessel"];

const timeModes = {
  all: { label: "全景", years: "960-1279", range: [960, 1279], description: "宋代图像与器物的全景星图" },
  early: { label: "北宋", years: "960-1099", range: [960, 1099], description: "北宋早期的宫廷、山水与器物基础" },
  xuanhe: { label: "宣和", years: "1100-1127", range: [1100, 1127], description: "徽宗时代的花鸟、书法与宫廷审美" },
  southern: { label: "南宋", years: "1128-1279", range: [1128, 1279], description: "靖康之后的南宋余韵与风格延续" },
};

const storyChapters = [
  {
    id: "thesis",
    label: "命题",
    domain: null,
    timeMode: "all",
    focus: [/Auspicious Cranes|瑞[鶴鹤]圖|瑞[鶴鹤]图/i],
    title: "他不是只会画画",
    hook: "把画、字、收藏和器物连起来看，宋徽宗更像是在设计一套王朝视觉系统。",
    insight: "这条线索从《瑞鹤图》开始：图像负责制造天命，花鸟负责训练观看，题跋负责认证，收藏负责归档，器物负责进入日常。",
    links: [
      ["《瑞鹤图》", "把天象变成王朝叙事"],
      ["瘦金题跋", "把皇帝签名写进图像"],
      ["宣和收藏", "把作品变成可管理的档案"],
    ],
  },
  {
    id: "omen",
    label: "祥瑞",
    domain: "omen",
    timeMode: "xuanhe",
    focus: [/Auspicious Cranes|瑞[鶴鹤]圖|瑞[鶴鹤]图|Song-Palace/i],
    title: "鹤不是鸟，是一条通知",
    hook: "1112 年的《瑞鹤图》把宫门、云气、题诗和鹤群放在一起，让自然现象变成政治图像。",
    insight: "这一幕连接的是“天象”和“皇权”：同样是鸟，飞过宫门时就不只是花鸟画，而是一套视觉合法性。",
    links: [
      ["瑞鹤", "从自然物变成祥瑞符号"],
      ["宫门", "把事件固定在权力中心"],
      ["御题", "用文字给图像盖章"],
    ],
  },
  {
    id: "nature",
    label: "格物",
    domain: "nature",
    timeMode: "xuanhe",
    focus: [/Finches and bamboo|竹禽|Five-colored|parakeet|写生珍禽|芙蓉|枇杷|梅花/i],
    title: "花鸟不是装饰，是观察方法",
    hook: "徽宗花鸟的重点不只是好看，而是把羽毛、竹枝、花叶都纳入细密的观看秩序。",
    insight: "这条线把《竹禽图》和写生珍禽连接起来：它们共同证明宫廷审美在训练一种“看见万物细节”的能力。",
    links: [
      ["竹禽", "把鸟的神态做成标准"],
      ["写生珍禽", "把自然拆成连续样本"],
      ["画院", "把观看变成制度"],
    ],
  },
  {
    id: "signature",
    label: "签名",
    domain: "inscription",
    timeMode: "xuanhe",
    focus: [/楷书千字文|Nongfang|Summer poem|Huizong-Calligraphy|Poem|Round fan|赵佶等法书/i],
    title: "瘦金体不是字，是界面签名",
    hook: "当文字进入画面，它不只是说明，而是在告诉观看者：这件图像被谁观看、谁认证、谁纳入秩序。",
    insight: "瘦金体把作品从“画”变成“被皇帝命名的对象”，也把审美权力从图像延伸到题跋、款识和印章。",
    links: [
      ["瘦金书", "形成独特识别系统"],
      ["题跋", "给图像增加权威层"],
      ["印章", "把观看变成认证"],
    ],
  },
  {
    id: "archive",
    label: "归档",
    domain: "collection",
    timeMode: "xuanhe",
    focus: [/文會|文会|聽琴|听琴|Literary Gathering|Court Ladies|Preparing Newly-Woven|捣练/i],
    title: "收藏不是爱好，是数据库",
    hook: "文会、听琴、摹古和内府收藏把作品连成网络：谁画、谁题、谁藏、谁被观看。",
    insight: "这一幕的关系是“图像进入档案”：人物场景、古画摹本和宫廷题签共同构成宣和内府的管理方式。",
    links: [
      ["文会图", "展示审美共同体"],
      ["听琴图", "把宫廷生活图像化"],
      ["内府收藏", "把作品编入系统"],
    ],
  },
  {
    id: "vessel",
    label: "器用",
    domain: "vessel",
    timeMode: "all",
    focus: [/Black-Glazed Teabowl|Imperial Tribute|Tea Bowl|Brush Washer|Cup and Stand|Meiping|供御/i],
    title: "器物把审美带进日常",
    hook: "如果说画和字塑造观看，宋瓷、茶碗和清供器物就是把这种审美带到手边。",
    insight: "这一幕连接图像和生活：同样的克制、留白、釉色和比例，开始进入饮茶、书斋、供养和陈设。",
    links: [
      ["茶碗", "把审美放进日常动作"],
      ["供御", "让器物接近宫廷秩序"],
      ["宋瓷釉色", "把克制变成质感"],
    ],
  },
  {
    id: "after",
    label: "余波",
    domain: null,
    timeMode: "southern",
    focus: [/Quatrain|West Lake|Narcissus|Gaozong|Lizong|Couplet/i],
    title: "系统被打断，但审美还在延续",
    hook: "1127 之后，王朝中心破碎，但题诗、山水、花鸟和器物的观看方式并没有消失。",
    insight: "结尾不是单纯怀旧，而是反转：宋徽宗留下的不是几幅名作，而是一套被历史中断、又继续扩散的审美系统。",
    links: [
      ["1127", "政治断裂"],
      ["南宋题诗", "视觉习惯延续"],
      ["后世收藏", "系统变成记忆"],
    ],
  },
];

function seededRandom(seed) {
  let value = seed % 2147483647;
  return () => {
    value = (value * 16807) % 2147483647;
    return (value - 1) / 2147483646;
  };
}

function hash(input) {
  return [...String(input)].reduce((acc, char) => (acc * 31 + char.charCodeAt(0)) >>> 0, 2166136261);
}

function useArtifacts() {
  const [data, setData] = React.useState([]);
  React.useEffect(() => {
    fetch("/song-huizong-artifacts-core-plus.json")
      .then((response) => response.json())
      .then((payload) => setData(payload.records ?? []));
  }, []);
  return data;
}

function withinTimeMode(item, timeMode) {
  if (timeMode === "all") return true;
  if (item.central) return true;
  const mode = timeModes[timeMode];
  const year = item.year;
  const text = `${item.date ?? ""} ${item.period ?? ""} ${item.dynasty ?? ""}`;
  if (year) return year >= mode.range[0] && year <= mode.range[1];
  if (timeMode === "xuanhe") return item.related_to_huizong || /Huizong|徽宗|宣和|Xuanhe|1100|1127|12th/i.test(text);
  if (timeMode === "southern") return /Southern Song|南宋|1128|1200|13th/i.test(text);
  if (timeMode === "early") return /Northern Song|北宋|960|1000|11th/i.test(text) && !item.related_to_huizong;
  return true;
}

function matchesQuery(item, query) {
  if (!query.trim()) return true;
  const needle = query.trim().toLowerCase();
  return [
    item.title,
    item.artist,
    item.source,
    item.medium,
    item.date,
    item.category,
    item.huizong_relation,
    item.meta?.label,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
    .includes(needle);
}

function cleanText(value, fallback = "") {
  if (!value) return fallback;
  return String(value)
    .replace(/<div\b[^>]*>.*$/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;|&#160;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/\s+/g, " ")
    .trim() || fallback;
}

function formatDate(value) {
  const text = cleanText(value);
  const between = text.match(/between\s+circa\s+(\d{3,4})\s+and\s+circa\s+(\d{3,4})/i);
  if (between) return `约 ${between[1]}-${between[2]}`;
  const circa = text.match(/circa\s+(\d{3,4})/i);
  if (circa) return `约 ${circa[1]}`;
  return text || "宋代";
}

function inferDomain(item, centralId) {
  if (!item) return "collection";
  if (item.id === centralId) return "omen";
  const text = [
    item.title,
    item.artist,
    item.medium,
    item.period,
    item.tags?.join(" "),
    item.huizong_relation,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  if (/auspicious|crane|瑞|鹤|鶴|parakeet|five-colored|五色|祥瑞|端门/.test(text)) return "omen";
  if (item.category === "calligraphy" || /calligraphy|poem|瘦金|诗|書|书|题跋|inscription/.test(text)) return "inscription";
  if (item.category === "porcelain" || item.category === "object" || /ceramic|porcelain|glaze|bronze|jade|vessel|bowl|dish|jar|釉|瓷|青铜|古器|茶|器/.test(text)) return "vessel";
  if (item.category === "flower_bird" || /bird|flower|bamboo|finch|禽|花|鸟|鳥|竹|写生/.test(text)) return "nature";
  return "collection";
}

const relationLabels = {
  huizong_work: "徽宗相关作品",
  huizong_attributed: "传为徽宗",
  huizong_inscribed: "徽宗题跋 / 收藏线索",
  related_style: "宋代审美参照",
};

const categoryDescriptions = {
  flower_bird: "花鸟层关注宋代对物象的细密观看：羽毛、枝叶、花色与留白共同构成一种克制而精确的宫廷审美。",
  porcelain: "宋瓷层强调器物轮廓、釉色和光泽的纯度，适合观察宋代审美中安静、节制、近乎抽象的一面。",
  calligraphy: "书法层把笔画、题跋和帝王身份放在一起看，文字不只是说明，也参与建立作品的秩序和权威。",
  landscape: "山水层呈现宋代关于空间、远近和气韵的观看方式，山水不只是景物，也是可进入的精神场域。",
  figure: "人物与雅集层把观看重点转向宫廷、文人和仪式场景，适合观察人物关系与审美生活如何被组织。",
  object: "器物层展示材料、工艺和装饰如何共同构成宋代视觉文化的物质基础。",
  painting: "画卷层保留长卷、册页和立轴的观看节奏，适合观察图像如何在时间中被展开。",
};

function buildDescription(item) {
  const categoryLabel = item.domainMeta?.label ?? item.meta?.label ?? categoryMeta[item.category]?.label ?? "文物";
  const relation = relationLabels[item.huizong_relation] ?? "宋代审美参照";
  const date = formatDate(item.date || item.period || item.dynasty);
  const author = cleanText(item.artist);
  const medium = cleanText(item.medium);
  const source = cleanText(item.source);
  const categoryNote = item.domainMeta?.note ?? categoryDescriptions[item.category] ?? "这件作品作为宋代审美星图中的一个节点，用来观察图像、材质、年代与馆藏来源之间的关系。";
  const authorPart = author ? `作者/相关人物为 ${author}。` : "";
  const mediumPart = medium ? `媒介记录为 ${medium}。` : "";
  const sourcePart = source ? `数据来自 ${source}。` : "";
  return `${date} · ${categoryLabel} · ${relation}。${categoryNote}${authorPart}${mediumPart}${sourcePart}`;
}

function detailFacts(item) {
  if (!item) return [];
  return [
    ["星域", item.domainMeta?.label ?? item.meta?.label ?? categoryMeta[item.category]?.label ?? "文物"],
    ["年代", formatDate(item.date || item.period || item.dynasty)],
    ["关系", relationLabels[item.huizong_relation] ?? "宋代参照"],
    ["来源", cleanText(item.source, "馆藏数据")],
  ];
}

function artworkImage(item, mode = "thumb") {
  if (!item) return "";
  if (mode === "full") {
    return item.image_full ?? item.image_url ?? item.local_thumb ?? item.image_thumb ?? "";
  }
  return item.local_thumb ?? item.image_thumb ?? item.image_url ?? item.image_full ?? "";
}

function objectLabelFacts(item) {
  if (!item) return [];
  return [
    ["作者", cleanText(item.artist, "未详")],
    ["年代", formatDate(item.date || item.period || item.dynasty)],
    ["朝代", cleanText(item.dynasty || item.period, "宋代")],
    ["材质", cleanText(item.medium, "馆藏未注明")],
    ["馆藏", cleanText(item.source, "馆藏数据")],
    ["部门", cleanText(item.department, item.domainMeta?.label ?? "宋代审美")],
    ["来源", cleanText(item.credit_line, item.public_domain ? "Public domain" : cleanText(item.license, "馆藏授权"))],
  ].filter(([, value]) => value);
}

function aestheticAxes(item) {
  if (!item) return [];
  const ratio = item.width && item.height ? item.width / item.height : 1;
  const medium = cleanText(item.medium).toLowerCase();
  const base = {
    flower_bird: [94, 72, 46, 62],
    porcelain: [64, 34, 96, 58],
    calligraphy: [42, 96, 38, 56],
    landscape: [56, 78, 42, 94],
    figure: [72, 62, 52, 74],
    object: [58, 42, 82, 54],
    painting: [82, 74, 48, 76],
  }[item.category] ?? [62, 58, 58, 58];
  const relationBoost = item.related_to_huizong ? 7 : 0;
  const longScrollBoost = ratio > 2.2 ? 10 : 0;
  const colorBoost = /ceramic|porcelain|glaze|silk|color|ink and color/i.test(medium) ? 7 : 0;
  const inkBoost = /ink|paper|calligraphy|album|handscroll/i.test(medium) ? 6 : 0;
  return [
    ["格物", clamp(base[0] + relationBoost, 18, 100)],
    ["笔墨", clamp(base[1] + inkBoost + relationBoost, 18, 100)],
    ["色釉", clamp(base[2] + colorBoost, 18, 100)],
    ["空间", clamp(base[3] + longScrollBoost, 18, 100)],
  ];
}

function getRelatedWorks(item, nodes) {
  if (!item) return [];
  return nodes
    .filter((node) => node.id !== item.id)
    .filter((node) => {
      if (node.domain === item.domain) return true;
      if (node.category === item.category) return true;
      if (node.related_to_huizong && item.related_to_huizong) return true;
      return node.source && node.source === item.source;
    })
    .sort((a, b) => tourScore(b) - tourScore(a))
    .slice(0, 5);
}

function findStoryTarget(chapter, nodes) {
  if (!chapter || !nodes.length) return null;
  const patterns = chapter.focus ?? [];
  const directMatch = nodes.find((node) =>
    patterns.some((pattern) =>
      pattern.test([
        node.title,
        node.artist,
        node.date,
        node.period,
        node.medium,
        node.tags?.join(" "),
      ].filter(Boolean).join(" "))
    )
  );
  if (directMatch) return directMatch;
  return nodes.find((node) => chapter.domain && node.domain === chapter.domain && node.related_to_huizong) ??
    nodes.find((node) => chapter.domain && node.domain === chapter.domain) ??
    nodes.find((node) => node.central) ??
    nodes[0] ??
    null;
}

function storyRelationLabel(chapter, item) {
  if (!chapter || !item) return "作品节点";
  const text = [item.title, item.category, item.medium, item.huizong_relation, item.tags?.join(" ")]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  if (chapter.id === "omen") return /crane|瑞|鹤|鶴|palace/.test(text) ? "祥瑞叙事" : "天象旁证";
  if (chapter.id === "nature") return /bird|禽|竹|flower|花|parakeet|写生/.test(text) ? "画院样本" : "格物参照";
  if (chapter.id === "signature") return /calligraphy|poem|楷书|书|瘦金|题/.test(text) ? "御笔认证" : "题跋线索";
  if (chapter.id === "archive") return /文会|聽琴|听琴|court|literary|ladies|figure|捣练/.test(text) ? "内府归档" : "收藏网络";
  if (chapter.id === "vessel") return /tea|bowl|cup|washer|vase|瓷|器|供御/.test(text) ? "日常器用" : "质感参照";
  if (chapter.id === "after") return /southern|gaozong|lizong|quatrain|west lake|narcissus/.test(text) ? "南宋余波" : "系统延续";
  return item.related_to_huizong ? "徽宗核心" : "关系节点";
}

function getStoryWorks(chapter, nodes, selected) {
  if (!chapter) return [];
  const patterns = chapter.focus ?? [];
  const matches = nodes.filter((node) =>
    patterns.some((pattern) =>
      pattern.test([
        node.title,
        node.artist,
        node.date,
        node.period,
        node.medium,
        node.tags?.join(" "),
      ].filter(Boolean).join(" "))
    )
  );
  const related = selected ? getRelatedWorks(selected, nodes) : [];
  const fallback = nodes
    .filter((node) => !chapter.domain || node.domain === chapter.domain || node.central)
    .sort((a, b) => tourScore(b) - tourScore(a));
  const seen = new Set();
  return [selected, ...matches, ...related, ...fallback]
    .filter(Boolean)
    .filter((node) => {
      if (seen.has(node.id)) return false;
      seen.add(node.id);
      return true;
    })
    .slice(0, 4);
}

function tourScore(item) {
  const relationScore = item.huizong_relation === "huizong_work" ? 4 : item.related_to_huizong ? 3 : 1;
  const categoryScore = {
    flower_bird: 5,
    calligraphy: 4,
    painting: 3,
    landscape: 2,
    porcelain: 1,
  }[item.category] ?? 0;
  return relationScore * 10 + categoryScore + (item.relevance_score ?? 0) / 100;
}

function findCentralRecord(records) {
  return (
    records.find((item) => /Auspicious Cranes|瑞[鶴鹤]圖|瑞[鶴鹤]图/i.test(item.title)) ??
    records.find((item) => /瑞|crane/i.test(item.title)) ??
    records.find((item) => /芙蓉锦鸡|芙蓉錦雞|Songhuizong4/i.test(item.title)) ??
    records.find((item) => /枇杷山鸟|梅花绣眼|山鳥|繡眼/i.test(item.title)) ??
    records.find((item) => /Finches and bamboo|竹禽/i.test(item.title)) ??
    records[0]
  );
}

function getDomainCounts(records, timeMode) {
  const central = findCentralRecord(records);
  const centralId = central?.id;
  const counts = Object.fromEntries(domainOrder.map((key) => [key, 0]));
  for (const item of records) {
    if (item.id !== centralId && !withinTimeMode(item, timeMode)) continue;
    const domain = inferDomain(item, centralId);
    counts[domain] = (counts[domain] ?? 0) + 1;
  }
  return counts;
}

function buildNodes(records, activeCategory, timeMode, query, coreOnly, denseMode) {
  const central = findCentralRecord(records);
  const centralId = central?.id;

  const filteredRecords = records.filter((item) => {
    const domain = inferDomain(item, centralId);
    const categoryOk = !activeCategory || domain === activeCategory || item.id === centralId;
    const timeOk = withinTimeMode(item, timeMode);
    const queryOk = matchesQuery(item, query);
    const coreOk = !coreOnly || item.related_to_huizong || item.id === centralId;
    return item.id === centralId || (categoryOk && timeOk && queryOk && coreOk);
  });

  const hasIntent = Boolean(activeCategory || timeMode !== "all" || query.trim() || coreOnly);
  const huizongLimit = denseMode ? (hasIntent ? 58 : 46) : (hasIntent ? 36 : 22);
  const peripheralLimit = denseMode ? (hasIntent ? 90 : 104) : (hasIntent ? 36 : 18);
  const huizong = filteredRecords
    .filter((item) => item.related_to_huizong)
    .slice(0, huizongLimit);
  const peripheral = filteredRecords
    .filter((item) => item.id !== central?.id && !huizong.some((core) => core.id === item.id))
    .slice(0, peripheralLimit);

  const all = [central, ...huizong.filter((item) => item.id !== central?.id), ...peripheral].filter(Boolean);
  const countsByCategory = all.reduce((result, item) => {
    const domain = inferDomain(item, centralId);
    result[domain] = (result[domain] ?? 0) + 1;
    return result;
  }, {});
  const seenByCategory = {};

  return all.map((item, index) => {
    const domain = inferDomain(item, centralId);
    const domainInfo = domainMeta[domain] ?? domainMeta.collection;
    const meta = {
      ...(categoryMeta[item.category] ?? defaultMeta),
      label: domainInfo.short,
      color: domainInfo.color,
      icon: domainInfo.icon,
    };
    const rand = seededRandom(hash(item.id ?? item.title));
    const core = item.related_to_huizong || index === 0;
    const categoryIndex = seenByCategory[domain] ?? 0;
    seenByCategory[domain] = categoryIndex + 1;
    const categoryCount = countsByCategory[domain] ?? 1;
    const center = index === 0 ? [0, 0, 0.15] : meta.center;
    const radius = index === 0 ? 0 : core ? 1.0 + rand() * 2.35 : 0.75 + rand() * 1.7;
    const angle = rand() * Math.PI * 2;
    const drift = (rand() - 0.5) * 0.85;
    const localTheta = categoryIndex * 2.399963 + rand() * 0.34;
    const progress = categoryCount <= 1 ? 0 : categoryIndex / (categoryCount - 1);
    const localRadius = (core ? 0.36 : 0.58) + Math.sqrt(progress) * (core ? 1.26 : 1.92) + (rand() - 0.5) * 0.26;
    const anchorX = Math.cos(domainInfo.angle) * domainInfo.radius;
    const anchorZ = Math.sin(domainInfo.angle) * domainInfo.depth;
    const localX = Math.cos(localTheta) * localRadius * 0.95;
    const localY = Math.sin(localTheta) * localRadius * 0.54 + (rand() - 0.5) * 0.28;
    const localZ = Math.sin(localTheta) * localRadius * 108 + (rand() - 0.5) * 72;
    const denseDepth = Math.round((anchorZ + localZ + (core ? 70 : -30)) / 10) * 10;
    const position = denseMode
      ? index === 0
        ? [0, -0.05, 0.2]
        : [
            anchorX + localX,
            domainInfo.y + localY,
            0,
          ]
      : index === 0
        ? [0, -0.05, 0.2]
        : [
            center[0] + Math.cos(angle) * radius,
            center[1] + Math.sin(angle) * radius * 0.68 + drift,
            center[2] + (rand() - 0.5) * 0.65,
          ];

    const relationBoost = item.huizong_relation === "huizong_work" ? 0.16 : item.related_to_huizong ? 0.08 : 0;
    const imageRatio = item.width && item.height ? item.width / item.height : 1;
    const base = index === 0
      ? denseMode ? 1.12 : 1.28
      : core
        ? (denseMode ? 0.22 : 0.32) + relationBoost
        : (denseMode ? 0.085 : 0.17) + rand() * (denseMode ? 0.085 : 0.14);
    const width = base * Math.min(Math.max(imageRatio, 0.55), 2.2);
    const height = base * Math.min(Math.max(1 / imageRatio, 0.58), 1.9);

    return {
      ...item,
      position,
      depth: denseMode
        ? index === 0 ? 120 : denseDepth
        : index === 0 ? 80 : Math.round(clamp((rand() - 0.5) * 620 + (core ? 80 : -60), -360, 220) / 10) * 10,
      size: [width, height],
      meta,
      domain,
      domainMeta: domainInfo,
      core,
      central: index === 0,
      seed: rand(),
    };
  });
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function Sidebar({ activeCategory, setActiveCategory, setSelected }) {
  const entries = domainOrder;
  return (
    <aside className="sidebar">
      <button className={activeCategory ? "seal-mark" : "seal-mark active"} onClick={() => {
        setActiveCategory(null);
        setSelected(null);
      }} title="全景">
        宋
      </button>
      <div className="tool-stack">
        {entries.map((key) => {
          const meta = domainMeta[key];
          const Icon = meta.icon;
          return (
            <button
              key={key}
              className={activeCategory === key ? "tool active" : "tool"}
              onClick={() => {
                setActiveCategory(activeCategory === key ? null : key);
                setSelected(null);
              }}
              title={`聚焦${meta.label}`}
              aria-label={`聚焦${meta.label}`}
            >
              <Icon size={18} />
              <span>{meta.label}</span>
            </button>
          );
        })}
      </div>
      <button className="bottom-sigil" onClick={() => {
        setActiveCategory("omen");
        setSelected(null);
      }} title="宣和天象">
        徽
      </button>
    </aside>
  );
}

function DetailPanel({ selected, hovered, setSelected, nodes, openViewingRoom }) {
  const item = hovered ?? selected;
  const displayDate = item ? formatDate(item.date || item.period || item.dynasty) : "";
  const displayTitle = item ? cleanText(item.title, "未命名作品") : "";
  const displaySource = item ? cleanText(item.artist || item.source, "馆藏记录") : "";
  const displayRelation = item ? relationLabels[item.huizong_relation] ?? cleanText(item.huizong_relation || item.source, "宋代审美参照") : "";
  const description = item ? buildDescription(item) : "";
  const facts = item ? detailFacts(item) : [];
  const axes = item ? aestheticAxes(item) : [];
  const relatedWorks = selected ? getRelatedWorks(selected, nodes) : [];
  return (
    <section className={item ? "detail visible" : "detail"}>
      {item && (
        <>
          <img src={artworkImage(item)} alt={item.title} />
          <div>
            <p className="meta">{item.domainMeta?.label ?? item.meta?.label ?? categoryMeta[item.category]?.label ?? "文物"} · {displayDate}</p>
            <h2>{displayTitle}</h2>
            <p>{displaySource}</p>
            <p className="relation">{displayRelation}</p>
            <div className="detail-facts">
              {facts.map(([label, value]) => (
                <span key={label}>
                  <small>{label}</small>
                  {value}
                </span>
              ))}
            </div>
            <div className="aesthetic-axis" aria-label="审美坐标">
              {axes.map(([label, value]) => (
                <div key={label}>
                  <span>{label}</span>
                  <i style={{ "--value": `${value}%` }} />
                  <b>{Math.round(value)}</b>
                </div>
              ))}
            </div>
            <p className="curator-note">{description}</p>
            {relatedWorks.length > 0 && (
              <div className="related-works">
                <small>相关星群</small>
                <div>
                  {relatedWorks.map((work) => (
                    <button
                      key={work.id}
                      onClick={() => setSelected(work)}
                      title={cleanText(work.title, "相关作品")}
                      aria-label={`查看${cleanText(work.title, "相关作品")}`}
                    >
                      <img src={artworkImage(work)} alt="" />
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div className="detail-actions">
              <button onClick={() => openViewingRoom(item)}>
                <Search size={13} />
                鉴赏
              </button>
              {item.source_url && (
                <a href={item.source_url} target="_blank" rel="noreferrer">
                  <ExternalLink size={13} />
                  来源
                </a>
              )}
              {selected && (
                <button onClick={() => setSelected(null)}>
                  <X size={13} />
                  收起
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </section>
  );
}

function ViewingRoom({ item, nodes, setItem, setSelected, onClose }) {
  React.useEffect(() => {
    if (!item) return undefined;
    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [item, onClose]);

  if (!item) return null;

  const title = cleanText(item.title, "未命名作品");
  const date = formatDate(item.date || item.period || item.dynasty);
  const author = cleanText(item.artist, cleanText(item.source, "馆藏记录"));
  const relation = relationLabels[item.huizong_relation] ?? "宋代审美参照";
  const facts = objectLabelFacts(item);
  const axes = aestheticAxes(item);
  const relatedWorks = getRelatedWorks(item, nodes);

  const chooseRelated = (work) => {
    setItem(work);
    setSelected(work);
  };

  return (
    <section className="viewing-room" role="dialog" aria-modal="true" aria-label={`${title} 鉴赏室`}>
      <button className="viewing-close" onClick={onClose} aria-label="关闭鉴赏室">
        <X size={17} />
      </button>
      <div className="viewing-image-stage">
        <img src={artworkImage(item, "full")} alt={title} />
      </div>
      <aside className="viewing-info">
        <p className="meta">{item.domainMeta?.label ?? "宋代审美"} · {relation}</p>
        <h2>{title}</h2>
        <p className="viewing-author">{author}</p>
        <p className="viewing-date">{date}</p>

        <div className="viewing-tombstone">
          {facts.map(([label, value]) => (
            <div key={label}>
              <span>{label}</span>
              <b>{value}</b>
            </div>
          ))}
        </div>

        <div className="viewing-axis" aria-label="审美坐标">
          {axes.map(([label, value]) => (
            <div key={label}>
              <span>{label}</span>
              <i style={{ "--value": `${value}%` }} />
            </div>
          ))}
        </div>

        <p className="viewing-note">{buildDescription(item)}</p>

        {item.source_url && (
          <a className="viewing-source" href={item.source_url} target="_blank" rel="noreferrer">
            <ExternalLink size={14} />
            馆藏来源
          </a>
        )}

        {relatedWorks.length > 0 && (
          <div className="viewing-related">
            <small>Related works</small>
            <div>
              {relatedWorks.map((work) => (
                <button
                  key={work.id}
                  onClick={() => chooseRelated(work)}
                  title={cleanText(work.title, "相关作品")}
                  aria-label={`查看${cleanText(work.title, "相关作品")}`}
                >
                  <img src={artworkImage(work)} alt="" />
                </button>
              ))}
            </div>
          </div>
        )}
      </aside>
    </section>
  );
}

function StoryPanel({ chapters, activeIndex, selected, nodes, setSelected, onChoose }) {
  const current = chapters[activeIndex] ?? chapters[0];
  const hasPrevious = activeIndex > 0;
  const hasNext = activeIndex < chapters.length - 1;
  const storyWorks = getStoryWorks(current, nodes, selected);
  return (
    <section className="story-panel">
      <div className="story-kicker">
        <span>分幕导览</span>
        <b>{String(activeIndex + 1).padStart(2, "0")} / {String(chapters.length).padStart(2, "0")}</b>
      </div>
      <h2>{current.title}</h2>
      <p>{current.hook}</p>
      <strong>{current.insight}</strong>

      <div className="story-link-chain" aria-label="本幕关系链">
        {current.links.map(([from, relation]) => (
          <div key={`${current.id}-${from}`}>
            <span>{from}</span>
            <i />
            <b>{relation}</b>
          </div>
        ))}
      </div>

      <div className="story-work-chain" aria-label="本幕作品链">
        {storyWorks.map((work) => (
          <button
            key={`${current.id}-${work.id}`}
            className={selected?.id === work.id ? "active" : ""}
            onClick={() => setSelected(work)}
            title={cleanText(work.title, "作品")}
            aria-label={`查看${cleanText(work.title, "作品")}`}
          >
            <img src={artworkImage(work)} alt="" />
            <span>{storyRelationLabel(current, work)}</span>
          </button>
        ))}
      </div>

      <div className="story-steps" role="group" aria-label="故事分幕">
        {chapters.map((chapter, index) => (
          <button
            key={chapter.id}
            className={index === activeIndex ? "active" : ""}
            onClick={() => onChoose(index)}
            title={chapter.title}
            aria-label={`进入第 ${index + 1} 幕：${chapter.title}`}
          >
            <span>{index + 1}</span>
            <small>{chapter.label}</small>
          </button>
        ))}
      </div>

      <div className="story-actions">
        <button disabled={!hasPrevious} onClick={() => hasPrevious && onChoose(activeIndex - 1)}>
          <ChevronLeft size={14} />
          上一幕
        </button>
        <button className="primary" onClick={() => onChoose(activeIndex)}>
          进入本幕
        </button>
        <button disabled={!hasNext} onClick={() => hasNext && onChoose(activeIndex + 1)}>
          下一幕
          <ChevronRight size={14} />
        </button>
      </div>

      <p className="story-focus">
        当前焦点 · {selected ? cleanText(selected.title, "作品") : "等待进入本幕"}
      </p>
    </section>
  );
}

function FallbackConstellation({ nodes, selected, setSelected, setHovered, denseMode, activeCategory, setActiveCategory, allDomainCounts }) {
  const central = nodes.find((node) => node.central);
  const featured = selected || null;
  const [view, setView] = useState({ rotateX: -5, rotateY: 0, zoom: 1, panX: 0, panY: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef(null);
  const domainCounts = useMemo(() => {
    const result = {};
    for (const node of nodes) result[node.domain] = (result[node.domain] ?? 0) + 1;
    return result;
  }, [nodes]);
  const lineOrigin = featured ?? central;
  const connectors = (featured ? nodes : [])
    .filter((node) => {
      if (!lineOrigin || node.id === lineOrigin.id) return false;
      if (!featured) return node.core && !node.central;
      return node.category === featured.category || (node.related_to_huizong && featured.related_to_huizong);
    })
    .slice(0, featured ? 12 : 16)
    .map((node) => ({ from: lineOrigin, to: node }))
    .filter((line) =>
      line.from &&
      line.to &&
      line.from.position?.every(Number.isFinite) &&
      line.to.position?.every(Number.isFinite)
    );

  const dust = useMemo(() => {
    const rand = seededRandom(1602);
    return Array.from({ length: 150 }, (_, index) => ({
      id: index,
      x: 4 + rand() * 92,
      y: 8 + rand() * 82,
      r: 0.035 + rand() * 0.09,
      opacity: 0.14 + rand() * 0.34,
    }));
  }, []);

  const project = (position) => ({
    x: 50 + position[0] * 7.05,
    y: 51 - position[1] * 9.35,
  });

  const project3d = (node) => ({
    x: node.position[0] * 82,
    y: -node.position[1] * 70,
    z: featured?.id === node.id ? 320 : node.depth,
  });

  const beginDrag = (event) => {
    if (event.button != null && event.button !== 0) return;
    dragRef.current = {
      x: event.clientX,
      y: event.clientY,
      rotateX: view.rotateX,
      rotateY: view.rotateY,
      panX: view.panX,
      panY: view.panY,
    };
    setIsDragging(true);
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const moveDrag = (event) => {
    if (!dragRef.current) return;
    const start = dragRef.current;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    setView((current) => ({
      ...current,
      rotateY: start.rotateY + dx * 0.18,
      rotateX: clamp(start.rotateX - dy * 0.055, -34, 24),
    }));
  };

  const endDrag = () => {
    dragRef.current = null;
    setIsDragging(false);
  };

  const wheelView = (event) => {
    event.preventDefault();
    const isZoom = event.ctrlKey || event.metaKey;
    if (isZoom) {
      setView((current) => ({
        ...current,
        zoom: clamp(current.zoom - event.deltaY * 0.0012, 0.72, 1.55),
      }));
    } else {
      setView((current) => ({
        ...current,
        rotateY: current.rotateY - event.deltaX * 0.12,
        rotateX: clamp(current.rotateX - event.deltaY * 0.045, -34, 24),
      }));
    }
  };

  const resetView = () => {
    setView({ rotateX: -5, rotateY: 0, zoom: 1, panX: 0, panY: 0 });
  };

  const isRelatedToFeatured = (node) => {
    if (!featured) return true;
    if (node.id === featured.id || node.central) return true;
    if (node.domain === featured.domain) return true;
    if (node.category === featured.category) return true;
    if (node.related_to_huizong && featured.related_to_huizong) return true;
    return node.source && node.source === featured.source;
  };

  return (
    <div
      className={[
        "fallback-constellation",
        "constellation-3d",
        denseMode ? "dense-mode" : "",
        featured ? "focus-mode" : "",
        isDragging ? "dragging" : "",
      ].filter(Boolean).join(" ")}
      data-testid="constellation"
      onPointerDown={beginDrag}
      onPointerMove={moveDrag}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onWheel={wheelView}
      style={{
        "--rx": `${view.rotateX}deg`,
        "--ry": `${view.rotateY}deg`,
        "--irx": `${-view.rotateX}deg`,
        "--iry": `${-view.rotateY}deg`,
        "--zoom": view.zoom,
        "--pan-x": `${view.panX}px`,
        "--pan-y": `${view.panY}px`,
      }}
    >
      <svg viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <radialGradient id="goldGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#e8c477" stopOpacity="0.34" />
            <stop offset="56%" stopColor="#d09d4c" stopOpacity="0.07" />
            <stop offset="100%" stopColor="#000" stopOpacity="0" />
          </radialGradient>
        </defs>
        <ellipse className={featured ? "core-aura active" : "core-aura"} cx="50" cy="51" rx="19" ry="18" />
        <ellipse className="cluster-orbit porcelain-orbit" cx="20.5" cy="69" rx="13.5" ry="14" />
        <ellipse className="cluster-orbit bird-orbit" cx="22" cy="35" rx="17" ry="13" />
        <ellipse className="cluster-orbit script-orbit" cx="75" cy="30" rx="17" ry="13" />
        <circle className="fallback-red-ring" cx="50" cy="50" r="23" />
        {connectors.map((line) => {
          const from = project(line.from.position);
          const to = project(line.to.position);
          if (![from.x, from.y, to.x, to.y].every(Number.isFinite)) return null;
          return <line key={`${line.from.id}-${line.to.id}`} x1={from.x} y1={from.y} x2={to.x} y2={to.y} />;
        })}
        {dust.map((dot) => (
          <circle key={dot.id} className="dust-dot" cx={dot.x} cy={dot.y} r={dot.r} opacity={dot.opacity} />
        ))}
      </svg>
      <div className="depth-stage">
        <div className="depth-world">
          <div className="museum-floor" />
          <div className="depth-ring depth-ring-one" />
          <div className="depth-ring depth-ring-two" />
          <div className="depth-ring depth-ring-three" />
          <div className="central-caption">
            <b>宣和天象</b>
            <span>《瑞鹤图》 · 1112 · 宫门祥瑞</span>
          </div>
          {domainOrder.map((key) => {
            const meta = domainMeta[key];
            const x = Math.cos(meta.angle) * meta.radius * 82;
            const y = -meta.y * 70;
            const z = Math.sin(meta.angle) * meta.depth * 0.48;
            return (
              <div
                key={`domain-halo-${key}`}
                className="orbit-lane"
                style={{
                  "--orbit-w": `${key === "omen" ? 270 : 330}px`,
                  "--orbit-h": `${key === "omen" ? 150 : 190}px`,
                  "--x": `${x}px`,
                  "--y": `${y}px`,
                  "--z": `${z}px`,
                  "--tilt": `${meta.angle * 18}deg`,
                  "--accent": meta.color,
                }}
              />
            );
          })}
          {domainOrder.map((key) => {
            const meta = domainMeta[key];
            const x = Math.cos(meta.angle) * meta.radius * 82;
            const y = -meta.y * 70 - 58;
            const z = Math.sin(meta.angle) * meta.depth * 0.34 + 76;
            const isMuted = activeCategory && activeCategory !== key;
            const isActive = activeCategory === key;
            return (
              <button
                key={key}
                className={[
                  "domain-label",
                  isActive ? "active" : "",
                  isMuted ? "muted" : "",
                ].filter(Boolean).join(" ")}
                style={{
                  "--x": `${x}px`,
                  "--y": `${y}px`,
                  "--z": `${z}px`,
                  "--accent": meta.color,
                }}
                onPointerDown={(event) => event.stopPropagation()}
                onClick={() => {
                  setActiveCategory(activeCategory === key ? null : key);
                  setSelected(null);
                }}
              >
                <b>{meta.seal}</b>
                <span>{meta.label}</span>
                <small>{allDomainCounts?.[key] ?? domainCounts[key] ?? 0} 件 · {meta.tag}</small>
              </button>
            );
          })}
      {nodes.slice(0, denseMode ? 152 : 72).map((node) => {
        const point = project(node.position);
        const point3d = project3d(node);
        const isFeatured = featured?.id === node.id;
        if (isFeatured) return null;
        const isDimmed = featured && !isRelatedToFeatured(node);
        const style = {
          left: "50%",
          top: "51%",
          width: node.central
              ? denseMode ? "clamp(160px, 18vw, 260px)" : "clamp(140px, 16vw, 230px)"
              : node.core
                ? denseMode ? "clamp(24px, 3vw, 54px)" : "clamp(26px, 3.7vw, 58px)"
                : denseMode ? "clamp(10px, 1.35vw, 26px)" : "clamp(13px, 1.8vw, 34px)",
          borderColor: node.central ? "#e1bf79" : node.meta.color,
          boxShadow: node.central
              ? "0 0 24px rgba(229, 189, 112, .32)"
              : `0 0 14px ${node.meta.color}42`,
          "--x": `${point3d.x}px`,
          "--y": `${point3d.y}px`,
          "--z": `${isDimmed ? point3d.z - 220 : point3d.z}px`,
          "--d": `${isDimmed ? 0.62 : clamp((denseMode ? 0.75 : 0.82) + (point3d.z + 260) / 2400, denseMode ? 0.58 : 0.68, denseMode ? 1.04 : 1.08)}`,
          "--blur": `${isDimmed ? 1.15 : point3d.z < -360 ? 0.7 : point3d.z < -140 ? 0.28 : 0}px`,
          "--alpha": `${isDimmed ? 0.13 : clamp((denseMode ? 0.36 : 0.58) + (point3d.z + 340) / 1500, denseMode ? 0.26 : 0.5, denseMode ? 0.82 : 0.9)}`,
        };
        return (
          <button
            key={`fallback-${node.id}`}
            className={
              isFeatured
                ? "fallback-node-button featured"
                : selected?.id === node.id
                  ? "fallback-node-button selected"
                : isDimmed
                  ? `fallback-node-button dimmed domain-${node.domain}`
                  : node.central
                    ? "fallback-node-button central-core"
                    : node.core
                      ? `fallback-node-button core domain-${node.domain} cat-${node.category}`
                      : `fallback-node-button domain-${node.domain} cat-${node.category}`
            }
            data-testid="artifact-node"
            aria-label={node.title}
            style={style}
            onPointerDown={(event) => event.stopPropagation()}
            onMouseEnter={() => setHovered(node)}
            onMouseLeave={() => setHovered(null)}
            onClick={() => setSelected(node)}
            title={node.title}
          >
            <img
              src={node.local_thumb ?? node.image_thumb ?? node.image_url}
              alt=""
              loading={node.central || node.core ? "eager" : "lazy"}
            />
          </button>
        );
      })}
        </div>
      </div>
      {featured && (() => {
        const rawRatio = featured.width && featured.height ? featured.width / featured.height : 1;
        const focusWidth =
          rawRatio > 2.4
            ? "min(44vw, 560px)"
            : rawRatio > 1.15
              ? "min(35vw, 470px)"
              : rawRatio < 0.72
                ? "min(26vw, 320px)"
                : "min(30vw, 390px)";
        return (
          <>
            <div className="focus-scrim" />
            <button
              className="focus-artwork-frame"
              data-testid="featured-artwork"
              aria-label={`已选中 ${cleanText(featured.title, "作品")}`}
              style={{ "--focus-width": focusWidth }}
              onPointerDown={(event) => event.stopPropagation()}
              onMouseEnter={() => setHovered(featured)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => setSelected(featured)}
              title={cleanText(featured.title, "作品")}
            >
              <img src={artworkImage(featured)} alt="" />
            </button>
          </>
        );
      })()}
      <div className="view-hud">
        <button onClick={resetView}>归位</button>
      </div>
    </div>
  );
}

function ViewStatus({ activeCategory, timeMode }) {
  const category = activeCategory ? domainMeta[activeCategory]?.label : "全类";
  const time = timeModes[timeMode];
  return (
    <section className="view-status">
      <p>{category} · {time.label}</p>
      <strong>{activeCategory ? domainMeta[activeCategory]?.note : "以《瑞鹤图》为中心，展开徽宗的画院、题跋、收藏与器用系统"}</strong>
    </section>
  );
}

function ControlPanel({ query, setQuery, coreOnly, setCoreOnly, denseMode, setDenseMode, setSelected, activeCategory, timeMode }) {
  return (
    <section className="control-panel">
      <label className="search-box">
        <Search size={14} />
        <input
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setSelected(null);
          }}
          placeholder="搜作品 / 材质 / 馆藏"
        />
        {query && (
          <button
            className="clear-query"
            onClick={() => {
              setQuery("");
              setSelected(null);
            }}
            aria-label="清除搜索"
          >
            <X size={13} />
          </button>
        )}
      </label>
      <button
        className={coreOnly ? "core-toggle active" : "core-toggle"}
        onClick={() => {
          setCoreOnly(!coreOnly);
          setSelected(null);
        }}
      >
        徽宗核心
      </button>
      <button
        className={denseMode ? "density-toggle active" : "density-toggle"}
        onClick={() => {
          setDenseMode(!denseMode);
          setSelected(null);
        }}
      >
        {denseMode ? "繁星层" : "策展层"}
      </button>
      <p>{timeModes[timeMode].label} · {activeCategory ? domainMeta[activeCategory]?.label : "五域"} · {denseMode ? "多层" : "精简"}</p>
    </section>
  );
}

function LegendStrip({ nodes, allDomainCounts }) {
  const counts = useMemo(() => {
    const result = {};
    for (const node of nodes) result[node.domain] = (result[node.domain] ?? 0) + 1;
    return result;
  }, [nodes]);
  return (
    <section className="legend-strip">
      {domainOrder.map((key) => {
        const meta = domainMeta[key];
        return (
          <div key={key}>
            <i style={{ background: meta.color }} />
            <span>{meta.label}</span>
            <b>{allDomainCounts?.[key] ?? counts[key] ?? 0}</b>
          </div>
        );
      })}
    </section>
  );
}

function TimelineControl({ timeMode, setTimeMode, setSelected }) {
  const items = [
    ["early", "960", "北宋"],
    ["xuanhe", "1127", "宣和"],
    ["southern", "1279", "南宋"],
  ];
  return (
    <div className="timeline" role="group" aria-label="时间筛选">
      <button className={timeMode === "early" ? "active" : ""} onClick={() => {
        setTimeMode(timeMode === "early" ? "all" : "early");
        setSelected(null);
      }}>
        <span>960</span>
        <small>北宋</small>
      </button>
      <i />
      <button className={timeMode === "xuanhe" ? "active crisis" : "crisis"} onClick={() => {
        setTimeMode(timeMode === "xuanhe" ? "all" : "xuanhe");
        setSelected(null);
      }}>
        <span>1127</span>
        <small>宣和</small>
      </button>
      <i />
      <button className={timeMode === "southern" ? "active" : ""} onClick={() => {
        setTimeMode(timeMode === "southern" ? "all" : "southern");
        setSelected(null);
      }}>
        <span>1279</span>
        <small>南宋</small>
      </button>
      <button className={timeMode === "all" ? "timeline-reset active" : "timeline-reset"} onClick={() => {
        setTimeMode("all");
        setSelected(null);
      }}>
        全景
      </button>
    </div>
  );
}

function App() {
  const artifacts = useArtifacts();
  const [selected, setSelected] = useState(null);
  const [viewingItem, setViewingItem] = useState(null);
  const [hovered, setHovered] = useState(null);
  const [storyIndex, setStoryIndex] = useState(0);
  const [activeCategory, setActiveCategory] = useState(null);
  const [timeMode, setTimeMode] = useState("all");
  const [query, setQuery] = useState("");
  const [coreOnly, setCoreOnly] = useState(false);
  const [denseMode, setDenseMode] = useState(false);
  const visibleNodes = useMemo(
    () => buildNodes(artifacts, activeCategory, timeMode, query, coreOnly, denseMode),
    [artifacts, activeCategory, timeMode, query, coreOnly, denseMode],
  );
  const allDomainCounts = useMemo(
    () => getDomainCounts(artifacts, timeMode),
    [artifacts, timeMode],
  );
  const activeLabel = activeCategory ? domainMeta[activeCategory]?.label : "五域";
  const timeLabel = timeModes[timeMode].label;
  const chooseStoryChapter = (index) => {
    const chapter = storyChapters[index] ?? storyChapters[0];
    const chapterTime = chapter.timeMode ?? "all";
    const chapterDomain = chapter.domain ?? null;
    const chapterNodes = buildNodes(artifacts, chapterDomain, chapterTime, "", false, false);
    setStoryIndex(index);
    setActiveCategory(chapterDomain);
    setTimeMode(chapterTime);
    setQuery("");
    setCoreOnly(false);
    setDenseMode(false);
    setViewingItem(null);
    setSelected(findStoryTarget(chapter, chapterNodes));
  };

  return (
    <main className="story-layout">
      <Sidebar activeCategory={activeCategory} setActiveCategory={setActiveCategory} setSelected={setSelected} />
      <header className="title-block">
        <h1>大宋审美操作系统</h1>
        <span>{timeLabel} · {activeLabel} · {visibleNodes.length} 件作品关系</span>
      </header>
      <div className="stats">
        <strong>{visibleNodes.length}</strong>
        <span>artifacts</span>
      </div>
      <ViewStatus activeCategory={activeCategory} timeMode={timeMode} />
      <ControlPanel
        query={query}
        setQuery={setQuery}
        coreOnly={coreOnly}
        setCoreOnly={setCoreOnly}
        denseMode={denseMode}
        setDenseMode={setDenseMode}
        setSelected={setSelected}
        activeCategory={activeCategory}
        timeMode={timeMode}
      />
      <StoryPanel
        chapters={storyChapters}
        activeIndex={storyIndex}
        selected={selected}
        nodes={visibleNodes}
        setSelected={setSelected}
        onChoose={chooseStoryChapter}
      />
      <FallbackConstellation
        nodes={visibleNodes}
        selected={selected}
        setSelected={setSelected}
        setHovered={setHovered}
        denseMode={denseMode}
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
        allDomainCounts={allDomainCounts}
      />
      <LegendStrip nodes={visibleNodes} allDomainCounts={allDomainCounts} />
      <DetailPanel
        selected={selected}
        hovered={hovered}
        setSelected={setSelected}
        nodes={visibleNodes}
        openViewingRoom={(item) => {
          setViewingItem(item);
          setSelected(item);
        }}
      />
      <ViewingRoom
        item={viewingItem}
        nodes={visibleNodes}
        setItem={setViewingItem}
        setSelected={setSelected}
        onClose={() => setViewingItem(null)}
      />
      <TimelineControl timeMode={timeMode} setTimeMode={setTimeMode} setSelected={setSelected} />
    </main>
  );
}

createRoot(document.getElementById("root")).render(<App />);
