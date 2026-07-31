#!/usr/bin/env bash
set -euo pipefail

node -e 'const [major, minor] = process.versions.node.split(".").map(Number); if (major < 22 || (major === 22 && minor < 13)) { throw new Error(`Pumblo requires Node.js 22.13.0 or newer. Found ${process.versions.node}.`); }'

echo "Installing the locked dependency set..."
npm ci

echo "Running release verification..."
npm run verify

echo
echo "Pumblo is ready. Start it with: npm run dev"
echo "Then open the local URL printed by Vinext."
