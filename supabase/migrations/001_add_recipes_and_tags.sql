-- Migration to add tags to prompts and create prompt_recipes table

-- 1. Add tags array to existing prompts table
ALTER TABLE public.prompts
ADD COLUMN tags text[] DEFAULT '{}'::text[];

-- 2. Create prompt_recipes table
CREATE TABLE public.prompt_recipes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    idea_hint TEXT NOT NULL,
    stack JSONB NOT NULL DEFAULT '{}'::jsonb,
    goal_mode TEXT,
    target_model TEXT,
    engineering_defaults TEXT[] DEFAULT '{}'::text[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Set up Row Level Security (RLS) for prompt_recipes
ALTER TABLE public.prompt_recipes ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own recipes
CREATE POLICY "Users can view their own recipes" 
    ON public.prompt_recipes 
    FOR SELECT 
    USING (auth.uid() = user_id);

-- Allow users to insert their own recipes
CREATE POLICY "Users can insert their own recipes" 
    ON public.prompt_recipes 
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own recipes
CREATE POLICY "Users can update their own recipes" 
    ON public.prompt_recipes 
    FOR UPDATE 
    USING (auth.uid() = user_id);

-- Allow users to delete their own recipes
CREATE POLICY "Users can delete their own recipes" 
    ON public.prompt_recipes 
    FOR DELETE 
    USING (auth.uid() = user_id);
