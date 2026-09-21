from datetime import datetime

from airflow import DAG
from airflow.operators.bash import BashOperator

PROJECT_DIR = "/opt/airflow/idiomas-pro"

with DAG(
    dag_id="idiomas_pro_analytics",
    description="Pipeline analítico incremental do projeto Idiomas Pro",
    start_date=datetime(2026, 9, 1),
    schedule="0 1 * * *",
    catchup=False,
    tags=["study", "postgresql", "data-engineering"],
) as dag:
    init = BashOperator(
        task_id="init_analytics",
        bash_command=f"cd {PROJECT_DIR} && python data-engineering/pipeline.py init",
    )

    extract = BashOperator(
        task_id="extract_incremental",
        bash_command=f"cd {PROJECT_DIR} && python data-engineering/pipeline.py extract",
    )

    transform = BashOperator(
        task_id="transform_warehouse",
        bash_command=f"cd {PROJECT_DIR} && python data-engineering/pipeline.py transform",
    )

    quality = BashOperator(
        task_id="data_quality",
        bash_command=f"cd {PROJECT_DIR} && python data-engineering/pipeline.py quality",
    )

    init >> extract >> transform >> quality
