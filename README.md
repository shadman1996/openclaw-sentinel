# OpenClaw Sentinel - Desktop Edition

OpenClaw Sentinel is an advanced, premium "anti-virus-like" anomaly monitoring dashboard designed to oversee the autonomous OpenClaw AI engine and actively scan your PC.

The Sentinel features a modern dark-mode glass UI bundled smoothly into a native Windows Desktop GUI!

## Advanced Features Built-in:
* **Real-time Charting:** Leverages Chart.js to visually graph your live `psutil` CPU and Memory metrics in real-time.
* **Network Intrusion Monitoring:** Scrapes your active listening socket ports to identify unauthorized internet connections.
* **Deep Scanning:** Employs the `openclaw` AI daemon heuristic model to sweep background apps and directories.
* **Quarantine Control:** Allows you to sever active malicious connections directly from the UI.

## Tech Stack
* **AI Engine:** Official `openclaw` CLI wrapper parsing data streams directly to Gemini
* **Backend:** Python + Flask + `psutil` + `pywebview`
* **Frontend:** HTML, Vanilla JS, and pure CSS featuring custom SVG icons and Chart.js graphs.

## Installation and Execution

1. Clone the repository
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   npm install -g openclaw@latest
   ```
3. Run the Desktop Application:
   ```bash
   python desktop.py
   ```
4. **Compile to a standalone `.exe` (Optional):**
   ```bash
   pip install pyinstaller
   pyinstaller --onefile --noconsole --name "OpenClawSentinel" desktop.py
   ```
   *Your standalone portable executable will be generated inside the `/dist` folder!*
