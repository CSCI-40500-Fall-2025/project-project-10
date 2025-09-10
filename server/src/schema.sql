-- Companies
CREATE TABLE IF NOT EXISTS companies (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  domain TEXT
);

-- Users (no real auth for MVP)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  age INT,
  gender TEXT,
  employer TEXT,
  company_id INT REFERENCES companies(id),
  passcode TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Housing areas (neighborhoods or target areas)
CREATE TABLE IF NOT EXISTS areas (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION
);

-- Listings
CREATE TABLE IF NOT EXISTS listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  city TEXT NOT NULL,
  area_id INT REFERENCES areas(id),
  price INT NOT NULL,
  bedrooms INT NOT NULL,
  bathrooms INT NOT NULL,
  available_from DATE NOT NULL,
  image_url TEXT,
  sqft INT,
  furnished BOOLEAN DEFAULT FALSE,
  pets_allowed BOOLEAN DEFAULT FALSE,
  description TEXT,
  owner_user_id UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Preferences (optional for future matching)
CREATE TABLE IF NOT EXISTS preferences (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  target_city TEXT,
  budget_min INT,
  budget_max INT,
  lease_term_months INT,
  move_in_earliest DATE,
  move_in_latest DATE,
  roommates_min INT,
  roommates_max INT,
  coed_ok BOOLEAN,
  pets_ok BOOLEAN,
  smoking_ok BOOLEAN,
  quiet_hours TEXT,
  cleanliness_level SMALLINT
);

