"""Download and normalize the public NISR crop-yield PxWeb table."""
from __future__ import annotations

import csv
import io
import json
from datetime import datetime, timezone
from pathlib import Path
from urllib.request import Request, urlopen


MODEL_DIR = Path(__file__).resolve().parent
DATA_DIR = MODEL_DIR / "data" / "official"
TABLE_PATH = (
    "NISR Statistical Databases/Agriculture/"
    "Crop area, production and yield for major crops/yield.px"
)
API_URL = "https://pxweb.statistics.gov.rw/api/v1/en/" + TABLE_PATH.replace(" ", "%20")
TABLE_URL = (
    "https://pxweb.statistics.gov.rw/pxweb/en/NISR%20Statistical%20Databases/"
    "Agriculture/Crop%20area,%20production%20and%20yield%20for%20major%20crops/yield.px"
)


def _get(url: str, body: bytes | None = None) -> tuple[bytes, str | None]:
    headers = {"User-Agent": "Mboni public-data importer"}
    if body is not None:
        headers["Content-Type"] = "application/json"
    request = Request(url, data=body, headers=headers)
    with urlopen(request, timeout=45) as response:
        return response.read(), response.headers.get_content_charset()


def download() -> None:
    metadata_bytes, _ = _get(API_URL)
    metadata = json.loads(metadata_bytes)
    variables = metadata.get("variables", [])
    by_code = {variable["code"]: variable for variable in variables}
    required = ("Season", "District", "Crop type")
    if any(code not in by_code for code in required):
        raise ValueError(f"Unexpected NISR table dimensions: {sorted(by_code)}")

    query = {
        "query": [
            {
                "code": code,
                "selection": {"filter": "item", "values": by_code[code]["values"]},
            }
            for code in required
        ],
        "response": {"format": "csv"},
    }
    raw, charset = _get(API_URL, json.dumps(query).encode("utf-8"))
    raw = raw.replace(b"\r\n", b"\n")
    text = raw.decode(charset or "cp1252")
    reader = csv.DictReader(io.StringIO(text.lstrip("\ufeff")))
    expected_crops = by_code["Crop type"]["valueTexts"]
    if (
        reader.fieldnames is None
        or reader.fieldnames[:2] != ["Season", "District"]
        or reader.fieldnames[2:] != expected_crops
    ):
        raise ValueError("The NISR CSV columns do not match the published table metadata.")

    district_values = {
        name
        for name in by_code["District"]["valueTexts"]
        if name not in {"National", "SSF", "LSF"}
    }
    normalized = []
    raw_rows = list(reader)
    for row in raw_rows:
        district = row["District"]
        if district not in district_values:
            continue
        for crop in expected_crops:
            value = row[crop].strip()
            if not value or value in {".", ".."}:
                continue
            try:
                yield_value = float(value)
            except ValueError as exc:
                raise ValueError(f"Unexpected yield value {value!r} for {district}/{crop}") from exc
            normalized.append(
                {
                    "season": row["Season"],
                    "district": district,
                    "crop_type": crop,
                    "yield_kg_per_ha": yield_value,
                }
            )

    expected_rows = len(by_code["Season"]["values"]) * len(by_code["District"]["values"])
    if len(raw_rows) != expected_rows or len(district_values) != 30 or not normalized:
        raise ValueError(
            f"Unexpected table size: {len(raw_rows)} rows and "
            f"{len(normalized)} district/crop observations."
        )

    DATA_DIR.mkdir(parents=True, exist_ok=True)
    (DATA_DIR / "nisr_agriculture_yield_raw.csv").write_bytes(raw)
    with (DATA_DIR / "district_crop_yield.csv").open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(
            handle,
            fieldnames=("season", "district", "crop_type", "yield_kg_per_ha"),
            lineterminator="\n",
        )
        writer.writeheader()
        writer.writerows(normalized)
    provenance = {
        "publisher": "National Institute of Statistics of Rwanda (NISR)",
        "title": metadata["title"],
        "table_url": TABLE_URL,
        "api_url": API_URL,
        "retrieved_at_utc": datetime.now(timezone.utc).isoformat(),
        "reference_year": None,
        "unit": "kg/ha",
        "dimensions": required,
        "districts_in_normalized_file": sorted(district_values),
        "seasons": by_code["Season"]["valueTexts"],
        "crop_types": expected_crops,
        "raw_file": "nisr_agriculture_yield_raw.csv",
        "normalized_file": "district_crop_yield.csv",
        "missing_values": "PxWeb '..' values are omitted from the normalized file.",
        "excluded_geographies": ["National", "SSF", "LSF"],
    }
    with (DATA_DIR / "source.json").open("w", encoding="utf-8") as handle:
        json.dump(provenance, handle, indent=2, ensure_ascii=False)
        handle.write("\n")
    print(
        f"Downloaded {len(raw_rows)} source rows and normalized "
        f"{len(normalized)} district/crop observations."
    )


if __name__ == "__main__":
    download()
