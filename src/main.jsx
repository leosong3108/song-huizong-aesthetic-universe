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
    question: "宋代高级感，是怎么被设计出来的？",
    answer: "因为他不是只留下几幅画，而是把天象、花鸟、书法、收藏和器物连成一套视觉秩序。",
    claim: "宋徽宗不是“艺术家皇帝”，而是在设计一套王朝视觉系统。",
    hook: "把画、字、收藏和器物连起来看，宋徽宗更像是在设计一套王朝视觉系统。",
    insight: "这条线索从《瑞鹤图》开始：图像负责制造天命，花鸟负责训练观看，题跋负责认证，收藏负责归档，器物负责进入日常。",
    punchline: "谁有资格定义美，谁就有资格定义秩序。",
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
    question: "为什么一群鹤，会成为王朝大事？",
    answer: "因为《瑞鹤图》把自然事件放进宫门、云气和御题里，变成可传播的祥瑞公告。",
    claim: "《瑞鹤图》不是在画鸟，而是在把天象变成政治公告。",
    hook: "1112 年的《瑞鹤图》把宫门、云气、题诗和鹤群放在一起，让自然现象变成政治图像。",
    insight: "这一幕连接的是“天象”和“皇权”：同样是鸟，飞过宫门时就不只是花鸟画，而是一套视觉合法性。",
    punchline: "15 年后，这个祥瑞中心反而成了北宋崩塌前的挽歌。",
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
    question: "为什么徽宗花鸟看起来安静，却有权力感？",
    answer: "因为它把观看自然训练成标准：羽毛、枝叶、眼神都被纳入画院规则。",
    claim: "徽宗花鸟真正迷人的地方，是它把“看见细节”变成了一种制度。",
    hook: "徽宗花鸟的重点不只是好看，而是把羽毛、竹枝、花叶都纳入细密的观看秩序。",
    insight: "这条线把《竹禽图》和写生珍禽连接起来：它们共同证明宫廷审美在训练一种“看见万物细节”的能力。",
    punchline: "鸟的眼神、竹的斜枝、花的姿态，都是画院训练出来的观看精度。",
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
    question: "为什么瘦金体一出现，画就像被认证了？",
    answer: "因为题跋把观看者、作者和收藏者绑定起来，让皇帝的字成为图像的界面签名。",
    claim: "瘦金体不是附在画上的字，而是徽宗给作品加上的视觉认证层。",
    hook: "当文字进入画面，它不只是说明，而是在告诉观看者：这件图像被谁观看、谁认证、谁纳入秩序。",
    insight: "瘦金体把作品从“画”变成“被皇帝命名的对象”，也把审美权力从图像延伸到题跋、款识和印章。",
    punchline: "一行题跋，就能把普通图像变成帝王系统里的对象。",
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
    question: "为什么宣和收藏不像爱好，更像数据库？",
    answer: "因为内府关心的不只是拥有作品，而是命名、题写、记录、排序和管理。",
    claim: "宣和收藏不是私人趣味，而是一套给图像编号、命名、归档的王朝数据库。",
    hook: "文会、听琴、摹古和内府收藏把作品连成网络：谁画、谁题、谁藏、谁被观看。",
    insight: "这一幕的关系是“图像进入档案”：人物场景、古画摹本和宫廷题签共同构成宣和内府的管理方式。",
    punchline: "当作品被题写、登录、收藏，它就进入了皇帝的观看秩序。",
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
    question: "宋代高级感为什么会让人想反复看？",
    answer: "因为它不只存在于名画里，还落到茶碗、釉色、书斋和日常手感里。",
    claim: "宋代审美不是只挂在墙上，它会落到茶碗、瓷器、书斋和手的动作里。",
    hook: "如果说画和字塑造观看，宋瓷、茶碗和清供器物就是把这种审美带到手边。",
    insight: "这一幕连接图像和生活：同样的克制、留白、釉色和比例，开始进入饮茶、书斋、供养和陈设。",
    punchline: "真正高级的审美，不只是看见，而是可以被使用。",
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
    question: "北宋之后，为什么宋代审美没有结束？",
    answer: "因为政治中心断裂后，题诗、花鸟、山水和器物的观看方式继续被后世收藏和复制。",
    claim: "1127 年打断的是王朝，不是宋代审美的传播。",
    hook: "1127 之后，王朝中心破碎，但题诗、山水、花鸟和器物的观看方式并没有消失。",
    insight: "结尾不是单纯怀旧，而是反转：宋徽宗留下的不是几幅名作，而是一套被历史中断、又继续扩散的审美系统。",
    punchline: "这就是故事的反差：政治失败了，审美却活得很久。",
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
  const noteSentence = /[。.!?]$/.test(categoryNote) ? categoryNote : `${categoryNote}。`;
  const authorPart = author ? `作者/相关人物为 ${author}。` : "";
  const mediumPart = medium ? `媒介记录为 ${medium}。` : "";
  const sourcePart = source ? `数据来自 ${source}。` : "";
  return `${date} · ${categoryLabel} · ${relation}。${noteSentence}${authorPart}${mediumPart}${sourcePart}`;
}

function displayArtworkTitle(item, fallback = "未命名作品") {
  const title = cleanText(item?.title, fallback);
  const aliases = [
    [/Auspicious Cranes/i, "瑞鹤图"],
    [/Five-colou?red parakeet|Five-coulored parakeet/i, "五色鹦鹉图"],
    [/Finches and bamboo|竹禽/i, "竹禽图"],
    [/Songhuizong3/i, "枇杷山鸟图"],
    [/Songhuizong4/i, "芙蓉锦鸡图"],
  ];
  return aliases.find(([pattern]) => pattern.test(title))?.[1] ?? title;
}

function poeticLine(item) {
  const domain = item?.domain;
  if (domain === "omen") return "它把飞鸟、宫门与云气连成一束光，让自然现象成为王朝想象的投影。";
  if (domain === "nature") return "一枝一羽被放大成宇宙尺度，宋人的观看从此变得安静、精密而有秩序。";
  if (domain === "inscription") return "笔画像星轨一样穿过画面，题跋不再解释作品，而是在为它建立身份。";
  if (domain === "vessel") return "釉色与器形收住了所有喧哗，把日常器物变成可以触摸的光。";
  if (domain === "collection") return "它不是孤立的藏品，而是宣和内府星图里被命名、收藏和再观看的一颗星。";
  return "这件作品在宋代审美的暗处发光，连接图像、材质、时间与观看者。";
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

function findDomainCenterRecord(records, domainKey, centralId) {
  const candidates = records
    .filter((item) => inferDomain(item, centralId) === domainKey)
    .sort((a, b) => {
      const localDelta = Number(Boolean(b.local_thumb)) - Number(Boolean(a.local_thumb));
      if (localDelta !== 0) return localDelta;
      return tourScore(b) - tourScore(a);
    });
  const textOf = (item) => [
    item.title,
    item.artist,
    item.date,
    item.period,
    item.medium,
    item.tags?.join(" "),
  ].filter(Boolean).join(" ");
  const priority = {
    omen: [
      /Auspicious Cranes|瑞[鶴鹤]圖|瑞[鶴鹤]图/i,
      /crane|瑞|鶴|鹤|palace/i,
    ],
    nature: [
      /芙蓉锦鸡|芙蓉錦雞|Songhuizong4|Five-colored|parakeet/i,
      /Finches and bamboo|竹禽|枇杷山鸟|山鳥|梅花绣眼|繡眼/i,
      /flower|bird|bamboo|禽|鸟|鳥|花/i,
    ],
    inscription: [
      /楷书千字文|Huizong-Calligraphy|瘦金|赵佶等法书/i,
      /Poem|calligraphy|inscription|题跋|书|書/i,
    ],
    collection: [
      /文會|文会|Literary Gathering|聽琴|听琴/i,
      /Court Ladies|Preparing Newly-Woven|捣练|figure|palace/i,
    ],
    vessel: [
      /tea|bowl|cup|washer|vase|porcelain|ceramic|glaze|瓷|盏|碗|瓶|炉|爐|器/i,
      /object|bronze|jade|lacquer/i,
    ],
  }[domainKey] ?? [];

  for (const pattern of priority) {
    const match = candidates.find((item) => pattern.test(textOf(item)));
    if (match) return match;
  }
  return candidates[0] ?? null;
}

function openingHeroScore(node) {
  const text = [
    node.title,
    node.artist,
    node.medium,
    node.tags?.join(" "),
  ].filter(Boolean).join(" ");
  let score = 0;
  if (node.domain === "nature") score += 24;
  if (node.local_thumb) score += 18;
  if (node.related_to_huizong) score += 8;
  if (/芙蓉锦鸡|芙蓉錦雞|Songhuizong4/i.test(text)) score += 34;
  if (/Five-colou?red parakeet|parakeet|五色/i.test(text)) score += 30;
  if (/Finches and bamboo|竹禽|枇杷山鸟|山鳥|梅花绣眼|繡眼/i.test(text)) score += 25;
  if (/flower|bird|bamboo|禽|鸟|鳥|花/i.test(text)) score += 14;
  if (node.domain === "omen") score -= 10;
  return score + tourScore(node) * 0.18;
}

function pickOpeningHero(nodes) {
  return [...nodes]
    .filter((node) => node.local_thumb || node.image_thumb || node.image_url)
    .sort((a, b) => openingHeroScore(b) - openingHeroScore(a))[0] ?? null;
}

function openingSort(a, b) {
  if (a.systemCenter !== b.systemCenter) return a.systemCenter ? -1 : 1;
  if (a.local_thumb !== b.local_thumb) return a.local_thumb ? -1 : 1;
  if (a.showcase !== b.showcase) return a.showcase ? -1 : 1;
  if (a.core !== b.core) return a.core ? -1 : 1;
  return tourScore(b) - tourScore(a);
}

function referenceOpeningPoint(domain, index, count, node) {
  const rand = seededRandom(hash(`${node.id}-reference-layout`));
  const jitter = (amount) => (rand() - 0.5) * amount;
  const configs = {
    nature: { cx: -26, cy: -8, rx: 17, ry: 16, phase: 0.15, z: 36 },
    vessel: { cx: -25, cy: 18, rx: 23, ry: 13, phase: 1.25, z: 14 },
    omen: { cx: 1, cy: -17, rx: 17, ry: 10, phase: 2.25, z: 48 },
    inscription: { cx: 26, cy: -16, rx: 15, ry: 10, phase: 3.1, z: 28 },
    collection: { cx: 24, cy: 9, rx: 17, ry: 17, phase: 4.15, z: 20 },
  };
  const config = configs[domain] ?? configs.collection;
  const rank = node.systemCenter
    ? "anchor"
    : index < 3 && (node.local_thumb || node.showcase || node.core)
      ? "feature"
      : node.showcase || node.core || (node.local_thumb && index < 6)
        ? "major"
        : index < count * 0.3
          ? "mid"
          : "small";
  const alpha = rank === "small" ? 0.72 : rank === "mid" ? 0.8 : rank === "major" ? 0.9 : 0.98;
  const countSafe = Math.max(count, 1);
  const golden = Math.PI * (3 - Math.sqrt(5));
  const normalized = (index + 0.5) / countSafe;
  const ring = Math.sqrt(normalized);
  const angle = config.phase + index * golden + Math.sin(index * 0.67 + config.phase) * 0.2;
  const rankRadius = rank === "anchor"
    ? 0.14
    : rank === "feature"
      ? 0.34 + index * 0.045
      : rank === "major"
        ? 0.48 + (index % 5) * 0.035
        : 0.22 + ring * 0.78;
  const armOffset = Math.sin(index * 1.91 + config.phase) * 0.075;
  const x =
    config.cx
    + Math.cos(angle) * config.rx * rankRadius
    + Math.cos(angle * 2.12) * config.rx * armOffset
    + jitter(rank === "small" ? 0.18 : 0.28);
  const y =
    config.cy
    + Math.sin(angle) * config.ry * rankRadius
    + Math.sin(angle * 1.58) * config.ry * armOffset
    + jitter(rank === "small" ? 0.16 : 0.24);
  const depth =
    config.z
    + (rank === "anchor" ? 96 : rank === "feature" ? 64 : rank === "major" ? 36 : rank === "mid" ? 8 : -18)
    + (1 - ring) * 34
    + jitter(16);
  const baseWidth = {
    nature: rank === "anchor" ? "clamp(48px, 4.3vw, 70px)" : rank === "feature" ? "clamp(38px, 3.4vw, 54px)" : rank === "major" ? "clamp(28px, 2.45vw, 39px)" : rank === "mid" ? "clamp(20px, 1.75vw, 28px)" : "clamp(15px, 1.32vw, 21px)",
    vessel: rank === "anchor" ? "clamp(38px, 3.45vw, 56px)" : rank === "feature" ? "clamp(29px, 2.62vw, 42px)" : rank === "major" ? "clamp(22px, 1.95vw, 31px)" : rank === "mid" ? "clamp(17px, 1.5vw, 23px)" : "clamp(13px, 1.13vw, 18px)",
    omen: rank === "anchor" ? "clamp(56px, 5vw, 84px)" : rank === "feature" ? "clamp(40px, 3.55vw, 58px)" : rank === "major" ? "clamp(29px, 2.55vw, 42px)" : rank === "mid" ? "clamp(20px, 1.76vw, 28px)" : "clamp(15px, 1.32vw, 21px)",
    inscription: rank === "anchor" ? "clamp(46px, 4.1vw, 68px)" : rank === "feature" ? "clamp(34px, 3vw, 50px)" : rank === "major" ? "clamp(25px, 2.2vw, 36px)" : rank === "mid" ? "clamp(18px, 1.58vw, 25px)" : "clamp(13px, 1.16vw, 18px)",
    collection: rank === "anchor" ? "clamp(48px, 4.25vw, 72px)" : rank === "feature" ? "clamp(36px, 3.2vw, 52px)" : rank === "major" ? "clamp(26px, 2.3vw, 38px)" : rank === "mid" ? "clamp(18px, 1.62vw, 26px)" : "clamp(13px, 1.15vw, 18px)",
  }[domain] ?? "clamp(14px, 1.2vw, 22px)";
  return {
    x,
    y,
    width: baseWidth,
    scale: rank === "small" ? 0.9 : rank === "mid" ? 0.96 : 1,
    tier: rank,
    z: depth,
    zIndex: Math.round(450 + depth + index),
    alpha,
  };
}

function buildReferenceOpeningLayout(nodes, spotlightId) {
  const layout = new Map();
  const coverCaps = {
    omen: Infinity,
    nature: Infinity,
    inscription: Infinity,
    collection: Infinity,
    vessel: Infinity,
  };
  const groups = domainOrder.reduce((result, key) => {
    result[key] = [];
    return result;
  }, {});
  for (const node of nodes) {
    if (!groups[node.domain]) groups[node.domain] = [];
    groups[node.domain].push(node);
  }
  for (const key of domainOrder) {
    const ordered = [...(groups[key] ?? [])].sort(openingSort);
    ordered.forEach((node, index) => {
      const point = referenceOpeningPoint(key, index, ordered.length, node);
      const isSpotlight = node.id === spotlightId;
      const visible = index < (coverCaps[key] ?? 24) || node.systemCenter || isSpotlight;
      layout.set(node.id, {
        x: `${point.x.toFixed(2)}vw`,
        y: `${point.y.toFixed(2)}vh`,
        z: isSpotlight ? 180 : point.z ?? 0,
        scale: isSpotlight ? 1.18 : point.scale,
        alpha: isSpotlight ? 1 : visible ? point.alpha : 0,
        width: point.width,
        tier: point.tier,
        visible,
        zIndex: isSpotlight ? 1400 : point.zIndex,
      });
    });
  }
  return layout;
}

function uniqueRecords(items) {
  const seen = new Set();
  return items.filter((item) => {
    if (!item || seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
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

function semanticGalaxyPosition({ domain, index, count, core, showcase, systemCenter, rand }) {
  const safeCount = Math.max(count, 1);
  const jitterX = (rand() - 0.5) * 0.16;
  const jitterY = (rand() - 0.5) * 0.14;
  const rankBoost = systemCenter ? 120 : showcase ? 70 : core ? 42 : 0;

  if (domain === "nature") {
    const columns = 8;
    const column = index % columns;
    const row = Math.floor(index / columns);
    const mid = (columns - 1) / 2;
    const t = Math.min(row / Math.max(Math.ceil(safeCount / columns) - 1, 1), 1);
    return {
      position: [
        -3.75 + (column - mid) * (0.28 + t * 0.08) + row * 0.08 + jitterX,
        1.55 - row * 0.24 + Math.sin(column * 0.95) * 0.08 + jitterY,
        0,
      ],
      depth: 32 + row * 12 - Math.abs(column - mid) * 5 + rankBoost,
    };
  }

  if (domain === "inscription") {
    const columns = 16;
    const column = index % columns;
    const row = Math.floor(index / columns);
    const mid = (columns - 1) / 2;
    return {
      position: [
        3.55 + (column - mid) * 0.2 + row * 0.08 + jitterX,
        1.58 - row * 0.24 + Math.sin(column * 0.9) * 0.035 + jitterY,
        0,
      ],
      depth: 70 + row * 18 - Math.abs(column - mid) * 4 + rankBoost,
    };
  }

  if (domain === "collection") {
    const columns = 12;
    const column = index % columns;
    const row = Math.floor(index / columns);
    const mid = (columns - 1) / 2;
    return {
      position: [
        3.25 + (column - mid) * 0.28 + (row % 2) * 0.06 + jitterX,
        0.12 - row * 0.26 + jitterY,
        0,
      ],
      depth: 24 + row * 15 + (column % 3) * 10 + rankBoost,
    };
  }

  if (domain === "vessel") {
    const columns = 24;
    const column = index % columns;
    const row = Math.floor(index / columns);
    const t = columns <= 1 ? 0 : column / (columns - 1);
    const theta = -1.15 + t * 2.3;
    return {
      position: [
        -2.65 + (column - 11.5) * 0.23 + (row % 2) * 0.05 + jitterX,
        -1.08 - row * 0.17 + Math.cos(theta) * 0.13 + jitterY,
        0,
      ],
      depth: -18 + Math.cos(theta) * 96 - row * 8 + rankBoost,
    };
  }

  const columns = 9;
  const column = index % columns;
  const row = Math.floor(index / columns);
  const mid = (columns - 1) / 2;
  return {
    position: [
      -0.05 + (column - mid) * 0.28 + row * 0.11 + jitterX,
      1.72 - row * 0.17 + Math.cos(column * 0.8) * 0.08 + jitterY,
      0,
    ],
    depth: 110 + row * 22 - Math.abs(column - mid) * 7 + rankBoost,
  };
}

function buildNodes(records, activeCategory, timeMode, query, coreOnly, denseMode) {
  const globalCenter = findCentralRecord(records);
  const centralId = globalCenter?.id;
  const activeSystemCenter = activeCategory
    ? findDomainCenterRecord(records, activeCategory, centralId) ?? globalCenter
    : null;
  const domainCenters = uniqueRecords(
    domainOrder.map((key) => findDomainCenterRecord(records, key, centralId) ?? (key === "omen" ? globalCenter : null))
  );
  const domainCenterIds = new Set(domainCenters.map((item) => item.id));
  const activeSystemCenterId = activeSystemCenter?.id;

  const filteredRecords = records.filter((item) => {
    const domain = inferDomain(item, centralId);
    const isSystemAnchor = activeCategory
      ? item.id === activeSystemCenterId
      : domainCenterIds.has(item.id);
    const categoryOk = !activeCategory || domain === activeCategory || isSystemAnchor;
    const timeOk = withinTimeMode(item, timeMode);
    const queryOk = matchesQuery(item, query);
    const coreOk = !coreOnly || item.related_to_huizong || isSystemAnchor;
    return isSystemAnchor || (categoryOk && timeOk && queryOk && coreOk);
  });

  const hasIntent = Boolean(activeCategory || timeMode !== "all" || query.trim() || coreOnly);
  const directorMode = !denseMode && !hasIntent;
  const huizongLimit = directorMode
    ? filteredRecords.length
    : denseMode ? (hasIntent ? 58 : 46) : hasIntent ? 36 : 22;
  const peripheralLimit = directorMode
    ? filteredRecords.length
    : denseMode ? (hasIntent ? 90 : 104) : hasIntent ? 36 : 18;
  const takeBalanced = (items, caps) => {
    if (directorMode || !caps) return items;
    const seen = {};
    return items.filter((item) => {
      const domain = inferDomain(item, centralId);
      const cap = caps[domain] ?? caps.default ?? Infinity;
      seen[domain] = seen[domain] ?? 0;
      if (seen[domain] >= cap) return false;
      seen[domain] += 1;
      return true;
    });
  };
  const huizong = takeBalanced(
    filteredRecords.filter((item) => item.related_to_huizong || domainCenterIds.has(item.id) || item.id === activeSystemCenterId),
    { omen: 6, nature: 9, inscription: 7, collection: 7, vessel: 7, default: 6 },
  ).slice(0, huizongLimit);
  const peripheral = takeBalanced(
    filteredRecords.filter((item) => item.id !== activeSystemCenterId && !huizong.some((core) => core.id === item.id)),
    { omen: 3, nature: 7, inscription: 5, collection: 7, vessel: 8, default: 5 },
  ).slice(0, peripheralLimit);

  const all = uniqueRecords([
    ...(activeCategory ? [activeSystemCenter] : domainCenters),
    ...huizong,
    ...peripheral,
  ]);
  const countsByCategory = all.reduce((result, item) => {
    const domain = inferDomain(item, centralId);
    result[domain] = (result[domain] ?? 0) + 1;
    return result;
  }, {});
  const showcaseCaps = { omen: 4, nature: 6, inscription: 5, collection: 6, vessel: 10 };
  const showcaseIdsByDomain = new Map(
    domainOrder.map((key) => {
      const ids = all
        .filter((item) => inferDomain(item, centralId) === key)
        .filter((item) => !domainCenterIds.has(item.id) && item.id !== activeSystemCenterId)
        .sort((a, b) => {
          const localDelta = Number(Boolean(b.local_thumb)) - Number(Boolean(a.local_thumb));
          if (localDelta !== 0) return localDelta;
          const imageDelta = Number(Boolean(b.image_thumb || b.image_url)) - Number(Boolean(a.image_thumb || a.image_url));
          if (imageDelta !== 0) return imageDelta;
          return tourScore(b) - tourScore(a);
        })
        .slice(0, showcaseCaps[key] ?? 4)
        .map((item) => item.id);
      return [key, new Set(ids)];
    })
  );
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
    const isActiveSystemCenter = Boolean(activeCategory && item.id === activeSystemCenterId);
    const isDomainCenter = domainCenterIds.has(item.id) || item.id === activeSystemCenterId;
    const isGlobalCenter = item.id === globalCenter?.id;
    const core = item.related_to_huizong || isDomainCenter;
    const showcase = Boolean(showcaseIdsByDomain.get(domain)?.has(item.id));
    const categoryIndex = seenByCategory[domain] ?? 0;
    seenByCategory[domain] = categoryIndex + 1;
    const categoryCount = countsByCategory[domain] ?? 1;
    const center = isActiveSystemCenter ? [0, 0, 0.15] : meta.center;
    const radius = isActiveSystemCenter ? 0 : core ? 1.0 + rand() * 2.35 : 0.75 + rand() * 1.7;
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
    const semanticLayout = directorMode
      ? semanticGalaxyPosition({
          domain,
          index: categoryIndex,
          count: categoryCount,
          core,
          showcase,
          systemCenter: isDomainCenter,
          rand,
        })
      : null;
    const position = denseMode
      ? isActiveSystemCenter
        ? [0, -0.05, 0.2]
        : [
            anchorX + localX,
            domainInfo.y + localY,
            0,
          ]
      : directorMode
        ? isActiveSystemCenter
          ? [0, -0.05, 0.2]
          : semanticLayout.position
      : isActiveSystemCenter
        ? [0, -0.05, 0.2]
        : [
            center[0] + Math.cos(angle) * radius,
            center[1] + Math.sin(angle) * radius * 0.68 + drift,
            center[2] + (rand() - 0.5) * 0.65,
          ];

    const relationBoost = item.huizong_relation === "huizong_work" ? 0.16 : item.related_to_huizong ? 0.08 : 0;
    const imageRatio = item.width && item.height ? item.width / item.height : 1;
    const base = isActiveSystemCenter
      ? denseMode ? 1.02 : 1.14
      : isDomainCenter
        ? denseMode ? 0.36 : 0.48
      : showcase
        ? denseMode ? 0.24 : domain === "vessel" ? 0.4 : 0.34
      : core
        ? (denseMode ? 0.22 : 0.32) + relationBoost
        : (denseMode ? 0.085 : 0.17) + rand() * (denseMode ? 0.085 : 0.14);
    const width = base * Math.min(Math.max(imageRatio, 0.55), 2.2);
    const height = base * Math.min(Math.max(1 / imageRatio, 0.58), 1.9);

    return {
      ...item,
      position,
      depth: denseMode
        ? isActiveSystemCenter ? 120 : denseDepth
        : directorMode
          ? isActiveSystemCenter ? 100 : semanticLayout.depth
          : isActiveSystemCenter ? 80 : Math.round(clamp((rand() - 0.5) * 620 + (core ? 80 : -60), -360, 220) / 10) * 10,
      size: [width, height],
      meta,
      domain,
      domainMeta: domainInfo,
      core,
      showcase,
      central: isActiveSystemCenter,
      systemCenter: isDomainCenter,
      globalCenter: isGlobalCenter,
      seed: rand(),
    };
  });
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function Sidebar({ activeCategory, setActiveCategory, setSelected }) {
  const entries = ["nature", "inscription", "collection", "vessel", "omen"];
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
              <b>{meta.seal}</b>
              <span>{meta.short}</span>
            </button>
          );
        })}
      </div>
      <button className="bottom-sigil" onClick={() => {
        setActiveCategory(null);
        setSelected(null);
      }} title="回到全景">
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

function StoryPanel({ chapters, activeIndex, selected, nodes, setSelected, onChoose, storyBeat }) {
  const current = chapters[activeIndex] ?? chapters[0];
  const hasPrevious = activeIndex > 0;
  const hasNext = activeIndex < chapters.length - 1;
  const storyWorks = getStoryWorks(current, nodes, selected);
  return (
    <section className={storyBeat >= 0 ? "story-panel story-panel-playing" : "story-panel"}>
      <div className="story-kicker">
        <span>{storyBeat >= 0 ? "关系路径" : "分幕导览"}</span>
        <b>{String(activeIndex + 1).padStart(2, "0")} / {String(chapters.length).padStart(2, "0")}</b>
      </div>
      <h2>{current.title}</h2>
      <p>{current.answer ?? current.hook}</p>
      <strong>{current.punchline ?? current.insight}</strong>

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
        {storyWorks.map((work, index) => (
          <button
            key={`${current.id}-${work.id}`}
            className={[
              selected?.id === work.id ? "active" : "",
              storyBeat >= index ? "story-lit" : "",
              storyBeat === index ? "story-current" : "",
            ].filter(Boolean).join(" ")}
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
          回溯
        </button>
        <button disabled={!hasNext} onClick={() => hasNext && onChoose(activeIndex + 1)}>
          流向
          <ChevronRight size={14} />
        </button>
      </div>

      <p className="story-focus">
        当前焦点 · {selected ? cleanText(selected.title, "作品") : "等待进入本幕"}
      </p>
    </section>
  );
}

function FallbackConstellation({
  nodes,
  selected,
  hovered,
  setSelected,
  setHovered,
  openViewingRoom,
  denseMode,
  activeCategory,
  setActiveCategory,
  allDomainCounts,
  storyWorks,
  storyBeat,
}) {
  const central =
    nodes.find((node) => node.central) ??
    nodes.find((node) => activeCategory && node.systemCenter) ??
    nodes.find((node) => node.globalCenter) ??
    nodes.find((node) => node.systemCenter);
  const featured = selected || null;
  const [view, setView] = useState({ rotateX: -5, rotateY: 0, zoom: 1, panX: 0, panY: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef(null);
  const storyPath = (storyWorks ?? [])
    .filter((node) => node?.position?.every(Number.isFinite))
    .slice(0, 4);
  const storyPathIds = new Set(storyPath.map((node) => node.id));
  const activeStoryNode = storyBeat >= 0 && storyBeat < storyPath.length ? storyPath[storyBeat] : null;
  const isStoryPlaying = storyBeat >= 0 && storyPath.length > 0;
  const openingMode = !featured && !activeCategory && !denseMode;
  const domainCounts = useMemo(() => {
    const result = {};
    for (const node of nodes) result[node.domain] = (result[node.domain] ?? 0) + 1;
    return result;
  }, [nodes]);
  const systemCentersByDomain = useMemo(() => {
    const result = new Map();
    for (const key of domainOrder) {
      const centerNode = nodes.find((node) => node.domain === key && node.systemCenter);
      if (centerNode) result.set(key, centerNode);
    }
    return result;
  }, [nodes]);
  const focusRelatedWorks = useMemo(
    () => featured ? getRelatedWorks(featured, nodes).slice(0, 6) : [],
    [featured, nodes],
  );
  const lineOrigin = featured ?? central;
  const activeSystemMeta = activeCategory ? domainMeta[activeCategory] : null;
  const galaxyTitle = activeSystemMeta?.label ?? "宋代审美银河";
  const galaxySubtitle = activeSystemMeta && central
    ? `${cleanText(central.title, activeSystemMeta.short)} · ${activeSystemMeta.tag}`
    : "五个星系 · 各自成环";
  const connectors = (featured ? nodes : [])
    .filter((node) => {
      if (!lineOrigin || node.id === lineOrigin.id) return false;
      if (!featured) return node.core && !node.central;
      return node.category === featured.category || (node.related_to_huizong && featured.related_to_huizong);
    })
    .slice(0, featured ? 6 : 10)
    .map((node) => ({ from: lineOrigin, to: node }))
    .filter((line) =>
      line.from &&
      line.to &&
      line.from.position?.every(Number.isFinite) &&
      line.to.position?.every(Number.isFinite)
    );
  const storyConnectors = storyPath
    .slice(1)
    .map((node, index) => ({
      from: storyPath[index],
      to: node,
      active: storyBeat >= index + 1,
      index,
    }))
    .filter((line) => line.from && line.to);

  const dust = useMemo(() => {
    const rand = seededRandom(1602);
    return Array.from({ length: 72 }, (_, index) => ({
      id: index,
      x: 4 + rand() * 92,
      y: 8 + rand() * 82,
      r: 0.035 + rand() * 0.09,
      opacity: 0.14 + rand() * 0.34,
    }));
  }, []);

  const rotateScenePoint = (point) => {
    const rx = (view.rotateX * Math.PI) / 180;
    const ry = (view.rotateY * Math.PI) / 180;
    const cosY = Math.cos(ry);
    const sinY = Math.sin(ry);
    const cosX = Math.cos(rx);
    const sinX = Math.sin(rx);

    const x1 = point.x * cosY + point.z * sinY;
    const z1 = -point.x * sinY + point.z * cosY;
    const y2 = point.y * cosX - z1 * sinX;
    const z2 = point.y * sinX + z1 * cosX;

    return { x: x1, y: y2, z: z2 };
  };

  const projectScenePoint = (point, options = {}) => {
    const rotated = rotateScenePoint(point);
    const depthScale = clamp(980 / (980 - rotated.z * 0.62), 0.66, 1.28);
    if (options.readable) {
      const ry = (view.rotateY * Math.PI) / 180;
      const rx = (view.rotateX * Math.PI) / 180;
      const parallaxX = Math.sin(ry) * point.z * 0.18 + (rotated.x - point.x) * 0.16;
      const parallaxY = Math.sin(rx) * point.z * 0.08 + (rotated.y - point.y) * 0.1;
      return {
        x: (point.x + parallaxX) * clamp(depthScale, 0.82, 1.12),
        y: (point.y + parallaxY) * clamp(depthScale, 0.82, 1.1),
        z: rotated.z,
        depthScale,
      };
    }
    return {
      x: rotated.x * depthScale,
      y: rotated.y * depthScale,
      z: rotated.z,
      depthScale,
    };
  };

  const rawPointFromNode = (node) => ({
    x: node.position[0] * 82,
    y: -node.position[1] * 70,
    z: featured?.id === node.id ? 320 : node.depth,
  });

  const projectNodeForSvg = (node) => {
    const point = projectScenePoint(rawPointFromNode(node), { readable: openingMode && !featured });
    return {
      x: 50 + point.x * 0.086,
      y: 51 + point.y * 0.134,
    };
  };

  const project3d = (node) => projectScenePoint(rawPointFromNode(node), { readable: openingMode && !featured });

  const galaxyWeb = useMemo(() => {
    if (featured) return [];
    return nodes
      .filter((node) => node.position?.every(Number.isFinite))
      .sort((a, b) => {
        if (a.systemCenter !== b.systemCenter) return a.systemCenter ? -1 : 1;
        if (a.core !== b.core) return a.core ? -1 : 1;
        return tourScore(b) - tourScore(a);
      })
      .slice(0, 56)
      .map((node, index) => {
        const point = {
          x: 50 + node.position[0] * 7.05,
          y: 51 - node.position[1] * 9.35,
        };
        const strength = node.systemCenter ? 0.7 : node.core ? 0.42 : 0.24;
        return {
          id: `${node.id}-${index}`,
          x1: 50,
          y1: 51,
          x2: point.x,
          y2: point.y,
          r: node.systemCenter ? 0.22 : node.core ? 0.14 : 0.08,
          lineOpacity: strength * 0.13,
          dotOpacity: strength * 0.2,
          delay: `${(index % 14) * -0.31}s`,
          color: node.domainMeta?.color ?? node.meta?.color ?? "#d6b36e",
        };
      });
  }, [featured, nodes]);

  const rawDomainPoint = (key) => {
    if (openingMode) {
      const reference = {
        nature: { x: -334, y: -54, z: 44 },
        vessel: { x: -334, y: 86, z: 34 },
        omen: { x: 8, y: -168, z: 58 },
        inscription: { x: 300, y: -184, z: 44 },
        collection: { x: 304, y: -38, z: 38 },
      }[key];
      if (reference) return reference;
    }
    const node = systemCentersByDomain.get(key);
    if (node?.position?.every(Number.isFinite)) {
      return {
        x: node.position[0] * 82,
        y: -node.position[1] * 70,
        z: (node.depth ?? 0) * 0.34,
      };
    }
    const meta = domainMeta[key];
    return {
      x: Math.cos(meta.angle) * meta.radius * 82,
      y: -meta.y * 70,
      z: Math.sin(meta.angle) * meta.depth * 0.48,
    };
  };

  const domainPoint = (key) => projectScenePoint(rawDomainPoint(key));

  const openingField = { particles: [], filaments: [] };

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
    if (node.id === featured.id || node.central || node.systemCenter) return true;
    if (node.domain === featured.domain) return true;
    if (node.category === featured.category) return true;
    if (node.related_to_huizong && featured.related_to_huizong) return true;
    return node.source && node.source === featured.source;
  };
  const projectedNodes = nodes.map((node) => ({
    node,
    point3d: project3d(node),
  }));
  const spotlightId = null;
  const spotlightNode = null;
  const referenceOpeningLayout = useMemo(
    () => openingMode ? buildReferenceOpeningLayout(nodes, spotlightId) : new Map(),
    [nodes, openingMode, spotlightId],
  );
  const effectVars = (index) => ({
    "--i": index,
    "--row2": index % 2,
    "--row3": index % 3,
    "--row4": index % 4,
  });

  return (
    <div
      className={[
        "fallback-constellation",
        "constellation-3d",
        openingMode ? "opening-mode" : "",
        denseMode ? "dense-mode" : "",
        featured ? "focus-mode" : "",
        isStoryPlaying ? "story-playing" : "",
        isDragging ? "dragging" : "",
      ].filter(Boolean).join(" ")}
      data-testid="constellation"
      onPointerDown={openingMode ? undefined : beginDrag}
      onPointerMove={openingMode ? undefined : moveDrag}
      onPointerUp={openingMode ? undefined : endDrag}
      onPointerCancel={openingMode ? undefined : endDrag}
      onWheel={openingMode ? undefined : wheelView}
      style={{
        "--rx": "0deg",
        "--ry": "0deg",
        "--irx": "0deg",
        "--iry": "0deg",
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
        {openingField.filaments.length > 0 && (
          <g className="song-field">
            <circle
              className="song-field-core"
              cx={50 + openingField.attractor.x * 0.086}
              cy={51 + openingField.attractor.y * 0.134}
              r="0.95"
            />
            {openingField.filaments.map((line) => (
              <line
                key={line.id}
                className="song-field-filament"
                x1={line.x1}
                y1={line.y1}
                x2={line.x2}
                y2={line.y2}
                style={{
                  "--field-color": line.color,
                  "--field-alpha": line.opacity,
                  "--field-delay": line.delay,
                }}
              />
            ))}
            {openingField.particles.map((dot) => (
              <circle
                key={dot.id}
                className="song-field-particle"
                cx={dot.x}
                cy={dot.y}
                r={dot.r}
                style={{
                  "--field-color": dot.color,
                  "--field-alpha": dot.opacity,
                  "--field-delay": dot.delay,
                }}
              />
            ))}
          </g>
        )}
        {!featured && galaxyWeb.length > 0 && (
          <g className="galaxy-web">
            {galaxyWeb.map((line) => (
              <React.Fragment key={line.id}>
                <line
                  x1={line.x1}
                  y1={line.y1}
                  x2={line.x2}
                  y2={line.y2}
                  style={{
                    "--web-line-alpha": line.lineOpacity,
                    "--web-delay": line.delay,
                    "--web-color": line.color,
                  }}
                />
                <circle
                  className="galaxy-web-dot"
                  cx={line.x2}
                  cy={line.y2}
                  r={line.r}
                  style={{
                    "--web-dot-alpha": line.dotOpacity,
                    "--web-delay": line.delay,
                    "--web-color": line.color,
                  }}
                />
              </React.Fragment>
            ))}
          </g>
        )}
        {!featured && <circle className="galaxy-core-dot" cx="50" cy="51" r="0.42" />}
        <ellipse className={featured ? "core-aura active" : "core-aura"} cx="50" cy="51" rx="19" ry="18" />
        <ellipse className="cluster-orbit porcelain-orbit" cx="20.5" cy="69" rx="13.5" ry="14" />
        <ellipse className="cluster-orbit bird-orbit" cx="22" cy="35" rx="17" ry="13" />
        <ellipse className="cluster-orbit script-orbit" cx="75" cy="30" rx="17" ry="13" />
        <circle className="fallback-red-ring" cx="50" cy="50" r="23" />
        {connectors.map((line) => {
          const from = projectNodeForSvg(line.from);
          const to = projectNodeForSvg(line.to);
          if (![from.x, from.y, to.x, to.y].every(Number.isFinite)) return null;
          return <line key={`${line.from.id}-${line.to.id}`} x1={from.x} y1={from.y} x2={to.x} y2={to.y} />;
        })}
        {storyConnectors.map((line) => {
          const from = projectNodeForSvg(line.from);
          const to = projectNodeForSvg(line.to);
          if (![from.x, from.y, to.x, to.y].every(Number.isFinite)) return null;
          return (
            <line
              key={`story-${line.from.id}-${line.to.id}`}
              className={line.active ? "story-path-line active" : "story-path-line"}
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              style={{ "--path-delay": `${line.index * 120}ms` }}
            />
          );
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
            <b>{galaxyTitle}</b>
            <span>{galaxySubtitle}</span>
          </div>
          {domainOrder.map((key) => {
            const meta = domainMeta[key];
            const point = domainPoint(key);
            return (
              <div
                key={`domain-halo-${key}`}
                className="orbit-lane"
                style={{
                  "--orbit-w": `${key === "omen" ? 270 : 330}px`,
                  "--orbit-h": `${key === "omen" ? 150 : 190}px`,
                  "--x": `${point.x}px`,
                  "--y": `${point.y}px`,
                  "--z": `${point.z}px`,
                  "--tilt": `${meta.angle * 18}deg`,
                  "--accent": meta.color,
                }}
              />
            );
          })}
          {domainOrder.map((key) => {
            const meta = domainMeta[key];
            const point = domainPoint(key);
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
                  "--x": `${point.x}px`,
                  "--y": `${point.y - 58}px`,
                  "--z": `${point.z + 76}px`,
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
          {domainOrder.map((key) => {
            const meta = domainMeta[key];
            const point = domainPoint(key);
            const isMuted = activeCategory && activeCategory !== key;
            return (
              <div
                key={`domain-effect-${key}`}
                className={[
                  "domain-effect",
                  `effect-${key}`,
                  isMuted ? "muted" : "",
                ].filter(Boolean).join(" ")}
                style={{
                  "--x": `${point.x}px`,
                  "--y": `${point.y}px`,
                  "--z": `${point.z + 18}px`,
                  "--accent": meta.color,
                }}
                aria-hidden="true"
              >
                {Array.from({ length: key === "nature" ? 9 : key === "vessel" ? 6 : 5 }, (_, index) => (
                  <i key={`${key}-effect-${index}`} style={effectVars(index)} />
                ))}
                {key === "nature" && (
                  <>
                    <span className="scene-branch branch-one" />
                    <span className="scene-branch branch-two" />
                    {Array.from({ length: 8 }, (_, index) => (
                      <span key={`bird-${index}`} className="scene-bird" style={effectVars(index)} />
                    ))}
                    {Array.from({ length: 12 }, (_, index) => (
                      <span key={`leaf-${index}`} className="scene-leaf" style={effectVars(index)} />
                    ))}
                  </>
                )}
                {key === "vessel" && (
                  <>
                    <span className="scene-shelf" />
                    {Array.from({ length: 7 }, (_, index) => (
                      <span key={`mist-${index}`} className="scene-mist" style={effectVars(index)} />
                    ))}
                    {Array.from({ length: 5 }, (_, index) => (
                      <span key={`glaze-${index}`} className="scene-glaze" style={effectVars(index)} />
                    ))}
                  </>
                )}
                {key === "inscription" && Array.from({ length: 9 }, (_, index) => (
                  <span key={`ink-${index}`} className="scene-ink" style={effectVars(index)} />
                ))}
                {key === "omen" && Array.from({ length: 6 }, (_, index) => (
                  <span key={`cloud-${index}`} className="scene-cloud" style={effectVars(index)} />
                ))}
                {key === "collection" && Array.from({ length: 6 }, (_, index) => (
                  <span key={`archive-${index}`} className="scene-archive" style={effectVars(index)} />
                ))}
              </div>
            );
          })}
      {projectedNodes.map(({ node, point3d }) => {
        const isFeatured = featured?.id === node.id;
        if (isFeatured) return null;
        const openingLayout = openingMode ? referenceOpeningLayout.get(node.id) : null;
        if (openingMode && openingLayout && !openingLayout.visible) return null;
        const isDimmed = featured && !isRelatedToFeatured(node);
        const storyPathIndex = storyPath.findIndex((work) => work.id === node.id);
        const isStoryPathNode = storyPathIndex >= 0;
        const isStoryActiveNode = activeStoryNode?.id === node.id;
        const isStorySeenNode = storyPathIndex >= 0 && storyBeat >= storyPathIndex;
        const isSystemAnchor = Boolean(node.systemCenter);
        const isOpeningBackdrop = openingMode && !isSystemAnchor && !node.core && !node.showcase && !isStoryPathNode;
        const isOpeningSecondary = openingMode && (node.core || node.showcase) && !isSystemAnchor && !isStoryPathNode;
        const isSpotlight = openingMode && node.id === spotlightId;
        const isStageSpotlight = openingMode && isSpotlight;
        if (isStageSpotlight) return null;
        const isHovered = hovered?.id === node.id;
        const frontness = clamp((point3d.z + 320) / 760, 0, 1);
        const prominence = clamp((frontness - 0.5) / 0.5, 0, 1);
        const depthBase = ((denseMode ? 0.75 : 0.82) + (point3d.z + 260) / 2400) * point3d.depthScale;
        const depthBoost = isDimmed
          ? 1
          : isSpotlight
            ? 1.62
          : openingMode
            ? isSystemAnchor
              ? 0.9 + prominence * 0.12
              : isOpeningBackdrop
                ? 0.78 + prominence * 0.52
              : isOpeningSecondary
                ? 0.9 + prominence * 0.4
              : 1 + prominence * 0.24
            : 1 + prominence * 0.28;
        const depthScaleValue = isDimmed
          ? 0.62
          : openingLayout
            ? openingLayout.scale
          : clamp(
              depthBase * depthBoost,
              isOpeningBackdrop ? 0.42 : denseMode ? 0.5 : 0.6,
              isSpotlight ? 1.72 : isOpeningBackdrop ? 1.2 : isOpeningSecondary ? 1.28 : isSystemAnchor ? 1.16 : denseMode ? 1.18 : 1.28,
            );
        const depthAlpha = isDimmed
          ? 0.13
          : openingLayout
            ? openingLayout.alpha
          : isSpotlight
            ? 1
          : isOpeningBackdrop
            ? clamp(0.46 + prominence * 0.38, 0.46, 0.84)
          : isOpeningSecondary
            ? clamp(0.62 + prominence * 0.3, 0.62, 0.92)
          : clamp((denseMode ? 0.36 : 0.58) + prominence * 0.28, denseMode ? 0.3 : 0.52, 0.88);
        const depthBlur = isDimmed
          ? 1.15
          : openingLayout
            ? 0
          : isSpotlight
            ? 0
          : isOpeningBackdrop
            ? clamp(0.22 - prominence * 0.14, 0, 0.22)
          : point3d.z < -360 ? 0.7 : point3d.z < -140 ? 0.28 : 0;
        const style = {
          left: "50%",
          top: "51%",
          "--node-width": openingLayout?.width ?? (node.central
              ? denseMode ? "clamp(160px, 18vw, 260px)" : "clamp(140px, 16vw, 230px)"
              : isSpotlight
                ? "clamp(190px, 18vw, 340px)"
              : openingMode && isSystemAnchor
                ? "clamp(42px, 4.4vw, 78px)"
              : isSystemAnchor
                ? denseMode ? "clamp(54px, 5.8vw, 92px)" : "clamp(58px, 6.4vw, 108px)"
              : isOpeningBackdrop
                ? "clamp(18px, 1.8vw, 34px)"
              : isOpeningSecondary
                ? "clamp(20px, 2.4vw, 46px)"
              : node.core
                ? denseMode ? "clamp(24px, 3vw, 54px)" : "clamp(26px, 3.7vw, 58px)"
                : denseMode ? "clamp(10px, 1.35vw, 26px)" : "clamp(13px, 1.8vw, 34px)"),
          "--node-border": node.central || isSystemAnchor ? "#e1bf79" : node.meta.color,
          "--node-shadow": isSpotlight
              ? "0 0 0 8px rgba(5, 4, 3, .58), 0 0 34px rgba(232, 194, 116, .36)"
              : node.central
              ? "0 0 24px rgba(229, 189, 112, .32)"
              : isSystemAnchor
                ? `0 0 18px ${node.meta.color}4f`
              : isOpeningBackdrop
                ? "none"
              : isOpeningSecondary
                ? `0 0 8px ${node.meta.color}2f`
              : `0 0 12px ${node.meta.color}36`,
          "--x": openingLayout ? openingLayout.x : `${isStageSpotlight ? 0 : point3d.x}px`,
          "--y": openingLayout ? openingLayout.y : `${isStageSpotlight ? -12 : point3d.y}px`,
          "--z": openingLayout ? `${openingLayout.z}px` : `${(isDimmed ? point3d.z - 220 : isStageSpotlight ? 520 : point3d.z) * 0.18}px`,
          "--d": `${isStageSpotlight ? 1 : depthScaleValue}`,
          "--frontness": `${prominence}`,
          "--spotlight": `${isSpotlight ? 1 : 0}`,
          "--blur": `${depthBlur}px`,
          "--alpha": `${depthAlpha}`,
          "--hover-scale": openingLayout
            ? openingLayout.tier === "anchor"
              ? 1.38
              : openingLayout.tier === "feature"
                ? 1.58
                : openingLayout.tier === "major"
                  ? 1.92
                  : openingLayout.tier === "mid"
                    ? 2.35
                    : 2.75
            : 1.08,
          zIndex: isHovered ? 1800 : openingLayout?.zIndex ?? Math.round((isSpotlight ? 1200 : 500) + point3d.z + prominence * 180),
        };
        return (
          <div
            key={`fallback-${node.id}`}
            className={
              [
                "fallback-node-shell",
                selected?.id === node.id ? "selected" : "",
                isDimmed ? "dimmed" : "",
                node.central ? "central-core" : "",
                isHovered ? "hovered" : "",
                node.systemCenter ? "system-center" : "",
                isSpotlight ? "spotlight-node" : "",
                node.globalCenter ? "global-center" : "",
                node.core && !node.central ? "core" : "",
                isOpeningBackdrop ? "opening-backdrop-node" : "",
                isOpeningSecondary ? "opening-secondary-node" : "",
                openingLayout ? `opening-tier-${openingLayout.tier}` : "",
                isStoryPathNode ? "story-path-node" : "",
                isStorySeenNode ? "story-seen-node" : "",
                isStoryActiveNode ? "story-active-node" : "",
                `domain-${node.domain}`,
                `cat-${node.category}`,
              ].filter(Boolean).join(" ")
            }
            style={style}
          >
            <button
              className={
                [
                  "fallback-node-button",
                  selected?.id === node.id ? "selected" : "",
                  isDimmed ? "dimmed" : "",
                  node.central ? "central-core" : "",
                  isHovered ? "hovered" : "",
                  node.systemCenter ? "system-center" : "",
                  isSpotlight ? "spotlight-node" : "",
                  node.globalCenter ? "global-center" : "",
                  node.core && !node.central ? "core" : "",
                  isOpeningBackdrop ? "opening-backdrop-node" : "",
                  isOpeningSecondary ? "opening-secondary-node" : "",
                  openingLayout ? `opening-tier-${openingLayout.tier}` : "",
                  isStoryPathNode ? "story-path-node" : "",
                  isStorySeenNode ? "story-seen-node" : "",
                  `domain-${node.domain}`,
                  `cat-${node.category}`,
                ].filter(Boolean).join(" ")
              }
              data-testid="artifact-node"
              aria-label={node.title}
              onPointerDown={(event) => event.stopPropagation()}
              onMouseEnter={() => setHovered(node)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => setSelected(node)}
              title={node.title}
            >
              <img
                src={node.local_thumb ?? node.image_thumb ?? node.image_url}
                alt=""
                loading={openingMode || node.central || node.systemCenter || node.core || node.showcase ? "eager" : "lazy"}
                decoding="async"
              />
            </button>
          </div>
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
        const title = displayArtworkTitle(featured);
        const date = formatDate(featured.date || featured.period || featured.dynasty);
        const source = cleanText(featured.artist || featured.source, "馆藏记录");
        const relation = relationLabels[featured.huizong_relation] ?? cleanText(featured.huizong_relation, "宋代审美参照");
        const sourceName = cleanText(featured.source, "馆藏记录");
        const medium = cleanText(featured.medium, "材质未详");
        const seenSatelliteTitles = new Set([title]);
        const satelliteWorks = focusRelatedWorks
          .filter((work) => {
            const key = displayArtworkTitle(work, "相关作品").toLowerCase();
            if (seenSatelliteTitles.has(key)) return false;
            seenSatelliteTitles.add(key);
            return true;
          })
          .slice(0, 6);
        const satelliteSlots = [
          [-260, 146],
          [-292, -88],
          [-56, -224],
          [98, -188],
          [112, 204],
          [-88, 226],
        ];
        const motionMarks = [
          ["-390px", "-116px", "240px", "-34px", "-6deg", "0s"],
          ["-330px", "92px", "280px", "-126px", "-18deg", "-4s"],
          ["-180px", "-248px", "210px", "150px", "22deg", "-8s"],
          ["120px", "-206px", "-260px", "72px", "164deg", "-12s"],
          ["-420px", "210px", "160px", "118px", "8deg", "-16s"],
        ];
        const satelliteBeams = satelliteWorks.map((work, index) => {
          const [x, y] = satelliteSlots[index % satelliteSlots.length];
          return {
            id: work.id,
            length: Math.round(Math.hypot(x, y)),
            angle: Math.atan2(y, x) * 180 / Math.PI,
            delay: `${index * 120}ms`,
          };
        });
        const narrativeMeta = [
          ["年代", date],
          ["作者", source],
          ["星域", featured.domainMeta?.label ?? featured.meta?.label ?? "宋代审美"],
          ["材质", medium],
          ["来源", sourceName],
        ];
        return (
          <>
            <div className="focus-scrim" />
            <div className="focus-orbit-system" aria-hidden="true">
              <i className="focus-orbit-ring ring-one" />
              <i className="focus-orbit-ring ring-two" />
              <i className="focus-orbit-ring ring-three" />
              <i className="focus-orbit-ray ray-one" />
              <i className="focus-orbit-ray ray-two" />
            </div>
            <div className="focus-motion-layer" aria-hidden="true">
              {motionMarks.map(([fromX, fromY, toX, toY, angle, delay], index) => (
                <i
                  key={`motion-mark-${index}`}
                  style={{
                    "--from-x": fromX,
                    "--from-y": fromY,
                    "--to-x": toX,
                    "--to-y": toY,
                    "--flight-angle": angle,
                    "--flight-delay": delay,
                  }}
                />
              ))}
            </div>
            {satelliteBeams.length > 0 && (
              <div className="focus-link-layer" aria-hidden="true">
                {satelliteBeams.map((beam) => (
                  <i
                    key={`focus-beam-${beam.id}`}
                    style={{
                      "--beam-length": `${beam.length}px`,
                      "--beam-angle": `${beam.angle}deg`,
                      "--beam-delay": beam.delay,
                    }}
                  />
                ))}
              </div>
            )}
            <button
              key={`focus-artwork-${featured.id}`}
              className={[
                "focus-artwork-frame",
                storyPathIds.has(featured.id) ? "story-path-frame" : "",
                activeStoryNode?.id === featured.id ? "story-active-frame" : "",
              ].filter(Boolean).join(" ")}
              data-testid="featured-artwork"
              aria-label={`已选中 ${cleanText(featured.title, "作品")}`}
              style={{ "--focus-width": focusWidth }}
              onPointerDown={(event) => event.stopPropagation()}
              onMouseEnter={() => setHovered(featured)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => openViewingRoom?.(featured)}
              title={title}
            >
              <img src={artworkImage(featured, "full")} alt="" />
            </button>
            {satelliteWorks.length > 0 && (
              <div
                className="focus-satellite-layer"
                data-testid="focus-satellites"
                aria-label="相关作品轨道"
              >
                {satelliteWorks.map((work, index) => {
                  const slot = satelliteSlots[index % satelliteSlots.length];
                  return (
                    <button
                      key={`focus-satellite-${work.id}`}
                      className="focus-satellite-button"
                      style={{
                        "--sat-x": `${slot[0]}px`,
                        "--sat-y": `${slot[1]}px`,
                        "--float-x": `${index % 2 === 0 ? 8 : -7}px`,
                        "--float-y": `${index % 3 === 0 ? -9 : 7}px`,
                        "--focus-delay": `${index * 80}ms`,
                        "--float-delay": `${index * -920}ms`,
                      }}
                      onMouseEnter={() => setHovered(work)}
                      onMouseLeave={() => setHovered(null)}
                      onPointerDown={(event) => {
                        event.stopPropagation();
                        setSelected(work);
                      }}
                      onClick={(event) => {
                        event.stopPropagation();
                        setSelected(work);
                      }}
                      title={displayArtworkTitle(work, "相关作品")}
                      aria-label={`切换到${displayArtworkTitle(work, "相关作品")}`}
                    >
                      <img src={artworkImage(work)} alt="" />
                      <span>{index + 1} · {work.domainMeta?.short ?? work.meta?.label ?? "旁证"}</span>
                    </button>
                  );
                })}
              </div>
            )}
            <aside
              className="focus-artwork-label"
              data-testid="featured-label"
              onPointerDown={(event) => event.stopPropagation()}
            >
              <p className="focus-kicker">画心节点 · {relation}</p>
              <h2>{title}</h2>
              <strong>{poeticLine(featured)}</strong>
              <dl className="focus-meta-list">
                {narrativeMeta.map(([label, value]) => (
                  <div key={label}>
                    <dt>{label}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>
              <div className="focus-label-actions">
                <button onClick={() => openViewingRoom?.(featured)}>
                  <Search size={13} />
                  入画
                </button>
                <button onClick={() => setSelected(null)}>
                  <X size={13} />
                  收起
                </button>
              </div>
            </aside>
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
      <strong>{activeCategory ? domainMeta[activeCategory]?.note : "五个星系各自成环：天象、花鸟、题跋、收藏与器用共同构成宋代审美银河"}</strong>
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
    ["pre", "907-979", "五代十国", "all"],
    ["early", "960-1127", "北宋", "early"],
    ["southern", "1127-1279", "南宋", "southern"],
    ["yuan", "1271-1368", "元", "all"],
    ["ming", "1368-1644", "明", "all"],
    ["qing", "1644-1911", "清", "all"],
    ["modern", "1912-至今", "近现代", "all"],
  ];
  return (
    <div className="timeline" role="group" aria-label="时间筛选">
      <button className="timeline-play" onClick={() => {
        setTimeMode("all");
        setSelected(null);
      }} aria-label="播放时间流">
        ▶
      </button>
      {items.map(([key, years, label, mode], index) => (
        <React.Fragment key={key}>
          {index > 0 && <i />}
          <button className={[
            timeMode === mode && (mode !== "all" || key === "pre") ? "active" : "",
            key === "early" ? "crisis" : "",
          ].filter(Boolean).join(" ")} onClick={() => {
            setTimeMode(timeMode === mode && mode !== "all" ? "all" : mode);
            setSelected(null);
          }}>
            <span>{label}</span>
            <small>{years}</small>
          </button>
        </React.Fragment>
      ))}
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
  const [storyRun, setStoryRun] = useState(0);
  const [storyBeat, setStoryBeat] = useState(-1);
  const visibleNodes = useMemo(
    () => buildNodes(artifacts, activeCategory, timeMode, query, coreOnly, denseMode),
    [artifacts, activeCategory, timeMode, query, coreOnly, denseMode],
  );
  const allDomainCounts = useMemo(
    () => getDomainCounts(artifacts, timeMode),
    [artifacts, timeMode],
  );
  const activeLabel = activeCategory ? domainMeta[activeCategory]?.label : "五域";
  const pageTitle = activeCategory ? `${domainMeta[activeCategory]?.short ?? "审美"}星系` : "宋代审美银河";
  const timeLabel = timeModes[timeMode].label;
  const totalArtifacts = artifacts.length;
  const activeChapter = storyChapters[storyIndex] ?? storyChapters[0];
  const activeStoryWorks = useMemo(
    () => getStoryWorks(activeChapter, visibleNodes, selected),
    [activeChapter, visibleNodes, selected],
  );

  React.useEffect(() => {
    if (!activeCategory || selected || !visibleNodes.length) return;
    const systemNode = visibleNodes.find((node) => node.central || node.systemCenter);
    if (systemNode) setSelected(systemNode);
  }, [activeCategory, selected, visibleNodes]);

  React.useEffect(() => {
    if (!storyRun) return undefined;
    setStoryBeat(0);
    const timers = [1, 2, 3].map((beat) =>
      window.setTimeout(() => setStoryBeat(beat), 520 + beat * 620)
    );
    const endTimer = window.setTimeout(() => setStoryBeat(4), 3500);
    return () => {
      timers.forEach(window.clearTimeout);
      window.clearTimeout(endTimer);
    };
  }, [storyRun, storyIndex]);

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
    setStoryRun((value) => value + 1);
  };

  return (
    <main className={selected ? "story-layout has-focus" : "story-layout"}>
      <Sidebar activeCategory={activeCategory} setActiveCategory={setActiveCategory} setSelected={setSelected} />
      <header className="title-block">
        <h1>{pageTitle}</h1>
        <span>宋代审美 · {timeLabel} · {activeLabel} · {totalArtifacts} 件素材 / {visibleNodes.length} 件入场</span>
      </header>
      <div className="stats">
        <strong>{totalArtifacts}</strong>
        <span>archive</span>
        <em>{visibleNodes.length} in view</em>
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
        storyBeat={storyBeat}
      />
      <FallbackConstellation
        nodes={visibleNodes}
        selected={selected}
        hovered={hovered}
        setSelected={setSelected}
        setHovered={setHovered}
        openViewingRoom={(item) => {
          setViewingItem(item);
          setSelected(item);
        }}
        denseMode={denseMode}
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
        allDomainCounts={allDomainCounts}
        storyWorks={activeStoryWorks}
        storyBeat={storyBeat}
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
