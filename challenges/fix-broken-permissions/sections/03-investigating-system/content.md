# Investigating System Logs & File Permissions

In this section, you will begin hands-on troubleshooting by checking system logs and inspecting file mode permissions.

---

## 🛠️ Step-by-Step Troubleshooting Workflow

### Step 1: Check System File Mode
Check the permission details of the application log file :
---------- 1 root root 0 Jul 28 21:24 /var/log/app-server.log

Expected output showing broken permissions:

> ⚠️ **Notice:** The mode  () means **no read or write access** is granted to any user or group!

---

## 📋 Task 1 Instructions ()

To complete the first lab task:

1. **Start the Lab Session**:
   
╔══════════════════════════════════════════════╗
║  The Last Deploy — Starting: Investigate Per…║
╚══════════════════════════════════════════════╝

⚙  Running setup commands...
  $ sudo rm -f /var/log/app-server.log

2. **Inspect the Log File**:
   Verify that  exists and note its permission status ().

3. **Record Log Inspection**:
   Create the required marker file to confirm you investigated the log permissions:
   

4. **Validate and Complete**:
   Run the check tool to verify your task:
   

5. **Stop the Session**:
   
