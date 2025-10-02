-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE genre_type AS ENUM ('Love', 'Sad', 'Motivational', 'Nature', 'Other');

-- Users table (extends Supabase auth.users)
CREATE TABLE users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  name TEXT,
  photo TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS (Row Level Security)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- RLS policies for users
CREATE POLICY "Users can view all profiles" ON users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON users FOR INSERT WITH CHECK (auth.uid() = id);

-- Poetry table
CREATE TABLE poetry (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  caption TEXT,
  poem TEXT NOT NULL,
  genre genre_type NOT NULL,
  image_url TEXT,
  image_description TEXT,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE poetry ENABLE ROW LEVEL SECURITY;

-- RLS policies for poetry
CREATE POLICY "Anyone can view poetry" ON poetry FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert poetry" ON poetry FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update own poetry" ON poetry FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own poetry" ON poetry FOR DELETE USING (auth.uid() = user_id);

-- Poetry likes table (many-to-many relationship)
CREATE TABLE poetry_likes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  poetry_id UUID REFERENCES poetry(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(poetry_id, user_id)
);

ALTER TABLE poetry_likes ENABLE ROW LEVEL SECURITY;

-- RLS policies for poetry_likes
CREATE POLICY "Anyone can view likes" ON poetry_likes FOR SELECT USING (true);
CREATE POLICY "Authenticated users can like poetry" ON poetry_likes FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = user_id);
CREATE POLICY "Users can delete own likes" ON poetry_likes FOR DELETE USING (auth.uid() = user_id);

-- Poetry comments table
CREATE TABLE poetry_comments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  poetry_id UUID REFERENCES poetry(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE poetry_comments ENABLE ROW LEVEL SECURITY;

-- RLS policies for poetry_comments
CREATE POLICY "Anyone can view comments" ON poetry_comments FOR SELECT USING (true);
CREATE POLICY "Authenticated users can add comments" ON poetry_comments FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = user_id);
CREATE POLICY "Users can update own comments" ON poetry_comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own comments" ON poetry_comments FOR DELETE USING (auth.uid() = user_id);

-- Poem requests table
CREATE TABLE poem_requests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  topic TEXT NOT NULL,
  genre genre_type NOT NULL CHECK (genre IN ('Love', 'Sad', 'Motivational', 'Nature')),
  mood TEXT NOT NULL,
  description TEXT NOT NULL,
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE poem_requests ENABLE ROW LEVEL SECURITY;

-- RLS policies for poem_requests
CREATE POLICY "Anyone can view requests" ON poem_requests FOR SELECT USING (true);
CREATE POLICY "Anyone can insert requests" ON poem_requests FOR INSERT USING (true);
CREATE POLICY "Only admins can update requests" ON poem_requests FOR UPDATE USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Only admins can delete requests" ON poem_requests FOR DELETE USING (auth.jwt() ->> 'role' = 'admin');

-- Create indexes for better performance
CREATE INDEX idx_poetry_created_at ON poetry(created_at DESC);
CREATE INDEX idx_poetry_genre ON poetry(genre);
CREATE INDEX idx_poetry_likes_poetry_id ON poetry_likes(poetry_id);
CREATE INDEX idx_poetry_likes_user_id ON poetry_likes(user_id);
CREATE INDEX idx_poetry_comments_poetry_id ON poetry_comments(poetry_id);
CREATE INDEX idx_poem_requests_created_at ON poem_requests(created_at DESC);
CREATE INDEX idx_poem_requests_completed ON poem_requests(completed);

-- Function to automatically update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_poetry_updated_at BEFORE UPDATE ON poetry
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_poetry_comments_updated_at BEFORE UPDATE ON poetry_comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_poem_requests_updated_at BEFORE UPDATE ON poem_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();