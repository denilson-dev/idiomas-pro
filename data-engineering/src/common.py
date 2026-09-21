from __future__ import annotations

import os
import re
from pathlib import Path

import psycopg
from dotenv import load_dotenv

ROOT = Path(__file__).resolve().parents[1]
load_dotenv(ROOT / ".env")
load_dotenv()

_IDENTIFIER = re.compile(r"^[A-Za-z_][A-Za-z0-9_]*$")


def database_url() -> str:
    dsn = os.getenv("DATA_DATABASE_URL") or os.getenv("DATABASE_URL")
    if not dsn:
        raise RuntimeError("Defina DATA_DATABASE_URL ou DATABASE_URL.")
    return dsn


def connect(*, autocommit: bool = False):
    return psycopg.connect(database_url(), autocommit=autocommit)


def safe_identifier(value: str) -> str:
    if not _IDENTIFIER.fullmatch(value):
        raise ValueError(f"Identificador SQL inválido: {value!r}")
    return value


def run_sql_file(path: Path) -> None:
    sql_text = path.read_text(encoding="utf-8")
    with connect(autocommit=True) as conn:
        conn.execute(sql_text)
