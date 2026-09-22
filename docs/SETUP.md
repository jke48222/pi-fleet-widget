# pi-fleet: setup

1. Give each Pi your SSH key: `ssh-copy-id pi@<host>` (or the user you use).
2. Run `./install.sh`; it copies the widget into Übersicht and writes
   `~/.config/widgetsuite/pi-fleet.json` from the example if you have none.
3. Edit the hosts in that file and refresh Übersicht (menu bar icon → Refresh All).

See the [README](../README.md) for what the widget shows and how it decides.
