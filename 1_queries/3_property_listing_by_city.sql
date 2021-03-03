-- SELECT
--     properties.id,
--     owner_id,
--     title,
--     thumbnail_photo_url,
--     cover_photo_url,
--     cost_per_night,
--     parking_spaces,
--     number_of_bathrooms,
--     number_of_bedrooms,
--     country,
--     street,
--     city,
--     province,
--     active,
--     AVG(property_reviews.rating) as average_rating
-- FROM
--     properties
--     JOIN property_reviews ON property_id = properties.id
-- WHERE
--     city LIKE 'Vancouver'
-- GROUP BY
--     properties.id
-- HAVING
--     AVG(property_reviews.rating) >= 4
-- LIMIT
--     10;
SELECT
    properties.*,
    avg(property_reviews.rating) as average_rating
FROM
    properties
    JOIN property_reviews ON properties.id = property_id
WHERE
    city LIKE 'Vancouver'
GROUP BY
    properties.id
HAVING
    avg(property_reviews.rating) >= 4
ORDER BY
    cost_per_night
LIMIT
    10;