-- バリスタに必要な追加フィールドを追加
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS years_of_experience INTEGER,
ADD COLUMN IF NOT EXISTS google_maps_link TEXT,
ADD COLUMN IF NOT EXISTS prefecture TEXT;

-- JOINでデータを取得しやすいようにインデックスを追加
CREATE INDEX IF NOT EXISTS idx_profiles_type ON public.profiles (type);
