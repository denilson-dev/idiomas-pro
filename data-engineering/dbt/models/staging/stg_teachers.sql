select
  payload ->> 'id' as teacher_id,
  nullif(payload ->> 'name', '') as teacher_name,
  lower(nullif(payload ->> 'email', '')) as email,
  coalesce((payload ->> 'isActive')::boolean, true) as is_active,
  (payload ->> 'createdAt')::timestamptz as created_at,
  (payload ->> 'updatedAt')::timestamptz as updated_at,
  source_updated_at,
  ingested_at,
  source_system
from {{ source('raw', 'teachers') }}
