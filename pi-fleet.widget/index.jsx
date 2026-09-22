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
              font-size:11px; line-height:1; cursor:grab; opacity:0.42;
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
               font-size:11px; line-height:1; cursor:nwse-resize; opacity:0.42;
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

// pi-fleet — your Raspberry Pis as an industrial control cabinet: a light-grey
// (RAL 7035) enclosure with a hazard stripe and hex screws, one sub-panel per
// host with an engraved traffolyte name label, an analog temperature gauge with
// a red zone, an LED bargraph for load, LED strips for memory and disk, a
// chrome pilot lamp, and engraved uptime. Probed over SSH with key auth and short timeouts; the
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
const W = 640, UH = 64, H = 100 + UNITS * (UH + 8);

export const className = card("light", W, H, ...POS) + `
  @font-face { font-family: "Barlow Condensed"; src: url("${FONTS}/BarlowCondensed-600.woff2") format("woff2"); font-weight: 600; }
  @font-face { font-family: "Barlow Condensed"; src: url("${FONTS}/BarlowCondensed-700.woff2") format("woff2"); font-weight: 700; }
  --cond: "Barlow Condensed", "Arial Narrow", sans-serif; --ink: #2B2E2B; --panel: #CFD3CE; --green: #2FBF5A; --red: #E0352B; --amber: #F2B31A;
  padding: 0; border-radius: 6px; backdrop-filter: none; overflow: hidden; font-family: var(--cond); user-select:none; -webkit-user-select:none;
  background: linear-gradient(180deg, #D9DCD8 0%, var(--panel) 50%, #C6CBC6 100%);
  box-shadow: 0 30px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.7), inset 0 0 0 1px #8F958F, inset 0 -2px 0 rgba(0,0,0,0.15);
  &::before { content:""; position:absolute; inset:0; pointer-events:none; opacity: 0.35; mix-blend-mode: multiply; background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.12'/%3E%3C/svg%3E"); }
  .door { position:absolute; inset: 10px; border-radius: 4px; pointer-events:none; box-shadow: inset 0 0 0 1px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.5); }
  .hazard { position:absolute; left: 11px; right: 11px; top: 11px; height: 6px; border-radius: 3px 3px 0 0; pointer-events:none; background: repeating-linear-gradient(45deg, #F2C230 0 9px, #1A1A1A 9px 18px); opacity: 0.9; }
  .ws-drag { top: 22px; left: 30px; color: #4a4e4a; background: rgba(0,0,0,0.06); } .ws-resize { bottom: 14px; right: 30px; color: #4a4e4a; background: rgba(0,0,0,0.06); }
  .screw { position:absolute; width: 10px; height: 10px; border-radius: 50%; background: radial-gradient(circle at 40% 35%, #9EA39E, #4A4E4A 60%, #2A2C2A 100%); box-shadow: 0 1px 0 rgba(255,255,255,0.5), inset 0 0 0 1px #202220; }
  .screw::after { content:""; position:absolute; left: 3px; top: 3px; width: 4px; height: 4px; background: #111; clip-path: polygon(50% 0, 100% 25%, 100% 75%, 50% 100%, 0 75%, 0 25%); }
  .head { position:absolute; top: 26px; left: 30px; right: 30px; display:flex; justify-content:space-between; align-items:center; }
  .head .left { display:flex; align-items:center; gap: 12px; }
  .plate { display:inline-block; background: #1D1F1D; color: #F4F4F0; font: 700 11px/1 var(--cond); letter-spacing: 3px; text-transform: uppercase; padding: 6px 10px 5px; border-radius: 2px; box-shadow: inset 0 0 0 1px #000, 0 1px 0 rgba(255,255,255,0.5); }
  .plate.w { background: #F6F6F2; color: #1D1F1D; box-shadow: inset 0 0 0 1px #8F958F, 0 1px 0 rgba(255,255,255,0.6); font-size: 12px; letter-spacing: 2.2px; max-width: 118px; overflow:hidden; text-overflow: ellipsis; white-space:nowrap; }
  .etch { font: 600 8.5px/1 var(--cond); letter-spacing: 1.6px; text-transform: uppercase; color: #4F544F; white-space: nowrap; text-shadow: 0 1px 0 rgba(255,255,255,0.5); }
  .etch.am { color: #9A6A00; } .etch.rd { color: #A82A22; }
  .pilot { width: 14px; height: 14px; border-radius: 50%; flex: 0 0 auto; box-shadow: 0 0 0 2px #BFC4BF, 0 0 0 3px #6E736E, 0 1px 2px 3px rgba(0,0,0,0.25); background: radial-gradient(circle at 40% 35%, #8CF0A6, var(--green) 60%, #1C7A30 100%); }
  .pilot.red { background: radial-gradient(circle at 40% 35%, #FF9A90, var(--red) 60%, #8A1F18 100%); }
  .pilot.amber { background: radial-gradient(circle at 40% 35%, #FFE08A, var(--amber) 60%, #8A5F00 100%); animation: pf-blink 1.2s steps(2, end) infinite; }
  .pilot.dim { background: radial-gradient(circle at 40% 35%, #6E736E, #3A3E3A 60%, #202220 100%); }
  .pilot.sm { width: 9px; height: 9px; box-shadow: 0 0 0 1.5px #BFC4BF, 0 0 0 2.5px #6E736E; }
  @keyframes pf-blink { 50% { opacity: 0.4; } }
  @media (prefers-reduced-motion: reduce) { .pilot.amber { animation:none; } }
  .units { position:absolute; top: 60px; left: 30px; right: 30px; display:flex; flex-direction:column; gap: 8px; }
  .unit { height: ${UH}px; border-radius: 4px; background: linear-gradient(180deg, #C6CBC6, #BEC3BE); box-shadow: inset 0 0 0 1px #8F958F, inset 0 1px 0 rgba(255,255,255,0.45), 0 1px 0 rgba(255,255,255,0.5);
          display:grid; grid-template-columns: 124px 60px 200px minmax(0, 1fr); align-items:center; gap: 14px; padding: 0 14px; position:relative; overflow:hidden; }
  .unit.off { filter: saturate(0.5); }
  .role { margin-top: 5px; }
  .gauge { position:relative; width: 56px; height: 56px; border-radius: 50%; background: radial-gradient(circle at 50% 50%, #FBFBF8 0 60%, #EDEEE9 100%); box-shadow: 0 0 0 2px #E2E5E1, 0 0 0 4px #8F958F, 0 0 0 5px #DADDD9, inset 0 1px 3px rgba(0,0,0,0.15), 0 2px 4px rgba(0,0,0,0.3); }
  .gauge .zone { position:absolute; inset: 0; border-radius: 50%; opacity: 0.85; background: conic-gradient(from -135deg, rgba(0,0,0,0) 0 210deg, var(--red) 210deg 270deg, rgba(0,0,0,0) 270deg 360deg); -webkit-mask: radial-gradient(circle, rgba(0,0,0,0) 0 22px, #000 22.5px 26px, rgba(0,0,0,0) 26.5px); }
  .gauge .tick { position:absolute; left: 50%; top: 50%; width: 1.5px; height: 56px; margin: -28px 0 0 -0.75px; pointer-events:none; }
  .gauge .tick::before { content:""; position:absolute; left: 0; top: 3px; width: 100%; height: 4px; background: #2B2E2B; }
  .gauge .tick.m::before { height: 6px; }
  .gauge .num { position:absolute; font: 700 6px/1 var(--cond); color: #2B2E2B; }
  .gauge .needle { position:absolute; left: 50%; top: 50%; width: 2px; height: 24px; margin: -22px 0 0 -1px; background: linear-gradient(180deg, #D8342B, #8A1F18); transform-origin: 50% 22px; transform: rotate(var(--a, -135deg)); transition: transform 1.2s cubic-bezier(.3,1.4,.4,1); border-radius: 1px; }
  .gauge .hub { position:absolute; left: 50%; top: 50%; width: 7px; height: 7px; margin: -3.5px 0 0 -3.5px; border-radius: 50%; background: radial-gradient(circle at 40% 35%, #6E736E, #202220); }
  .gauge .val { position:absolute; left: 0; right: 0; bottom: 7px; text-align:center; font: 700 7px/1 var(--cond); color: #2B2E2B; letter-spacing: 0.5px; }
  .gauge .unitlbl { position:absolute; left: 0; right: 0; top: 17px; text-align:center; font: 600 5.5px/1 var(--cond); color: #6E736E; letter-spacing: 1px; }
  .meter { display:flex; flex-direction:column; gap: 6px; min-width: 0; overflow:hidden; }
  .leds { display:flex; gap: 3px; align-items:flex-end; padding: 3px 4px; border-radius: 3px; background: #1B1D1B; box-shadow: inset 0 1px 2px rgba(0,0,0,0.8), 0 1px 0 rgba(255,255,255,0.5); }
  .leds i { width: 7px; height: 12px; border-radius: 1px; background: var(--off); }
  .leds i.on { background: var(--on); box-shadow: 0 0 5px var(--on); }
  .strips { display:flex; gap: 12px; }
  .strip { display:flex; align-items:center; gap: 6px; }
  .strip .dots { display:flex; gap: 2px; padding: 2px 3px; border-radius: 2px; background: #1B1D1B; box-shadow: inset 0 1px 2px rgba(0,0,0,0.8), 0 1px 0 rgba(255,255,255,0.5); }
  .strip .dots i { width: 5px; height: 7px; border-radius: 1px; background: #3A2E10; }
  .strip .dots i.on { background: var(--amber); box-shadow: 0 0 4px rgba(242,179,26,0.8); }
  .stat { display:flex; flex-direction:column; align-items:flex-end; gap: 6px; min-width: 0; }
  .stat .etch { max-width: 100%; overflow:hidden; text-overflow: ellipsis; }
  .foot { position:absolute; left: 30px; right: 30px; bottom: 22px; display:flex; justify-content:space-between; }
`;

const Leds = ({ frac }) => {
  const n = 12, lit = Math.round(Math.min(1, Math.max(0, frac)) * n);
  return <div className="leds">{Array.from({ length: n }, (_, i) => { const on = i < lit; const c = i < 8 ? ["#1a3d20", "#3DD65C"] : i < 11 ? ["#3d2c06", "#FFB000"] : ["#3d0f0c", "#FF3B30"]; return <i key={i} className={on ? "on" : ""} style={{ "--off": c[0], "--on": c[1] }} />; })}</div>;
};
const Strip = ({ label, frac }) => { const lit = Math.round(frac * 8); return <div className="strip"><span className="etch">{label}</span><span className="dots">{Array.from({ length: 8 }, (_, i) => <i key={i} className={i < lit ? "on" : ""} />)}</span></div>; };
const TICKS = Array.from({ length: 11 }, (_, i) => -135 + i * 27);
const Gauge = ({ temp, on }) => {
  const t = on && temp ? Math.max(0, Math.min(90, temp)) : 0;
  return (
    <div className="gauge" title={on && temp ? `${temp.toFixed(1)} °C` : "no reading"}>
      <div className="zone" />
      {TICKS.map((a, i) => <span key={i} className={`tick ${i % 5 === 0 ? "m" : ""}`} style={{ transform: `rotate(${a}deg)` }} />)}
      <span className="num" style={{ left: 13, top: 40 }}>0</span><span className="num" style={{ left: 24, top: 9 }}>45</span><span className="num" style={{ left: 36, top: 40 }}>90</span>
      <span className="unitlbl">°C</span>
      <span className="needle" style={{ "--a": `${-135 + (t / 90) * 270}deg` }} /><span className="hub" />
      <span className="val">{on && temp ? temp.toFixed(1) : "--.-"}</span>
    </div>
  );
};

const Unit = ({ h }) => {
  const th = h.online ? throttle(h.throttled) : null;
  return (
    <div className={`unit ${h.online ? "" : "off"}`}>
      <div><span className="plate w" title={h.host}>{h.name}</span><div className="etch role">{h.role || h.model || h.host}</div></div>
      <Gauge temp={h.online ? h.temp : 0} on={h.online} />
      <div className="meter">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}><Leds frac={h.online ? (h.load[0] || 0) / Math.max(1, h.cores || 1) : 0} /><span className="etch">{h.online ? (h.load[0] || 0).toFixed(2) : "--"} load · {h.cores || "-"}c</span></div>
        <div className="strips"><Strip label="mem" frac={h.online ? pct(h.mem_total - h.mem_avail, h.mem_total) : 0} /><Strip label="disk" frac={h.online ? pct(h.disk_total - h.disk_avail, h.disk_total) : 0} /></div>
      </div>
      <div className="stat">
        <span className={`pilot ${!h.online ? "red" : th === "now" ? "amber" : ""}`} />
        <span className="etch">{h.online ? `up ${fmtUp(h.uptime)}` : "no link"}</span>
        <span className={`etch ${th ? "am" : !h.online ? "rd" : ""}`}>{h.online ? (th === "now" ? "throttled" : th === "before" ? "was throttled" : `${h.ms} ms`) : (h.error || "unreachable").slice(0, 18)}</span>
      </div>
    </div>
  );
};

const Rack = ({ data, staleTs, mock }) => {
  const hosts = (data.hosts || []).slice(0, 6); const up = hosts.filter((h) => h.online).length;
  return (
    <div>
      <div className="door" /><div className="hazard" />
      <DragHandle k={KEY} />
      <ResizeHandle k={KEY} />
      <span className="screw" style={{ top: 22, left: 16 }} /><span className="screw" style={{ top: 22, right: 16 }} /><span className="screw" style={{ bottom: 16, left: 16 }} /><span className="screw" style={{ bottom: 16, right: 16 }} />
      <div className="head"><div className="left"><span className="plate">Pi fleet</span><span className={`pilot sm ${hosts.length && up ? "" : "dim"}`} /><span className="etch">power</span></div><span className="etch">{hosts.length ? `${up} of ${hosts.length} online` : "no units"}{staleTs ? ` · stale ${clockStamp(staleTs)}` : ""}</span></div>
      <div className="units">{hosts.length ? hosts.map((h) => <Unit key={h.name} h={h} />) : <div className="etch" style={{ padding: 20 }}>Add hosts to ~/.config/widgetsuite/pi-fleet.json and refresh.</div>}</div>
      <div className="foot"><span className="etch">ssh · read-only · every {data.interval || 30}s</span><span className={`etch ${data.demo || mock ? "am" : ""}`}>{data.demo || mock ? "sample units · see setup" : `probed ${clockStamp((data.now || Date.now() / 1000) * 1000)}`}</span></div>
    </div>
  );
};

export const render = (props) => {
  const r = resolve(KEY, props, parse, MOCK);
  if (r.loading) return <Skel tint={T.tintOrange} />;
  return <Rack data={r.data} staleTs={r.staleTs} mock={r.mock} />;
};
