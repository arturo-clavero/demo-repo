from contextlib import contextmanager
from datetime import date
from typing import Iterator

import pymysql
import pymysql.cursors


@contextmanager
def connect(settings: dict) -> Iterator[pymysql.connections.Connection]:
    conn = pymysql.connect(cursorclass=pymysql.cursors.DictCursor, autocommit=False, **settings)
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


def orders_between(conn, start: date, end: date) -> list[dict]:
    with conn.cursor() as cur:
        cur.execute(
            "SELECT o.id, o.status, o.totalCents, o.createdAt, u.email "
            "FROM Orders o JOIN Users u ON u.id = o.userId "
            "WHERE o.createdAt >= %s AND o.createdAt < %s ORDER BY o.id",
            (start, end),
        )
        return list(cur.fetchall())


def products(conn) -> list[dict]:
    with conn.cursor() as cur:
        cur.execute("SELECT code, name, priceCents, stock FROM Products WHERE active = %s ORDER BY code", (True,))
        return list(cur.fetchall())


def customers(conn, email_domain: str | None = None) -> list[dict]:
    """Customer list for the marketing export, optionally one email domain only."""
    domain_filter = f"AND email LIKE '%@{email_domain}'" if email_domain else ""
    with conn.cursor() as cur:
        cur.execute(f"SELECT id, name, email, createdAt FROM Users WHERE role = 'customer' {domain_filter} ORDER BY id")
        return list(cur.fetchall())


def upsert_products(conn, rows: list[dict]) -> int:
    with conn.cursor() as cur:
        cur.executemany(
            "INSERT INTO Products (code, name, priceCents, stock, active, createdAt, updatedAt) "
            "VALUES (%(code)s, %(name)s, %(priceCents)s, %(stock)s, 1, NOW(), NOW()) "
            "ON DUPLICATE KEY UPDATE name = VALUES(name), priceCents = VALUES(priceCents), stock = VALUES(stock)",
            rows,
        )
        return cur.rowcount
