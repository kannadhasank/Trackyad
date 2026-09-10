-- Trackyad initial schema — vertical slice: customers, partners, rentals, users.
-- Installations, contracts, shipments and VGO items still come from mock data
-- and land in a later migration.

CREATE EXTENSION IF NOT EXISTS citext;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Lowercase to match the keys the frontend already uses in STATUS /
-- PAYMENT_STATUS (src/data/mockData.js), so StatusChip needs no change.
CREATE TYPE payment_status AS ENUM ('paid', 'pending', 'overdue');
CREATE TYPE rental_status  AS ENUM ('active', 'ending_soon', 'overdue', 'returned');

CREATE TABLE customers (
  id         text PRIMARY KEY,
  company    text NOT NULL,
  address    text,
  contact    text,
  email      citext,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE partners (
  id         text PRIMARY KEY,
  name       text NOT NULL,
  address    text,
  city       text,
  country    text,
  email      citext,
  contact    text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Human-readable ids are preserved. The sequence replaces the client-side
-- max+1 logic in RentalsPage.jsx, which races under concurrent creates.
CREATE SEQUENCE rentals_id_seq START WITH 20447;

CREATE TABLE rentals (
  id                  text PRIMARY KEY DEFAULT ('RNT-' || nextval('rentals_id_seq')),
  customer_id         text NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
  partner_id          text NOT NULL REFERENCES partners(id)  ON DELETE RESTRICT,
  part_number         text NOT NULL,
  device_part_number  text,
  serial_number       text NOT NULL,
  site_address        text,
  rental_start        date NOT NULL,
  end_date            date NOT NULL,
  contract_number     text,
  contract_start      date,
  contract_end        date,
  sla                 text,
  invoice_number      text,
  payment_status      payment_status NOT NULL DEFAULT 'pending',
  status              rental_status   NOT NULL DEFAULT 'active',
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT rentals_dates_ordered CHECK (end_date >= rental_start)
);

ALTER SEQUENCE rentals_id_seq OWNED BY rentals.id;

CREATE INDEX rentals_customer_id_idx   ON rentals (customer_id);
CREATE INDEX rentals_partner_id_idx    ON rentals (partner_id);
CREATE INDEX rentals_status_idx        ON rentals (status);
CREATE INDEX rentals_serial_number_idx ON rentals (serial_number);

CREATE TABLE users (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username      citext NOT NULL UNIQUE,
  password_hash text NOT NULL,
  display_name  text,
  role          text NOT NULL DEFAULT 'operations',
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

-- Keep updated_at honest without doing it in application code.
CREATE OR REPLACE FUNCTION set_updated_at() RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER customers_set_updated_at BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER partners_set_updated_at BEFORE UPDATE ON partners
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER rentals_set_updated_at BEFORE UPDATE ON rentals
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER users_set_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
