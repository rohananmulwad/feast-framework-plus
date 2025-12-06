-- Drop existing SELECT policy for users
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;

-- Create a more restrictive policy that combines user self-view and admin view
-- This explicitly ensures users can ONLY see their own roles (not other users via restaurant_id)
CREATE POLICY "Users can only view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid() 
  OR public.has_role(auth.uid(), 'admin'::app_role)
);