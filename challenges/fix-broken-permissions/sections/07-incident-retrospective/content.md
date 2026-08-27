# Incident Retrospective & Best Practices

Congratulations! You successfully resolved the `HTTP 502` incident by diagnosing and fixing broken Linux file permissions.

---

## 📌 Summary of Incident Lifecycle

| Stage | Activity | Key Command |
|---|---|---|
| **1. Alert** | PagerDuty alerted  | — |
| **2. Investigation** | Inspected permissions on `/var/log/app-server.log` | `ls -l /var/log/app-server.log` |
| **3. Root Cause** | Identified file mode `000` blocking access | — |
| **4. Mitigation** | Restored read permissions `644` | `sudo chmod 644 /var/log/app-server.log` |
| **5. Recovery** | Confirmed application startup & HTTP health | `ls -l /var/log/app-server.log` |

---

## 🛡️ Production Best Practices to Prevent Permission Outages

1. **Follow Principle of Least Privilege**: Grant processes only the minimum permissions required (e.g. `644` for logs, `600` for credentials, `755` for executables). Never use `777`.
2. **Automate Log Rotation Safely**: Configure `logrotate` with explicit file mode & ownership directives:
   
3. **Audit CI/CD Deployment Scripts**: Ensure deployment scripts do not run recursive `chmod` or create files as `root` without setting group/other read permissions.
