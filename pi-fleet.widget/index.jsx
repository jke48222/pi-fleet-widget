import { React } from "uebersicht";
// --- Inlined design system (self-contained; formerly theme.js) ---
// Shared design system for the widget set: color tokens, fonts, layout, the
// common card shell, drag/resize handles, a last-known-good cache, and the
// standard data-resolution helper. Imported by every widget so they stay
// visually and behaviorally consistent.
const T = {
  // Accent tints
  tintBlue: "#296BE0",
  tintPink: "#E86E87",
  tintGreen: "#59A875",
  tintOrange: "#D9946B",
  tintPurple: "#A861DE",

  // Cards
  cardLight: "rgba(255,255,255,0.74)",
  cardDark: "rgba(33,36,43,0.88)",

  // Ink (text on light)
  ink: "#1F2129",
  inkDim: "#616670",
  inkMute: "#8C919C",

  // Text on dark
  onDark: "#F7F7FA",
  onDarkDim: "#BDBFC7",
  onDarkMute: "#8F949E",

  // Walls (desktop stand-in backgrounds)
  wall1: "#F0F2F7",
  wall2: "#DBE3ED",
  wall3: "#BFC7DB",

  // GitHub ramp
  ghEmpty: "rgba(255,255,255,0.10)",
  ghGreen1: "#9CE8A8",
  ghGreen2: "#40C463",
  ghGreen3: "#30A14F",
  ghGreen4: "#216E38",

  // Scene colors
  nightSky: "#14141A",
  cosmicBase: "#0A051A",
  cosmicViolet: "#8C338C",
  cosmicMagenta: "#D9598C",
  cosmicIndigo: "#331A66",
  shaderPurple: "#402673",
  shaderTeal: "#268C8C",
  duskBase: "#4D408C",
  duskAmber: "#D9A666",
  duskPurple: "#8C4DA6",
  duskGlow: "#F28073",
  cardCream: "#F2F0E6",
  paperGrain: "#9E8052",

  archivePalette: [
    "#D98C4D", "#A64D33", "#733326", "#E0B359",
    "#8C6640", "#B88CCC", "#594D80", "#8C73BF",
    "#8CBF8C", "#4D8059", "#598CD9", "#334D8C",
  ],

  // Layout
  radius: "24px",
  captionTracking: "1.5px",
};

// Fonts. Install Instrument Serif, Geist, and Geist Mono for the intended look;
// each stack falls back to a system font if the family is missing.
const serif = "'Instrument Serif', Georgia, serif";
const sans = "'Geist', -apple-system, BlinkMacSystemFont, sans-serif";
const mono = "'Geist Mono', 'SF Mono', ui-monospace, monospace";

// Default desktop placement [x, y] per widget. Each widget calls
// card(variant, w, h, ...LAYOUT.<key>) so widgets lay out at distinct positions
// rather than stacking at the origin. These are overridden by any saved
// position from the drag handle.
const LAYOUT = {
  nowSpinning:  [380, 40],
  musicArchive: [40, 40],
  spatial:      [380, 200],
  mosaic:       [1120, 40],
  stack:        [1120, 486],
  drop:         [1120, 708],
  swap:         [380, 672],
  aiDailyPull:  [40, 368],
  apod:         [40, 576],
  atlas:        [1280, 224],
  tarot:        [1120, 224],
};

// Shared card shell. variant is "dark" or "light"; x/y set the on-desktop
// position. The common loading/empty/stale state styles are appended so every
// widget can render those states without repeating CSS.
const card = (variant, w, h, x = 0, y = 0) => `
  position: absolute;
  left: ${x}px; top: ${y}px;
  width: ${w}px;
  height: ${h}px;
  border-radius: ${T.radius};
  overflow: hidden;
  box-shadow: 0 12px 40px rgba(0,0,0,0.35);
  background: ${variant === "dark" ? T.cardDark : T.cardLight};
  backdrop-filter: blur(20px);
  color: ${variant === "dark" ? T.onDark : T.ink};
  font-family: ${sans};
  box-sizing: border-box;
  transform-origin: top left;

  /* Promote each card to its own GPU layer so a sibling widget's frequent
     refresh cannot trigger a backdrop-filter recomposite, which otherwise made
     the blur flicker on and off. */
  will-change: transform;
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;

  .ws-stale { position:absolute; top:8px; right:10px; z-index:5;
              font-family:${mono}; font-size:8px; letter-spacing:1px;
              text-transform:uppercase; opacity:0.72;
              color:${variant === "dark" ? T.onDarkMute : T.inkMute}; }
  .ws-empty { position:absolute; inset:0; display:flex; align-items:center;
              justify-content:center; padding:24px; text-align:center;
              font-family:${serif}; font-style:italic; font-size:18px;
              opacity:0.6; color:${variant === "dark" ? T.onDarkDim : T.inkDim}; }
  .ws-skel  { position:absolute; inset:14px; border-radius:14px; opacity:0.18;
              animation: ws-pulse 1.6s ease-in-out infinite; }
  @keyframes ws-pulse { 0%,100% { opacity:0.10; } 50% { opacity:0.24; } }
  @media (prefers-reduced-motion: reduce) {
    .ws-skel { animation:none; opacity:0.16; }
  }

  .ws-drag  { position:absolute; top:6px; left:6px; z-index:30;
              width:18px; height:18px; border-radius:6px;
              display:flex; align-items:center; justify-content:center;
              font-size:11px; line-height:1; cursor:grab; opacity:0.22;
              transition:opacity .15s ease; user-select:none;
              -webkit-user-select:none;
              color:${variant === "dark" ? T.onDarkMute : T.inkMute};
              background:${variant === "dark"
                ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)"}; }
  .ws-drag:hover  { opacity:0.95; }
  .ws-drag:active { cursor:grabbing; }

  .ws-resize { position:absolute; bottom:5px; right:5px; z-index:30;
               width:16px; height:16px; border-radius:5px;
               display:flex; align-items:center; justify-content:center;
               font-size:11px; line-height:1; cursor:nwse-resize; opacity:0.22;
               transition:opacity .15s ease; user-select:none;
               -webkit-user-select:none;
               color:${variant === "dark" ? T.onDarkMute : T.inkMute};
               background:${variant === "dark"
                 ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)"}; }
  .ws-resize:hover { opacity:0.95; }
`;

// Small uppercase monospace caption used for metadata labels.
const caption = (color) => `
  font-family: ${mono};
  text-transform: uppercase;
  letter-spacing: ${T.captionTracking};
  color: ${color};
`;

// State helpers, returned as React elements (this is plain JS, not JSX).
const h = React.createElement;

// Loading: an accent-tinted skeleton block.
const Skel = ({ tint = T.tintBlue }) =>
  h("div", { className: "ws-skel", style: { background: tint } });

// Empty: a single quiet line of text.
const Empty = ({ text }) => h("div", { className: "ws-empty" }, text);

// Stale: a small marker showing the time of the last successful refresh.
const Stale = ({ ts }) =>
  h("div", { className: "ws-stale" }, `stale · ${clockStamp(ts)}`);

// Drag and resize support.
//
// Übersicht renders each widget into its own absolutely-positioned `.widget`
// node, all inside a shared `#uebersicht` container. The wrapper to move is the
// nearest `.widget` ancestor of a handle — not the topmost absolute element,
// which is the shared container.
//
// DragHandle updates the wrapper's left/top. ResizeHandle scales it uniformly
// via a top-left-anchored CSS transform, keeping these fixed-layout cards crisp
// instead of clipping. Both persist to localStorage, so position and size
// survive refreshes and reboots.
const posKey = (k) => `ws:pos:${k}`;
const scaleKey = (k) => `ws:scale:${k}`;
const MIN_SCALE = 0.4, MAX_SCALE = 3;

const findWrapper = (node) => node && node.closest(".widget");

// Apply any saved position and scale. Runs on every mount, since the wrapper
// may have been recreated on refresh.
const applySaved = (wrapper, key) => {
  try {
    const pos = JSON.parse(localStorage.getItem(posKey(key)) || "null");
    if (pos && typeof pos.x === "number") {
      wrapper.style.left = pos.x + "px";
      wrapper.style.top = pos.y + "px";
    }
  } catch (e) { /* storage unavailable */ }
  try {
    const scale = parseFloat(localStorage.getItem(scaleKey(key)));
    if (scale > 0) wrapper.style.transform = `scale(${scale})`;
  } catch (e) { /* storage unavailable */ }
};

const initDrag = (node, key) => {
  if (!node) return;
  const wrapper = findWrapper(node);
  if (!wrapper) return;
  applySaved(wrapper, key);

  if (node.__wsDragWired) return; // attach listeners once per node
  node.__wsDragWired = true;

  // Keep grip clicks from reaching the card's own onClick handler.
  node.addEventListener("click", (e) => e.stopPropagation());

  node.addEventListener("mousedown", (e) => {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX, startY = e.clientY;
    const cs = getComputedStyle(wrapper);
    const origX = parseFloat(wrapper.style.left || cs.left) || 0;
    const origY = parseFloat(wrapper.style.top || cs.top) || 0;
    const onMove = (ev) => {
      wrapper.style.left = origX + (ev.clientX - startX) + "px";
      wrapper.style.top = origY + (ev.clientY - startY) + "px";
    };
    const onUp = () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
      try {
        localStorage.setItem(posKey(key), JSON.stringify({
          x: parseFloat(wrapper.style.left) || 0,
          y: parseFloat(wrapper.style.top) || 0,
        }));
      } catch (e) { /* storage unavailable */ }
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  });

  // Double-click the grip to snap back to the card's default LAYOUT slot.
  node.addEventListener("dblclick", (e) => {
    e.preventDefault();
    e.stopPropagation();
    try { localStorage.removeItem(posKey(key)); } catch (e) { /* ignore */ }
    wrapper.style.left = "";
    wrapper.style.top = "";
  });
};

const initResize = (node, key) => {
  if (!node) return;
  const wrapper = findWrapper(node);
  if (!wrapper) return;
  applySaved(wrapper, key);

  if (node.__wsResizeWired) return;
  node.__wsResizeWired = true;

  node.addEventListener("click", (e) => e.stopPropagation());

  node.addEventListener("mousedown", (e) => {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX, startY = e.clientY;
    const cs = getComputedStyle(wrapper);
    // Layout width/height are unaffected by transform, so they stay constant.
    const baseW = parseFloat(cs.width) || 1;
    const baseH = parseFloat(cs.height) || 1;
    const m = /scale\(([^)]+)\)/.exec(wrapper.style.transform || "");
    const origScale = m ? parseFloat(m[1]) || 1 : 1;
    const onMove = (ev) => {
      const delta = (ev.clientX - startX + (ev.clientY - startY)) / (baseW + baseH);
      const next = Math.max(MIN_SCALE, Math.min(MAX_SCALE, origScale + delta));
      wrapper.style.transform = `scale(${next})`;
    };
    const onUp = () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
      const m2 = /scale\(([^)]+)\)/.exec(wrapper.style.transform || "");
      try { localStorage.setItem(scaleKey(key), String(m2 ? m2[1] : 1)); }
      catch (e) { /* storage unavailable */ }
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  });

  // Double-click the corner to restore the card's default size.
  node.addEventListener("dblclick", (e) => {
    e.preventDefault();
    e.stopPropagation();
    try { localStorage.removeItem(scaleKey(key)); } catch (e) { /* ignore */ }
    wrapper.style.transform = "";
  });
};

// Each handle takes the widget's LAYOUT key so position and scale are stored
// per widget. DragHandle renders top-left, ResizeHandle bottom-right.
const DragHandle = ({ k }) =>
  h("div", { className: "ws-drag", title: "Drag to move · double-click to reset",
             ref: (n) => initDrag(n, k) }, "☰");

const ResizeHandle = ({ k }) =>
  h("div", { className: "ws-resize", title: "Drag to resize · double-click to reset",
             ref: (n) => initResize(n, k) }, "⤡");

// Last-known-good cache, persisted in localStorage with a timestamp.
const remember = (key, data) => {
  try { localStorage.setItem(`ws:${key}`, JSON.stringify({ data, ts: Date.now() })); }
  catch (e) { /* storage unavailable; skip */ }
};

const recall = (key) => {
  try { return JSON.parse(localStorage.getItem(`ws:${key}`)); }
  catch (e) { return null; }
};

const clockStamp = (ms) =>
  new Date(ms).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

// True before the command has produced any output (the initial load tick).
const isLoading = ({ output, error }) =>
  output === undefined && !error;

// Standard data flow for command-backed widgets. parse(output) must return a
// falsy value when there is nothing usable.
//   loading -> { loading: true }            render <Skel/>
//   success -> { data }                     cached as last-known-good
//   failure -> { data, staleTs }            last-known-good + time, render <Stale/>
//   cold    -> { data, mock: true }         mock data, nothing cached yet
const resolve = (key, props, parse, mock) => {
  if (isLoading(props)) return { loading: true };
  let data = null;
  try { data = parse(props.output); } catch (e) { data = null; }
  if (data) { remember(key, data); return { data }; }
  const cached = recall(key);
  if (cached && cached.data) return { data: cached.data, staleTs: cached.ts };
  return { data: mock, mock: true };
};
// --- End inlined design system ---

// pi-fleet — your Raspberry Pis at a glance: reachability, SoC temperature,
// load, memory, disk, uptime, and throttling flags, probed over SSH with key
// auth and short timeouts. Hosts live in ~/.config/widgetsuite/pi-fleet.json
// (install.sh writes an example). With no config the widget shows labeled
// sample data instead of a blank card. The probe is read-only and installs
// nothing on the Pis.

const POS = [640, 420];
const KEY = "pifleet";

export const command = String.raw`python3 - <<'PY'
#!/usr/bin/env python3
# pi-fleet helper: probes each host in ~/.config/widgetsuite/pi-fleet.json over
# SSH (key auth, BatchMode, short timeouts, all hosts in parallel) and prints one
# JSON object. With no config it prints labeled sample data so the widget is
# never blank. Nothing is installed on the Pis; the probe is a read-only shell
# script sent over stdin.
import os, sys, json, time, subprocess, concurrent.futures
HOME = os.path.expanduser("~"); NOW = time.time()
CFG = os.path.join(HOME, ".config", "widgetsuite", "pi-fleet.json")
REMOTE = r"""
H=$(hostname 2>/dev/null)
U=$(cut -d' ' -f1 /proc/uptime 2>/dev/null)
L=$(cut -d' ' -f1-3 /proc/loadavg 2>/dev/null)
T=$(cat /sys/class/thermal/thermal_zone0/temp 2>/dev/null || echo 0)
M=$(awk '/MemTotal/ {t=$2} /MemAvailable/ {a=$2} END {print t*1024, a*1024}' /proc/meminfo 2>/dev/null)
D=$(df -Pk / 2>/dev/null | awk 'NR==2 {print $2*1024, $4*1024}')
TH=$(vcgencmd get_throttled 2>/dev/null | cut -d= -f2)
MODEL=$(tr -d '\0' < /proc/device-tree/model 2>/dev/null)
C=$(nproc 2>/dev/null || echo 1)
IP=$(hostname -I 2>/dev/null | cut -d' ' -f1)
printf '%s|%s|%s|%s|%s|%s|%s|%s|%s|%s\n' "$H" "$U" "$L" "$T" "$M" "$D" "$TH" "$MODEL" "$C" "$IP"
"""
def sample():
    return {"now": int(NOW), "demo": True, "interval": 30, "hosts": [
        {"name": "wall", "role": "LED matrix", "host": "wall.local", "online": True, "hostname": "wall", "model": "Raspberry Pi 5 Model B Rev 1.0", "cores": 4, "ip": "10.0.0.31",
         "uptime": 1123456, "load": [0.42, 0.38, 0.35], "temp": 51.7, "mem_total": 8589934592, "mem_avail": 6012345678, "disk_total": 62000000000, "disk_avail": 41000000000, "throttled": "0x0", "ms": 38},
        {"name": "parmco", "role": "motor control", "host": "parmco.local", "online": True, "hostname": "parmco", "model": "Raspberry Pi 4 Model B Rev 1.4", "cores": 4, "ip": "10.0.0.44",
         "uptime": 86400 * 3 + 5000, "load": [1.31, 0.9, 0.7], "temp": 63.2, "mem_total": 4294967296, "mem_avail": 2100000000, "disk_total": 31000000000, "disk_avail": 12000000000, "throttled": "0x50000", "ms": 61},
        {"name": "car", "role": "audio tracking", "host": "car.local", "online": False, "hostname": "", "model": "", "cores": 0, "ip": "",
         "uptime": 0, "load": [0, 0, 0], "temp": 0, "mem_total": 0, "mem_avail": 0, "disk_total": 0, "disk_avail": 0, "throttled": "", "ms": 0, "error": "no route to host"},
    ]}
try:
    cfg = json.load(open(CFG))
except Exception:
    print(json.dumps(sample())); sys.exit(0)
hosts = cfg.get("hosts") or []
if not hosts:
    print(json.dumps(sample())); sys.exit(0)

def probe(h):
    name = h.get("name") or h.get("host"); user = h.get("user", "pi"); host = h.get("host"); port = str(h.get("port", 22))
    base = {"name": name, "role": h.get("role", ""), "host": host, "online": False, "hostname": "", "model": "", "cores": 0, "ip": "",
            "uptime": 0, "load": [0, 0, 0], "temp": 0, "mem_total": 0, "mem_avail": 0, "disk_total": 0, "disk_avail": 0, "throttled": "", "ms": 0}
    t0 = time.time()
    try:
        r = subprocess.run(["ssh", "-p", port, "-o", "BatchMode=yes", "-o", "ConnectTimeout=4", "-o", "StrictHostKeyChecking=accept-new",
                            "-o", "LogLevel=ERROR", f"{user}@{host}", "sh -s"], input=REMOTE, capture_output=True, text=True, timeout=10)
        base["ms"] = int((time.time() - t0) * 1000)
        line = (r.stdout.strip().split("\n") or [""])[-1]
        if r.returncode != 0 or line.count("|") < 9:
            base["error"] = (r.stderr.strip().split("\n") or ["unreachable"])[-1][:80] or "unreachable"; return base
        H, U, L, T, M, D, TH, MODEL, C, IP = line.split("|")[:10]
        load = [float(x) for x in L.split()[:3]] if L.strip() else [0, 0, 0]
        mem = [int(float(x)) for x in M.split()[:2]] if M.strip() else [0, 0]
        disk = [int(float(x)) for x in D.split()[:2]] if D.strip() else [0, 0]
        base.update({"online": True, "hostname": H, "uptime": int(float(U or 0)), "load": load, "temp": round(int(float(T or 0)) / 1000.0, 1),
                     "mem_total": mem[0], "mem_avail": mem[1] if len(mem) > 1 else 0, "disk_total": disk[0], "disk_avail": disk[1] if len(disk) > 1 else 0,
                     "throttled": TH.strip(), "model": MODEL.strip(), "cores": int(C or 1), "ip": IP.strip()})
    except subprocess.TimeoutExpired:
        base["error"] = "timeout"; base["ms"] = int((time.time() - t0) * 1000)
    except Exception as e:
        base["error"] = str(e)[:80]
    return base

with concurrent.futures.ThreadPoolExecutor(max_workers=min(8, len(hosts))) as ex:
    results = list(ex.map(probe, hosts))
print(json.dumps({"now": int(NOW), "demo": False, "interval": int(cfg.get("interval", 30)), "hosts": results}))
PY`;

export const refreshFrequency = 1000 * 30;

const parse = (out) => { const j = JSON.parse(out); return j && Array.isArray(j.hosts) ? j : null; };
const MOCK = { now: 0, demo: true, hosts: [] };

const fmtUp = (s) => { if (!s) return "—"; const d = Math.floor(s / 86400), h = Math.floor((s % 86400) / 3600), m = Math.floor((s % 3600) / 60); return d ? `${d}d ${h}h` : h ? `${h}h ${m}m` : `${m}m`; };
const fmtGB = (b) => b >= 1e9 ? `${(b / 1e9).toFixed(b >= 1e10 ? 0 : 1)}G` : `${Math.round(b / 1e6)}M`;
const pct = (used, total) => total ? Math.min(100, Math.round((used / total) * 100)) : 0;
const tempTint = (t) => t >= 70 ? T.tintPink : t >= 55 ? T.tintOrange : T.tintGreen;
const throttle = (hex) => {
  const v = parseInt(hex || "0", 16) || 0;
  if (v & 0xF) return { label: "throttled", tint: T.tintPink };
  if (v & 0xF0000) return { label: "was throttled", tint: T.tintOrange };
  return null;
};
const headline = (hosts, demo) => {
  const n = hosts.length, up = hosts.filter((h) => h.online).length;
  if (!n) return "No Pis configured yet.";
  if (up === n) return n === 1 ? "The Pi is up." : `All ${n} Pis are up.`;
  if (!up) return "Nothing answers.";
  return `${up} of ${n} up, ${n - up} dark.`;
};

const SAVED_HOSTS = (((recall("pifleet") || {}).data || {}).hosts || []).length;
const W = 440, H = SAVED_HOSTS > 3 ? 452 : 300;

export const className = card("dark", W, H, ...POS) + `
  padding: 16px 18px 12px;
  display: flex; flex-direction: column;

  .cap { ${caption(T.onDarkMute)} display:flex; justify-content:space-between; }
  .cap b { font-weight:500; color:${T.onDarkDim}; }
  .head { font-family:${serif}; font-style:italic; font-size:22px; line-height:1.15; margin: 6px 0 10px; color:${T.onDark}; }

  .grid { flex:1; display:grid; grid-template-columns: repeat(3, 1fr); grid-auto-rows: 1fr; gap: 8px; min-height:0; }
  .tile { position:relative; border-radius: 14px; padding: 10px 11px 9px; background: rgba(255,255,255,0.05); box-shadow: inset 0 0 0 1px rgba(255,255,255,0.06);
          display:flex; flex-direction:column; gap: 6px; min-width:0; }
  .tile.off { opacity: 0.55; }
  .name { display:flex; align-items:center; gap:6px; font-size: 12.5px; font-weight: 500; color:${T.onDark}; white-space:nowrap; overflow:hidden; }
  .name i { flex:none; width:7px; height:7px; border-radius:50%; background:${T.tintGreen}; box-shadow: 0 0 0 3px color-mix(in srgb, ${T.tintGreen} 20%, transparent); }
  .tile.off .name i { background:${T.tintPink}; box-shadow:none; }
  .role { font-family:${mono}; font-size:8px; letter-spacing:1px; text-transform:uppercase; color:${T.onDarkMute}; margin-top:-4px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .vitals { display:flex; align-items:center; gap: 8px; }
  .gauge { position:relative; width:44px; height:44px; flex:none; }
  .gauge svg { width:44px; height:44px; transform: rotate(135deg); }
  .gauge .val { position:absolute; inset:0; display:flex; align-items:center; justify-content:center; font-family:${mono}; font-size:10px; color:${T.onDark}; padding-top:2px; }
  .gauge .val small { font-size:7px; color:${T.onDarkMute}; margin-left:1px; }
  .spark { flex:1; min-width:0; }
  .spark svg { width:100%; height:18px; display:block; }
  .spark .lbl { font-family:${mono}; font-size:8px; letter-spacing:0.8px; color:${T.onDarkMute}; margin-top:2px; white-space:nowrap; }
  .spark .lbl b { font-weight:500; color:${T.onDarkDim}; }
  .bars { display:flex; flex-direction:column; gap:4px; }
  .bar { display:flex; align-items:center; gap:6px; font-family:${mono}; font-size:8px; letter-spacing:0.6px; color:${T.onDarkMute}; }
  .bar span { width:26px; flex:none; }
  .bar i { flex:1; height:3px; border-radius:2px; background: rgba(255,255,255,0.10); overflow:hidden; }
  .bar i b { display:block; height:100%; border-radius:2px; background:${T.onDarkDim}; }
  .bar em { font-style:normal; width:28px; text-align:right; color:${T.onDarkDim}; }
  .foot2 { display:flex; justify-content:space-between; font-family:${mono}; font-size:8px; letter-spacing:0.8px; color:${T.onDarkMute}; margin-top:auto; }
  .flag { font-family:${mono}; font-size:7.5px; letter-spacing:1px; text-transform:uppercase; padding:2px 5px; border-radius:5px; color: var(--tint); background: color-mix(in srgb, var(--tint) 16%, transparent); }
  .err { font-family:${serif}; font-style:italic; font-size:13px; color:${T.onDarkDim}; margin-top:2px; }

  .foot { display:flex; justify-content:space-between; align-items:baseline; margin-top: 8px; padding-top: 8px; border-top: 1px solid rgba(255,255,255,0.07);
          font-family:${mono}; font-size: 8.5px; letter-spacing: 1.2px; text-transform: uppercase; color: ${T.onDarkMute}; }
  .foot b { font-weight: 500; color: ${T.onDarkDim}; }
  .mock { color: ${T.tintOrange}; }
`;

const HIST = "pifleet-hist";
const pushHist = (hosts) => {
  const h = (recall(HIST) || {}).data || {};
  hosts.forEach((x) => { if (!x.online) return; const a = (h[x.name] || []).concat([x.load[0]]); h[x.name] = a.slice(-40); });
  remember(HIST, h); return h;
};

const Gauge = ({ t }) => {
  const r = 18, c = 2 * Math.PI * r, span = 0.75, frac = Math.min(1, Math.max(0, t / 90));
  return (
    <div className="gauge">
      <svg viewBox="0 0 44 44">
        <circle cx="22" cy="22" r={r} fill="none" stroke="rgba(255,255,255,0.10)" strokeWidth="4" strokeDasharray={`${c * span} ${c}`} strokeLinecap="round" />
        <circle cx="22" cy="22" r={r} fill="none" stroke={tempTint(t)} strokeWidth="4" strokeDasharray={`${c * span * frac} ${c}`} strokeLinecap="round" />
      </svg>
      <div className="val">{Math.round(t)}<small>°C</small></div>
    </div>
  );
};
const Spark = ({ pts, cores }) => {
  const w = 80, h = 18, max = Math.max(cores || 1, ...pts, 0.5);
  const d = pts.length > 1 ? pts.map((v, i) => `${(i / (pts.length - 1)) * w},${h - 1 - (v / max) * (h - 2)}`).join(" ") : `0,${h - 1} ${w},${h - 1}`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
      <line x1="0" y1={h - 1 - ((cores || 1) / max) * (h - 2)} x2={w} y2={h - 1 - ((cores || 1) / max) * (h - 2)} stroke="rgba(255,255,255,0.12)" strokeWidth="1" strokeDasharray="2 2" />
      <polyline points={d} fill="none" stroke={T.tintBlue} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
};

const Tile = ({ h, hist }) => {
  if (!h.online) return (
    <div className="tile off">
      <div className="name"><i />{h.name}</div>
      <div className="role">{h.role || h.host}</div>
      <div className="err">Unreachable.</div>
      <div className="foot2"><span>{(h.error || "no answer").slice(0, 26)}</span></div>
    </div>
  );
  const fl = throttle(h.throttled);
  return (
    <div className="tile">
      <div className="name"><i />{h.name}</div>
      <div className="role">{h.role || h.model || h.host}</div>
      <div className="vitals">
        <Gauge t={h.temp} />
        <div className="spark">
          <Spark pts={(hist[h.name] || [h.load[0]])} cores={h.cores} />
          <div className="lbl"><b>{h.load[0].toFixed(2)}</b> load · {h.cores}c</div>
        </div>
      </div>
      <div className="bars">
        <div className="bar"><span>mem</span><i><b style={{ width: `${pct(h.mem_total - h.mem_avail, h.mem_total)}%` }} /></i><em>{pct(h.mem_total - h.mem_avail, h.mem_total)}%</em></div>
        <div className="bar"><span>disk</span><i><b style={{ width: `${pct(h.disk_total - h.disk_avail, h.disk_total)}%` }} /></i><em>{fmtGB(h.disk_avail)}</em></div>
      </div>
      <div className="foot2"><span>up {fmtUp(h.uptime)}</span>{fl ? <span className="flag" style={{ "--tint": fl.tint }}>{fl.label}</span> : <span>{h.ms} ms</span>}</div>
    </div>
  );
};

const Fleet = ({ data, staleTs, mock }) => {
  const hosts = data.hosts || []; const hist = staleTs || mock || data.demo ? ((recall(HIST) || {}).data || {}) : pushHist(hosts);
  const up = hosts.filter((h) => h.online).length;
  return (
    <div>
      <DragHandle k={KEY} />
      <ResizeHandle k={KEY} />
      {staleTs ? <Stale ts={staleTs} /> : null}
      <div className="cap"><span>Pi fleet</span><span><b>{up}</b> of <b>{hosts.length}</b> online</span></div>
      <div className="head">{headline(hosts, data.demo)}</div>
      <div className="grid" style={{ gridTemplateColumns: `repeat(${Math.min(3, Math.max(1, hosts.length))}, 1fr)` }}>
        {hosts.length ? hosts.slice(0, 6).map((h) => <Tile key={h.name} h={h} hist={hist} />) : <Empty text="Add hosts to ~/.config/widgetsuite/pi-fleet.json, then refresh." />}
      </div>
      <div className="foot">
        <span>ssh · read-only · every <b>{data.interval || 30}s</b></span>
        <span>{data.demo ? <span className="mock">sample data · see setup</span> : clockStamp((data.now || Date.now() / 1000) * 1000)}</span>
      </div>
    </div>
  );
};

export const render = (props) => {
  const r = resolve(KEY, props, parse, MOCK);
  if (r.loading) return <Skel tint={T.tintBlue} />;
  return <Fleet data={r.data} staleTs={r.staleTs} mock={r.mock} />;
};
