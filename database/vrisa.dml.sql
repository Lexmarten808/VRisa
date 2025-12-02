-- DML seed data: at least 10 rows per table
-- Order respects foreign key dependencies

-- 1) users
INSERT INTO users (u_name, last_name, u_password, u_type, validated)
VALUES
('Ana', 'Gómez', 'pass123', 'ciudadano', TRUE),
('Luis', 'Pérez', 'pass123', 'ciudadano', TRUE),
('María', 'Rodríguez', 'pass123', 'admin', TRUE),
('Jorge', 'López', 'pass123', 'institucion', TRUE),
('Camila', 'Martínez', 'pass123', 'ciudadano', FALSE),
('Diego', 'Torres', 'pass123', 'ciudadano', TRUE),
('Sofía', 'Ramírez', 'pass123', 'ciudadano', TRUE),
('Andrés', 'Castro', 'pass123', 'admin', TRUE),
('Valeria', 'Suárez', 'pass123', 'ciudadano', FALSE),
('Carlos', 'Herrera', 'pass123', 'institucion', TRUE),
-- Usuarios administradores de estaciones
('Pedro', 'Quintero', 'pass123', 'administrador_estacion', TRUE),
('Laura', 'Patiño', 'pass123', 'administrador_estacion', TRUE);

-- 2) email (references users)
INSERT INTO email (u_id, email)
VALUES
(1, 'ana.gomez@example.com'),
(2, 'luis.perez@example.com'),
(3, 'maria.rodri@example.com'),
(4, 'jorge.lopez@institucion.edu'),
(5, 'camila.martinez@example.com'),
(6, 'diego.torres@example.com'),
(7, 'sofia.ramirez@example.com'),
(8, 'andres.castro@example.com'),
(9, 'valeria.suarez@example.com'),
(10, 'carlos.herrera@institucion.edu'),
(11, 'pedro.quintero@stations.com'),
(12, 'laura.patino@stations.com');

-- 3) phone_number (references users)
INSERT INTO phone_number (u_id, p_number)
VALUES
(1, '+57 3001111111'),
(2, '+57 3002222222'),
(3, '+57 3003333333'),
(4, '+57 3004444444'),
(5, '+57 3005555555'),
(6, '+57 3006666666'),
(7, '+57 3007777777'),
(8, '+57 3008888888'),
(9, '+57 3009999999'),
(10, '+57 3010000000'),
(11, '+57 3011111111'),
(12, '+57 3012222222');

-- 4) institution
INSERT INTO institution (i_name, logo, color_set, street, neighborhood, validated, admin_id)
VALUES
('Universidad del Valle', 'univalle.png', 'red-white', 'Calle 13 #100', 'Ciudad Universitaria', TRUE, 4),
('Instituto Ambiental Andino', 'andino.png', 'green-white', 'Av. Bosque 12', 'El Bosque', TRUE, 10),
('Centro de Meteorología Pacífico', 'pacifico.png', 'blue-gray', 'Cra 45 #15', 'San Antonio', TRUE, 4),
('Fundación Aire Limpio', 'aire.png', 'teal-white', 'Calle 5 #25', 'Santa Mónica', TRUE, 10),
('Observatorio Climático Norte', 'norte.png', 'navy-white', 'Av. Norte 33', 'La Flora', FALSE, 4),
('Parque Tecnológico Valle', 'ptv.png', 'orange-white', 'Cra 10 #20', 'ValleTech', TRUE, 10),
('Centro de Investigación Andina', 'cia.png', 'green-gray', 'Calle 9 #8', 'Andes', TRUE, 4),
('Alianza por el Clima', 'apc.png', 'purple-white', 'Av. Central 7', 'Centro', TRUE, 10),
('Red de Estaciones Urbanas', 'reu.png', 'yellow-black', 'Cra 20 #40', 'Urbano', FALSE, 4),
('Instituto del Agua', 'agua.png', 'cyan-white', 'Calle 1 #2', 'Río', TRUE, 10);

-- 5) station (references users as admin_id and institution)
-- Assume admins: user IDs 3 and 8; institutions 1..10
INSERT INTO station (s_name, lat, lon, calibration_certificate, maintenance_date, admin_id, s_state, institution_id)
VALUES
('Estación Univalle-1', 3.375000, -76.532000, 'CAL-UV-001', '2025-01-15', 3, 'activo', 1),
('Estación Andino-1', 4.711000, -74.072000, 'CAL-AN-001', '2025-02-10', 8, 'activo', 2),
('Estación Pacífico-1', 3.450000, -76.540000, 'CAL-PA-001', '2025-03-05', 3, 'mantenimiento', 3),
('Estación Aire-1', 6.251000, -75.563000, 'CAL-AI-001', '2025-02-20', 8, 'activo', 4),
('Estación Norte-1', 7.120000, -73.120000, 'CAL-NO-001', '2025-01-30', 3, 'inactivo', 5),
('Estación PTV-1', 3.397000, -76.549000, 'CAL-PT-001', '2025-04-01', 8, 'activo', 6),
('Estación Andina-2', 5.070000, -75.520000, 'CAL-AN-002', '2025-03-12', 3, 'activo', 7),
('Estación Clima-1', 4.620000, -74.080000, 'CAL-CL-001', '2025-05-01', 8, 'activo', 8),
('Estación Urbana-1', 3.480000, -76.530000, 'CAL-UR-001', '2025-02-28', 3, 'inactivo', 9),
('Estación Agua-1', 2.930000, -75.280000, 'CAL-AG-001', '2025-01-18', 8, 'activo', 10);

-- 6) sensor (references station)
INSERT INTO sensor (s_type, installment_date, s_state, station_id, last_calibration_date)
VALUES
('PM2.5', '2025-01-20', 'activo', 1, '2025-03-20'),
('PM10',  '2025-01-21', 'activo', 1, '2025-03-21'),
('CO2',   '2025-02-12', 'mantenimiento', 2, '2025-04-10'),
('NO2',   '2025-03-10', 'activo', 3, '2025-05-02'),
('SO2',   '2025-02-25', 'inactivo', 4, '2025-04-25'),
('O3',    '2025-03-05', 'activo', 5, '2025-05-05'),
('CO',    '2025-01-28', 'activo', 6, '2025-03-28'),
('Humedad', '2025-02-01', 'activo', 7, '2025-04-01'),
('Temperatura', '2025-02-15', 'activo', 8, '2025-04-15'),
('Viento', '2025-03-01', 'activo', 9, '2025-05-01');

-- 7) variable
INSERT INTO variable (v_name, v_unit, v_type)
VALUES
('PM2.5', 'µg/m3', 'calidad_aire'),
('PM10',  'µg/m3', 'calidad_aire'),
('CO2',   'ppm',   'gas'),
('NO2',   'ppm',   'gas'),
('SO2',   'ppm',   'gas'),
('O3',    'ppm',   'gas'),
('CO',    'ppm',   'gas'),
('Humedad', '%',    'clima'),
('Temperatura', '°C', 'clima'),
('Velocidad Viento', 'm/s', 'clima');

-- 8) measurement (references sensor and variable)
-- Map sensor types to variable IDs accordingly: 1->PM2.5, 2->PM10, 3->CO2, 4->NO2, 5->SO2, 6->O3, 7->CO, 8->Humedad, 9->Temperatura, 10->Velocidad Viento
INSERT INTO measurement (m_date, m_value, sensor_id, variable_id)
VALUES
('2025-05-20 08:00:00', 12.5, 1, 1),
('2025-05-20 09:00:00', 25.0, 2, 2),
('2025-05-20 10:00:00', 410.2, 3, 3),
('2025-05-20 11:00:00', 0.032, 4, 4),
('2025-05-20 12:00:00', 0.008, 5, 5),
('2025-05-20 13:00:00', 0.060, 6, 6),
('2025-05-20 14:00:00', 0.900, 7, 7),
('2025-05-20 15:00:00', 55.0, 8, 8),
('2025-05-20 16:00:00', 27.3, 9, 9),
('2025-05-20 17:00:00', 3.8, 10, 10);

-- 9) report (references institution)
INSERT INTO report (r_type, r_description, institution_id)
VALUES
('diario', 'Resumen diario de calidad del aire', 1),
('semanal', 'Reporte semanal estaciones Andino', 2),
('mensual', 'Tendencias mensuales Pacífico', 3),
('alerta', 'Alerta por niveles altos de NO2', 4),
('diario', 'Resumen diario Norte', 5),
('mensual', 'Mensual Parque Tecnológico', 6),
('diario', 'Diario Andina', 7),
('semanal', 'Semanal Alianza por el Clima', 8),
('alerta', 'Alerta urbana por PM10', 9),
('mensual', 'Mensual Instituto del Agua', 10);

-- 10) report_log (references report and institution)
INSERT INTO report_log (report_id, institution_id, description)
VALUES
(1, 1, 'Log generado para reporte diario Univalle'),
(2, 2, 'Log semanal Andino'),
(3, 3, 'Log mensual Pacífico'),
(4, 4, 'Log alerta NO2'),
(5, 5, 'Log diario Norte'),
(6, 6, 'Log mensual PTV'),
(7, 7, 'Log diario Andina'),
(8, 8, 'Log semanal APC'),
(9, 9, 'Log alerta urbana PM10'),
(10, 10, 'Log mensual Instituto del Agua');

