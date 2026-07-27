## Secure Shell (SSH)

The **SSH (Secure Shell)** protocol is the industry standard for securely connecting to remote Linux servers, executing commands, and transferring files over unencrypted networks.

---

## 1. Installing & Enabling OpenSSH Server (`sshd`)

Before you can connect to a Linux machine via SSH (or run commands like `ssh localhost` or `ssh-copy-id`), the **OpenSSH Server** service (`sshd`) must be installed and actively running on the target system.

### Installing OpenSSH Server
Depending on your Linux distribution, install the server package:
```bash
# Ubuntu / Debian
sudo apt update && sudo apt install -y openssh-server

# RHEL / CentOS / Fedora / AlmaLinux
sudo dnf install -y openssh-server

# Arch Linux
sudo pacman -S openssh
```

### Managing the SSH Service (`systemctl`)
Once installed, ensure the SSH daemon is running:
```bash
# Start the SSH service
sudo systemctl start ssh      # On Ubuntu/Debian (or 'sshd' on RHEL/Fedora)

# Enable SSH to start automatically on system boot
sudo systemctl enable ssh     # (or 'sshd')

# Check service status
sudo systemctl status ssh
```

---

## 2. Public Key Cryptography

SSH authentication typically uses **public-key cryptography**, which relies on an asymmetric key pair:
- **Private Key (`id_ed25519` or `id_rsa`)**: Stored securely on your local client machine (never share this!).
- **Public Key (`id_ed25519.pub` or `id_rsa.pub`)**: Placed on remote servers inside `~/.ssh/authorized_keys` to grant passwordless access to your private key holder.

---

## 3. Generating SSH Key Pairs (`ssh-keygen`)

To create a new key pair on your system, use `ssh-keygen`:

```bash
# Recommended: Modern Ed25519 key (fast & highly secure)
ssh-keygen -t ed25519

# Alternative: Standard RSA key (4096 bits)
ssh-keygen -t rsa -b 4096
```

> **Beginner Tip:** When prompted for a file location or passphrase, press `Enter` to accept the default path (`~/.ssh/id_ed25519`) and press `Enter` twice for a key without a passphrase (ideal for automated lab scripts).

This creates two files in your `~/.ssh/` directory:
- `~/.ssh/id_ed25519` (Private key)
- `~/.ssh/id_ed25519.pub` (Public key)

---

## 4. Setting Up Passwordless Login (`authorized_keys`)

To connect to an SSH server (or `localhost`) without entering a password every time, your **public key** must be registered on the target server inside `~/.ssh/authorized_keys`.

### Method A: Using `ssh-copy-id` (Recommended)
The `ssh-copy-id` tool automatically appends your public key to the remote server's `authorized_keys` file:
```bash
ssh-copy-id localhost
# or for a remote user:
ssh-copy-id username@remote-host
```

### Method B: Manual File Appending
If `ssh-copy-id` is not available, you can append your public key manually:
```bash
# Ensure the ~/.ssh directory exists with proper permissions
mkdir -p ~/.ssh
chmod 700 ~/.ssh

# Append your public key to authorized_keys
cat ~/.ssh/id_ed25519.pub >> ~/.ssh/authorized_keys
# OR if using RSA:
cat ~/.ssh/id_rsa.pub >> ~/.ssh/authorized_keys

# Set strict permissions on authorized_keys (required by SSH)
chmod 600 ~/.ssh/authorized_keys
```

---

## 5. Testing Your SSH Connection

Verify that passwordless access is working properly:
```bash
ssh localhost
```
If configured correctly, you will log into `localhost` without being asked for a password! Type `exit` to close the SSH session.

---

## Lab Tasks

### Task 1: Setup passwordless login to localhost
1. Start the lab in your terminal:
   ```bash
   tld start lnx-passwordless-login
   ```
2. Ensure `openssh-server` is installed and the `ssh` / `sshd` service is active (`sudo systemctl status ssh`).
3. If you don't already have an SSH key pair, generate one:
   ```bash
   ssh-keygen -t ed25519 -N "" -f ~/.ssh/id_ed25519
   ```
4. Append your public key (`~/.ssh/id_ed25519.pub` or `~/.ssh/id_rsa.pub`) to `~/.ssh/authorized_keys`:
   ```bash
   ssh-copy-id localhost
   # or manually:
   cat ~/.ssh/id_ed25519.pub >> ~/.ssh/authorized_keys
   chmod 600 ~/.ssh/authorized_keys
   ```
5. Test that `ssh localhost` connects without asking for a password.
6. Verify the task:
   ```bash
   tld check
   ```

### Task 2: Generate an SSH key pair
1. Start the lab in your terminal:
   ```bash
   tld start lnx-ssh-login
   ```
2. Generate a standard SSH key pair (`ED25519` or `RSA`) inside your user's default `~/.ssh/` directory:
   ```bash
   ssh-keygen -t ed25519
   ```
3. Verify the task:
   ```bash
   tld check
   ```
