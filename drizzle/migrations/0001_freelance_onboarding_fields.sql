ALTER TABLE public.freelance_profiles
  ADD COLUMN IF NOT EXISTS onboarded boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS experience_years integer NOT NULL DEFAULT 0;