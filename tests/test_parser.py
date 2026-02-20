from app.parser import group_daily, load_band_csv, summarize


def test_load_and_summarize_sample_data():
    records = load_band_csv("data/sample_band_data.csv")

    summary = summarize(records)
    assert summary["days"] == 3
    assert summary["total_steps"] == 22700
    assert summary["avg_heart_rate"] > 0


def test_group_daily_data():
    records = load_band_csv("data/sample_band_data.csv")
    daily = group_daily(records)

    assert len(daily) == 3
    assert daily[0]["date"] == "2026-02-13"
    assert daily[1]["steps"] == 7400
