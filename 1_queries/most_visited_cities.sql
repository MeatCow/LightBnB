SELECT city,
  COUNT(*) AS total_reservations
FROM reservations
  LEFT JOIN properties ON property_id = properties.id
GROUP BY city
ORDER BY total_reservations DESC;