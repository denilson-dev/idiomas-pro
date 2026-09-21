{{ config(materialized='table') }}
select md5('ES') as language_key, 'ES' as language_code, 'Espanhol' as language_name
union all select md5('EN'), 'EN', 'Inglês'
union all select md5('FR'), 'FR', 'Francês'
