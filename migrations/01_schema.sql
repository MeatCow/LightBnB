DROP TABLE IF EXISTS users CASCADE;

DROP TABLE IF EXISTS properties CASCADE;

DROP TABLE IF EXISTS reservations CASCADE;

DROP TABLE IF EXISTS property_reviews CASCADE;

CREATE TABLE users(
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  "password" VARCHAR(255) NOT NULL
);

CREATE TABLE properties(
  id SERIAL PRIMARY KEY,
  owner_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  thumbnail_photo_url VARCHAR(255) NOT NULL,
  cover_photo_url VARCHAR(255) NOT NULL,
  cost_per_night INTEGER NOT NULL DEFAULT 0,
  parking_spaces INTEGER NOT NULL DEFAULT 0,
  number_of_bathrooms INTEGER NOT NULL DEFAULT 0,
  number_of_bedrooms INTEGER NOT NULL DEFAULT 0,
  country VARCHAR(255) NOT NULL,
  street VARCHAR(255) NOT NULL,
  city VARCHAR(255) NOT NULL,
  province VARCHAR(255) NOT NULL,
  post_code VARCHAR(255) NOT NULL,
  active boolean NOT NULL DEFAULT TRUE
);

CREATE TABLE reservations(
  id serial PRIMARY KEY,
  property_id INTEGER REFERENCES properties(id) ON DELETE CASCADE,
  guest_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL
);

CREATE TABLE property_reviews(
  id serial PRIMARY KEY,
  guest_id integer REFERENCES users(id) ON DELETE CASCADE,
  property_id integer REFERENCES properties(id) ON DELETE CASCADE,
  reservation_id integer REFERENCES reservations(id) ON DELETE CASCADE,
  rating SMALLINT NOT NULL DEFAULT 0,
  message TEXT
);