select
  payload ->> 'id' as attempt_id,
  payload ->> 'sessionId' as session_id,
  nullif(payload ->> 'userId', '') as user_id,
  nullif(payload ->> 'teacherId', '') as teacher_id,
  nullif(payload ->> 'studentName', '') as student_name,
  lower(nullif(payload ->> 'studentEmail', '')) as student_email,
  coalesce(nullif(payload ->> 'language', ''), 'ES') as language,
  payload ->> 'status' as status,
  (payload ->> 'totalQuestions')::integer as total_questions,
  payload -> 'questionIds' as question_ids,
  nullif(payload ->> 'score', '')::integer as score,
  nullif(payload ->> 'cefrLevel', '') as cefr_level,
  payload -> 'breakdown' as breakdown,
  (payload ->> 'createdAt')::timestamptz as created_at,
  (payload ->> 'updatedAt')::timestamptz as updated_at,
  nullif(payload ->> 'completedAt', '')::timestamptz as completed_at,
  source_updated_at,
  ingested_at,
  source_system
from {{ source('raw', 'test_attempts') }}
where source_system = '{{ var("analytics_source_system", "idiomas_pro:public") }}'
