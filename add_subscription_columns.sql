-- ========================================================
-- ADD SUBSCRIPTION COLUMNS TO COPARENTING_PROFILES
-- ========================================================

-- 1. Add columns for Pro status and subscription dates
ALTER TABLE public.coparenting_profiles 
ADD COLUMN IF NOT EXISTS is_pro BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS subscription_start TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS subscription_end TIMESTAMP WITH TIME ZONE;

-- 2. Optional: Add an index for status checks
CREATE INDEX IF NOT EXISTS idx_coparenting_profiles_is_pro ON public.coparenting_profiles(is_pro);

-- 3. EXAMPLE: Activate PRO for a user manually (Valid for 1 Month)
-- UPDATE public.coparenting_profiles 
-- SET is_pro = true, 
--     subscription_start = now(), 
--     subscription_end = now() + interval '1 month'
-- WHERE email = 'roso@yahoo.com';

-- 4. EXAMPLE: Activate PRO for a user manually (Valid for 1 Year)
-- UPDATE public.coparenting_profiles 
-- SET is_pro = true, 
--     subscription_start = now(), 
--     subscription_end = now() + interval '1 year'
-- WHERE email = 'roso@yahoo.com';
