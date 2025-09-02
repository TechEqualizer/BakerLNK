-- Migration to add social media links to Baker table
ALTER TABLE bakers ADD COLUMN instagram_url TEXT;
ALTER TABLE bakers ADD COLUMN facebook_url TEXT;
ALTER TABLE bakers ADD COLUMN tiktok_url TEXT;
ALTER TABLE bakers ADD COLUMN website_url TEXT;
ALTER TABLE bakers ADD COLUMN phone_number TEXT;