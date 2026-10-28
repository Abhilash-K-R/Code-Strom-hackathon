#!/usr/bin/env bash
set -e

echo "========================================================"
echo "  FamilyMeds (DoseBandhu) - Installing Dependencies"
echo "  Team: Elite Evolvers (MHC09) - CODE STORM 2026"
echo "========================================================"

if [ -d "FamilyMeds" ]; then
  cd FamilyMeds
else
  echo "[ERROR] FamilyMeds directory not found!"
  exit 1
fi

echo ""
echo "[1/2] Installing Node.js & React Native / Expo Dependencies..."
npm install

echo ""
echo "========================================================"
echo "  Dependencies Installed Successfully!"
echo "  To run the application:"
echo "    - Browser demo:  cd FamilyMeds && npm run web"
echo "    - Mobile phone:  cd FamilyMeds && npm start"
echo "========================================================"
