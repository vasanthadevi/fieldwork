"""Start and always stop the target app for a run."""

import os
import socket
import subprocess
import sys
import time
from contextlib import contextmanager
from pathlib import Path

ROOT = Path(__file__).parent.parent
WEB_PORT, API_PORT = 4400, 8100
TARGET_URL = f"http://127.0.0.1:{WEB_PORT}"


def _wait(port: int, timeout: float = 30):
    end = time.time() + timeout
    while time.time() < end:
        with socket.socket() as s:
            if s.connect_ex(("127.0.0.1", port)) == 0:
                return
        time.sleep(0.15)
    raise TimeoutError(f"port {port} never opened")


@contextmanager
def target_app():
    procs = [
        subprocess.Popen([sys.executable, "-m", "uvicorn", "fieldwork.target_api:app", "--port", str(API_PORT),
                          "--log-level", "warning"], cwd=ROOT),
        subprocess.Popen(["node_modules/.bin/vite", "--host", "127.0.0.1", "--port", str(WEB_PORT), "--strictPort"],
                         cwd=ROOT / "target", stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
                         env={**os.environ, "TARGET_API": f"http://127.0.0.1:{API_PORT}"}),
    ]
    try:
        _wait(API_PORT)
        _wait(WEB_PORT)
        yield TARGET_URL
    finally:
        for p in procs:
            p.terminate()
        for p in procs:
            p.wait(timeout=10)
