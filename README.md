# OpenClaw Sentinel

OpenClaw Sentinel is a cybersecurity "anti-virus-like" anomaly monitoring dashboard specifically designed to oversee the autonomous AI agent running locally (OpenClaw).

This application provides real-time visibility into the system by aggregating local telemetry logs and detecting risks associated with OpenClaw, such as:
- **Over-privileged execution** (e.g., unauthorized sudo escalating)
- **File tampering attempts**
- **Process and memory spikes**
- **Indirect prompt injection attempts**

## Tech Stack
* **Backend:** Python + Flask (simulates OpenClaw telemetry logs acting as a local agent interface)
* **Frontend:** HTML, Vanilla JS, and pure CSS featuring a custom dynamic, premium dark-mode glassmorphic aesthetic.

## Installation and Execution

1. Clone the repository
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Run the development server:
   ```bash
   python app.py
   ```
4. Navigate to `http://127.0.0.1:5000` in your web browser.

## Features
- **Health Integrity Monitoring:** Live scoring based on the frequency and severity of detected anomalies.
- **Resource Utilization:** Visual tracking of CPU and memory spikes often resulting from looping AI tasks or resource leaks.
- **Real-Time Threat Feed:** A live log of warnings and critical system events.
- **Task Quarantine System:** Single click resolution logic to terminate out-of-control AI processes and regain system composure.
