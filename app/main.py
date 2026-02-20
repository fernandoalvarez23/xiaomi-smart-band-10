from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from app.parser import group_daily, load_band_csv, summarize

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_FILE = BASE_DIR / "data" / "sample_band_data.csv"
WEB_DIR = BASE_DIR / "web"

app = FastAPI(title="Xiaomi Smart Band 10 Dashboard")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/static", StaticFiles(directory=WEB_DIR), name="static")


@app.get("/")
def index() -> FileResponse:
    return FileResponse(WEB_DIR / "index.html")


@app.get("/api/summary")
def summary() -> dict:
    records = load_band_csv(DATA_FILE)
    return summarize(records)


@app.get("/api/daily")
def daily() -> list[dict]:
    records = load_band_csv(DATA_FILE)
    return group_daily(records)
