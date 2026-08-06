# ==========================================================
# The Last Deploy - Build System
# ==========================================================

GO_DIR   := agent
BIN_DIR  := bin
DIST_DIR := dist
CLI      := $(BIN_DIR)/tld

.PHONY: \
	build dist install clean \
	fmt vet test verify \
	sync start stop check status login logout doctor publish

# ==========================================================
# Verification
# ==========================================================

fmt:
	@echo "==> Checking code formatting..."
	@cd $(GO_DIR) && test -z "$$(gofmt -l .)"
	@echo "✓ Formatting OK"

vet:
	@echo "==> Running go vet..."
	@cd $(GO_DIR) && go vet ./...
	@echo "✓ go vet passed"

test:
	@echo "==> Running unit tests..."
	@cd $(GO_DIR) && go test ./...
	@echo "✓ Tests passed"

verify: fmt vet test
	@echo ""
	@echo "====================================="
	@echo "Verification completed successfully."
	@echo "====================================="

# ==========================================================
# Build
# ==========================================================

build:
	@echo "==> Building CLI..."
	@mkdir -p $(BIN_DIR)
	@cd $(GO_DIR) && go build -o ../$(CLI) .
	@echo "✓ CLI built successfully"

dist: verify
	@echo "==> Creating release artifacts..."

	@mkdir -p $(DIST_DIR)
	@rm -rf $(DIST_DIR)/*

	@cd $(GO_DIR) && \
		CGO_ENABLED=0 GOOS=linux GOARCH=amd64 \
		go build -ldflags="-s -w" \
		-o ../$(DIST_DIR)/tld-linux-amd64 .

	@cd $(GO_DIR) && \
		CGO_ENABLED=0 GOOS=linux GOARCH=arm64 \
		go build -ldflags="-s -w" \
		-o ../$(DIST_DIR)/tld-linux-arm64 .

	@cd $(GO_DIR) && \
		CGO_ENABLED=0 GOOS=darwin GOARCH=amd64 \
		go build -ldflags="-s -w" \
		-o ../$(DIST_DIR)/tld-darwin-amd64 .

	@cd $(GO_DIR) && \
		CGO_ENABLED=0 GOOS=darwin GOARCH=arm64 \
		go build -ldflags="-s -w" \
		-o ../$(DIST_DIR)/tld-darwin-arm64 .

	@cd $(DIST_DIR) && sha256sum tld-* > checksums.txt

	@echo ""
	@echo "====================================="
	@echo "Release build completed successfully."
	@echo "Artifacts available in ./$(DIST_DIR)"
	@echo "====================================="

# ==========================================================
# Installation
# ==========================================================

install: build
	cp $(CLI) /usr/local/bin/tld
	@echo "Installed to /usr/local/bin/tld"

# ==========================================================
# Developer Commands
# ==========================================================

sync: build
	./$(CLI) sync

start: build
	./$(CLI) start $(ID)

stop: build
	./$(CLI) stop

check: build
	./$(CLI) check

status: build
	./$(CLI) status

login: build
	./$(CLI) login

logout: build
	./$(CLI) logout

doctor: build
	./$(CLI) doctor

publish: build
	./$(CLI) publish

# ==========================================================
# Cleanup
# ==========================================================

clean:
	rm -rf $(BIN_DIR) $(DIST_DIR)
	@echo "Cleaned build artifacts."
