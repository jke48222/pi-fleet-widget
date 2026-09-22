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
