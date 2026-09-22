#!/usr/bin/env bash
# Creates ~/.config/widgetsuite/pi-fleet.json from the example if it does not exist yet.
CFG="$HOME/.config/widgetsuite"; DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
mkdir -p "$CFG"
if [ ! -f "$CFG/pi-fleet.json" ]; then
  cp "$DIR/pi-fleet.example.json" "$CFG/pi-fleet.json"
  echo "    wrote $CFG/pi-fleet.json — edit the hosts, then refresh Übersicht."
else
  echo "    $CFG/pi-fleet.json already exists; left untouched."
fi
echo "    Each Pi needs your SSH key: ssh-copy-id pi@<host>. The probe is read-only."
