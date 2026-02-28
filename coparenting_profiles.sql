-- ==================== COPARENTING SCHEMA ====================

-- Table: public.coparenting_profiles
CREATE TABLE IF NOT EXISTS public.coparenting_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT,
    email TEXT,
    phone_number TEXT,
    data JSONB DEFAULT '{}', -- Store all app state here (expenses, tasks, etc.)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.coparenting_profiles ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own coparenting profile" 
ON public.coparenting_profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own coparenting profile" 
ON public.coparenting_profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own coparenting profile" 
ON public.coparenting_profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_coparenting_profiles_updated_at
BEFORE UPDATE ON public.coparenting_profiles
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();
