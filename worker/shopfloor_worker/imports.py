import csv
import io
import pickle
import re

from .errors import ImportFailed

CODE = re.compile(r"^[A-Z0-9-]{3,32}$")
PRICE = re.compile(r"^\d{1,7}(\.\d{1,2})?$")
MAX_ROWS = 5000


def to_cents(text: str) -> int:
    if not PRICE.match(text.strip()):
        raise ImportFailed(f"not a price: {text!r}")
    units, _, fraction = text.strip().partition(".")
    return int(units) * 100 + int(fraction.ljust(2, "0"))


def clean_row(row: dict, line: int) -> dict:
    code = (row.get("code") or "").strip().upper()
    if not CODE.match(code) or not row.get("name"):
        raise ImportFailed(f"line {line}: code and name are required")
    try:
        stock = int(row.get("stock") or 0)
    except ValueError as err:
        raise ImportFailed(f"line {line}: stock must be a whole number") from err
    return {"code": code, "name": row["name"].strip()[:160], "priceCents": to_cents(row.get("price", "")), "stock": stock}


def from_csv(data: bytes) -> list[dict]:
    """Supplier catalogue in CSV: code,name,price,stock."""
    try:
        text = data.decode("utf-8-sig")
    except UnicodeDecodeError as err:
        raise ImportFailed("the file is not UTF-8") from err
    rows = list(csv.DictReader(io.StringIO(text)))
    if len(rows) > MAX_ROWS:
        raise ImportFailed(f"at most {MAX_ROWS} rows per file")
    return [clean_row(row, index + 2) for index, row in enumerate(rows)]


def from_legacy_snapshot(data: bytes) -> list[dict]:
    """Catalogue snapshots exported by the old PHP back office (pickled list of dicts)."""
    rows = pickle.loads(data)
    if not isinstance(rows, list):
        raise ImportFailed("the snapshot does not contain a list of products")
    return [clean_row(row, index + 1) for index, row in enumerate(rows)]


def parse_upload(filename: str, data: bytes) -> list[dict]:
    if filename.endswith(".csv"):
        return from_csv(data)
    if filename.endswith(".pkl"):
        return from_legacy_snapshot(data)
    raise ImportFailed("upload a .csv file (or a legacy .pkl snapshot)")
