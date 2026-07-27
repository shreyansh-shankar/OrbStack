## Systemd and Services

On modern Linux distributions, **systemd** acts as the system initialization (init) system and service manager. It manages system resources, mounts, sockets, and background services (daemons) grouped into logical configuration units.

---

## 1. Managing Services with `systemctl`

The primary command used to interact with systemd is `systemctl`.

- **Check service status**:
  ```bash
  systemctl status cron
  ```
- **Start or Stop a service**:
  ```bash
  sudo systemctl start nginx
  sudo systemctl stop nginx
  ```
- **Restart or Reload configurations**:
  ```bash
  sudo systemctl restart nginx
  ```
- **Enable or Disable auto-start on boot**:
  ```bash
  # Start on boot
  sudo systemctl enable nginx
  
  # Prevent starting on boot
  sudo systemctl disable nginx
  ```

---

## 2. System Services vs User Services

While standard services run system-wide with root privileges, systemd also manages **User-level services**. These allow standard users to run their own background processes without needing sudo access.

- User services are configured inside `~/.config/systemd/user/`.
- You interact with them by adding the `--user` flag:
  ```bash
  systemctl --user status my-service
  systemctl --user start my-service
  systemctl --user enable my-service
  ```

---

## Lab Tasks

### Task 1: Enable a user-level service
1. Start the lab in your terminal:
   ```bash
   tld start lnx-enable-service
   ```
2. Configure the user-level service `thelastdeploy-user.service` so that it is enabled to start automatically whenever your user session logs in.
3. Verify the task:
   ```bash
   tld check
   ```

### Task 2: Inspect system service status
1. Start the lab in your terminal:
   ```bash
   tld start lnx-inspect-service
   ```
2. Query the systemd service named `cron` to find its current active status.
3. Save that active state (e.g., `active` or `inactive`) on a single line to a file named `cron_status.txt` inside a new directory named `service-test` in your home directory.
4. Verify the task:
   ```bash
   tld check
   ```

### Task 3: Start a user-level service
1. Start the lab in your terminal:
   ```bash
   tld start lnx-start-service
   ```
2. The setup script created a user-level systemd service named `thelastdeploy-user.service`.
3. Start this user-level service.
4. Verify the task:
   ```bash
   tld check
   ```
