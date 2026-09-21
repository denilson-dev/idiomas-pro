from pathlib import Path

from common import run_sql_file

BASE_DIR = Path(__file__).resolve().parents[1]

if __name__ == "__main__":
    run_sql_file(BASE_DIR / "sql" / "00_bootstrap.sql")
    print("Schemas e tabelas de controle criados/validados com sucesso.")
