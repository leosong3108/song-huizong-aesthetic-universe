import React, { useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { BookOpen, Brush, ChevronLeft, ChevronRight, CircleDot, ExternalLink, Feather, Mountain, Play, Search, Sparkles, Waves, X } from "lucide-react";
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

const clusterLabels = [
  { key: "flower_bird", seal: "物", title: "格物花鸟", subtitle: "细密观看" },
  { key: "porcelain", seal: "釉", title: "宋瓷清供", subtitle: "色与形" },
  { key: "calligraphy", seal: "书", title: "瘦金题跋", subtitle: "笔画秩序" },
  { key: "landscape", seal: "境", title: "山水远意", subtitle: "空间气韵" },
  { key: "figure", seal: "雅", title: "宫廷雅集", subtitle: "人物仪式" },
  { key: "object", seal: "器", title: "器物星尘", subtitle: "材料工艺" },
];

const orbitMeta = {
  flower_bird: { yBase: 0.88, inner: 1.3, outer: 5.6, turns: 1.75, start: -0.95, labelT: 0.7, depth: 560, tilt: -18 },
  calligraphy: { yBase: 0.55, inner: 1.45, outer: 6.1, turns: 1.42, start: 0.18, labelT: 0.62, depth: 540, tilt: 14 },
  landscape: { yBase: -0.18, inner: 1.85, outer: 6.8, turns: 1.15, start: 1.25, labelT: 0.64, depth: 620, tilt: -9 },
  figure: { yBase: 1.22, inner: 1.6, outer: 5.35, turns: 1.25, start: 2.38, labelT: 0.58, depth: 500, tilt: 22 },
  porcelain: { yBase: -1.42, inner: 1.65, outer: 6.05, turns: 1.52, start: 3.1, labelT: 0.68, depth: 570, tilt: -24 },
  object: { yBase: -1.92, inner: 2.1, outer: 6.7, turns: 1.1, start: 4.14, labelT: 0.66, depth: 590, tilt: 19 },
  painting: { yBase: 0.02, inner: 1.1, outer: 4.95, turns: 1.88, start: 5.02, labelT: 0.6, depth: 520, tilt: 6 },
};

const timeModes = {
  all: { label: "全景", years: "960-1279", range: [960, 1279], description: "宋代图像与器物的全景星图" },
  early: { label: "北宋", years: "960-1099", range: [960, 1099], description: "北宋早期的宫廷、山水与器物基础" },
  xuanhe: { label: "宣和", years: "1100-1127", range: [1100, 1127], description: "徽宗时代的花鸟、书法与宫廷审美" },
  southern: { label: "南宋", years: "1128-1279", range: [1128, 1279], description: "靖康之后的南宋余韵与风格延续" },
};

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
  const categoryLabel = item.meta?.label ?? categoryMeta[item.category]?.label ?? "文物";
  const relation = relationLabels[item.huizong_relation] ?? "宋代审美参照";
  const date = formatDate(item.date || item.period || item.dynasty);
  const author = cleanText(item.artist);
  const medium = cleanText(item.medium);
  const source = cleanText(item.source);
  const categoryNote = categoryDescriptions[item.category] ?? "这件作品作为宋代审美星图中的一个节点，用来观察图像、材质、年代与馆藏来源之间的关系。";
  const authorPart = author ? `作者/相关人物为 ${author}。` : "";
  const mediumPart = medium ? `媒介记录为 ${medium}。` : "";
  const sourcePart = source ? `数据来自 ${source}。` : "";
  return `${date} · ${categoryLabel} · ${relation}。${categoryNote}${authorPart}${mediumPart}${sourcePart}`;
}

function detailFacts(item) {
  if (!item) return [];
  return [
    ["类别", item.meta?.label ?? categoryMeta[item.category]?.label ?? "文物"],
    ["年代", formatDate(item.date || item.period || item.dynasty)],
    ["关系", relationLabels[item.huizong_relation] ?? "宋代参照"],
    ["来源", cleanText(item.source, "馆藏数据")],
  ];
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
      if (node.category === item.category) return true;
      if (node.related_to_huizong && item.related_to_huizong) return true;
      return node.source && node.source === item.source;
    })
    .sort((a, b) => tourScore(b) - tourScore(a))
    .slice(0, 5);
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

function buildNodes(records, activeCategory, timeMode, query, coreOnly, denseMode) {
  const central =
    records.find((item) => /芙蓉锦鸡|芙蓉錦雞|Songhuizong4/i.test(item.title)) ??
    records.find((item) => /枇杷山鸟|梅花绣眼|山鳥|繡眼/i.test(item.title)) ??
    records.find((item) => /Finches and bamboo|竹禽/i.test(item.title)) ??
    records.find((item) => /Auspicious Cranes|瑞/i.test(item.title)) ??
    records[0];

  const filteredRecords = records.filter((item) => {
    const categoryOk = !activeCategory || item.category === activeCategory || item.related_to_huizong;
    const timeOk = withinTimeMode(item, timeMode);
    const queryOk = matchesQuery(item, query);
    const coreOk = !coreOnly || item.related_to_huizong || item.id === central?.id;
    return item.id === central?.id || (categoryOk && timeOk && queryOk && coreOk);
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
    result[item.category] = (result[item.category] ?? 0) + 1;
    return result;
  }, {});
  const seenByCategory = {};

  return all.map((item, index) => {
    const meta = categoryMeta[item.category] ?? defaultMeta;
    const rand = seededRandom(hash(item.id ?? item.title));
    const core = item.related_to_huizong || index === 0;
    const categoryIndex = seenByCategory[item.category] ?? 0;
    seenByCategory[item.category] = categoryIndex + 1;
    const categoryCount = countsByCategory[item.category] ?? 1;
    const center = index === 0 ? [0, 0, 0.15] : meta.center;
    const radius = index === 0 ? 0 : core ? 1.0 + rand() * 2.35 : 0.75 + rand() * 1.7;
    const angle = rand() * Math.PI * 2;
    const drift = (rand() - 0.5) * 0.85;
    const orbit = orbitMeta[item.category] ?? { yBase: 0, inner: 1.4, outer: 5.8, turns: 1.35, start: 0, depth: 540 };
    const progress = categoryCount <= 1 ? 0 : categoryIndex / (categoryCount - 1);
    const spiralNoise = (rand() - 0.5) * 0.58;
    const orbitLayer = categoryIndex % 4;
    const orbitAngle = orbit.start + progress * orbit.turns * Math.PI * 2 + spiralNoise + orbitLayer * 0.17;
    const radiusProgress = Math.sqrt(progress);
    const orbitRadius =
      (core ? orbit.inner + (orbit.outer - orbit.inner) * radiusProgress * 0.76 : orbit.inner + (orbit.outer - orbit.inner) * radiusProgress) +
      (rand() - 0.5) * 0.48 +
      orbitLayer * 0.12;
    const orbitY =
      orbit.yBase +
      Math.sin(orbitAngle * 0.72 + progress * Math.PI) * 0.92 +
      Math.cos(orbitAngle * 1.6) * 0.18 +
      (rand() - 0.5) * 0.72;
    const denseDepth = Math.round((Math.sin(orbitAngle) * orbit.depth + Math.cos(progress * Math.PI * 2) * 90 + (core ? 90 : -80)) / 10) * 10;
    const position = denseMode
      ? index === 0
        ? [0, -0.05, 0.2]
        : [
            Math.cos(orbitAngle) * orbitRadius * (0.86 + progress * 0.2),
            orbitY,
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
  const entries = ["flower_bird", "porcelain", "calligraphy", "landscape", "object"];
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
          const meta = categoryMeta[key];
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
        setActiveCategory("flower_bird");
        setSelected(null);
      }} title="徽宗花鸟">
        徽
      </button>
    </aside>
  );
}

function DetailPanel({ selected, hovered, setSelected, nodes }) {
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
          <img src={item.local_thumb ?? item.image_thumb ?? item.image_url} alt={item.title} />
          <div>
            <p className="meta">{item.meta?.label ?? categoryMeta[item.category]?.label ?? "文物"} · {displayDate}</p>
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
                      <img src={work.local_thumb ?? work.image_thumb ?? work.image_url} alt="" />
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div className="detail-actions">
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

function TourPanel({ items, selected, setSelected }) {
  const currentIndex = Math.max(0, items.findIndex((item) => item.id === selected?.id));
  const active = items[currentIndex];
  const move = (direction) => {
    if (!items.length) return;
    const start = currentIndex >= 0 ? currentIndex : 0;
    const next = (start + direction + items.length) % items.length;
    setSelected(items[next]);
  };

  return (
    <section className="tour-panel">
      <button className="tour-start" onClick={() => items[0] && setSelected(items[0])}>
        <Play size={13} />
        徽宗导览
      </button>
      <button className="tour-step" onClick={() => move(-1)} aria-label="上一件">
        <ChevronLeft size={15} />
      </button>
      <div>
        <strong>{active ? cleanText(active.title, "核心作品") : "核心作品"}</strong>
        <span>{items.length ? `${currentIndex + 1}/${items.length}` : "0/0"}</span>
      </div>
      <button className="tour-step" onClick={() => move(1)} aria-label="下一件">
        <ChevronRight size={15} />
      </button>
    </section>
  );
}

function FallbackConstellation({ nodes, selected, setSelected, setHovered, denseMode }) {
  const central = nodes.find((node) => node.central);
  const featured = selected || null;
  const [view, setView] = useState({ rotateX: -5, rotateY: 0, zoom: 1, panX: 0, panY: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef(null);
  const lineOrigin = featured ?? central;
  const connectors = nodes
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
          {Object.entries(orbitMeta).map(([key, orbit]) => {
            const meta = categoryMeta[key] ?? defaultMeta;
            const armT = 0.58;
            const armAngle = orbit.start + armT * orbit.turns * Math.PI * 2;
            const armRadius = orbit.inner + (orbit.outer - orbit.inner) * Math.sqrt(armT);
            return (
              <div
                key={`orbit-${key}`}
                className="orbit-lane"
                style={{
                  "--orbit-w": `${(orbit.outer - orbit.inner) * 142 + 250}px`,
                  "--orbit-h": `${(orbit.outer - orbit.inner) * 42 + 86}px`,
                  "--x": `${Math.cos(armAngle) * armRadius * 58}px`,
                  "--y": `${(-orbit.yBase * 58) + Math.sin(armAngle * 0.7) * 34}px`,
                  "--z": `${Math.sin(armAngle) * orbit.depth * 0.56}px`,
                  "--tilt": `${orbit.tilt}deg`,
                  "--accent": meta.color,
                }}
              />
            );
          })}
          {clusterLabels.map((cluster) => {
            const meta = categoryMeta[cluster.key];
            const orbit = orbitMeta[cluster.key] ?? { yBase: 0, inner: 1.4, outer: 5.8, turns: 1.35, start: 0, labelT: 0.6, depth: 540 };
            const labelAngle = orbit.start + orbit.labelT * orbit.turns * Math.PI * 2;
            const labelRadius = orbit.inner + (orbit.outer - orbit.inner) * Math.sqrt(orbit.labelT);
            const x = Math.cos(labelAngle) * labelRadius * 82;
            const y = -(orbit.yBase + Math.sin(labelAngle * 0.72 + orbit.labelT * Math.PI) * 0.78) * 70;
            const z = Math.sin(labelAngle) * orbit.depth * 0.56;
            const isMuted = featured && featured.category !== cluster.key;
            return (
              <div
                key={cluster.key}
                className={isMuted ? "cluster-label muted" : "cluster-label"}
                style={{
                  "--x": `${x}px`,
                  "--y": `${y}px`,
                  "--z": `${z}px`,
                  "--accent": meta.color,
                }}
              >
                <b>{cluster.seal}</b>
                <span>{cluster.title}</span>
                <small>{cluster.subtitle}</small>
              </div>
            );
          })}
      {nodes.slice(0, denseMode ? 152 : 72).map((node) => {
        const point = project(node.position);
        const point3d = project3d(node);
        const isFeatured = featured?.id === node.id;
        const isDimmed = featured && !isRelatedToFeatured(node);
        const rawRatio = node.width && node.height ? node.width / node.height : 1;
        const featureRatio = clamp(rawRatio, 0.48, 6);
        const featuredWidth =
          rawRatio > 2.4
            ? "min(38vw, 500px)"
            : rawRatio > 1.15
              ? "min(28vw, 380px)"
              : rawRatio < 0.72
                ? "min(15vw, 220px)"
                : "min(22vw, 300px)";
        const style = {
          left: "50%",
          top: "51%",
          width: isFeatured
            ? featuredWidth
            : node.central
              ? denseMode ? "clamp(38px, 4.6vw, 68px)" : "clamp(42px, 5vw, 74px)"
              : node.core
                ? denseMode ? "clamp(20px, 3.1vw, 50px)" : "clamp(26px, 3.7vw, 58px)"
                : denseMode ? "clamp(8px, 1.25vw, 24px)" : "clamp(13px, 1.8vw, 34px)",
          aspectRatio: isFeatured ? `${featureRatio}` : undefined,
          borderColor: isFeatured || node.central ? "#e1bf79" : node.meta.color,
          boxShadow: isFeatured
            ? "0 0 44px rgba(229, 189, 112, .48)"
            : node.central
              ? "0 0 24px rgba(229, 189, 112, .32)"
              : `0 0 14px ${node.meta.color}42`,
          "--x": `${isFeatured ? 0 : point3d.x}px`,
          "--y": `${isFeatured ? 0 : point3d.y}px`,
          "--z": `${isFeatured ? 210 : isDimmed ? point3d.z - 220 : point3d.z}px`,
          "--d": `${isFeatured ? 1 : isDimmed ? 0.62 : clamp((denseMode ? 0.75 : 0.82) + (point3d.z + 260) / 2400, denseMode ? 0.58 : 0.68, denseMode ? 1.04 : 1.08)}`,
          "--blur": `${isFeatured ? 0 : isDimmed ? 1.15 : point3d.z < -360 ? 0.7 : point3d.z < -140 ? 0.28 : 0}px`,
          "--alpha": `${isFeatured ? 1 : isDimmed ? 0.13 : clamp((denseMode ? 0.36 : 0.58) + (point3d.z + 340) / 1500, denseMode ? 0.26 : 0.5, denseMode ? 0.82 : 0.9)}`,
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
                  ? `fallback-node-button dimmed cat-${node.category}`
                  : node.central
                    ? "fallback-node-button central-core"
                    : node.core
                      ? `fallback-node-button core cat-${node.category}`
                      : `fallback-node-button cat-${node.category}`
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
      <div className="view-hud">
        <button onClick={resetView}>归位</button>
      </div>
    </div>
  );
}

function ViewStatus({ activeCategory, timeMode }) {
  const category = activeCategory ? categoryMeta[activeCategory]?.label : "全类";
  const time = timeModes[timeMode];
  return (
    <section className="view-status">
      <p>{category} · {time.label}</p>
      <strong>{time.description}</strong>
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
      <p>{timeModes[timeMode].label} · {activeCategory ? categoryMeta[activeCategory]?.label : "全类"} · {denseMode ? "多层" : "精简"}</p>
    </section>
  );
}

function LegendStrip({ nodes }) {
  const counts = useMemo(() => {
    const result = {};
    for (const node of nodes) result[node.category] = (result[node.category] ?? 0) + 1;
    return result;
  }, [nodes]);
  const entries = ["flower_bird", "porcelain", "calligraphy", "landscape", "figure", "object"];
  return (
    <section className="legend-strip">
      {entries.map((key) => {
        const meta = categoryMeta[key];
        return (
          <div key={key}>
            <i style={{ background: meta.color }} />
            <span>{meta.label}</span>
            <b>{counts[key] ?? 0}</b>
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
  const [hovered, setHovered] = useState(null);
  const [activeCategory, setActiveCategory] = useState(null);
  const [timeMode, setTimeMode] = useState("all");
  const [query, setQuery] = useState("");
  const [coreOnly, setCoreOnly] = useState(false);
  const [denseMode, setDenseMode] = useState(true);
  const visibleNodes = useMemo(
    () => buildNodes(artifacts, activeCategory, timeMode, query, coreOnly, denseMode),
    [artifacts, activeCategory, timeMode, query, coreOnly, denseMode],
  );
  const tourItems = useMemo(
    () => visibleNodes
      .filter((node) => node.related_to_huizong || node.central)
      .sort((a, b) => tourScore(b) - tourScore(a))
      .slice(0, 12),
    [visibleNodes],
  );
  const activeLabel = activeCategory ? categoryMeta[activeCategory]?.label : "全类";
  const timeLabel = timeModes[timeMode].label;

  return (
    <main>
      <Sidebar activeCategory={activeCategory} setActiveCategory={setActiveCategory} setSelected={setSelected} />
      <header className="title-block">
        <h1>宋徽宗的审美宇宙</h1>
        <span>{timeLabel} · {activeLabel} · {visibleNodes.length} 件图像与器物</span>
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
      <TourPanel items={tourItems} selected={selected} setSelected={setSelected} />
      <FallbackConstellation nodes={visibleNodes} selected={selected} setSelected={setSelected} setHovered={setHovered} denseMode={denseMode} />
      <LegendStrip nodes={visibleNodes} />
      <DetailPanel selected={selected} hovered={hovered} setSelected={setSelected} nodes={visibleNodes} />
      <TimelineControl timeMode={timeMode} setTimeMode={setTimeMode} setSelected={setSelected} />
    </main>
  );
}

createRoot(document.getElementById("root")).render(<App />);
