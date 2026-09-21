from __future__ import annotations

import argparse
import os
import random
import uuid
from datetime import datetime, timedelta, timezone
from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit

import psycopg
from faker import Faker

fake = Faker("pt_BR")
LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"]
CATEGORIES = ["GRAMMAR", "VOCABULARY", "LISTENING"]


def db_url() -> str:
    value = os.getenv("ANALYTICS_DATABASE_URL") or os.getenv("DATABASE_URL")
    if not value:
        raise RuntimeError("Defina ANALYTICS_DATABASE_URL ou DATABASE_URL.")

    parts = urlsplit(value)
    query = [(key, val) for key, val in parse_qsl(parts.query) if key != "schema"]
    return urlunsplit((parts.scheme, parts.netloc, parts.path, urlencode(query), parts.fragment))


def cefr(score: int) -> str:
    if score <= 20:
        return "A1"
    if score <= 40:
        return "A2"
    if score <= 60:
        return "B1"
    if score <= 80:
        return "B2"
    if score <= 95:
        return "C1"
    return "C2"


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--students", type=int, default=500)
    parser.add_argument("--teachers", type=int, default=20)
    parser.add_argument("--questions", type=int, default=120)
    parser.add_argument("--attempts", type=int, default=2000)
    parser.add_argument("--answers-per-attempt", type=int, default=18)
    args = parser.parse_args()

    source = "synthetic"
    batch = uuid.uuid4()
    now = datetime.now(timezone.utc)

    teacher_ids = [f"synthetic-teacher-{i}" for i in range(args.teachers)]
    user_ids = [f"synthetic-user-{i}" for i in range(args.students)]
    question_ids = [f"synthetic-question-{i}" for i in range(args.questions)]

    with psycopg.connect(db_url()) as conn:
        with conn.cursor() as cur:
            for tid in teacher_ids:
                cur.execute(
                    """
                    INSERT INTO raw.teachers
                    (teacher_id, name, email, is_active, source_updated_at, source_system, batch_id)
                    VALUES (%s,%s,%s,true,%s,%s,%s)
                    ON CONFLICT (teacher_id, source_system) DO NOTHING
                    """,
                    (tid, fake.name(), fake.unique.email(), now, source, batch),
                )

            for uid in user_ids:
                cur.execute(
                    """
                    INSERT INTO raw.users
                    (user_id, name, email, source_updated_at, source_system, batch_id)
                    VALUES (%s,%s,%s,%s,%s,%s)
                    ON CONFLICT (user_id, source_system) DO NOTHING
                    """,
                    (uid, fake.name(), fake.unique.email(), now, source, batch),
                )

            for i, qid in enumerate(question_ids):
                cur.execute(
                    """
                    INSERT INTO raw.questions
                    (question_id, prompt, category, level, is_active,
                     source_updated_at, source_system, batch_id)
                    VALUES (%s,%s,%s,%s,true,%s,%s,%s)
                    ON CONFLICT (question_id, source_system) DO NOTHING
                    """,
                    (
                        qid,
                        f"Questão sintética {i + 1}",
                        CATEGORIES[i % len(CATEGORIES)],
                        LEVELS[i % len(LEVELS)],
                        now,
                        source,
                        batch,
                    ),
                )

            for i in range(args.attempts):
                attempt_id = f"synthetic-attempt-{uuid.uuid4()}"
                user_id = random.choice(user_ids)
                teacher_id = random.choice(teacher_ids)
                created = now - timedelta(
                    days=random.randint(0, 730),
                    minutes=random.randint(0, 1440),
                )
                completed = created + timedelta(minutes=random.randint(8, 45))

                selected_questions = random.sample(
                    question_ids,
                    k=min(args.answers_per_attempt, len(question_ids)),
                )
                correct = 0
                answer_rows = []
                for qid in selected_questions:
                    is_correct = random.random() < random.uniform(0.35, 0.9)
                    correct += int(is_correct)
                    q_index = int(qid.rsplit("-", 1)[1])
                    answer_rows.append(
                        (
                            f"synthetic-answer-{uuid.uuid4()}",
                            attempt_id,
                            qid,
                            "A",
                            is_correct,
                            CATEGORIES[q_index % len(CATEGORIES)],
                            LEVELS[q_index % len(LEVELS)],
                            completed,
                            completed,
                            source,
                            batch,
                        )
                    )

                total = len(selected_questions)
                score = round(100 * correct / total) if total else 0
                cur.execute(
                    """
                    INSERT INTO raw.test_attempts (
                        attempt_id, user_id, teacher_id, student_name, student_email,
                        language, status, total_questions, score, cefr_level,
                        created_at, completed_at, source_updated_at, source_system, batch_id
                    )
                    VALUES (%s,%s,%s,%s,NULL,'ES','COMPLETED',%s,%s,%s,%s,%s,%s,%s,%s)
                    ON CONFLICT (attempt_id, source_system) DO NOTHING
                    """,
                    (
                        attempt_id, user_id, teacher_id, None, total, score, cefr(score),
                        created, completed, completed, source, batch,
                    ),
                )
                cur.executemany(
                    """
                    INSERT INTO raw.attempt_answers (
                        answer_id, attempt_id, question_id, selected_answer,
                        is_correct, category, question_level, created_at,
                        source_updated_at, source_system, batch_id
                    )
                    VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
                    ON CONFLICT (answer_id, source_system) DO NOTHING
                    """,
                    answer_rows,
                )

                if (i + 1) % 500 == 0:
                    conn.commit()
                    print(f"{i + 1} tentativas sintéticas geradas...")

        conn.commit()

    print(
        f"Concluído: {args.students} alunos, {args.teachers} professores, "
        f"{args.questions} questões e {args.attempts} tentativas sintéticas."
    )


if __name__ == "__main__":
    main()
