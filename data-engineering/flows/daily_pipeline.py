from __future__ import annotations

import os
import subprocess
import sys
from pathlib import Path

from prefect import flow, task

ROOT = Path(__file__).resolve().parents[2]
DBT_DIR = ROOT / "data-engineering" / "dbt"


def run(command: list[str]) -> None:
    subprocess.run(command, cwd=ROOT, check=True)


def dbt_vars() -> str:
    source_schema = os.getenv("SOURCE_SCHEMA", "public")
    return '{"analytics_source_system": "idiomas_pro:' + source_schema + '"}'


@task
def bootstrap():
    run([sys.executable, "data-engineering/src/bootstrap.py"])


@task
def ingest():
    run([sys.executable, "data-engineering/src/ingest.py"])


@task
def dbt_staging():
    run([
        "dbt", "run",
        "--select", "path:models/staging",
        "--vars", dbt_vars(),
        "--project-dir", str(DBT_DIR),
        "--profiles-dir", str(DBT_DIR),
    ])


@task
def dbt_snapshot():
    run([
        "dbt", "snapshot",
        "--vars", dbt_vars(),
        "--project-dir", str(DBT_DIR),
        "--profiles-dir", str(DBT_DIR),
    ])


@task
def dbt_build():
    run([
        "dbt", "build",
        "--vars", dbt_vars(),
        "--project-dir", str(DBT_DIR),
        "--profiles-dir", str(DBT_DIR),
    ])


@task
def quality():
    run([sys.executable, "data-engineering/src/quality.py"])


@task
def materialized_views():
    run([sys.executable, "data-engineering/src/materialized_views.py"])


@flow(name="idiomas-pro-data-pipeline", log_prints=True)
def daily_pipeline():
    bootstrap()
    ingest()
    dbt_staging()
    dbt_snapshot()
    dbt_build()
    quality()
    materialized_views()


if __name__ == "__main__":
    daily_pipeline()
