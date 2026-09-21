select
    attempt_id,
    user_id,
    teacher_id,
    nullif(trim(student_name), '') as student_name,
    md5(lower(trim(coalesce(student_email, '')))) as student_email_hash,
    upper(coalesce(language, 'ES')) as language,
    upper(status) as status,
    total_questions,
    score,
    upper(cefr_level) as cefr_level,
    created_at,
    completed_at,
    source_system
from {{ source('raw', 'test_attempts') }}
