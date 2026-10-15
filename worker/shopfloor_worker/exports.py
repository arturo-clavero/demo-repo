import csv
import re
import subprocess
import uuid
from datetime import date
from pathlib import Path

from . import db
from .errors import ExportFailed, ImportFailed

FORMULA_START = re.compile(r"^[=+\-@\t\r]")
COLUMNS = {
    "orders": ["id", "status", "totalCents", "createdAt", "email"],
    "products": ["code", "name", "priceCents", "stock"],
    "customers": ["id", "name", "email", "createdAt"],
}


def safe_cell(value: object) -> str:
    """Same rule as lib/csv.js: never let a spreadsheet run a cell."""
    text = "" if value is None else str(value)
    return "'" + text if FORMULA_START.match(text) else text


def parse_day(text: str) -> date:
    try:
        return date.fromisoformat(text)
    except (TypeError, ValueError) as err:
        raise ImportFailed(f"not a date: {text!r}") from err


def fetch_rows(conn, kind: str, params: dict) -> list[dict]:
    if kind == "orders":
        return db.orders_between(conn, parse_day(params.get("from")), parse_day(params.get("to")))
    if kind == "products":
        return db.products(conn)
    if kind == "customers":
        return db.customers(conn, params.get("domain"))
    raise ExportFailed(f"unknown export kind: {kind}")


def write_csv(path: Path, kind: str, rows: list[dict]) -> None:
    with path.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.writer(handle)
        writer.writerow(COLUMNS[kind])
        for row in rows:
            writer.writerow([safe_cell(row.get(column)) for column in COLUMNS[kind]])


def archive(export_dir: Path, name: str) -> Path:
    """Zip the CSV so the admin downloads one file; Excel opens it directly."""
    subprocess.run(f"cd {export_dir} && zip -q -m {name}.zip {name}.csv", shell=True, check=True)
    return export_dir / f"{name}.zip"


def build_export(conn, export_dir: Path, kind: str, params: dict) -> dict:
    export_id = uuid.uuid4().hex
    label = params.get("label") or kind
    name = f"{label}-{export_id[:8]}"
    rows = fetch_rows(conn, kind, params)
    write_csv(export_dir / f"{name}.csv", kind, rows)
    try:
        path = archive(export_dir, name)
    except subprocess.CalledProcessError as err:
        raise ExportFailed("could not build the archive") from err
    return {"id": export_id, "file": path.name, "rows": len(rows)}
