select
  payload ->> 'id' as user_id,
  nullif(payload ->> 'name', '') as user_name,
  lower(nullif(payload ->> 'email', '')) as email,
  (payload ->> 'createdAt')::timestamptz as created_at,
  (payload ->> 'updatedAt')::timestamptz as updated_at,
  source_updated_at,
  ingested_at,
  source_system
from {{ source('raw', 'users') }}
