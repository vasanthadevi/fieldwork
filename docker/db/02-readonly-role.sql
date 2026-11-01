DROP ROLE IF EXISTS copilot_readonly;
CREATE ROLE copilot_readonly WITH LOGIN PASSWORD 'readonly';
GRANT CONNECT ON DATABASE chinook TO copilot_readonly;
GRANT USAGE ON SCHEMA public TO copilot_readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO copilot_readonly;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO copilot_readonly;

-- Belt and suspenders: 5s statement cap + read-only transactions by default.
ALTER ROLE copilot_readonly SET statement_timeout = '5000';
ALTER ROLE copilot_readonly SET default_transaction_read_only = on;
