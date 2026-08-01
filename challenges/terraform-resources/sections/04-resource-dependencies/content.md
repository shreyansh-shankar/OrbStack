# Resource Dependencies

Often, one resource depends on another. Terraform supports two types of dependencies:

## 1. Implicit Dependencies
Formed when a resource references an attribute of another resource. Terraform automatically analyzes these references and builds them in the correct sequence.
```hcl
resource "random_id" "server" {
  byte_length = 8
}

resource "local_file" "config" {
  content  = "Server ID: ${random_id.server.hex}"
  filename = "/tmp/server_config.txt"
}
```

## 2. Explicit Dependencies
Used when resources have dependency relationships that are not visible via code references. You configure these using the `depends_on` meta-argument:
```hcl
resource "local_file" "db" {
  content  = "database"
  filename = "/tmp/db.txt"
}

resource "local_file" "app" {
  content    = "app"
  filename   = "/tmp/app.txt"
  depends_on = [local_file.db]
}
```

---

## Lab Tasks

### Task 1: Create an Explicit Dependency
1. Start the lab in your terminal:
   ```bash
   tld start tf-explicit-dependency
   ```
2. Navigate to `~/terraform-resources-challenge`.
3. Complete the task requirements: Explicit dependency verified.
4. Verify the task:
   ```bash
   tld check
   ```

### Task 2: Create an Implicit Dependency
1. Start the lab in your terminal:
   ```bash
   tld start tf-implicit-dependency
   ```
2. Navigate to `~/terraform-resources-challenge`.
3. Complete the task requirements: Implicit dependency verified.
4. Verify the task:
   ```bash
   tld check
   ```
