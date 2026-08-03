#!/bin/sh
set -e

# ANSI Color Codes
RESET="\033[0m"
BOLD="\033[1m"
CYAN="\033[36m"
GREEN="\033[32m"
YELLOW="\033[33m"
RED="\033[31m"

print_logo() {
  printf "${CYAN}${BOLD}"
  cat << "EOF"
 _________  ___       ________     
|\___   ___\\  \     |\   ___ \    
\|___ \  \_\ \  \    \ \  \_|\ \   
     \ \  \ \ \  \    \ \  \ \\ \  
      \ \  \ \ \  \____\ \  \_| \ \ 
       \ \__\ \ \_______\ \_______\
        \|__|  \|_______|\|_______|

    T H E   L A S T   D E P L O Y
EOF
  printf "${RESET}\n"
}

print_logo
printf "${BOLD}Installing the TLD CLI...${RESET}\n\n"

# 1. Detect OS
OS_TYPE="$(uname -s | tr '[:upper:]' '[:lower:]')"
case "$OS_TYPE" in
  linux*)  OS="linux" ;;
  darwin*) OS="darwin" ;;
  msys*|mingw*|cygwin*)
    printf "${RED}Native Windows is not directly supported.${RESET}\n"
    printf "Please use ${BOLD}Ubuntu WSL2${RESET} (Windows Subsystem for Linux) and re-run this script inside WSL.\n"
    exit 1
    ;;
  *)
    printf "${RED}Unsupported operating system: $OS_TYPE${RESET}\n"
    exit 1
    ;;
esac

# 2. Detect Architecture
ARCH_TYPE="$(uname -m)"
case "$ARCH_TYPE" in
  x86_64|amd64)  ARCH="amd64" ;;
  arm64|aarch64) ARCH="arm64" ;;
  *)
    printf "${RED}Unsupported architecture: $ARCH_TYPE${RESET}\n"
    exit 1
    ;;
esac

printf "Detected OS: ${BOLD}${OS}${RESET} (${ARCH})\n"

# 3. Resolve Latest Version Tag
TAG="v1.0.0"
if command -v curl >/dev/null 2>&1; range_header=""; then
  LATEST_TAG=$(curl -sL https://api.github.com/repos/thelastdeploy/thelastdeploy/releases/latest | grep '"tag_name":' | sed -E 's/.*"([^"]+)".*/\1/')
  if [ -n "$LATEST_TAG" ]; then
    TAG="$LATEST_TAG"
  fi
fi

BINARY_NAME="tld-${OS}-${ARCH}"
RELEASE_URL="https://github.com/thelastdeploy/thelastdeploy/releases/download/${TAG}/${BINARY_NAME}"
CHECKSUM_URL="https://github.com/thelastdeploy/thelastdeploy/releases/download/${TAG}/checksums.txt"

TMP_DIR="$(mktemp -d 2>/dev/null || mktemp -d -t 'tld_install')"
trap 'rm -rf "$TMP_DIR"' EXIT INT TERM

TMP_BIN="${TMP_DIR}/${BINARY_NAME}"
TMP_SUM="${TMP_DIR}/checksums.txt"

printf "Downloading ${BOLD}tld ${TAG}${RESET}...\n"

if command -v curl >/dev/null 2>&1; then
  curl -fsSL "$RELEASE_URL" -o "$TMP_BIN"
  curl -fsSL "$CHECKSUM_URL" -o "$TMP_SUM" 2>/dev/null || true
elif command -v wget >/dev/null 2>&1; then
  wget -qO "$TMP_BIN" "$RELEASE_URL"
  wget -qO "$TMP_SUM" "$CHECKSUM_URL" 2>/dev/null || true
else
  printf "${RED}Error: curl or wget is required to download TLD.${RESET}\n"
  exit 1
fi

# 4. Verify Checksum
if [ -f "$TMP_SUM" ]; then
  EXPECTED_HASH=$(grep "${BINARY_NAME}$" "$TMP_SUM" | awk '{print $1}')
  if [ -n "$EXPECTED_HASH" ]; then
    if command -v sha256sum >/dev/null 2>&1; then
      ACTUAL_HASH=$(sha256sum "$TMP_BIN" | awk '{print $1}')
    elif command -v shasum >/dev/null 2>&1; then
      ACTUAL_HASH=$(shasum -a 256 "$TMP_BIN" | awk '{print $1}')
    fi

    if [ -n "$ACTUAL_HASH" ]; then
      if [ "$EXPECTED_HASH" = "$ACTUAL_HASH" ]; then
        printf "${GREEN}✓ Checksum verified (SHA-256)${RESET}\n"
      else
        printf "${RED}Checksum verification failed!${RESET}\n"
        printf "Expected: $EXPECTED_HASH\nGot:      $ACTUAL_HASH\n"
        exit 1
      fi
    fi
  fi
fi

# 5. Install Binary
INSTALL_DIR="/usr/local/bin"
TARGET_BIN="${INSTALL_DIR}/tld"

chmod +x "$TMP_BIN"

if [ -w "$INSTALL_DIR" ]; then
  mv "$TMP_BIN" "$TARGET_BIN"
else
  printf "Installing to ${INSTALL_DIR} (requires sudo)..."
  if command -v sudo >/dev/null 2>&1; then
    sudo mv "$TMP_BIN" "$TARGET_BIN"
    printf " ${GREEN}done.${RESET}\n"
  else
    FALLBACK_DIR="${HOME}/.local/bin"
    mkdir -p "$FALLBACK_DIR"
    TARGET_BIN="${FALLBACK_DIR}/tld"
    mv "$TMP_BIN" "$TARGET_BIN"
    printf " ${YELLOW}Installed to ${TARGET_BIN}${RESET}\n"
  fi
fi

chmod +x "$TARGET_BIN"

# 6. Verify Installation
printf "\n${GREEN}${BOLD}✓ TLD CLI installed successfully!${RESET}\n"

if ! command -v tld >/dev/null 2>&1; then
  printf "${YELLOW}Note: ${TARGET_BIN%/*} is not currently in your PATH.${RESET}\n"
  printf "Add it to your shell profile (~/.bashrc or ~/.zshrc):\n"
  printf "  export PATH=\"\$PATH:${TARGET_BIN%/*}\"\n\n"
fi

printf "\nRun ${BOLD}tld login${RESET} to authenticate or ${BOLD}tld doctor${RESET} to check your setup.\n"
