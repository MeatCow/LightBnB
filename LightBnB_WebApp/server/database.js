const { Pool } = require('pg');
const properties = require('./json/properties.json');
const users = require('./json/users.json');

const pool = new Pool({
  user: 'labber',
  password: 'labber',
  host: 'localhost',
  database: 'lightbnb'
});

/// Users

/**
 * Get a single user from the database given their email.
 * @param {String} email The email of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithEmail = function(email) {
  return new Promise((resolve, reject) => {
    pool.query(`
    SELECT *
    FROM users
    WHERE LOWER(email) = LOWER($1)
    LIMIT 1;
    `, [email])
      .then(user => {
        if (!user) {
          return resolve(null);
        }
        resolve(user.rows[0]);
      })
      .catch(error => {
        reject(error);
      });
  });
};
exports.getUserWithEmail = getUserWithEmail;

/**
 * Get a single user from the database given their id.
 * @param {string} id The id of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithId = function(id) {
  return new Promise((resolve, reject) => {
    pool.query(`
    SELECT *
    FROM users
    WHERE id = $1
    LIMIT 1;
    `, [id])
      .then(user => {
        if (!user) {
          return resolve(null);
        }
        resolve(user.rows[0]);
      })
      .catch(error => {
        reject(error);
      });
  });
};
exports.getUserWithId = getUserWithId;


/**
 * Add a new user to the database.
 * @param {{name: string, password: string, email: string}} user
 * @return {Promise<{}>} A promise to the user.
 */
const addUser = function(user) {
  return new Promise((resolve, reject) => {
    if (!user.email || !user.name || !user.password) {
      reject('Missing user information');
    }
    pool.query(`
    INSERT INTO users(name, email, password)
    VALUES ($1, $2, $3)
    RETURNING *;
    `, [user.name, user.email, user.password])
      .then(user => {
        if (!user) {
          return resolve(null);
        }
        resolve(user.rows[0]);
      })
      .catch(error => {
        if (error.code === "23505") {
          return reject('User with this email already exists');
        }
        reject(error);
      });
  });
};
exports.addUser = addUser;

/// Reservations

/**
 * Get all reservations for a single user.
 * @param {string} guestId The id of the user.
 * @return {Promise<[{}]>} A promise to the reservations.
 */
const getAllReservations = function(guestId, limit = 10) {
  return new Promise((resolve, reject) => {
    pool.query(`
    SELECT *
    FROM reservations
    JOIN properties on reservations.properties.id = properties_id
    WHERE guest_id = $1
    LIMIT $2;
    `, [guestId, limit])
      .then(reservations => {
        resolve(reservations.rows);
      })
      .catch(error => reject(error));
  });
};
exports.getAllReservations = getAllReservations;

/// Properties

/**
 * Get all properties.
 * @param {{}} options An object containing query options.
 * @param {*} limit The number of results to return.
 * @return {Promise<[{}]>}  A promise to the properties.
 */
const getAllProperties = function(options, limit = 10) {
  let queryParams = [];
  let queryString = `
  SELECT properties.*,
    AVG(property_reviews.rating) as average_rating
  FROM properties
  LEFT JOIN property_reviews ON properties.id = property_id `;

  let nextJoin = 'WHERE';

  if (options.city) {
    queryParams.push(`%${options.city}%`);
    queryString += `${nextJoin} city ILIKE $${queryParams.length} `;
    nextJoin = 'AND';
  }

  if (options.owner_id) {
    queryParams.push(`${options.owner_id}`);
    queryString += `${nextJoin} owner_id = $${queryParams.length} `;
    nextJoin = 'AND';
  }

  if (options.minimum_price_per_night) {
    queryParams.push(`${options.minimum_price_per_night}`);
    queryString += `${nextJoin} cost_per_night/100 >= $${queryParams.length} `;
    nextJoin = 'AND';
  }

  if (options.maximum_price_per_night) {
    queryParams.push(`${options.maximum_price_per_night}`);
    queryString += `${nextJoin} cost_per_night/100 <= $${queryParams.length} `;
    nextJoin = 'AND';
  }

  queryString += `
  GROUP BY properties.id
  `;

  if (options.minimum_rating) {
    queryParams.push(`${options.minimum_rating}`);
    queryString += `HAVING AVG(property_reviews.rating) >= $${queryParams.length} `;
  }

  queryParams.push(limit);
  queryString += `
  ORDER BY cost_per_night
  LIMIT $${queryParams.length};
  `;

  return new Promise((resolve, reject) => {
    pool.query(queryString, queryParams)
      .then(data => {
        resolve(data.rows);
      })
      .catch(err => {
        reject(err);
      });
  });
};
exports.getAllProperties = getAllProperties;


/**
 * Add a property to the database
 * @param {{}} property An object containing all of the property details.
 * @return {Promise<{}>} A promise to the property.
 */
const addProperty = function(property) {
  const queryParams = [...Object.values(property)];
  const queryString = `
  INSERT INTO properties(title, description, number_of_bedrooms, number_of_bathrooms, parking_spaces, cost_per_night, thumbnail_photo_url,
    cover_photo_url, street, country, city, province, post_code, owner_id)
  VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
  RETURNING *;
  `;

  return new Promise((resolve, reject) => {
    pool.query(queryString, queryParams)
      .then(data => {
        resolve(data.rows);
      })
      .catch(err => {
        reject(err);
      });
  });
};
exports.addProperty = addProperty;
