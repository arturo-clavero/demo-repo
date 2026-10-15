import pytest

from shopfloor_worker.errors import ImportFailed
from shopfloor_worker.imports import clean_row, from_csv, parse_upload, to_cents


def test_to_cents_parses_amounts():
    assert to_cents("12") == 1200
    assert to_cents("12.5") == 1250
    assert to_cents(" 0.07 ") == 7


def test_to_cents_rejects_junk():
    for bad in ["1e3", "-4", "12.345", ""]:
        with pytest.raises(ImportFailed):
            to_cents(bad)


def test_from_csv_reads_a_catalogue():
    data = "code,name,price,stock\nmug-1,Mug,4.50,10\nTEA-2,Green tea,3,0\n".encode()
    assert from_csv(data) == [
        {"code": "MUG-1", "name": "Mug", "priceCents": 450, "stock": 10},
        {"code": "TEA-2", "name": "Green tea", "priceCents": 300, "stock": 0},
    ]


def test_from_csv_reports_the_bad_line():
    data = b"code,name,price,stock\nOK-1,Fine,1,1\n,Missing code,1,1\n"
    with pytest.raises(ImportFailed, match="line 3"):
        from_csv(data)


def test_clean_row_rejects_a_bad_stock():
    with pytest.raises(ImportFailed, match="whole number"):
        clean_row({"code": "AB-1", "name": "x", "price": "1", "stock": "many"}, 2)


def test_parse_upload_refuses_other_types():
    with pytest.raises(ImportFailed):
        parse_upload("catalogue.xlsx", b"")
