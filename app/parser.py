from __future__ import annotations

import csv
from dataclasses import dataclass
from datetime import date, datetime
from pathlib import Path
from statistics import mean
from typing import Iterable


@dataclass
class BandRecord:
    timestamp: datetime
    steps: int
    heart_rate: int
    calories: float
    sleep_minutes: int


def _to_int(value: str, default: int = 0) -> int:
    try:
        return int(float(value))
    except (TypeError, ValueError):
        return default


def _to_float(value: str, default: float = 0.0) -> float:
    try:
        return float(value)
    except (TypeError, ValueError):
        return default


def load_band_csv(path: str | Path) -> list[BandRecord]:
    records: list[BandRecord] = []
    with Path(path).open("r", encoding="utf-8") as file:
        reader = csv.DictReader(file)
        for row in reader:
            records.append(
                BandRecord(
                    timestamp=datetime.fromisoformat(row["timestamp"]),
                    steps=_to_int(row.get("steps", 0)),
                    heart_rate=_to_int(row.get("heart_rate", 0)),
                    calories=_to_float(row.get("calories", 0)),
                    sleep_minutes=_to_int(row.get("sleep_minutes", 0)),
                )
            )
    return sorted(records, key=lambda r: r.timestamp)


def summarize(records: Iterable[BandRecord]) -> dict[str, float | int]:
    data = list(records)
    if not data:
        return {
            "days": 0,
            "total_steps": 0,
            "avg_heart_rate": 0,
            "total_calories": 0,
            "avg_sleep_hours": 0,
        }

    days = {record.timestamp.date() for record in data}
    avg_hr = round(mean(r.heart_rate for r in data if r.heart_rate > 0), 1)
    avg_sleep = round(mean(r.sleep_minutes for r in data) / 60, 2)

    return {
        "days": len(days),
        "total_steps": sum(r.steps for r in data),
        "avg_heart_rate": avg_hr,
        "total_calories": round(sum(r.calories for r in data), 2),
        "avg_sleep_hours": avg_sleep,
    }


def group_daily(records: Iterable[BandRecord]) -> list[dict[str, float | int | date]]:
    buckets: dict[date, dict[str, float | int | date]] = {}
    for record in records:
        day = record.timestamp.date()
        if day not in buckets:
            buckets[day] = {
                "date": day,
                "steps": 0,
                "calories": 0.0,
                "heart_rate_samples": [],
                "sleep_minutes": 0,
            }

        bucket = buckets[day]
        bucket["steps"] = int(bucket["steps"]) + record.steps
        bucket["calories"] = float(bucket["calories"]) + record.calories
        bucket["sleep_minutes"] = int(bucket["sleep_minutes"]) + record.sleep_minutes
        bucket["heart_rate_samples"].append(record.heart_rate)

    daily: list[dict[str, float | int | date]] = []
    for day, bucket in sorted(buckets.items()):
        hr_samples = [h for h in bucket["heart_rate_samples"] if h > 0]
        daily.append(
            {
                "date": day.isoformat(),
                "steps": int(bucket["steps"]),
                "calories": round(float(bucket["calories"]), 2),
                "avg_heart_rate": round(mean(hr_samples), 1) if hr_samples else 0,
                "sleep_hours": round(int(bucket["sleep_minutes"]) / 60, 2),
            }
        )
    return daily
