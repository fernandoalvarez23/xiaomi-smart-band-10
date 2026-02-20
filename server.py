from __future__ import annotations

import json
from http.server import BaseHTTPRequestHandler, HTTPServer
from pathlib import Path
from urllib.parse import unquote

from app.parser import group_daily, load_band_csv, summarize

BASE_DIR = Path(__file__).resolve().parent
DATA_FILE = BASE_DIR / "data" / "sample_band_data.csv"
WEB_DIR = BASE_DIR / "web"


class DashboardHandler(BaseHTTPRequestHandler):
    def _send_json(self, payload: object, status: int = 200) -> None:
        body = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def _send_file(self, file_path: Path) -> None:
        if not file_path.exists() or not file_path.is_file():
            self.send_error(404, "Archivo no encontrado")
            return

        suffix = file_path.suffix
        content_type = {
            ".html": "text/html; charset=utf-8",
            ".css": "text/css; charset=utf-8",
            ".js": "application/javascript; charset=utf-8",
        }.get(suffix, "application/octet-stream")

        content = file_path.read_bytes()
        self.send_response(200)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(content)))
        self.end_headers()
        self.wfile.write(content)

    def do_GET(self) -> None:  # noqa: N802
        path = unquote(self.path.split("?", 1)[0])

        if path == "/api/summary":
            records = load_band_csv(DATA_FILE)
            self._send_json(summarize(records))
            return

        if path == "/api/daily":
            records = load_band_csv(DATA_FILE)
            self._send_json(group_daily(records))
            return

        if path == "/":
            self._send_file(WEB_DIR / "index.html")
            return

        if path.startswith("/static/"):
            relative = path.replace("/static/", "", 1)
            self._send_file(WEB_DIR / relative)
            return

        self.send_error(404, "Ruta no encontrada")


def run() -> None:
    server = HTTPServer(("0.0.0.0", 8000), DashboardHandler)
    print("Dashboard disponible en http://localhost:8000")
    server.serve_forever()


if __name__ == "__main__":
    run()
