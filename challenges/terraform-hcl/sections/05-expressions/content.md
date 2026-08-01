# Expressions

Expressions allow you to dynamically compute values inside HCL configurations.

## String Interpolation
You can embed variables or expressions in double-quoted strings using the `${}` syntax:
```hcl
variable "name" {
  default = "DevOps"
}

resource "local_file" "welcome" {
  content  = "Welcome to ${var.name} track!"
  filename = "/tmp/welcome.txt"
}
```

## Basic Mathematical & Logical Expressions
HCL supports standard mathematical operators (`+`, `-`, `*`, `/`) and logical operators (`&&`, `||`, `!`).

---

## Lab Tasks

### Task 1: Use Basic Expressions
1. Start the lab in your terminal:
   ```bash
   tld start tf-basic-expressions
   ```
2. Navigate to `~/terraform-hcl-challenge`.
3. Complete the task requirements: String interpolation validated successfully.
4. Verify the task:
   ```bash
   tld check
   ```
