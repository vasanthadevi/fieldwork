"""Run gold SQL against Chinook through the read-only role."""

import os
from decimal import Decimal

import psycopg
from dotenv import load_dotenv

load_dotenv()


def _clean(value):
    return float(value) if isinstance(value, Decimal) else value


def run_gold(sql: str) -> dict:
    with psycopg.connect(os.environ["READONLY_DATABASE_URL"]) as conn:
        cur = conn.execute(sql)
        return {
            "columns": [d.name for d in cur.description],
            "rows": [[_clean(v) for v in row] for row in cur.fetchall()],
        }
