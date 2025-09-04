-- Grant access to public tables
ALTER TABLE public.care_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.care_activity_details ENABLE ROW LEVEL SECURITY;

-- Policy for care_activities
CREATE POLICY "Users can view their own garden care activities" 
ON public.care_activities
FOR SELECT 
USING (
    garden_id IN (
        SELECT id FROM public.gardens 
        WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Users can insert their own garden care activities" 
ON public.care_activities
FOR INSERT 
WITH CHECK (
    garden_id IN (
        SELECT id FROM public.gardens 
        WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Users can update their own garden care activities" 
ON public.care_activities
FOR UPDATE 
USING (
    garden_id IN (
        SELECT id FROM public.gardens 
        WHERE user_id = auth.uid()
    )
)
WITH CHECK (
    garden_id IN (
        SELECT id FROM public.gardens 
        WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Users can delete their own garden care activities" 
ON public.care_activities
FOR DELETE 
USING (
    garden_id IN (
        SELECT id FROM public.gardens 
        WHERE user_id = auth.uid()
    )
);

-- Policy for care_activity_details
ALTER TABLE public.care_activity_details ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own care activity details" 
ON public.care_activity_details
FOR SELECT 
USING (
    care_activity_id IN (
        SELECT id FROM public.care_activities
        WHERE garden_id IN (
            SELECT id FROM public.gardens 
            WHERE user_id = auth.uid()
        )
    )
);

CREATE POLICY "Users can insert their own care activity details" 
ON public.care_activity_details
FOR INSERT 
WITH CHECK (
    care_activity_id IN (
        SELECT id FROM public.care_activities
        WHERE garden_id IN (
            SELECT id FROM public.gardens 
            WHERE user_id = auth.uid()
        )
    )
);

CREATE POLICY "Users can update their own care activity details" 
ON public.care_activity_details
FOR UPDATE 
USING (
    care_activity_id IN (
        SELECT id FROM public.care_activities
        WHERE garden_id IN (
            SELECT id FROM public.gardens 
            WHERE user_id = auth.uid()
        )
    )
)
WITH CHECK (
    care_activity_id IN (
        SELECT id FROM public.care_activities
        WHERE garden_id IN (
            SELECT id FROM public.gardens 
            WHERE user_id = auth.uid()
        )
    )
);

CREATE POLICY "Users can delete their own care activity details" 
ON public.care_activity_details
FOR DELETE 
USING (
    care_activity_id IN (
        SELECT id FROM public.care_activities
        WHERE garden_id IN (
            SELECT id FROM public.gardens 
            WHERE user_id = auth.uid()
        )
    )
);

-- Grant basic access to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON public.care_activities TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.care_activity_details TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
