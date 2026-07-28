# Understanding Linux File Permissions & Incident Context

Before diagnosing the outage, let's review how **Linux File Permissions** work and why they cause application crashes when misconfigured.

---

## 1. The Linux Permission Model

Every file and directory in Linux has an owner, a group, and a set of permission bits for three categories of users:

| Category | Abbreviation | Description |
|---|---|---|
| **User (Owner)** | `u` | The specific system user account that owns the file. |
| **Group** | `g` | Users belonging to the group that owns the file. |
| **Others** | `o` | Every other user account on the Linux system. |

---

## 2. Permission Types & Octal Values

Permissions are represented using symbolic characters (`r`, `w`, `x`) or 3-digit octal numbers (`644`, `755`, `600`, `000`):

| Bit | Character | Numeric Value | Meaning on Files | Meaning on Directories |
|---|---|---|---|---|
| **Read** | `r` | `4` | View/read file content | List files in directory (`ls`) |
| **Write** | `w` | `2` | Modify/delete file content | Create/remove files in directory |
| **Execute** | `x` | `1` | Run file as program/script | Enter directory (`cd`) |

### Standard Octal Permission Examples:
- **`644` (`rw-r--r--`)**: Owner can read & write; group and others can only read. Standard for public files & logs.
- **`755` (`rwxr-xr-x`)**: Owner can read, write & execute; others can read & execute. Standard for scripts & directories.
- **`600` (`rw-------`)**: Only owner can read & write. Standard for private keys & passwords.
- **`000` (`---------`)**: **NO ACCESS FOR ANYONE** (except `root`). Any non-root account receives `Permission denied`.

---

## 3. How Background Daemons Access Files

When system services run under `systemd`, they run under a designated non-root user (e.g. `appuser`):

```ini
[Service]
User=appuser
Group=appgroup
ExecStart=/usr/bin/app-server --log /var/log/app-server.log
```

When `app-server` starts:
1. The kernel checks if user `appuser` has read (`r`) or write (`w`) permissions on `/var/log/app-server.log`.
2. If `/var/log/app-server.log` has permissions `000` (`---------`), the system call `open("/var/log/app-server.log", O_WRONLY)` fails instantly with:
   ```text
   Permission denied (EACCES)
   ```
3. The application process aborts and crashes on startup.