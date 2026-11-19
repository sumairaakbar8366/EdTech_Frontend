#!/usr/bin/env bash
# Runs each screen test from a fresh app.
cd "$(dirname "$0")"
ok=0
for k in welcome first-login school-login signup-register register returning lock learn-school switch-school web offline-saved offline-new reconnect save-copy live-fails; do printf "%-10s" $k; UI_CASE=$k npx jest -c jest.ui.config.js 2>&1 | grep -E "^Tests:" || ok=1; done
exit $ok
