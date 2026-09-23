ALTER TABLE public.freelance_profiles
  ADD COLUMN IF NOT EXISTS visible boolean NOT NULL DEFAULT true;

DROP POLICY IF EXISTS "freelances are public" ON public.freelance_profiles;

CREATE POLICY "visible freelances are public"
ON public.freelance_profiles
FOR SELECT
TO public
USING (visible OR auth.uid() = user_id);