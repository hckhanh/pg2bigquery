SELECT
  id,
  name,
  date_part('day'::text, created_at) AS year,
  CASE
    WHEN date_part('month', created_at) < 10
    THEN concat('0', date_part('month', created_at))
    ELSE date_part('month', created_at)
  END AS month
FROM products
WHERE
  created_at > (('now'::text)::date - 30)
  and created_at <= ('now'::text::date-180);
