import webview
import threading
from app import app, run_asyncio_loop

def start_server():
    app.run(host='0.0.0.0', port=5000, threaded=True, use_reloader=False)

if __name__ == '__main__':
    # Start the backend Flask server in a daemon thread
    server_thread = threading.Thread(target=start_server, daemon=True)
    server_thread.start()

    # Start the OpenClaw / psutil OS anomaly monitoring thread
    monitor_thread = threading.Thread(target=run_asyncio_loop, daemon=True)
    monitor_thread.start()

    # Create the native Desktop Window
    webview.create_window(
        'OpenClaw Sentinel - Native Monitor', 
        'http://127.0.0.1:5000',
        width=1200,
        height=800,
        resizable=True,
        background_color='#07090f'
    )
    
    # Start the PyWebView event loop
    webview.start()
