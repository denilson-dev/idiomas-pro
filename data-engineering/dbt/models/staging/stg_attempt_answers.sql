select
  payload ->> 'id' as answer_id,
  payload ->> 'attemptId' as attempt_id,
  payload ->> 'questionId' as question_id,
  payload ->> 'selectedAnswer' as selected_answer,
  (payload ->> 'isCorrect')::boolean as is_correct,
  payload ->> 'category' as category,
  payload ->> 'questionLevel' as question_level,
  (payload ->> 'createdAt')::timestamptz as created_at,
  source_updated_at,
  ingested_at,
  source_system
from {{ source('raw', 'attempt_answers') }}
where source_system = '{{ var("analytics_source_system", "idiomas_pro:public") }}'
