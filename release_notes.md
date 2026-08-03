# The Last Deploy — v1.0.0 Release

Initial v1.0.0 release of the `tld` CLI tool supporting Linux and macOS (Windows users install via WSL2).

### Supported Binaries

- **Linux (amd64)**: `tld-linux-amd64`
- **Linux (arm64)**: `tld-linux-arm64`
- **macOS (amd64)**: `tld-darwin-amd64`
- **macOS (arm64)**: `tld-darwin-arm64`

> **Note for Windows Users**: Please run `curl -fsSL https://install.thelastdeploy.com | sh` inside your **Ubuntu WSL2** environment.

### Verification
Verify downloaded binaries using `checksums.txt`:
```bash
sha256sum -c checksums.txt
```
