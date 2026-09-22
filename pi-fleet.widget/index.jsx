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

// pi-fleet — your Raspberry Pis as a rack of hardware: one 1U faceplate per
// host with an embossed tape label, a seven-segment temperature readout, an
// LED bar graph for load, small LED strips for memory and disk, a status lamp,
// and etched uptime. Probed over SSH with key auth and short timeouts; the
// helper is embedded below and is read-only. Hosts live in
// ~/.config/widgetsuite/pi-fleet.json; with no config the rack shows labeled
// sample units so it is never blank.

const POS = [640, 400];
const KEY = "pifleet";
const FONTS = "pi-fleet.widget/fonts";

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

const fmtUp = (s) => { if (!s) return "--"; const d = Math.floor(s / 86400), h = Math.floor((s % 86400) / 3600), m = Math.floor((s % 3600) / 60); return d ? `${d}D ${String(h).padStart(2, "0")}H` : h ? `${h}H ${String(m).padStart(2, "0")}M` : `${m}M`; };
const pct = (used, total) => total ? Math.min(1, used / total) : 0;
const throttle = (hex) => { const v = parseInt(hex || "0", 16) || 0; return (v & 0xF) ? "now" : (v & 0xF0000) ? "before" : null; };

const SAVED_HOSTS = (((recall(KEY) || {}).data || {}).hosts || []).length;
const UNITS = Math.max(3, Math.min(6, SAVED_HOSTS || 3));
const W = 580, UH = 60, H = 92 + UNITS * (UH + 8);

export const className = card("dark", W, H, ...POS) + `
  @font-face { font-family: "DSEG7"; src: url("${FONTS}/DSEG7Classic-Bold.woff2") format("woff2"); font-weight: 700; }
  @font-face { font-family: "Barlow Condensed"; src: url("${FONTS}/BarlowCondensed-600.woff2") format("woff2"); font-weight: 600; }
  @font-face { font-family: "Barlow Condensed"; src: url("${FONTS}/BarlowCondensed-700.woff2") format("woff2"); font-weight: 700; }
  @font-face { font-family: "Rubik"; src: url("${FONTS}/Rubik-800.woff2") format("woff2"); font-weight: 800; }
  --cond: "Barlow Condensed", "Arial Narrow", sans-serif; --etch: #A7ABB3; --amber: #FFB000; --green: #3DD65C; --red: #FF3B30;
  padding: 0; border-radius: 10px; backdrop-filter: none; overflow: hidden; font-family: var(--cond); user-select:none; -webkit-user-select:none;
  background: linear-gradient(180deg, #3A3D43 0%, #2C2E33 6%, #26282D 94%, #1B1C20 100%);
  box-shadow: 0 30px 60px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.14), 0 0 0 1px #0d0e10;
  &::before { content:""; position:absolute; inset:0; pointer-events:none; opacity: 0.5;
    background: repeating-linear-gradient(90deg, rgba(255,255,255,0.035) 0 1px, rgba(0,0,0,0) 1px 3px); }
  .ws-drag { top: 8px; left: 30px; }
  .screw { position:absolute; width: 9px; height: 9px; border-radius:50%; background: radial-gradient(circle at 40% 35%, #9a9ea6, #45484e 65%, #2a2c30 100%); box-shadow: 0 1px 1px rgba(255,255,255,0.12), inset 0 0 0 1px #131416; }
  .screw::after { content:""; position:absolute; left: 1px; right: 1px; top: 4px; height: 1px; background: #131416; transform: rotate(-30deg); }
  .rail { position:absolute; top: 0; bottom: 0; width: 22px; background: linear-gradient(90deg, rgba(0,0,0,0.25), rgba(0,0,0,0)); }
  .rail.r { right:0; background: linear-gradient(270deg, rgba(0,0,0,0.25), rgba(0,0,0,0)); }
  .head { position:absolute; top: 12px; left: 30px; right: 30px; display:flex; justify-content:space-between; align-items:baseline; }
  .etch { font: 700 10px/1 var(--cond); letter-spacing: 3px; text-transform:uppercase; color: var(--etch); text-shadow: 0 -1px 0 rgba(0,0,0,0.9), 0 1px 0 rgba(255,255,255,0.06); }
  .etch.s { font-weight: 600; font-size: 8px; letter-spacing: 1.6px; color: #7E838C; white-space: nowrap; }
  .etch.am { color: var(--amber); }
  .units { position:absolute; top: 36px; left: 30px; right: 30px; display:flex; flex-direction:column; gap: 8px; }
  .unit { height: ${UH}px; border-radius: 5px; background: linear-gradient(180deg, #1F2125 0%, #17181C 100%);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.06), inset 0 0 0 1px #0c0d0f, 0 1px 0 rgba(255,255,255,0.05);
          display:grid; grid-template-columns: 112px 108px 1fr 100px; align-items:center; gap: 12px; padding: 0 12px; position:relative; }
  .unit.off { filter: saturate(0.6); }
  .dymo { display:inline-block; max-width: 110px; overflow:hidden; text-overflow: ellipsis; white-space:nowrap; background: linear-gradient(180deg, #202020 0%, #0E0E0E 100%); color: #F6F3EC;
          font: 800 11px/1 "Rubik", "Arial Rounded MT Bold", sans-serif; letter-spacing: 1.8px; text-transform:uppercase; padding: 6px 9px 5px; border-radius: 2px;
          transform: rotate(-1.4deg); box-shadow: 0 1px 2px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.14); text-shadow: 0 -1px 0 #000, 0 1px 0 rgba(255,255,255,0.18); }
  .role { margin-top: 5px; }
  .seg { position:relative; display:inline-flex; align-items:baseline; gap: 2px; background: #130806; border-radius: 4px; padding: 6px 8px 4px; box-shadow: inset 0 2px 6px rgba(0,0,0,0.85), 0 0 0 1px #0a0a0a, 0 1px 0 rgba(255,255,255,0.05); }
  .seg .v { font: 700 22px/1 "DSEG7", monospace; color: var(--amber); text-shadow: 0 0 9px rgba(255,176,0,0.55); position:relative; }
  .seg .g { position:absolute; left: 8px; top: 6px; font: 700 22px/1 "DSEG7", monospace; color: rgba(255,176,0,0.08); }
  .seg .u { font: 700 9px/1 var(--cond); color: rgba(255,176,0,0.75); letter-spacing: 1px; margin-left: 4px; }
  .unit.off .seg .v { color: rgba(255,176,0,0.28); text-shadow:none; }
  .meter { display:flex; flex-direction:column; gap: 5px; }
  .leds { display:flex; gap: 3px; align-items:flex-end; }
  .leds i { width: 7px; height: 13px; border-radius: 1.5px; background: var(--off); box-shadow: inset 0 1px 1px rgba(0,0,0,0.6); }
  .leds i.on { background: var(--on); box-shadow: 0 0 6px var(--on), inset 0 1px 0 rgba(255,255,255,0.35); }
  .strips { display:flex; gap: 14px; }
  .strip { display:flex; align-items:center; gap: 6px; }
  .strip .dots { display:flex; gap: 2px; }
  .strip .dots i { width: 5px; height: 7px; border-radius: 1px; background: #2a2412; box-shadow: inset 0 1px 1px rgba(0,0,0,0.6); }
  .strip .dots i.on { background: var(--amber); box-shadow: 0 0 4px rgba(255,176,0,0.7); }
  .stat { display:flex; flex-direction:column; align-items:flex-end; gap: 5px; }
  .lamp { width: 11px; height: 11px; border-radius:50%; background: radial-gradient(circle at 40% 35%, #7cf59a, var(--green) 60%, #1c7a30 100%); box-shadow: 0 0 10px rgba(61,214,92,0.7), inset 0 0 0 1px rgba(0,0,0,0.3); }
  .lamp.red { background: radial-gradient(circle at 40% 35%, #ff8a80, var(--red) 60%, #8a1f18 100%); box-shadow: 0 0 10px rgba(255,59,48,0.6), inset 0 0 0 1px rgba(0,0,0,0.3); }
  .lamp.amber { background: radial-gradient(circle at 40% 35%, #ffd76a, var(--amber) 60%, #8a5f00 100%); box-shadow: 0 0 10px rgba(255,176,0,0.7); animation: pf-blink 1.2s steps(2, end) infinite; }
  @keyframes pf-blink { 50% { opacity: 0.35; box-shadow: none; } }
  @media (prefers-reduced-motion: reduce) { .lamp.amber { animation:none; } }
  .foot { position:absolute; left: 30px; right: 30px; bottom: 12px; display:flex; justify-content:space-between; }
`;

const Leds = ({ frac }) => {
  const n = 12, lit = Math.round(Math.min(1, Math.max(0, frac)) * n);
  return <div className="leds">{Array.from({ length: n }, (_, i) => { const on = i < lit; const c = i < 8 ? ["#1a3d20", "#3DD65C"] : i < 11 ? ["#3d2c06", "#FFB000"] : ["#3d0f0c", "#FF3B30"]; return <i key={i} className={on ? "on" : ""} style={{ "--off": c[0], "--on": c[1] }} />; })}</div>;
};
const Strip = ({ label, frac }) => { const lit = Math.round(frac * 8); return <div className="strip"><span className="etch s">{label}</span><span className="dots">{Array.from({ length: 8 }, (_, i) => <i key={i} className={i < lit ? "on" : ""} />)}</span></div>; };

const Unit = ({ h }) => {
  const th = h.online ? throttle(h.throttled) : null;
  const temp = h.online && h.temp ? h.temp.toFixed(1) : "--.-";
  return (
    <div className={`unit ${h.online ? "" : "off"}`}>
      <div><span className="dymo" title={h.host}>{h.name}</span><div className="etch s role">{h.role || h.model || h.host}</div></div>
      <div><span className="seg"><span className="g">88.8</span><span className="v">{temp}</span><span className="u">°C</span></span></div>
      <div className="meter">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}><Leds frac={h.online ? (h.load[0] || 0) / Math.max(1, h.cores || 1) : 0} /><span className="etch s">{h.online ? (h.load[0] || 0).toFixed(2) : "--"} load · {h.cores || "-"}c</span></div>
        <div className="strips"><Strip label="mem" frac={h.online ? pct(h.mem_total - h.mem_avail, h.mem_total) : 0} /><Strip label="disk" frac={h.online ? pct(h.disk_total - h.disk_avail, h.disk_total) : 0} /></div>
      </div>
      <div className="stat">
        <span className={`lamp ${!h.online ? "red" : th === "now" ? "amber" : ""}`} />
        <span className="etch s">{h.online ? `up ${fmtUp(h.uptime)}` : "no link"}</span>
        <span className={`etch s ${th ? "am" : ""}`}>{h.online ? (th === "now" ? "throttled" : th === "before" ? "was throttled" : `${h.ms} ms`) : (h.error || "unreachable").slice(0, 18)}</span>
      </div>
    </div>
  );
};

const Rack = ({ data, staleTs, mock }) => {
  const hosts = (data.hosts || []).slice(0, 6); const up = hosts.filter((h) => h.online).length;
  return (
    <div>
      <DragHandle k={KEY} />
      <ResizeHandle k={KEY} />
      <span className="rail" /><span className="rail r" />
      <span className="screw" style={{ top: 9, left: 9 }} /><span className="screw" style={{ top: 9, right: 9 }} /><span className="screw" style={{ bottom: 9, left: 9 }} /><span className="screw" style={{ bottom: 9, right: 9 }} />
      <div className="head"><span className="etch">Pi fleet</span><span className="etch s">{hosts.length ? `${up} of ${hosts.length} online` : "no units"}{staleTs ? ` · stale ${clockStamp(staleTs)}` : ""}</span></div>
      <div className="units">{hosts.length ? hosts.map((h) => <Unit key={h.name} h={h} />) : <div className="etch s" style={{ padding: 20 }}>Add hosts to ~/.config/widgetsuite/pi-fleet.json and refresh.</div>}</div>
      <div className="foot"><span className="etch s">ssh · read-only · every {data.interval || 30}s</span><span className={`etch s ${data.demo || mock ? "am" : ""}`}>{data.demo || mock ? "sample units · see setup" : `probed ${clockStamp((data.now || Date.now() / 1000) * 1000)}`}</span></div>
    </div>
  );
};

export const render = (props) => {
  const r = resolve(KEY, props, parse, MOCK);
  if (r.loading) return <Skel tint={T.tintOrange} />;
  return <Rack data={r.data} staleTs={r.staleTs} mock={r.mock} />;
};
