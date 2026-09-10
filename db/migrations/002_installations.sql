-- Installations, with an attached document (site report, checklist, signed POD).
-- Customer is normalised to a real FK here; the mock data stored the company
-- name as a bare string, which cannot be kept consistent.

CREATE TYPE install_location AS ENUM ('Local', 'Overseas');

CREATE SEQUENCE installations_id_seq START WITH 1103;

CREATE TABLE installations (
  id                   text PRIMARY KEY DEFAULT ('INS-' || nextval('installations_id_seq')),
  customer_id          text NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
  installation_address text NOT NULL,
  installation_date    date NOT NULL,
  installation_time    time,
  device_model         text NOT NULL,
  serial_number        text NOT NULL,
  start_time           time,
  end_time             time,
  location             install_location NOT NULL DEFAULT 'Local',
  country              text,
  assigned_engineer    text,
  quotation_number     text,
  po_number            text,

  -- Document metadata. The file itself lives on disk under uploads/;
  -- only the stored name and its provenance are kept here.
  document_filename    text,          -- name on disk, generated, collision-free
  document_original    text,          -- what the user's file was called
  document_mimetype    text,
  document_size        integer,
  document_uploaded_at timestamptz,

  created_at           timestamptz NOT NULL DEFAULT now(),
  updated_at           timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT installations_times_ordered
    CHECK (end_time IS NULL OR start_time IS NULL OR end_time >= start_time)
);

ALTER SEQUENCE installations_id_seq OWNED BY installations.id;

CREATE INDEX installations_customer_id_idx   ON installations (customer_id);
CREATE INDEX installations_serial_number_idx ON installations (serial_number);
CREATE INDEX installations_date_idx          ON installations (installation_date);

CREATE TRIGGER installations_set_updated_at BEFORE UPDATE ON installations
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
