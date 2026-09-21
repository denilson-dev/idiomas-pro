{{ config(materialized='table') }}
select md5('A1') as cefr_key, 'A1' as cefr_level, 1 as level_order, 0 as min_score, 20 as max_score
union all select md5('A2'), 'A2', 2, 21, 40
union all select md5('B1'), 'B1', 3, 41, 60
union all select md5('B2'), 'B2', 4, 61, 80
union all select md5('C1'), 'C1', 5, 81, 95
union all select md5('C2'), 'C2', 6, 96, 100
