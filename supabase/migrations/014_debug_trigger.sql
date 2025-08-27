-- Migration 014: Debug Trigger Issues
-- Temporarily disable trigger to test basic user creation

-- Drop the existing trigger to test basic auth
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Test if basic user creation works without trigger first
-- We'll re-enable it after debugging

-- Keep the function for later use
COMMENT ON FUNCTION handle_new_user IS 'Temporarily disabled trigger function for debugging auth issues';