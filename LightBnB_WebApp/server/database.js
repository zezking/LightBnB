const properties = require("./json/properties.json");
const { Pool } = require("pg");
const users = require("./json/users.json");

/// Users
const pool = new Pool({
  user: "vagrant",
  port: 5432,
  password: "123",
  host: "localhost",
  database: "lightbnb",
});

/**
 * Get a single user from the database given their email.
 * @param {String} email The email of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithEmail = function (email) {
  // let user;
  return pool
    .query("SELECT * FROM users WHERE email= $1", [email])
    .then((data) => data.rows[0])
    .catch((err) => {
      return null;
    });
};
exports.getUserWithEmail = getUserWithEmail;

/**
 * Get a single user from the database given their id.
 * @param {string} id The id of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithId = function (id) {
  return pool
    .query("SELECT * FROM users WHERE users.id= $1", [id])
    .then((data) => data.rows[0])
    .catch((err) => {
      return null;
    });
};
exports.getUserWithId = getUserWithId;

/**
 * Add a new user to the database.
 * @param {{name: string, password: string, email: string}} user
 * @return {Promise<{}>} A promise to the user.
 */
const addUser = function (user) {
  // return pool.query('INSERT')
  console.log(user);
  return pool
    .query("INSERT INTO users (name, email, password) VALUES ($1, $2, $3);", [
      user.name,
      user.email,
      user.password,
    ])
    .then((data) => data.rows)
    .catch((err) => console.log(err));
};
exports.addUser = addUser;

/// Reservations

/**
 * Get all reservations for a single user.
 * @param {string} guest_id The id of the user.
 * @return {Promise<[{}]>} A promise to the reservations.
 */
const getAllReservations = function (guest_id, limit = 10) {
  return pool
    .query(
      "SELECT properties.*, reservations.*, avg(rating) as average_rating FROM reservations JOIN properties ON reservations.property_id = properties.id JOIN property_reviews ON properties.id = property_reviews.property_id WHERE reservations.guest_id = $1 AND reservations.end_date < now()::date GROUP BY properties.id, reservations.id ORDER BY reservations.start_date LIMIT $2;",
      [guest_id, limit]
    )
    .then((data) => data.rows);
};
exports.getAllReservations = getAllReservations;

/// Properties

/**
 * Get all properties.
 * @param {{}} options An object containing query options.
 * @param {*} limit The number of results to return.
 * @return {Promise<[{}]>}  A promise to the properties.
 */
const getAllProperties = (options, limit = 10) => {
  const queryParams = [];
  let queryString = `
  SELECT properties.*, AVG(property_reviews.rating) as average_rating
  FROM properties
  LEFT JOIN property_reviews ON properties.id = property_id
  `;

  if (options.city) {
    queryParams.push(`%${options.city}%`);
    queryString += `WHERE city LIKE $${queryParams.length} `;
  }
  if (options.owner_id) {
    queryParams.push(options.owner_id);
    queryString += `WHERE properties.owner_id = $${queryParams.length} `;
  }
  if (options.minimum_price_per_night) {
    queryParams.push(options.minimum_price_per_night * 100);
    queryString += `AND properties.cost_per_night >= $${queryParams.length} `;
  }
  if (options.maximum_price_per_night) {
    queryParams.push(options.maximum_price_per_night * 100);
    queryString += `AND properties.cost_per_night <= $${queryParams.length} `;
  }
  queryString += "GROUP BY properties.id";

  if (options.minimum_rating) {
    queryParams.push(options.minimum_rating * 1);
    queryString += ` HAVING AVG(property_reviews.rating) >= $${queryParams.length} `;
  }

  queryParams.push(limit);
  queryString += `
  ORDER BY cost_per_night
  LIMIT $${queryParams.length};
  `;

  return pool
    .query(queryString, queryParams)
    .then((data) => data.rows)
    .catch((err) => {
      console.log(err);
    });
};
exports.getAllProperties = getAllProperties;
/**
 * Add a property to the database
 * @param {{}} property An object containing all of the property details.
 * @return {Promise<{}>} A promise to the property.
 */
const addProperty = function (property) {
  let queryVariable = "";
  let queryColumn = "";
  let queryParams = [];
  for (const i in property) {
    if (property[i]) {
      queryParams.push(property[i]); //push all the key values into parameters array
      queryColumn += `${i}, `; //push all the keys as columns for insert into
    }
  }

  //initialize all the $ variables based on the legnth of parameters
  for (let i = 0; i < queryParams.length; i++) {
    queryVariable += `$${i + 1}, `;
  }

  queryColumn = queryColumn.slice(0, -2);
  queryVariable = queryVariable.slice(0, -2);

  let queryString = `INSERT INTO properties(${queryColumn}) VALUES (${queryVariable}) RETURNING *;`;

  return pool
    .query(queryString, queryParams)
    .then((data) => data.rows)
    .catch((err) => console.log(err));
};
exports.addProperty = addProperty;
