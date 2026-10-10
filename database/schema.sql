CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(30),
  password_hash TEXT NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'user' CHECK (role IN ('user','admin')),
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS areas (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT DEFAULT '',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INT NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS room_types (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(80) NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INT NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS amenities (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(80) NOT NULL UNIQUE,
  icon VARCHAR(60) DEFAULT 'check',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INT NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS properties (
  id BIGSERIAL PRIMARY KEY,
  public_id VARCHAR(24) NOT NULL UNIQUE,
  property_type VARCHAR(20) NOT NULL CHECK (property_type IN ('pg','hostel','flat')),
  internal_name VARCHAR(180) NOT NULL,
  title VARCHAR(180) NOT NULL,
  room_type VARCHAR(80) NOT NULL,
  monthly_rent INTEGER NOT NULL CHECK (monthly_rent >= 0),
  security_deposit INTEGER NOT NULL DEFAULT 0 CHECK (security_deposit >= 0),
  gender_preference VARCHAR(30) NOT NULL DEFAULT 'any',
  food_included BOOLEAN NOT NULL DEFAULT FALSE,
  furnishing VARCHAR(30) NOT NULL DEFAULT 'furnished',
  suitable_for VARCHAR(120) DEFAULT 'students',
  area_id BIGINT REFERENCES areas(id) ON DELETE SET NULL,
  public_area VARCHAR(120) NOT NULL,
  exact_address TEXT,
  owner_name VARCHAR(120),
  owner_phone VARCHAR(30),
  amenities TEXT[] NOT NULL DEFAULT '{}',
  short_description VARCHAR(240) NOT NULL,
  description TEXT DEFAULT '',
  house_rules TEXT DEFAULT '',
  total_beds INTEGER DEFAULT 1,
  available_beds INTEGER DEFAULT 1,
  availability VARCHAR(30) NOT NULL DEFAULT 'available',
  image_url TEXT,
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  show_on_homepage BOOLEAN NOT NULL DEFAULT TRUE,
  status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('published','draft','inactive')),
  internal_notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS properties_public_search_idx ON properties (status, property_type, public_area, monthly_rent);
CREATE INDEX IF NOT EXISTS properties_featured_idx ON properties (is_featured, show_on_homepage, created_at DESC);
CREATE TABLE IF NOT EXISTS property_images (
  id BIGSERIAL PRIMARY KEY,
  property_id BIGINT NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  alt_text VARCHAR(180) DEFAULT '',
  is_main BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS saved_properties (
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  property_id BIGINT NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, property_id)
);
CREATE TABLE IF NOT EXISTS enquiries (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  property_id BIGINT REFERENCES properties(id) ON DELETE SET NULL,
  name VARCHAR(120) NOT NULL,
  phone VARCHAR(30) NOT NULL,
  email VARCHAR(255),
  preferred_move_date DATE,
  message TEXT DEFAULT '',
  status VARCHAR(24) NOT NULL DEFAULT 'new' CHECK (status IN ('new','contacted','closed','not_interested')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS enquiries_created_idx ON enquiries (created_at DESC);
CREATE TABLE IF NOT EXISTS enquiry_notes (
  id BIGSERIAL PRIMARY KEY,
  enquiry_id BIGINT NOT NULL REFERENCES enquiries(id) ON DELETE CASCADE,
  admin_id BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  note TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS page_sections (
  id BIGSERIAL PRIMARY KEY,
  page_key VARCHAR(80) NOT NULL,
  section_key VARCHAR(100) NOT NULL,
  title VARCHAR(180) NOT NULL,
  description TEXT DEFAULT '',
  image_url TEXT,
  button_text VARCHAR(80),
  button_link VARCHAR(240),
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_visible BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(page_key, section_key)
);
CREATE TABLE IF NOT EXISTS banners (
  id BIGSERIAL PRIMARY KEY,
  title VARCHAR(180) NOT NULL,
  subtitle TEXT DEFAULT '',
  image_url TEXT,
  button_text VARCHAR(80) DEFAULT 'Explore Properties',
  button_link VARCHAR(240) DEFAULT '/pg.html',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INT NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS faqs (
  id BIGSERIAL PRIMARY KEY,
  category VARCHAR(80) NOT NULL DEFAULT 'General',
  question VARCHAR(240) NOT NULL,
  answer TEXT NOT NULL,
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INT NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS testimonials (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  role VARCHAR(80) DEFAULT 'Resident',
  rating INT NOT NULL DEFAULT 5 CHECK (rating BETWEEN 1 AND 5),
  review TEXT NOT NULL,
  is_published BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order INT NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id BIGSERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  subscribed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS media_files (
  id BIGSERIAL PRIMARY KEY,
  url TEXT NOT NULL,
  pathname TEXT,
  alt_text VARCHAR(180) DEFAULT '',
  category VARCHAR(80) DEFAULT 'other',
  created_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS site_settings (
  key VARCHAR(100) PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS admin_audit_logs (
  id BIGSERIAL PRIMARY KEY,
  admin_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(80),
  entity_id VARCHAR(80),
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS schema_migrations (
  name VARCHAR(180) PRIMARY KEY,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
