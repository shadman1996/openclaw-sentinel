import time
import random
import threading
from flask import Flask, jsonify, render_template

app = Flask(__name__)

# Simulated memory for our OpenClaw telemetry
telemetry_data = {
    "system_health": 100,
    "cpu_usage": 15,
    "memory_usage": 45,
    "active_processes": 3,
    "recent_logs": [],
    "anomalies": []
}

# Pre-defined OpenClaw specific log messages
NORMAL_LOGS = [
    "INFO: Auth token refreshed successfully.",
    "INFO: Indexed local directory ~/Documents/Workspace",
    "INFO: Skill 'FileSearch' executed in 143ms",
    "DEBUG: Parsing email attachments...",
    "INFO: Connected to internal REST API",
    "INFO: Model context updated.",
]

ANOMALY_LOGS = [
    {"level": "WARN", "msg": "Suspected Indirect Prompt Injection detected in 'invoice.pdf'. Context quarantined.", "type": "prompt_injection"},
    {"level": "CRIT", "msg": "Unauthorized access attempt to ~/.ssh/id_rsa blocked by Guardrails.", "type": "file_tampering"},
    {"level": "WARN", "msg": "Unexpected outbound connection to unknown IP: 45.122.x.x", "type": "network_anomaly"},
    {"level": "CRIT", "msg": "High privilege escalation request (sudo) without user confirmation.", "type": "privilege_escalation"},
    {"level": "WARN", "msg": "Memory leak detected in skill 'ImageProcessor'.", "type": "resource_spike"},
]

def simulate_telemetry():
    """Background thread function to generate simulated telemetry data over time"""
    global telemetry_data
    log_id = 1
    
    while True:
        # Simulate standard resource fluctuations
        telemetry_data["cpu_usage"] = max(5, min(95, telemetry_data["cpu_usage"] + random.randint(-5, 5)))
        telemetry_data["memory_usage"] = max(20, min(90, telemetry_data["memory_usage"] + random.randint(-2, 2)))
        
        # Determine if an anomaly occurs (15% chance per cycle)
        if random.random() < 0.15:
            anomaly = random.choice(ANOMALY_LOGS)
            log_entry = {
                "id": log_id,
                "timestamp": time.strftime("%H:%M:%S"),
                "level": anomaly["level"],
                "message": anomaly["msg"],
                "type": anomaly["type"]
            }
            telemetry_data["anomalies"].append(log_entry)
            telemetry_data["recent_logs"].insert(0, log_entry)
            
            # Impact system health based on anomaly
            if anomaly["level"] == "CRIT":
                telemetry_data["system_health"] = max(0, telemetry_data["system_health"] - 15)
            else:
                telemetry_data["system_health"] = max(0, telemetry_data["system_health"] - 5)
                
            # Simulate a CPU spike on anomaly
            telemetry_data["cpu_usage"] = min(99, telemetry_data["cpu_usage"] + 30)
                
        else:
            # Normal log entry
            log_entry = {
                "id": log_id,
                "timestamp": time.strftime("%H:%M:%S"),
                "level": "INFO",
                "message": random.choice(NORMAL_LOGS),
                "type": "normal"
            }
            telemetry_data["recent_logs"].insert(0, log_entry)
            
            # Slow recovery of system health
            telemetry_data["system_health"] = min(100, telemetry_data["system_health"] + 2)
            
        # Cap the logs array size to prevent memory explosion
        if len(telemetry_data["recent_logs"]) > 50:
            telemetry_data["recent_logs"] = telemetry_data["recent_logs"][:50]
        if len(telemetry_data["anomalies"]) > 20:
            telemetry_data["anomalies"] = telemetry_data["anomalies"][:20]
            
        log_id += 1
        time.sleep(2) # Generate new data every 2 seconds

# Start background simulation thread
thread = threading.Thread(target=simulate_telemetry, daemon=True)
thread.start()

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/api/telemetry")
def get_telemetry():
    return jsonify(telemetry_data)

@app.route("/api/action/kill_process", methods=["POST"])
def kill_process():
    global telemetry_data
    # Simulate resolving an issue and restoring health
    telemetry_data["system_health"] = min(100, telemetry_data["system_health"] + 20)
    telemetry_data["cpu_usage"] = 25
    return jsonify({"status": "success", "message": "Rogue OpenClaw process terminated."})

if __name__ == "__main__":
    app.run(debug=True, host="127.0.0.1", port=5000)
