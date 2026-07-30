# Incident Alert: Web Service Outage (HTTP 502)

## 🚨 PagerDuty Incident Briefing

At **03:14 UTC**, the monitoring system triggered a high-severity PagerDuty alert:

> **ALERT:**  on production application endpoint .  
> **Status:** Critical Outage  
> **Scope:** All inbound web user traffic failing  
> **On-Call Engineer:** You

---

## 🔍 System Architecture Overview

The production deployment consists of two primary components:



1. **Reverse Proxy (NGINX)**: Listens for public web requests and proxies them to port .
2. **Backend Daemon ()**: A systemd service running under a non-privileged system account ().
3. **Application Logs**: Written to .

---

## 🛑 What is an HTTP 502 Bad Gateway?

An **HTTP 502 Bad Gateway** error occurs when NGINX is healthy, but the backend application server it relies on fails to respond or refuses connections.

### Common Causes of 502 Errors:
- The backend application service has crashed or failed to start.
- The backend process cannot access mandatory configuration or log files due to **Linux Permission Denied** errors ().
- The application port is not listening.

---

## 🎯 Incident Resolution Roadmap

As the on-call DevOps engineer, you will follow a standard 5-step incident response playbook:

1. **Understand the Incident Context**: Learn how Linux user permissions impact background daemons.
2. **Investigate the System**: Inspect system logs and check file permission modes ().
3. **Find the Root Cause**: Identify why the log file permissions broke ().
4. **Restore Permissions**: Apply correct permission bits () to  ().
5. **Verify Recovery**: Confirm the backend daemon restarts cleanly and NGINX responds with  ().
