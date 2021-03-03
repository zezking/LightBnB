SELECT
    reservations.*,
    properties.*,
    AVG(property_reviews.rating) as average_rating
FROM
    properties
    JOIN reservations ON properties.owner_id = reservations.guest_id
    JOIN property_reviews ON property_reviews.guest_id = properties.owner_id
WHERE
    properties.owner_id = 1
    AND reservations.end_date < now() :: date
GROUP BY
    reservations.id,
    properties.id
ORDER BY
    reservations.start_date
LIMIT
    10;