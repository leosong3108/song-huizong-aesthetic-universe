import React, { useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { BookOpen, Brush, CircleDot, ExternalLink, Feather, Mountain, Search, Sparkles, Waves, X } from "lucide-react";
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

function buildNodes(records, activeCategory, timeMode, query, coreOnly) {
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
  const huizong = filteredRecords
    .filter((item) => item.related_to_huizong)
    .slice(0, hasIntent ? 36 : 22);
  const peripheral = filteredRecords
    .filter((item) => item.id !== central?.id && !huizong.some((core) => core.id === item.id))
    .slice(0, hasIntent ? 36 : 18);

  const all = [central, ...huizong.filter((item) => item.id !== central?.id), ...peripheral].filter(Boolean);

  return all.map((item, index) => {
    const meta = categoryMeta[item.category] ?? defaultMeta;
    const rand = seededRandom(hash(item.id ?? item.title));
    const core = item.related_to_huizong || index === 0;
    const center = index === 0 ? [0, 0, 0.15] : meta.center;
    const radius = index === 0 ? 0 : core ? 1.0 + rand() * 2.35 : 0.75 + rand() * 1.7;
    const angle = rand() * Math.PI * 2;
    const drift = (rand() - 0.5) * 0.85;
    const position =
      index === 0
        ? [0, -0.05, 0.2]
        : [
            center[0] + Math.cos(angle) * radius,
            center[1] + Math.sin(angle) * radius * 0.68 + drift,
            center[2] + (rand() - 0.5) * 0.65,
          ];

    const relationBoost = item.huizong_relation === "huizong_work" ? 0.16 : item.related_to_huizong ? 0.08 : 0;
    const imageRatio = item.width && item.height ? item.width / item.height : 1;
    const base = index === 0 ? 1.28 : core ? 0.32 + relationBoost : 0.17 + rand() * 0.14;
    const width = base * Math.min(Math.max(imageRatio, 0.55), 2.2);
    const height = base * Math.min(Math.max(1 / imageRatio, 0.58), 1.9);

    return {
      ...item,
      position,
      depth: index === 0 ? 80 : Math.round(clamp((rand() - 0.5) * 620 + (core ? 80 : -60), -360, 220) / 10) * 10,
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

function DetailPanel({ selected, hovered, setSelected }) {
  const item = hovered ?? selected;
  const displayDate = item ? formatDate(item.date || item.period || item.dynasty) : "";
  const displayTitle = item ? cleanText(item.title, "未命名作品") : "";
  const displaySource = item ? cleanText(item.artist || item.source, "馆藏记录") : "";
  const displayRelation = item ? relationLabels[item.huizong_relation] ?? cleanText(item.huizong_relation || item.source, "宋代审美参照") : "";
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

function FallbackConstellation({ nodes, selected, setSelected, setHovered }) {
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
    .filter((line) => line.from && line.to);

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
      rotateY: clamp(start.rotateY + dx * 0.07, -28, 28),
      rotateX: clamp(start.rotateX - dy * 0.05, -22, 16),
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
        rotateY: clamp(current.rotateY - event.deltaX * 0.052, -32, 32),
        rotateX: clamp(current.rotateX - event.deltaY * 0.04, -24, 18),
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
      {nodes.slice(0, 72).map((node) => {
        const point = project(node.position);
        const point3d = project3d(node);
        const isFeatured = featured?.id === node.id;
        const isDimmed = featured && !isRelatedToFeatured(node);
        const style = {
          left: "50%",
          top: "51%",
          width: isFeatured
            ? "min(20vw, 300px)"
            : node.central
              ? "clamp(42px, 5vw, 74px)"
              : node.core
                ? "clamp(26px, 3.7vw, 58px)"
                : "clamp(13px, 1.8vw, 34px)",
          borderColor: isFeatured || node.central ? "#e1bf79" : node.meta.color,
          boxShadow: isFeatured
            ? "0 0 44px rgba(229, 189, 112, .48)"
            : node.central
              ? "0 0 24px rgba(229, 189, 112, .32)"
              : `0 0 14px ${node.meta.color}42`,
          "--x": `${isFeatured ? 0 : point3d.x}px`,
          "--y": `${isFeatured ? 0 : point3d.y}px`,
          "--z": `${isFeatured ? 330 : isDimmed ? point3d.z - 220 : point3d.z}px`,
          "--d": `${isFeatured ? 1 : isDimmed ? 0.62 : clamp(0.82 + (point3d.z + 260) / 2200, 0.68, 1.08)}`,
          "--blur": `${isFeatured ? 0 : isDimmed ? 1.15 : point3d.z < -260 ? 0.45 : point3d.z < -80 ? 0.18 : 0}px`,
          "--alpha": `${isFeatured ? 1 : isDimmed ? 0.16 : clamp(0.58 + (point3d.z + 340) / 1500, 0.5, 0.9)}`,
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

function ControlPanel({ query, setQuery, coreOnly, setCoreOnly, setSelected, activeCategory, timeMode }) {
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
      <p>{timeModes[timeMode].label} · {activeCategory ? categoryMeta[activeCategory]?.label : "全类"}</p>
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
  const visibleNodes = useMemo(
    () => buildNodes(artifacts, activeCategory, timeMode, query, coreOnly),
    [artifacts, activeCategory, timeMode, query, coreOnly],
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
        setSelected={setSelected}
        activeCategory={activeCategory}
        timeMode={timeMode}
      />
      <FallbackConstellation nodes={visibleNodes} selected={selected} setSelected={setSelected} setHovered={setHovered} />
      <LegendStrip nodes={visibleNodes} />
      <DetailPanel selected={selected} hovered={hovered} setSelected={setSelected} />
      <TimelineControl timeMode={timeMode} setTimeMode={setTimeMode} setSelected={setSelected} />
    </main>
  );
}

createRoot(document.getElementById("root")).render(<App />);
