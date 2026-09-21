select
  q.question_key,
  q.question_id,
  q.prompt,
  q.category,
  q.cefr_level,
  count(a.answer_id)::bigint as total_answers,
  count(*) filter (where a.is_correct)::bigint as correct_answers,
  count(*) filter (where not a.is_correct)::bigint as incorrect_answers,
  case
    when count(a.answer_id) = 0 then null
    else round(count(*) filter (where a.is_correct)::numeric / count(a.answer_id)::numeric * 100, 2)
  end as accuracy_rate
from {{ ref('dim_question') }} q
left join {{ ref('fact_answer') }} a on a.question_key = q.question_key
group by 1,2,3,4,5
