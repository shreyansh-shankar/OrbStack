# Understanding Linux File Permissions & Incident Context

Before diagnosing the outage, let's review how **Linux File Permissions** work and why they cause application crashes when misconfigured.

---

## 🔐 1. The Linux Permission Model

Every file and directory in Linux has an owner, a group, and a set of permission bits for three categories of users:

| Category | Abbreviation | Description |
|---|---|---|
| **User (Owner)** |  | The specific system user account that owns the file. |
| **Group** |  | Users belonging to the group that owns the file. |
| **Others** |  | Every other user account on the Linux system. |

---

## 📜 2. Permission Types & Octal Values

Permissions are represented using symbolic characters (,  20:15:00 up  1:13,  1 user,  load average: 0.48, 0.52, 0.49
USER     TTY      FROM             LOGIN@   IDLE   JCPU   PCPU  WHAT
fsociety tty2     -                19:01    1:13m  0.02s  0.02s /usr/libexec/gnome-session-init-worker ubuntu, ) or 3-digit octal numbers (, , , ):

| Bit | Character | Numeric Value | Meaning on Files | Meaning on Directories |
|---|---|---|---|---|
| **Read** |  |  | View/read file content | List files in directory (CODE_OF_CONDUCT.md
CONTRIBUTING.md
LICENSE
Makefile
NOTICE
README.md
agent
bin
challenges
landing
web) |
| **Write** |  20:15:00 up  1:13,  1 user,  load average: 0.48, 0.52, 0.49
USER     TTY      FROM             LOGIN@   IDLE   JCPU   PCPU  WHAT
fsociety tty2     -                19:01    1:13m  0.02s  0.02s /usr/libexec/gnome-session-init-worker ubuntu |  | Modify/delete file content | Create/remove files in directory |
| **Execute** |  |  | Run file as program/script | Enter directory () |

### Standard Octal Permission Examples:
- ** ()**: Owner can read & write; group and others can only read. Standard for public files & logs.
- ** ()**: Owner can read, write & execute; others can read & execute. Standard for scripts & directories.
- ** ()**: Only owner can read & write. Standard for private keys & passwords.
- ** ()**: **NO ACCESS FOR ANYONE** (except ). Any non-root account receives .

---

## ⚙️ 3. How Background Daemons Access Files

When system services run under , they run under a designated non-root user (e.g. ):



When  starts:
1. The kernel checks if user  has read () or write ( 20:15:00 up  1:13,  1 user,  load average: 0.48, 0.52, 0.49
USER     TTY      FROM             LOGIN@   IDLE   JCPU   PCPU  WHAT
fsociety tty2     -                19:01    1:13m  0.02s  0.02s /usr/libexec/gnome-session-init-worker ubuntu) permissions on .
2. If  has permissions  (), the system call  fails instantly with:
   
3. The application process aborts and crashes on startup.

---

## 💡 Essential Inspection Commands

When investigating permission issues, use these commands:

| Command | Purpose |
|---|---|
| -rw-r--r-- 1 root root 0 Jul 28 19:30 /var/log/app-server.log | Display file permissions, owner, and group |
| 644 root:root | Print octal mode () and  |
|  | Inspect groups and UID of the application user |
