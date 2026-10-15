from datetime import date

import pytest

from shopfloor_worker.errors import ImportFailed
from shopfloor_worker.exports import parse_day, safe_cell, write_csv


def test_safe_cell_neutralises_formulas():
    assert safe_cell("=HYPERLINK(1)") == "'=HYPERLINK(1)"
    assert safe_cell("plain") == "plain"
    assert safe_cell(None) == ""


def test_parse_day():
    assert parse_day("2026-01-31") == date(2026, 1, 31)
    with pytest.raises(ImportFailed):
        parse_day("31/01/2026")


def test_write_csv(tmp_path):
    path = tmp_path / "products.csv"
    write_csv(path, "products", [{"code": "A-1", "name": "@Mug", "priceCents": 450, "stock": 3}])
    assert path.read_text().splitlines() == ["code,name,priceCents,stock", "A-1,'@Mug,450,3"]
