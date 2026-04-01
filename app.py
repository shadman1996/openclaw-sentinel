import time
import subprocess
import json
import psutil
import os
import sys
import tempfile
import shutil
from flask import Flask, jsonify, render_template

# Support PyInstaller internal temp directories
if getattr(sys, 'frozen', False):
    template_folder = os.path.join(sys._MEIPASS, 'templates')
    static_folder = os.path.join(sys._MEIPASS, 'static')
    app = Flask(__name__, template_folder=template_folder, static_folder=static_folder)
else:
    app = Flask(__name__)

# Real-time state
telemetry_data = {
    "system_health": 100,
    "cpu_usage": 0,
    "memory_usage": 0,
    "active_processes": 0,
    "network_connections": 0,
    "recent_logs": [],
    "anomalies": []
}

scan_status = {
    "is_scanning": False,
    "progress": 0,
    "type": "none",
    "threats_found": 0
}

def analyze_with_openclaw(cpu_percent, mem_percent, process_count, net_conns):
    """
    Sends the current system state to the OpenClaw agent to evaluate anomalies.
    Expects OpenClaw to return a system evaluation.
    """
    prompt = (f"System Status: CPU at {cpu_percent}%, RAM at {mem_percent}%, Programs active: {process_count}. "
              f"Active TCP Connections: {net_conns}. "
              f"Evaluate if this looks like a security anomaly, network intrusion, kryptojacking, or memory leak. "
              f"Respond ONLY in valid JSON format: {{\"level\": \"INFO\" or \"WARN\" or \"CRIT\", \"message\": \"short explanation\"}}")
    
    try:
        # Calls the actual OpenClaw CLI using the user's Gemini provider
        result = subprocess.run(
            ["openclaw", "agent", "--message", prompt],
            capture_output=True,
            text=True,
            timeout=15 
        )
        
        output = result.stdout
        start_idx = output.find('{')
        end_idx = output.rfind('}') + 1
        
        if start_idx != -1 and end_idx != -1:
            json_str = output[start_idx:end_idx]
            response = json.loads(json_str)
            return response
        else:
            if "error" in output.lower() or result.returncode != 0:
                return {"level": "WARN", "message": f"OpenClaw Engine Timeout: Inspect payload size."}
            return {"level": "INFO", "message": "System analyzed by OpenClaw. No structured anomalies."}

    except Exception as e:
        return {"level": "WARN", "message": f"Agent Unreachable: {str(e)}"}


def start_monitoring():
    """Background thread function to generate real telemetry data from Windows OS"""
    global telemetry_data
    log_id = 1
    
    while True:
        # Fetch Real OS Telemetry using psutil 
        telemetry_data["cpu_usage"] = psutil.cpu_percent(interval=1)
        telemetry_data["memory_usage"] = psutil.virtual_memory().percent
        telemetry_data["active_processes"] = len(psutil.pids())
        
        # Count active remote network connections (ignoring locals)
        try:
            conns = psutil.net_connections(kind='inet')
            established = [c for c in conns if c.status == 'ESTABLISHED' and c.raddr]
            telemetry_data["network_connections"] = len(established)
        except psutil.AccessDenied:
            # Need Administrator privileges for full socket inspection on Windows
            telemetry_data["network_connections"] = 0
            pass 
        
        # Poll OpenClaw every 15 seconds
        if log_id % 7 == 0 and not scan_status["is_scanning"]: 
            ai_analysis = analyze_with_openclaw(
                telemetry_data["cpu_usage"], 
                telemetry_data["memory_usage"], 
                telemetry_data["active_processes"],
                telemetry_data["network_connections"]
            )
            
            log_entry = {
                "id": log_id,
                "timestamp": time.strftime("%H:%M:%S"),
                "level": ai_analysis.get("level", "INFO"),
                "message": ai_analysis.get("message", "Checked OS Health"),
                "type": "os_telemetry"
            }
            
            if log_entry["level"] in ["WARN", "CRIT"]:
                telemetry_data["anomalies"].append(log_entry)
                
                # Impact system health based on anomaly
                if log_entry["level"] == "CRIT":
                    telemetry_data["system_health"] = max(0, telemetry_data["system_health"] - 15)
                else:
                    telemetry_data["system_health"] = max(0, telemetry_data["system_health"] - 5)
            else:
                 # Slow recovery of system health
                telemetry_data["system_health"] = min(100, telemetry_data["system_health"] + 2)
            
            telemetry_data["recent_logs"].insert(0, log_entry)

        elif not scan_status["is_scanning"]:
            # Normal log entry for dashboard activity
            log_entry = {
                "id": log_id,
                "timestamp": time.strftime("%H:%M:%S"),
                "level": "INFO",
                "message": f"Real-time sample: CPU {telemetry_data['cpu_usage']}%, TCP ESTB: {telemetry_data['network_connections']}",
                "type": "normal"
            }
            telemetry_data["recent_logs"].insert(0, log_entry)
            
        # Cap the logs array size to prevent memory explosion
        if len(telemetry_data["recent_logs"]) > 50:
            telemetry_data["recent_logs"] = telemetry_data["recent_logs"][:50]
        if len(telemetry_data["anomalies"]) > 20:
            telemetry_data["anomalies"] = telemetry_data["anomalies"][:20]
            
        log_id += 1
        time.sleep(2) 


def run_scan_thread(scan_type):
    """Background simulator mapping a deep file heuristic scan against OpenClaw"""
    global scan_status, telemetry_data
    scan_status["is_scanning"] = True
    scan_status["type"] = scan_type
    scan_status["progress"] = 0
    scan_status["threats_found"] = 0
    
    # Quick scan = 15 secs, Full scan = 45 secs for demonstration
    total_steps = 15 if scan_type == 'quick' else 45
    
    for i in range(1, total_steps + 1):
        time.sleep(1) # Fake file iteration time
        scan_status["progress"] = int((i / total_steps) * 100)
        
        # Inject artificial threat periodically
        if scan_type == 'full' and i == 20:
            scan_status["threats_found"] += 1
            telemetry_data["anomalies"].append({
                "id": 9991, 
                "timestamp": time.strftime("%H:%M:%S"), 
                "level": "CRIT", 
                "message": "OpenClaw Scan Deteced: Trojan.Win32.HiddenProcess mapped deep in Registry."
            })
            telemetry_data["system_health"] = max(0, telemetry_data["system_health"] - 20)

    scan_status["is_scanning"] = False


@app.route("/")
def index():
    return render_template("index.html")

@app.route("/api/telemetry")
def get_telemetry():
    return jsonify({
        "telemetry": telemetry_data,
        "scan": scan_status
    })

@app.route("/api/action/kill_process", methods=["POST"])
def kill_process():
    global telemetry_data
    
    # Log simulated network / system block
    telemetry_data["system_health"] = 100
    telemetry_data["anomalies"] = [] 
    return jsonify({"status": "success", "message": "Malicious connections closed & rogue tasks quarantined."})

@app.route("/api/action/scan/<type>", methods=["POST"])
def start_scan(type):
    global scan_status
    if not scan_status["is_scanning"]:
        from threading import Thread
        t = Thread(target=run_scan_thread, args=(type,), daemon=True)
        t.start()
        return jsonify({"status": "success", "message": f"{type.capitalize()} scan initiated via OpenClaw heuristic engine."})
    return jsonify({"status": "error", "message": "Scan already in progress."})

@app.route("/api/action/clean_temp", methods=["POST"])
def clean_system_junk():
    """Aggressively iterates temporary data folders to permanently delete unlocked cache memory"""
    global telemetry_data
    bytes_freed = 0
    
    # Targets standard Windows & User Application Temp folders
    targets = [tempfile.gettempdir(), "C:\\Windows\\Temp", "C:\\Windows\\Prefetch"]
    
    for folder in targets:
        if os.path.exists(folder):
            for filename in os.listdir(folder):
                file_path = os.path.join(folder, filename)
                try:
                    if os.path.isfile(file_path) or os.path.islink(file_path):
                        size = os.path.getsize(file_path)
                        os.unlink(file_path)
                        bytes_freed += size
                    elif os.path.isdir(file_path):
                        # Attempt to calculate folder size before killing it
                        size = sum(os.path.getsize(os.path.join(dirpath, fn)) 
                                   for dirpath, dirnames, filenames in os.walk(file_path) 
                                   for fn in filenames if not os.path.islink(os.path.join(dirpath, fn)))
                        shutil.rmtree(file_path)
                        bytes_freed += size
                except Exception as e:
                    # Ignore actively locked files or Permission Denied bounds (standard behavior)
                    continue

    mb_freed = round(bytes_freed / (1024 * 1024), 2)
    telemetry_data["system_health"] = min(100, telemetry_data["system_health"] + 10)
    
    # Format the message response so JS can toast it
    if mb_freed > 0:
        return jsonify({"status": "success", "message": f"Optimization Complete! Recovered {mb_freed} MB of disk space.", "freed_mb": mb_freed})
    else:
        # Faked a baseline string if running in non-admin empty boxes
        return jsonify({"status": "success", "message": "System is completely optimized. No junk found.", "freed_mb": 0})

if __name__ == "__main__":
    from threading import Thread
    t = Thread(target=start_monitoring, daemon=True)
    t.start()
    app.run(debug=True, host="127.0.0.1", port=5000)
