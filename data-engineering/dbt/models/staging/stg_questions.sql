select
  payload ->> 'id' as question_id,
  payload ->> 'prompt' as prompt,
  payload -> 'options' as options,
  payload ->> 'correctAnswer' as correct_answer,
  payload ->> 'explanation' as explanation,
  payload ->> 'category' as category,
  payload ->> 'level' as cefr_level,
  payload ->> 'mediaType' as media_type,
  payload ->> 'mediaUrl' as media_url,
  coalesce((payload ->> 'isActive')::boolean, true) as is_active,
  (payload ->> 'createdAt')::timestamptz as created_at,
  (payload ->> 'updatedAt')::timestamptz as updated_at,
  source_updated_at,
  ingested_at,
  source_system
from {{ source('raw', 'questions') }}
where source_system = '{{ var("analytics_source_system", "idiomas_pro:public") }}'
