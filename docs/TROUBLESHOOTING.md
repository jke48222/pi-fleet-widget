# pi-fleet: troubleshooting

Run `./check.sh` first; it prints a pass/fail line per item.

- **A Pi shows "Unreachable".** From a terminal run `ssh -o BatchMode=yes pi@<host> true`. If that asks for a password, copy your key with `ssh-copy-id pi@<host>`. If it hangs, the hostname is wrong or mDNS (`.local`) is not resolving; try the IP.
- **Everything is "sample data".** There is no config yet. Run `./install.sh` or copy `setup/pi-fleet.example.json` to `~/.config/widgetsuite/pi-fleet.json`.
- **Temperature is 0 or missing.** The host has no `thermal_zone0`; the tile still shows load and disk.
- **The card is cramped with many hosts.** It sizes itself from the last saved host count; reload Übersicht once after adding hosts.
- Test the helper directly: `python3 setup/pi-fleet.py | python3 -m json.tool`.
