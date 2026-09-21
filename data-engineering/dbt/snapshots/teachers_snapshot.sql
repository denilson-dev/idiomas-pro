{% snapshot teachers_snapshot %}
{{
  config(
    target_schema='warehouse',
    unique_key='teacher_id',
    strategy='timestamp',
    updated_at='updated_at'
  )
}}
select
  teacher_id,
  teacher_name,
  email,
  is_active,
  created_at,
  updated_at
from {{ ref('stg_teachers') }}
{% endsnapshot %}
