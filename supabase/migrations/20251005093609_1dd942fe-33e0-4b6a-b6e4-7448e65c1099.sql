-- Insert sample parking lots (campus locations)
INSERT INTO public.parking_lots (code, name, total_spots, lat, lng, location) VALUES
('A', 'Main Gate Parking', 50, 28.5450, 77.2730, ST_SetSRID(ST_MakePoint(77.2730, 28.5450), 4326)),
('B', 'Library Parking', 80, 28.5455, 77.2740, ST_SetSRID(ST_MakePoint(77.2740, 28.5455), 4326)),
('C', 'Sports Complex', 40, 28.5440, 77.2720, ST_SetSRID(ST_MakePoint(77.2720, 28.5440), 4326)),
('D', 'Academic Block', 60, 28.5460, 77.2750, ST_SetSRID(ST_MakePoint(77.2750, 28.5460), 4326))
ON CONFLICT (code) DO NOTHING;

-- Insert sample parking slots
INSERT INTO public.parking_slots (lot_id, slot_number, status, lat, lng) 
SELECT 
  pl.id,
  generate_series::text,
  CASE WHEN random() > 0.7 THEN 'occupied' ELSE 'available' END,
  pl.lat + (random() * 0.0002 - 0.0001),
  pl.lng + (random() * 0.0002 - 0.0001)
FROM public.parking_lots pl
CROSS JOIN generate_series(1, 10)
ON CONFLICT (lot_id, slot_number) DO NOTHING;

-- Insert campus nodes for routing
INSERT INTO public.campus_nodes (name, node_type, lat, lng, location, ndvi_value) VALUES
('Main Gate', 'landmark', 28.5448, 77.2728, ST_SetSRID(ST_MakePoint(77.2728, 28.5448), 4326), 0.3),
('Library', 'building', 28.5456, 77.2738, ST_SetSRID(ST_MakePoint(77.2738, 28.5456), 4326), 0.6),
('Sports Complex', 'building', 28.5442, 77.2718, ST_SetSRID(ST_MakePoint(77.2718, 28.5442), 4326), 0.7),
('Academic Block', 'building', 28.5462, 77.2748, ST_SetSRID(ST_MakePoint(77.2748, 28.5462), 4326), 0.5),
('Hostel Area', 'building', 28.5435, 77.2735, ST_SetSRID(ST_MakePoint(77.2735, 28.5435), 4326), 0.8),
('Cafeteria', 'building', 28.5450, 77.2745, ST_SetSRID(ST_MakePoint(77.2745, 28.5450), 4326), 0.4),
('Junction 1', 'intersection', 28.5452, 77.2733, ST_SetSRID(ST_MakePoint(77.2733, 28.5452), 4326), 0.5),
('Junction 2', 'intersection', 28.5447, 77.2740, ST_SetSRID(ST_MakePoint(77.2740, 28.5447), 4326), 0.6)
ON CONFLICT DO NOTHING;

-- Insert campus edges for routing
INSERT INTO public.campus_edges (from_node_id, to_node_id, distance_meters, pathway_type, lighting_level, cctv_coverage, crowd_density, avg_carbon_ppm)
SELECT 
  n1.id, n2.id,
  ST_DistanceSphere(n1.location::geometry, n2.location::geometry),
  CASE WHEN random() > 0.7 THEN 'road' ELSE 'walkway' END,
  floor(random() * 5 + 5)::int,
  random() > 0.5,
  floor(random() * 5 + 3)::int,
  350 + random() * 150
FROM public.campus_nodes n1
CROSS JOIN public.campus_nodes n2
WHERE n1.id != n2.id 
  AND ST_DistanceSphere(n1.location::geometry, n2.location::geometry) < 400
ON CONFLICT DO NOTHING;

-- Insert NDVI grid data (simulated green index)
INSERT INTO public.ndvi_grid (grid_cell_id, lat, lng, location, ndvi_value)
SELECT 
  'cell_' || row_number() OVER (),
  28.5435 + (x * 0.001),
  77.2715 + (y * 0.001),
  ST_SetSRID(ST_MakePoint(77.2715 + (y * 0.001), 28.5435 + (x * 0.001)), 4326),
  0.2 + (random() * 0.6)
FROM generate_series(0, 5) x
CROSS JOIN generate_series(0, 5) y
ON CONFLICT (grid_cell_id) DO NOTHING;

-- Insert carbon emissions grid
INSERT INTO public.carbon_grid (grid_cell_id, lat, lng, location, carbon_ppm, traffic_density)
SELECT 
  'carbon_' || row_number() OVER (),
  28.5435 + (x * 0.001),
  77.2715 + (y * 0.001),
  ST_SetSRID(ST_MakePoint(77.2715 + (y * 0.001), 28.5435 + (x * 0.001)), 4326),
  350 + (random() * 200),
  floor(random() * 50)::int
FROM generate_series(0, 5) x
CROSS JOIN generate_series(0, 5) y
ON CONFLICT (grid_cell_id) DO NOTHING;

-- Insert IoT sensors
INSERT INTO public.iot_sensors (sensor_id, sensor_type, lat, lng, location, current_value, unit) VALUES
('AQ_001', 'air_quality', 28.5450, 77.2730, ST_SetSRID(ST_MakePoint(77.2730, 28.5450), 4326), 85, 'AQI'),
('NOISE_001', 'noise', 28.5455, 77.2740, ST_SetSRID(ST_MakePoint(77.2740, 28.5455), 4326), 65, 'dB'),
('LIGHT_001', 'light', 28.5440, 77.2720, ST_SetSRID(ST_MakePoint(77.2720, 28.5440), 4326), 7, 'lux/10'),
('LIGHT_002', 'light', 28.5460, 77.2750, ST_SetSRID(ST_MakePoint(77.2750, 28.5460), 4326), 8, 'lux/10'),
('SOIL_001', 'soil_moisture', 28.5445, 77.2735, ST_SetSRID(ST_MakePoint(77.2735, 28.5445), 4326), 45, '%')
ON CONFLICT (sensor_id) DO NOTHING;

-- Insert simulation state
INSERT INTO public.simulation_state (state_key, state_value) VALUES
('simulation_mode', '{"enabled": true, "scenario": "normal"}'::jsonb),
('traffic_multiplier', '{"value": 1.0}'::jsonb),
('parking_occupancy_rate', '{"value": 0.65}'::jsonb)
ON CONFLICT (state_key) DO UPDATE SET state_value = EXCLUDED.state_value;