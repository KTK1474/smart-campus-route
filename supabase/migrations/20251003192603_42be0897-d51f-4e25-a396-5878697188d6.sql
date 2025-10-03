-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- User profiles table for eco-scores and tracking
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  eco_score INTEGER DEFAULT 0,
  total_co2_saved NUMERIC(10,2) DEFAULT 0,
  total_distance_traveled NUMERIC(10,2) DEFAULT 0,
  preferred_transport_mode TEXT DEFAULT 'walk',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Parking lots table
CREATE TABLE public.parking_lots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  total_spots INTEGER NOT NULL,
  location GEOGRAPHY(POINT, 4326) NOT NULL,
  lat NUMERIC(10,7) NOT NULL,
  lng NUMERIC(10,7) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Parking slots table
CREATE TABLE public.parking_slots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lot_id UUID REFERENCES public.parking_lots(id) ON DELETE CASCADE,
  slot_number TEXT NOT NULL,
  status TEXT DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'reserved')),
  lat NUMERIC(10,7) NOT NULL,
  lng NUMERIC(10,7) NOT NULL,
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(lot_id, slot_number)
);

-- Campus graph nodes for routing
CREATE TABLE public.campus_nodes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT,
  node_type TEXT DEFAULT 'intersection' CHECK (node_type IN ('intersection', 'building', 'parking', 'landmark')),
  lat NUMERIC(10,7) NOT NULL,
  lng NUMERIC(10,7) NOT NULL,
  location GEOGRAPHY(POINT, 4326) NOT NULL,
  ndvi_value NUMERIC(4,3) DEFAULT 0.5,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Campus graph edges for routing
CREATE TABLE public.campus_edges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  from_node_id UUID REFERENCES public.campus_nodes(id) ON DELETE CASCADE,
  to_node_id UUID REFERENCES public.campus_nodes(id) ON DELETE CASCADE,
  distance_meters NUMERIC(10,2) NOT NULL,
  pathway_type TEXT DEFAULT 'walkway' CHECK (pathway_type IN ('walkway', 'road', 'bikepath', 'stairs')),
  avg_carbon_ppm NUMERIC(10,2) DEFAULT 400,
  lighting_level INTEGER DEFAULT 5 CHECK (lighting_level BETWEEN 0 AND 10),
  cctv_coverage BOOLEAN DEFAULT false,
  crowd_density INTEGER DEFAULT 3 CHECK (crowd_density BETWEEN 0 AND 10),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- NDVI heatmap data
CREATE TABLE public.ndvi_grid (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  grid_cell_id TEXT UNIQUE NOT NULL,
  lat NUMERIC(10,7) NOT NULL,
  lng NUMERIC(10,7) NOT NULL,
  location GEOGRAPHY(POINT, 4326) NOT NULL,
  ndvi_value NUMERIC(4,3) NOT NULL CHECK (ndvi_value BETWEEN -1 AND 1),
  cell_size_meters INTEGER DEFAULT 50,
  last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- Carbon emissions heatmap
CREATE TABLE public.carbon_grid (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  grid_cell_id TEXT UNIQUE NOT NULL,
  lat NUMERIC(10,7) NOT NULL,
  lng NUMERIC(10,7) NOT NULL,
  location GEOGRAPHY(POINT, 4326) NOT NULL,
  carbon_ppm NUMERIC(10,2) NOT NULL,
  traffic_density INTEGER DEFAULT 0 CHECK (traffic_density BETWEEN 0 AND 100),
  cell_size_meters INTEGER DEFAULT 50,
  last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- IoT sensors table
CREATE TABLE public.iot_sensors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sensor_id TEXT UNIQUE NOT NULL,
  sensor_type TEXT NOT NULL CHECK (sensor_type IN ('air_quality', 'noise', 'light', 'temperature', 'humidity', 'soil_moisture')),
  lat NUMERIC(10,7) NOT NULL,
  lng NUMERIC(10,7) NOT NULL,
  location GEOGRAPHY(POINT, 4326) NOT NULL,
  current_value NUMERIC(10,2),
  unit TEXT NOT NULL,
  last_reading TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);

-- Sensor readings history
CREATE TABLE public.sensor_readings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sensor_id UUID REFERENCES public.iot_sensors(id) ON DELETE CASCADE,
  value NUMERIC(10,2) NOT NULL,
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Safety incidents table
CREATE TABLE public.safety_incidents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  incident_type TEXT NOT NULL CHECK (incident_type IN ('theft', 'accident', 'medical', 'harassment', 'other')),
  lat NUMERIC(10,7) NOT NULL,
  lng NUMERIC(10,7) NOT NULL,
  location GEOGRAPHY(POINT, 4326) NOT NULL,
  severity INTEGER DEFAULT 5 CHECK (severity BETWEEN 1 AND 10),
  description TEXT,
  reported_at TIMESTAMPTZ DEFAULT NOW()
);

-- Routes table for saving user routes
CREATE TABLE public.routes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  route_type TEXT NOT NULL CHECK (route_type IN ('eco', 'safe', 'fast')),
  from_lat NUMERIC(10,7) NOT NULL,
  from_lng NUMERIC(10,7) NOT NULL,
  to_lat NUMERIC(10,7) NOT NULL,
  to_lng NUMERIC(10,7) NOT NULL,
  path_points JSONB NOT NULL,
  distance_meters NUMERIC(10,2) NOT NULL,
  duration_seconds INTEGER NOT NULL,
  co2_saved_kg NUMERIC(6,3) DEFAULT 0,
  safety_score INTEGER DEFAULT 50 CHECK (safety_score BETWEEN 0 AND 100),
  transport_mode TEXT NOT NULL CHECK (transport_mode IN ('walk', 'cycle', 'car', 'ev', 'bus', 'shuttle')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Leaderboard entries
CREATE TABLE public.leaderboard_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('daily', 'weekly', 'monthly', 'all_time')),
  score INTEGER NOT NULL,
  rank INTEGER,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, category, period_start)
);

-- Simulation state for admin controls
CREATE TABLE public.simulation_state (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  state_key TEXT UNIQUE NOT NULL,
  state_value JSONB NOT NULL,
  last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parking_lots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parking_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campus_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campus_edges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ndvi_grid ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carbon_grid ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.iot_sensors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sensor_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.safety_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaderboard_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.simulation_state ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Profiles: users can view all, but only update their own
CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Parking: public read access
CREATE POLICY "Parking lots are viewable by everyone"
  ON public.parking_lots FOR SELECT
  USING (true);

CREATE POLICY "Parking slots are viewable by everyone"
  ON public.parking_slots FOR SELECT
  USING (true);

-- Campus graph: public read access
CREATE POLICY "Campus nodes are viewable by everyone"
  ON public.campus_nodes FOR SELECT
  USING (true);

CREATE POLICY "Campus edges are viewable by everyone"
  ON public.campus_edges FOR SELECT
  USING (true);

-- NDVI and carbon: public read access
CREATE POLICY "NDVI grid is viewable by everyone"
  ON public.ndvi_grid FOR SELECT
  USING (true);

CREATE POLICY "Carbon grid is viewable by everyone"
  ON public.carbon_grid FOR SELECT
  USING (true);

-- IoT sensors: public read access
CREATE POLICY "IoT sensors are viewable by everyone"
  ON public.iot_sensors FOR SELECT
  USING (true);

CREATE POLICY "Sensor readings are viewable by everyone"
  ON public.sensor_readings FOR SELECT
  USING (true);

-- Safety incidents: public read access
CREATE POLICY "Safety incidents are viewable by everyone"
  ON public.safety_incidents FOR SELECT
  USING (true);

-- Routes: users can view all and create their own
CREATE POLICY "Routes are viewable by everyone"
  ON public.routes FOR SELECT
  USING (true);

CREATE POLICY "Users can create routes"
  ON public.routes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Leaderboard: public read access
CREATE POLICY "Leaderboard is viewable by everyone"
  ON public.leaderboard_entries FOR SELECT
  USING (true);

-- Simulation state: public read access
CREATE POLICY "Simulation state is viewable by everyone"
  ON public.simulation_state FOR SELECT
  USING (true);

-- Indexes for performance
CREATE INDEX idx_parking_slots_status ON public.parking_slots(status);
CREATE INDEX idx_parking_slots_lot_id ON public.parking_slots(lot_id);
CREATE INDEX idx_routes_user_id ON public.routes(user_id);
CREATE INDEX idx_routes_created_at ON public.routes(created_at DESC);
CREATE INDEX idx_leaderboard_category ON public.leaderboard_entries(category, rank);
CREATE INDEX idx_sensor_readings_sensor_id ON public.sensor_readings(sensor_id, recorded_at DESC);
CREATE INDEX idx_ndvi_grid_location ON public.ndvi_grid USING GIST(location);
CREATE INDEX idx_carbon_grid_location ON public.carbon_grid USING GIST(location);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, username, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substring(NEW.id::text, 1, 8)),
    COALESCE(NEW.raw_user_meta_data->>'display_name', 'EcoNav User')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();