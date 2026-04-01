import webview
import threading
import time
import socket
from app import app, run_asyncio_loop, run_security_audit

def start_server():
    app.run(host='127.0.0.1', port=5000, threaded=True, use_reloader=False)

def wait_for_flask(host='127.0.0.1', port=5000, timeout=12):
    """Poll until Flask is accepting TCP connections — prevents blank white window."""
    deadline = time.time() + timeout
    while time.time() < deadline:
        try:
            with socket.create_connection((host, port), timeout=0.3):
                return True
        except OSError:
            time.sleep(0.1)
    return False

if __name__ == '__main__':
    # 1. Start hardware telemetry asyncio loop
    monitor_thread = threading.Thread(target=run_asyncio_loop, daemon=True)
    monitor_thread.start()

    # 2. Prime security audit in background (was only called in app.py __main__ block)
    threading.Thread(target=run_security_audit, daemon=True).start()

    # 3. Start Flask server
    server_thread = threading.Thread(target=start_server, daemon=True)
    server_thread.start()

    # 4. Block until Flask is ready — avoids the race condition that shows a blank window
    if not wait_for_flask():
        print("ERROR: Flask server did not start within 12 seconds.")
        raise SystemExit(1)

    # 5. Open the native desktop window
    webview.create_window(
        'OpenClaw Sentinel',
        'http://127.0.0.1:5000',
        width=1280,
        height=820,
        resizable=True,
        background_color='#07090f',
        min_size=(900, 600)
    )

    webview.start()
