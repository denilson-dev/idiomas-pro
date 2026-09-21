from __future__ import annotations

import argparse
import random
import uuid
from datetime import datetime, timedelta, timezone

from faker import Faker
from psycopg.types.json import Jsonb

from common import connect

fake = Faker("pt_BR")
LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"]
CATEGORIES = ["GRAMMAR", "VOCABULARY", "LISTENING"]


DDL = """
CREATE SCHEMA IF NOT EXISTS synthetic;

DROP TABLE IF EXISTS synthetic."AttemptAnswer";
DROP TABLE IF EXISTS synthetic."TestAttempt";
DROP TABLE IF EXISTS synthetic."Question";
DROP TABLE IF EXISTS synthetic."Teacher";
DROP TABLE IF EXISTS synthetic."User";

CREATE TABLE synthetic."User" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL,
  "updatedAt" TIMESTAMPTZ NOT NULL
);

CREATE TABLE synthetic."Teacher" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "isActive" BOOLEAN NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL,
  "updatedAt" TIMESTAMPTZ NOT NULL
);

CREATE TABLE synthetic."Question" (
  "id" TEXT PRIMARY KEY,
  "prompt" TEXT NOT NULL,
  "options" JSONB NOT NULL,
  "correctAnswer" TEXT NOT NULL,
  "explanation" TEXT,
  "category" TEXT NOT NULL,
  "level" TEXT NOT NULL,
  "mediaType" TEXT,
  "mediaUrl" TEXT,
  "isActive" BOOLEAN NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL,
  "updatedAt" TIMESTAMPTZ NOT NULL
);

CREATE TABLE synthetic."TestAttempt" (
  "id" TEXT PRIMARY KEY,
  "sessionId" TEXT NOT NULL,
  "userId" TEXT,
  "teacherId" TEXT,
  "studentName" TEXT,
  "studentEmail" TEXT,
  "language" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "totalQuestions" INTEGER NOT NULL,
  "questionIds" JSONB NOT NULL,
  "score" INTEGER,
  "cefrLevel" TEXT,
  "breakdown" JSONB,
  "createdAt" TIMESTAMPTZ NOT NULL,
  "updatedAt" TIMESTAMPTZ NOT NULL,
  "completedAt" TIMESTAMPTZ
);

CREATE TABLE synthetic."AttemptAnswer" (
  "id" TEXT PRIMARY KEY,
  "attemptId" TEXT NOT NULL,
  "questionId" TEXT NOT NULL,
  "selectedAnswer" TEXT NOT NULL,
  "isCorrect" BOOLEAN NOT NULL,
  "category" TEXT NOT NULL,
  "questionLevel" TEXT NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL
);
"""


def cefr_from_score(score: int) -> str:
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


def parse_args():
    parser = argparse.ArgumentParser(description="Gera dados sintéticos para estudos de Engenharia de Dados.")
    parser.add_argument("--students", type=int, default=500)
    parser.add_argument("--teachers", type=int, default=20)
    parser.add_argument("--questions", type=int, default=120)
    parser.add_argument("--attempts", type=int, default=5000)
    parser.add_argument("--answers-per-attempt", type=int, default=18)
    parser.add_argument("--days", type=int, default=365)
    return parser.parse_args()


def main():
    args = parse_args()
    now = datetime.now(timezone.utc)
    start = now - timedelta(days=args.days)

    with connect() as conn:
        conn.execute(DDL)

        students = []
        for _ in range(args.students):
            sid = str(uuid.uuid4())
            created = fake.date_time_between(start_date=start, end_date=now, tzinfo=timezone.utc)
            students.append((sid, fake.name(), fake.unique.email(), created, created))
        conn.executemany(
            'INSERT INTO synthetic."User" ("id","name","email","createdAt","updatedAt") VALUES (%s,%s,%s,%s,%s)',
            students,
        )

        teachers = []
        for _ in range(args.teachers):
            tid = str(uuid.uuid4())
            created = fake.date_time_between(start_date=start, end_date=now, tzinfo=timezone.utc)
            teachers.append((tid, fake.name(), fake.unique.email(), True, created, created))
        conn.executemany(
            'INSERT INTO synthetic."Teacher" ("id","name","email","isActive","createdAt","updatedAt") VALUES (%s,%s,%s,%s,%s,%s)',
            teachers,
        )

        questions = []
        for idx in range(args.questions):
            qid = str(uuid.uuid4())
            category = CATEGORIES[idx % len(CATEGORIES)]
            level = LEVELS[(idx // len(CATEGORIES)) % len(LEVELS)]
            created = start
            questions.append(
                (
                    qid,
                    f"Questão sintética {idx + 1}",
                    Jsonb(["A", "B", "C", "D"]),
                    "A",
                    "Registro sintético para testes.",
                    category,
                    level,
                    "AUDIO" if category == "LISTENING" else None,
                    None,
                    True,
                    created,
                    created,
                )
            )
        conn.executemany(
            """
            INSERT INTO synthetic."Question"
            ("id","prompt","options","correctAnswer","explanation","category","level","mediaType","mediaUrl","isActive","createdAt","updatedAt")
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
            """,
            questions,
        )

        student_rows = students
        teacher_ids = [row[0] for row in teachers]
        question_rows = questions

        for batch_start in range(0, args.attempts, 500):
            attempts = []
            answers = []
            for _ in range(batch_start, min(batch_start + 500, args.attempts)):
                attempt_id = str(uuid.uuid4())
                student = random.choice(student_rows)
                teacher_id = random.choice(teacher_ids)
                completed = fake.date_time_between(start_date=start, end_date=now, tzinfo=timezone.utc)
                created = completed - timedelta(minutes=random.randint(5, 45))
                score = max(0, min(100, int(random.gauss(65, 20))))
                level = cefr_from_score(score)
                selected_questions = random.sample(
                    question_rows,
                    k=min(args.answers_per_attempt, len(question_rows)),
                )
                question_ids = [row[0] for row in selected_questions]

                attempts.append(
                    (
                        attempt_id,
                        str(uuid.uuid4()),
                        student[0],
                        teacher_id,
                        student[1],
                        student[2],
                        "ES",
                        "COMPLETED",
                        len(selected_questions),
                        Jsonb(question_ids),
                        score,
                        level,
                        Jsonb({"synthetic": True}),
                        created,
                        completed,
                        completed,
                    )
                )

                target_correct = round(len(selected_questions) * score / 100)
                for index, question in enumerate(selected_questions):
                    correct = index < target_correct
                    answers.append(
                        (
                            str(uuid.uuid4()),
                            attempt_id,
                            question[0],
                            "A" if correct else random.choice(["B", "C", "D"]),
                            correct,
                            question[5],
                            question[6],
                            completed,
                        )
                    )

            conn.executemany(
                """
                INSERT INTO synthetic."TestAttempt"
                ("id","sessionId","userId","teacherId","studentName","studentEmail","language","status","totalQuestions","questionIds","score","cefrLevel","breakdown","createdAt","updatedAt","completedAt")
                VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
                """,
                attempts,
            )
            conn.executemany(
                """
                INSERT INTO synthetic."AttemptAnswer"
                ("id","attemptId","questionId","selectedAnswer","isCorrect","category","questionLevel","createdAt")
                VALUES (%s,%s,%s,%s,%s,%s,%s,%s)
                """,
                answers,
            )
            conn.commit()
            print(f"Tentativas geradas: {min(batch_start + 500, args.attempts)}/{args.attempts}")

    print("Dados sintéticos criados no schema synthetic.")
    print("Use SOURCE_SCHEMA=synthetic para executar o pipeline sobre esse conjunto.")


if __name__ == "__main__":
    main()
