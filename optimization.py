import subprocess
import winreg
import os
import shutil
import tempfile
import ctypes

# ─── Helper ───────────────────────────────────────────────────────────────────

def _reg_create(hive, path, values: dict):
    """Create/open a registry key and set multiple values, auto-detecting type."""
    key = winreg.CreateKeyEx(hive, path, 0, winreg.KEY_SET_VALUE)
    for name, data in values.items():
        if isinstance(data, int):
            t = winreg.REG_DWORD
        elif isinstance(data, bytes):
            t = winreg.REG_BINARY
        else:
            t = winreg.REG_SZ
        winreg.SetValueEx(key, name, 0, t, data)
    winreg.CloseKey(key)

_NO_WIN = subprocess.CREATE_NO_WINDOW if os.name == 'nt' else 0

# ─── Power ────────────────────────────────────────────────────────────────────

def set_high_performance_power_plan():
    """Activates Ultimate Performance power plan (falls back to High Performance)."""
    try:
        ultimate = "e9a42b02-d5df-448d-aa00-03f14749eb61"
        high     = "8c5e7fda-e8bf-4a96-9a85-a6e23a8c635c"

        # Try activating Ultimate directly (exists on Win 10 Pro/Enterprise 1803+)
        r = subprocess.run(["powercfg", "-setactive", ultimate],
                           capture_output=True, text=True, creationflags=_NO_WIN)
        if r.returncode == 0:
            return True, "Power plan set to Ultimate Performance."

        # Not present — create it by duplicating the scheme, then activate
        subprocess.run(["powercfg", "-duplicatescheme", ultimate],
                       capture_output=True, creationflags=_NO_WIN)
        r2 = subprocess.run(["powercfg", "-setactive", ultimate],
                            capture_output=True, text=True, creationflags=_NO_WIN)
        if r2.returncode == 0:
            return True, "Ultimate Performance plan created and activated."

        # Final fallback: High Performance
        subprocess.run(["powercfg", "-setactive", high],
                       capture_output=True, creationflags=_NO_WIN)
        return True, "Power plan set to High Performance."
    except Exception as e:
        return False, str(e)

# ─── Game Mode ────────────────────────────────────────────────────────────────

def enable_game_mode():
    """Enables Game Mode and disables GameDVR background recording overhead."""
    try:
        # Enable Game Mode (CreateKey is safe even if key already exists)
        _reg_create(winreg.HKEY_CURRENT_USER, r"Software\Microsoft\GameBar", {
            "AllowAutoGameMode": 1,
            "AutoGameModeEnabled": 1,
        })
        # Disable GameDVR (eliminates background recording CPU/GPU overhead)
        _reg_create(winreg.HKEY_CURRENT_USER, r"System\GameConfigStore", {
            "GameDVR_Enabled": 0,
            "GameDVR_FSEBehaviorMode": 2,
            "GameDVR_HonorUserFSEBehaviorMode": 1,
            "GameDVR_DXGIHonorFSEWindowsCompatible": 1,
        })
        return True, "Game Mode enabled. GameDVR background recording disabled for maximum FPS."
    except Exception as e:
        return False, str(e)

# ─── HAGS ─────────────────────────────────────────────────────────────────────

def enable_hags():
    """Enables Hardware-Accelerated GPU Scheduling (HAGS) — reduces GPU latency."""
    try:
        _reg_create(winreg.HKEY_LOCAL_MACHINE,
                    r"SYSTEM\CurrentControlSet\Control\GraphicsDrivers",
                    {"HwSchMode": 2})
        return True, "HAGS enabled. GPU now manages its own VRAM scheduling. Reboot to apply."
    except PermissionError:
        return False, "Access Denied: run app.py as Administrator to enable HAGS."
    except Exception as e:
        return False, str(e)

# ─── Visual Effects ───────────────────────────────────────────────────────────

def optimize_visual_effects():
    """Disables all Windows animations and transparency for maximum performance."""
    try:
        # Master switch: VisualFXSetting 2 = "Adjust for best performance"
        _reg_create(winreg.HKEY_CURRENT_USER,
                    r"Software\Microsoft\Windows\CurrentVersion\Explorer\VisualEffects",
                    {"VisualFXSetting": 2})

        # Turn off individual animation flags in Explorer\Advanced
        _reg_create(winreg.HKEY_CURRENT_USER,
                    r"Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced", {
                        "ListviewAlphaSelect": 0,
                        "ListviewShadow":      0,
                        "TaskbarAnimations":   0,
                        "IconsOnly":           0,
                    })

        # Control Panel\Desktop — kill menu delay and full-drag
        desktop_key = winreg.CreateKeyEx(winreg.HKEY_CURRENT_USER,
                                         r"Control Panel\Desktop", 0, winreg.KEY_SET_VALUE)
        winreg.SetValueEx(desktop_key, "MenuShowDelay",  0, winreg.REG_SZ,    "0")
        winreg.SetValueEx(desktop_key, "DragFullWindows",0, winreg.REG_SZ,    "0")
        # UserPreferencesMask: binary value that disables all animation effects
        winreg.SetValueEx(desktop_key, "UserPreferencesMask", 0, winreg.REG_BINARY,
                          b'\x90\x12\x01\x80\x10\x00\x00\x00')
        winreg.CloseKey(desktop_key)

        # Disable minimize/maximize animations
        _reg_create(winreg.HKEY_CURRENT_USER,
                    r"Control Panel\Desktop\WindowMetrics",
                    {"MinAnimate": "0"})

        return True, "All visual effects disabled. Sign out and back in to fully apply."
    except Exception as e:
        return False, str(e)

# ─── Background Apps ──────────────────────────────────────────────────────────

def disable_background_apps():
    """Stops UWP apps running in background globally."""
    try:
        _reg_create(winreg.HKEY_CURRENT_USER,
                    r"Software\Microsoft\Windows\CurrentVersion\BackgroundAccessApplications",
                    {"GlobalUserDisabled": 1})
        _reg_create(winreg.HKEY_CURRENT_USER,
                    r"Software\Microsoft\Windows\CurrentVersion\Search",
                    {"BackgroundAppGlobalToggle": 0})
        return True, "Background apps globally disabled. RAM freed on next reboot."
    except Exception as e:
        return False, str(e)

# ─── Graphics Performance ─────────────────────────────────────────────────────

def set_graphics_performance():
    """Tunes Windows Multimedia Scheduler for maximum GPU/game priority."""
    try:
        # SystemProfile: reserve 0% for system (100% to apps), disable network throttling
        _reg_create(winreg.HKEY_LOCAL_MACHINE,
                    r"SOFTWARE\Microsoft\Windows NT\CurrentVersion\Multimedia\SystemProfile", {
                        "SystemResponsiveness": 0,
                        "NetworkThrottlingIndex": 0xffffffff,
                    })
        # Games task profile: max GPU and CPU scheduling priority
        _reg_create(winreg.HKEY_LOCAL_MACHINE,
                    r"SOFTWARE\Microsoft\Windows NT\CurrentVersion\Multimedia\SystemProfile\Tasks\Games", {
                        "Affinity": 0,
                        "Background Only": "False",
                        "Clock Rate": 10000,
                        "GPU Priority": 8,
                        "Priority": 6,
                        "Scheduling Category": "High",
                        "SFIO Priority": "High",
                    }, kind=winreg.REG_SZ)
        return True, "Multimedia Scheduler set to max GPU/game priority. No reboot needed."
    except PermissionError:
        return False, "Access Denied: run app.py as Administrator for GPU scheduling changes."
    except Exception as e:
        return False, str(e)

# ─── Disk Cleanup ─────────────────────────────────────────────────────────────

def run_disk_cleanup():
    """Deletes temp files, clears Recycle Bin, and runs Windows Disk Cleanup."""
    freed = 0
    cleaned = []

    targets = [
        tempfile.gettempdir(),
        os.path.join(os.environ.get("SystemRoot", r"C:\Windows"), "Temp"),
    ]

    for folder in targets:
        if not os.path.exists(folder):
            continue
        try:
            for entry in os.scandir(folder):
                try:
                    if entry.is_file(follow_symlinks=False):
                        freed += entry.stat().st_size
                        os.unlink(entry.path)
                    elif entry.is_dir(follow_symlinks=False):
                        try:
                            size = sum(f.stat().st_size for f in os.scandir(entry.path) if f.is_file())
                            shutil.rmtree(entry.path, ignore_errors=True)
                            freed += size
                        except Exception:
                            pass
                except Exception:
                    pass
            cleaned.append(os.path.basename(folder) or folder)
        except Exception:
            pass

    # Empty Recycle Bin silently (flags: SHERB_NOCONFIRMATION|SHERB_NOPROGRESSUI|SHERB_NOSOUND)
    try:
        ctypes.windll.shell32.SHEmptyRecycleBinW(None, None, 0x0007)
        cleaned.append("Recycle Bin")
    except Exception:
        pass

    # Kick off Windows Disk Cleanup in background (pre-configure all categories via sageset)
    try:
        subprocess.run(["reg", "add",
                        r"HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Explorer\VolumeCaches\Temporary Files",
                        "/v", "StateFlags0001", "/t", "REG_DWORD", "/d", "2", "/f"],
                       capture_output=True, creationflags=_NO_WIN)
        subprocess.Popen(["cleanmgr.exe", "/sagerun:1"], creationflags=_NO_WIN)
    except Exception:
        pass

    mb = round(freed / (1024 * 1024), 2)
    return True, f"Freed {mb} MB from {', '.join(cleaned)}. Windows Disk Cleanup running in background."

# ─── Startup Management ───────────────────────────────────────────────────────

def get_startup_apps():
    """Returns startup programs from HKCU and HKLM Run keys."""
    apps = []
    locations = [
        (winreg.HKEY_CURRENT_USER, r"Software\Microsoft\Windows\CurrentVersion\Run", "HKCU"),
        (winreg.HKEY_LOCAL_MACHINE, r"Software\Microsoft\Windows\CurrentVersion\Run", "HKLM"),
    ]
    for hive, path, hive_name in locations:
        try:
            key = winreg.OpenKey(hive, path, 0, winreg.KEY_READ)
            i = 0
            while True:
                try:
                    name, value, _ = winreg.EnumValue(key, i)
                    apps.append({"name": name, "path": value, "hive": hive_name})
                    i += 1
                except OSError:
                    break
            winreg.CloseKey(key)
        except Exception:
            pass
    return apps

def disable_startup_app(name, hive):
    """Removes a startup registry entry."""
    hive_map = {"HKCU": winreg.HKEY_CURRENT_USER, "HKLM": winreg.HKEY_LOCAL_MACHINE}
    h = hive_map.get(hive)
    if not h:
        return False, "Invalid registry hive."
    try:
        key = winreg.OpenKey(h, r"Software\Microsoft\Windows\CurrentVersion\Run",
                             0, winreg.KEY_SET_VALUE)
        winreg.DeleteValue(key, name)
        winreg.CloseKey(key)
        return True, f"'{name}' removed from startup."
    except FileNotFoundError:
        return False, f"Entry '{name}' not found."
    except PermissionError:
        return False, "Access Denied: run as Administrator for HKLM startup entries."
    except Exception as e:
        return False, str(e)

# ─── Driver Updates ───────────────────────────────────────────────────────────

def check_driver_updates():
    """Triggers Windows Update scan and opens Optional Updates (driver updates)."""
    try:
        # Trigger background Windows Update detection
        subprocess.Popen(["usoclient.exe", "StartScan"], creationflags=_NO_WIN)
    except Exception:
        pass
    try:
        # Open Windows Update > Optional Updates (where driver updates appear)
        subprocess.run(["start", "ms-settings:windowsupdate-optionalupdates"], shell=True)
        return True, "Windows Update scan triggered. Optional Updates page opened — driver updates appear there."
    except Exception as e:
        return False, str(e)

# ─── Registry Cleaner ─────────────────────────────────────────────────────────

def clean_registry():
    """Removes orphaned HKCU startup entries pointing to missing executables."""
    cleaned = 0
    locations = [
        (winreg.HKEY_CURRENT_USER, r"Software\Microsoft\Windows\CurrentVersion\Run"),
        (winreg.HKEY_CURRENT_USER, r"Software\Microsoft\Windows\CurrentVersion\RunOnce"),
    ]
    for hive, path in locations:
        try:
            key = winreg.OpenKey(hive, path, 0, winreg.KEY_READ | winreg.KEY_SET_VALUE)
            to_delete = []
            i = 0
            while True:
                try:
                    name, value, _ = winreg.EnumValue(key, i)
                    raw = value.strip()
                    exe_path = raw[1:].split('"')[0] if raw.startswith('"') else raw.split(' ')[0]
                    if exe_path and not os.path.exists(exe_path):
                        to_delete.append(name)
                    i += 1
                except OSError:
                    break
            for name in to_delete:
                try:
                    winreg.DeleteValue(key, name)
                    cleaned += 1
                except Exception:
                    pass
            winreg.CloseKey(key)
        except Exception:
            pass
    if cleaned:
        return True, f"Registry cleaned: {cleaned} orphaned startup entr{'y' if cleaned == 1 else 'ies'} removed."
    return True, "Registry scan complete. No orphaned entries found."

# ─── Browser Cache ────────────────────────────────────────────────────────────

def clean_browser_cache():
    """Deletes cache folders for Chrome, Edge, and Firefox."""
    local   = os.environ.get("LOCALAPPDATA", "")
    roaming = os.environ.get("APPDATA", "")

    cache_paths = [
        (os.path.join(local, r"Google\Chrome\User Data\Default\Cache"),      "Chrome"),
        (os.path.join(local, r"Google\Chrome\User Data\Default\Code Cache"), "Chrome"),
        (os.path.join(local, r"Microsoft\Edge\User Data\Default\Cache"),      "Edge"),
        (os.path.join(local, r"Microsoft\Edge\User Data\Default\Code Cache"), "Edge"),
    ]
    ff_root = os.path.join(roaming, r"Mozilla\Firefox\Profiles")
    if os.path.exists(ff_root):
        for profile in os.listdir(ff_root):
            cache_paths.append((os.path.join(ff_root, profile, "cache2"), "Firefox"))

    total, browsers = 0, set()
    for cache_dir, browser in cache_paths:
        if os.path.exists(cache_dir):
            for root, _, files in os.walk(cache_dir):
                for f in files:
                    fp = os.path.join(root, f)
                    try:
                        total += os.path.getsize(fp)
                        os.unlink(fp)
                        browsers.add(browser)
                    except Exception:
                        pass

    mb = round(total / (1024 * 1024), 2)
    if browsers:
        return True, f"Cleared {mb} MB of cache from: {', '.join(sorted(browsers))}."
    return True, "No browser cache found (browsers not installed or already clean)."

# ─── Overclocking / PBO ───────────────────────────────────────────────────────

def open_pbo_tool():
    """Detects CPU vendor and launches the appropriate OC tool (Ryzen Master / Intel XTU)."""
    try:
        key = winreg.OpenKey(winreg.HKEY_LOCAL_MACHINE,
                             r"HARDWARE\DESCRIPTION\System\CentralProcessor\0")
        cpu_name, _ = winreg.QueryValueEx(key, "ProcessorNameString")
        winreg.CloseKey(key)
        cpu_name = cpu_name.strip()
    except Exception:
        cpu_name = "Unknown"

    if "AMD" in cpu_name.upper():
        paths = [
            r"C:\Program Files\AMD\RyzenMaster\AMD Ryzen Master.exe",
            r"C:\Program Files (x86)\AMD\RyzenMaster\AMD Ryzen Master.exe",
        ]
        for p in paths:
            if os.path.exists(p):
                subprocess.Popen([p])
                return True, f"AMD Ryzen Master opened. ({cpu_name})"
        return False, (f"AMD CPU detected: {cpu_name}. "
                       "Install AMD Ryzen Master from amd.com to tune PBO/overclocking.")

    if "INTEL" in cpu_name.upper():
        paths = [
            r"C:\Program Files (x86)\Intel\Intel(R) Extreme Tuning Utility\XtuService.exe",
            r"C:\Program Files\Intel\Intel(R) Extreme Tuning Utility\XtuService.exe",
        ]
        for p in paths:
            if os.path.exists(p):
                subprocess.Popen([p])
                return True, f"Intel XTU opened. ({cpu_name})"
        return False, (f"Intel CPU detected: {cpu_name}. "
                       "Install Intel Extreme Tuning Utility (XTU) from intel.com.")

    return False, f"CPU: {cpu_name}. Use your BIOS/UEFI for manual overclocking."

# ─── Microsoft PC Manager ─────────────────────────────────────────────────────

def open_pc_manager():
    """Launches Microsoft PC Manager, or opens the Store page to install it."""
    local = os.environ.get("LOCALAPPDATA", "")
    prog  = os.environ.get("PROGRAMFILES", r"C:\Program Files")
    prog86 = os.environ.get("PROGRAMFILES(X86)", r"C:\Program Files (x86)")

    paths = [
        os.path.join(local,  r"Programs\Microsoft PC Manager\PCManager.exe"),
        os.path.join(prog,   r"Microsoft PC Manager\PCManager.exe"),
        os.path.join(prog86, r"Microsoft PC Manager\PCManager.exe"),
    ]
    for p in paths:
        if os.path.exists(p):
            subprocess.Popen([p])
            return True, "Microsoft PC Manager launched."

    # Try launching via registered app alias (Store install)
    try:
        result = subprocess.run(["where", "MSPCManager.exe"],
                                capture_output=True, text=True, creationflags=_NO_WIN)
        if result.returncode == 0 and result.stdout.strip():
            subprocess.Popen([result.stdout.strip().splitlines()[0]])
            return True, "Microsoft PC Manager launched."
    except Exception:
        pass

    # Not installed — open Store page
    subprocess.run(["start", "ms-windows-store://pdp/?ProductId=9PM860492SZD"], shell=True)
    return True, "PC Manager not installed. Microsoft Store opened to install it (free)."
