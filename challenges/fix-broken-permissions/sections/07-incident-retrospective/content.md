# Incident Retrospective & Best Practices

Congratulations! You successfully resolved the  incident by diagnosing and fixing broken Linux file permissions.

---

## 📌 Summary of Incident Lifecycle

| Stage | Activity | Key Command |
|---|---|---|
| **1. Alert** | PagerDuty alerted  | — |
| **2. Investigation** | Inspected permissions on  | ---------- 1 root root 0 Jul 28 21:24 /var/log/app-server.log |
| **3. Root Cause** | Identified file mode  () blocking  | 0 |
| **4. Mitigation** | Restored read permissions () |  |
| **5. Recovery** | Confirmed application startup & HTTP health |  |

---

## 🛡️ Production Best Practices to Prevent Permission Outages

1. **Follow Principle of Least Privilege**: Grant processes only the minimum permissions required (e.g.  for logs,  for credentials,  for executables). Never use .
2. **Automate Log Rotation Safely**: Configure  with explicit file mode & ownership directives:
   
3. **Audit CI/CD Deployment Scripts**: Ensure deployment scripts do not run recursive  or create files as  without setting group/other read permissions.
