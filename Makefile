# Makefile — The Last Deploy agent
.PHONY: build run sync start stop check status login logout clean install dist

build:
	cd agent && go get golang.org/x/term && go build -o ../bin/tld .

dist:
	mkdir -p dist
	rm -rf dist/*
	cd agent && CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -ldflags="-s -w" -o ../dist/tld-linux-amd64 .
	cd agent && CGO_ENABLED=0 GOOS=linux GOARCH=arm64 go build -ldflags="-s -w" -o ../dist/tld-linux-arm64 .
	cd agent && CGO_ENABLED=0 GOOS=darwin GOARCH=amd64 go build -ldflags="-s -w" -o ../dist/tld-darwin-amd64 .
	cd agent && CGO_ENABLED=0 GOOS=darwin GOARCH=arm64 go build -ldflags="-s -w" -o ../dist/tld-darwin-arm64 .
	cd dist && sha256sum tld-* > checksums.txt
	@echo "Build complete. Artifacts and checksums created in dist/"

# Install to /usr/local/bin so `tld` works from anywhere.
# Requires sudo on most systems.
install: build
	cp bin/tld /usr/local/bin/tld
	@echo "Installed: /usr/local/bin/tld"

# Quick dev targets — run from repo root
sync: build
	./bin/tld sync

start: build
	./bin/tld start $(ID)

stop: build
	./bin/tld stop

check: build
	./bin/tld check

status: build
	./bin/tld status

login: build
	./bin/tld login

logout: build
	./bin/tld logout

clean:
	rm -rf bin/ dist/