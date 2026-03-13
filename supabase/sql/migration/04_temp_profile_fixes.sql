-- Temporarily allow NULLs so auth trigger can create minimal profiles
ALTER TABLE profiles ALTER COLUMN full_name DROP NOT NULL;
ALTER TABLE profiles ALTER COLUMN nrc DROP NOT NULL;
ALTER TABLE profiles ALTER COLUMN gender DROP NOT NULL;
ALTER TABLE profiles ALTER COLUMN postal_code DROP NOT NULL;

-- Re-add NOT NULL constraints
ALTER TABLE profiles ALTER COLUMN full_name SET NOT NULL;
ALTER TABLE profiles ALTER COLUMN nrc SET NOT NULL;
ALTER TABLE profiles ALTER COLUMN gender SET NOT NULL;
ALTER TABLE profiles ALTER COLUMN postal_code SET NOT NULL;
