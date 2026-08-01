# Installing Terraform

To work with Terraform, you need to install the Terraform Command Line Interface (CLI) on your machine. The CLI is a single compiled binary package that interfaces with various cloud providers and systems.

## Installation Methods:

### On Ubuntu/Debian Linux:
```bash
sudo apt-get update && sudo apt-get install -y gnupg software-properties-common
wget -O- https://apt.releases.hashicorp.com/gpg | gpg --dearmor | sudo tee /usr/share/keyrings/hashicorp-archive-keyring.gpg > /dev/null
echo "deb [signed-by=/usr/share/keyrings/hashicorp-archive-keyring.gpg] https://apt.releases.hashicorp.com $(lsb_release -cs) main" | sudo tee /etc/apt/sources.list.d/hashicorp.list
sudo apt-get update && sudo apt-get install terraform
```

### On macOS (using Homebrew):
```bash
brew tap hashicorp/tap
brew install hashicorp/tap/terraform
```

### Verifying Installation:
Once installed, verify that the CLI is accessible by running:
```bash
terraform -version
```

---

## Lab Tasks

### Task 1: Verify Terraform Version
1. Start the lab in your terminal:
   ```bash
   tld start tf-check-version
   ```
2. Navigate to `~/terraform-challenge`.
3. Complete the task requirements: Terraform CLI is operational.
4. Verify the task:
   ```bash
   tld check
   ```

### Task 2: Install Terraform CLI
1. Start the lab in your terminal:
   ```bash
   tld start tf-install-cli
   ```
2. Navigate to `~/terraform-challenge`.
3. Complete the task requirements: Terraform CLI successfully found.
4. Verify the task:
   ```bash
   tld check
   ```
