#!/bin/bash
# validator.sh — linux-networking / 05-http-with-curl / lnx-fetch-webpage
set -euo pipefail

TARGET_FILE="$HOME/network-test/homepage.txt"

if [ ! -f "$TARGET_FILE" ]; then
  echo "FAIL: File $TARGET_FILE not found."
  exit 1
fi

CONTENT=$(tr -d '\r' < "$TARGET_FILE" | xargs)

if [ "$CONTENT" != "welcome to thelastdeploy" ]; then
  echo "FAIL: Expected homepage response 'welcome to thelastdeploy' but found '$CONTENT' in $TARGET_FILE."
  exit 1
fi

echo "PASS: Homepage content successfully retrieved."
exit 0
