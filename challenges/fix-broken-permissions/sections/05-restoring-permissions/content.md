# Restoring Correct Linux Permissions

With the root cause identified, you must now restore appropriate read permissions so  (and system logging utilities) can access .

---

## 🛠️ Recommended Permission Mode

Log files should generally be configured with mode  ():
- **User (Owner)**:  () — Read and Write
- **Group**:  () — Read only
- **Others**:  () — Read only

### Applying :


### Verifying the Change:
---------- 1 root root 0 Jul 28 21:24 /var/log/app-server.log

Expected output:


---

## 📋 Task 3 Instructions ()

To complete the third lab task:

1. **Start the Lab Session**:
   
╔══════════════════════════════════════════════╗
║  The Last Deploy — Starting: Fix Broken Perm…║
╚══════════════════════════════════════════════╝

⚙  Running setup commands...
  $ sudo rm -f /var/log/app-server.log

2. **Restore Permissions**:
   Apply read permissions () to :
   

3. **Validate and Complete**:
   Run  to verify that  is readable ( mode):
   

4. **Stop the Session**:
   
