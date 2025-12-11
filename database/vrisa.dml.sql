-------------------------------------
-- INSERT INTO users  (25 registros)
-------------------------------------
INSERT INTO users (u_name, last_name, u_password, u_type, validated) VALUES
('Ana', 'Gomez', 'pass123', 'admin', TRUE),
('Carlos', 'Lopez', 'pass123', 'institucion', TRUE),
('Maria', 'Diaz', 'pass123', 'institucion', TRUE),
('Jorge', 'Martinez', 'pass123', 'institucion', TRUE),
('Luisa', 'Ramirez', 'pass123', 'administrador_estacion', TRUE),
('Pedro', 'Sanchez', 'pass123', 'administrador_estacion', TRUE),
('Juan', 'Torres', 'pass123', 'administrador_estacion', TRUE),
('Esteban', 'Morales', 'pass123', 'administrador_estacion', TRUE),
('Sofia', 'Cruz', 'pass123', 'ciudadano', TRUE),
('Camilo', 'Ortiz', 'pass123', 'ciudadano', TRUE),
('Daniel', 'Rios', 'pass123', 'ciudadano', FALSE),
('Sara', 'Muñoz', 'pass123', 'ciudadano', FALSE),
('Felipe', 'Castro', 'pass123', 'ciudadano', TRUE),
('Diana', 'Pardo', 'pass123', 'ciudadano', TRUE),
('Miguel', 'Guerra', 'pass123', 'ciudadano', TRUE),
('Juliana', 'Correa', 'pass123', 'ciudadano', FALSE),
('Oscar', 'Peña', 'pass123', 'ciudadano', TRUE),
('Valentina', 'Bello', 'pass123', 'ciudadano', TRUE),
('Sebastian', 'Mora', 'pass123', 'ciudadano', FALSE),
('Natalia', 'Cortes', 'pass123', 'ciudadano', TRUE),
('Hector', 'Roldan', 'pass123', 'administrador_estacion', TRUE),
('Mario', 'Zuleta', 'pass123', 'administrador_estacion', TRUE),
('Alex', 'Vega', 'pass123', 'ciudadano', TRUE),
('Laura', 'Arango', 'pass123', 'ciudadano', TRUE),
('Pablo', 'Reyes', 'pass123', 'ciudadano', TRUE);

-------------------------------------
-- INSERT INTO email (20 registros)
-------------------------------------
INSERT INTO email (u_id, email) VALUES
(1,'ana.gomez@example.com'),
(2,'carlos.lopez@example.com'),
(3,'maria.diaz@example.com'),
(4,'jorge.martinez@example.com'),
(5,'luisa.ramirez@example.com'),
(6,'pedro.sanchez@example.com'),
(7,'juan.torres@example.com'),
(8,'esteban.morales@example.com'),
(9,'sofia.cruz@example.com'),
(10,'camilo.ortiz@example.com'),
(11,'daniel.rios@example.com'),
(12,'sara.munoz@example.com'),
(13,'felipe.castro@example.com'),
(14,'diana.pardo@example.com'),
(15,'miguel.guerra@example.com'),
(16,'juliana.correa@example.com'),
(17,'oscar.pena@example.com'),
(18,'valentina.bello@example.com'),
(19,'sebastian.mora@example.com'),
(20,'natalia.cortes@example.com');

--------------------------------------------
-- INSERT INTO phone_number (20 registros)
--------------------------------------------
INSERT INTO phone_number (u_id, p_number) VALUES
(1,'3001111111'),
(2,'3001111112'),
(3,'3001111113'),
(4,'3001111114'),
(5,'3001111115'),
(6,'3001111116'),
(7,'3001111117'),
(8,'3001111118'),
(9,'3001111119'),
(10,'3001111120'),
(11,'3001111121'),
(12,'3001111122'),
(13,'3001111123'),
(14,'3001111124'),
(15,'3001111125'),
(16,'3001111126'),
(17,'3001111127'),
(18,'3001111128'),
(19,'3001111129'),
(20,'3001111130');

------------------------------------------------
-- INSERT INTO institution (20 registros)
------------------------------------------------
INSERT INTO institution (i_name, logo, color_set, street, neighborhood, validated, admin_id) VALUES
('DAC Cali', 'logo1.png', '#0055AA', 'Calle 5', 'San Fernando', TRUE, 2),
('EMCALI', 'logo2.png', '#00AA55', 'Cra 15', 'Santa Rosa', TRUE, 3),
('UAESPM', 'logo3.png', '#AA5500', 'Calle 13', 'El Cedro', TRUE, 4),
('CVC Sur', 'logo4.png', '#2244FF', 'Av Pasoancho', 'Limonar', TRUE, 5),
('CVC Norte', 'logo5.png', '#44CC22', 'Av 6N', 'Versalles', TRUE, 6),
('Pance Ambiental', 'logo6.png', '#112233', 'Calle 18', 'Pance', TRUE, 7),
('San Antonio Aire', 'logo7.png', '#99AA00', 'Cra 10', 'San Antonio', TRUE, 8),
('AireSeguro', 'logo8.png', '#00AACC', 'Cra 100', 'Ciudad Jardin', TRUE, 21),
('AmbienteVerde', 'logo9.png', '#ABCDEF', 'Calle 50', 'Prados', TRUE, 22),
('EcoCali', 'logo10.png', '#101010', 'Calle 70', 'La Flora', TRUE, 23),
('CalAire', 'logo11.png', '#404080', 'Calle 45', 'San Vicente', TRUE, 24),
('RespiraCali', 'logo12.png', '#505050', 'Cra 8', 'Centenario', TRUE, 25),
('EcoZona Norte', 'logo13.png', '#778899', 'Av 9', 'La Flora', TRUE, 9),
('Aire Limpio', 'logo14.png', '#AAAAAA', 'Calle 33', 'Granada', TRUE, 10),
('Aire Puro', 'logo15.png', '#DDAA00', 'Cra 56', 'Pasoancho', TRUE, 11),
('Cali Respira', 'logo16.png', '#00DDEE', 'Calle 3', 'San Bosco', TRUE, 12),
('CalimaAire', 'logo17.png', '#882244', 'Calle 16', 'Calima', TRUE, 13),
('La Base Ambiental', 'logo18.png', '#3355DD', 'Calle 72', 'La Base', TRUE, 14),
('SurAire', 'logo19.png', '#EE8844', 'Calle 48', 'El Ingenio', TRUE, 15),
('AsocAmbiental', 'logo20.png', '#AA33AA', 'Calle 22', 'La Merced', TRUE, 16);

------------------------------------------------
-- INSERT INTO station (20 registros)
-- incluye: sin admin + varias sin institución
------------------------------------------------
INSERT INTO station (s_name, lat, lon, calibration_certificate, maintenance_date, admin_id, s_state, institution_id) VALUES
('Estacion Sur', 3.401200, -76.540300, 'cert1.pdf', '2024-03-10', 5, 'activo', 1),
('Estacion Norte', 3.460100, -76.520400, 'cert2.pdf', '2024-04-12', 6, 'activo', 2),
('Estacion Centro', 3.451000, -76.532000, 'cert3.pdf', '2024-02-08', 7, 'mantenimiento', 3),
('Estacion Pance', 3.333300, -76.600100, 'cert4.pdf', '2024-01-15', 21, 'activo', 4),
('Estacion San Antonio', 3.452200, -76.542300, 'cert5.pdf', '2024-03-28', 8, 'inactivo', 5),
('Estacion Flora', 3.470800, -76.520000, 'cert6.pdf', '2024-03-01', 22, 'activo', 6),
('Estacion Pasoancho', 3.397000, -76.530000, 'cert7.pdf', '2024-02-20', 23, 'activo', 7),
('Estacion 100', 3.368000, -76.522200, 'cert8.pdf', '2024-01-11', 24, 'activo', 8),
('Estacion Ingenio', 3.373000, -76.540100, 'cert9.pdf', '2024-04-01', 25, 'activo', 9),
-- estaciones sin institución
('Estacion SinInst1', 3.450000, -76.531000, NULL, NULL, 5, 'activo', NULL),
('Estacion SinInst2', 3.448000, -76.533000, NULL, NULL, 6, 'inactivo', NULL),
('Estacion SinInst3', 3.449500, -76.534200, NULL, NULL, 7, 'activo', NULL),
('Estacion SinInst4', 3.420000, -76.510000, NULL, NULL, 8, 'mantenimiento', NULL),
-- estación sin admin
('Estacion SinAdmin', 3.410000, -76.500000, NULL, NULL, NULL, 'activo', 10),
('Estacion Aguablanca', 3.420000, -76.485000, 'certA.pdf','2024-03-20', 21, 'activo', 11),
('Estacion Menga', 3.490000, -76.520000, 'certB.pdf','2024-02-22', 22, 'activo', 12),
('Estacion Calima', 3.480000, -76.530000, 'certC.pdf','2024-03-01', 23, 'activo', 13),
('Estacion Versalles', 3.465000, -76.525000, 'certD.pdf','2024-01-18', 24, 'inactivo', 14),
('Estacion Prados', 3.460000, -76.535000, 'certE.pdf','2024-02-14', 25, 'activo', 15),
('Estacion Limonar', 3.390000, -76.540000, 'certF.pdf','2024-02-26', 21, 'activo', 16);

-----------------------------------------
-- INSERT INTO sensor (20 registros)
-----------------------------------------
INSERT INTO sensor (s_type, installment_date, s_state, station_id, last_calibration_date) VALUES
('PM2.5', '2024-01-10', 'activo', 1, '2024-03-01'),
('PM10',  '2024-01-11', 'activo', 1, '2024-03-02'),
('SO2',   '2024-01-12', 'inactivo', 2, '2024-03-03'),
('NO2',   '2024-01-13', 'activo', 3, '2024-03-04'),
('O3',    '2024-01-14', 'activo', 4, '2024-03-05'),
('CO',    '2024-01-15', 'mantenimiento', 5, '2024-03-06'),
('Temperature', '2024-01-16', 'activo', 6, '2024-03-07'),
('Humidity',    '2024-01-17', 'activo', 7, '2024-03-08'),
('WindSpeed',   '2024-01-18', 'activo', 8, '2024-03-09'),
('PM10',  '2024-01-19', 'activo', 9, '2024-03-10'),
('PM2.5', '2024-02-01', 'activo', 10, '2024-03-11'),
('SO2',   '2024-02-02', 'inactivo', 11, '2024-03-12'),
('NO2',   '2024-02-03', 'activo', 12, '2024-03-13'),
('O3',    '2024-02-04', 'activo', 13, '2024-03-14'),
('CO',    '2024-02-05', 'activo', 14, '2024-03-15'),
('Humidity', '2024-02-06', 'activo', 15, '2024-03-16'),
('WindSpeed','2024-02-07','activo', 16,'2024-03-17'),
('Temperature','2024-02-08','activo', 17,'2024-03-18'),
('PM10','2024-02-09','activo', 18,'2024-03-19'),
('PM2.5','2024-02-10','activo', 19,'2024-03-20');

-----------------------------------------
-- INSERT INTO variable (20 registros)
-----------------------------------------
INSERT INTO variable (v_name, v_unit, v_type) VALUES
('PM2.5', 'µg/m3', 'contaminante'),
('PM10', 'µg/m3', 'contaminante'),
('SO2', 'ppm', 'contaminante'),
('NO2', 'ppm', 'contaminante'),
('O3', 'ppm', 'contaminante'),
('CO', 'ppm', 'contaminante'),
('Temperatura', '°C', 'meteorologica'),
('Humedad', '%', 'meteorologica'),
('Velocidad Viento', 'm/s', 'meteorologica'),
('Presion', 'hPa', 'meteorologica'),
('Radiacion Solar', 'W/m2', 'meteorologica'),
('Lluvia', 'mm', 'meteorologica'),
('CO2', 'ppm', 'contaminante'),
('NH3', 'ppm', 'contaminante'),
('PM1', 'µg/m3', 'contaminante'),
('UV Index', 'UV', 'meteorologica'),
('Visibilidad', 'm', 'meteorologica'),
('Direccion Viento', '°', 'meteorologica'),
('VOC', 'ppm', 'contaminante'),
('H2S', 'ppm', 'contaminante');

-----------------------------------------
-- INSERT INTO measurement (20 registros)
-----------------------------------------
INSERT INTO measurement (m_date, m_value, sensor_id, variable_id) VALUES
('2024-03-01 10:00', 35.2, 1, 1),
('2024-03-01 11:00', 42.8, 2, 2),
('2024-03-01 12:00', 0.010, 3, 3),
('2024-03-01 13:00', 0.020, 4, 4),
('2024-03-01 14:00', 0.030, 5, 5),
('2024-03-01 15:00', 0.040, 6, 6),
('2024-03-01 16:00', 28.5, 7, 7),
('2024-03-01 17:00', 60.2, 8, 8),
('2024-03-01 18:00', 4.5, 9, 9),
('2024-03-01 19:00', 30.1, 10, 2),
('2024-03-02 10:00', 25.4, 11, 1),
('2024-03-02 11:00', 0.050, 12, 3),
('2024-03-02 12:00', 0.060, 13, 4),
('2024-03-02 13:00', 0.070, 14, 5),
('2024-03-02 14:00', 0.080, 15, 6),
('2024-03-02 15:00', 65.0, 16, 8),
('2024-03-02 16:00', 5.2, 17, 9),
('2024-03-02 17:00', 22.3, 18, 7),
('2024-03-02 18:00', 33.8, 19, 2),
('2024-03-02 19:00', 40.5, 20, 1);
-----------------------------------------
-- Measurements últimos 7 días
INSERT INTO measurement (m_date, m_value, sensor_id, variable_id) VALUES
('2025-12-09 08:00', 34.5, 1, 1),
('2025-12-09 09:00', 48.2, 2, 2),
('2025-12-08 14:30', 0.012, 3, 3),
('2025-12-08 16:15', 0.018, 4, 4),
('2025-12-07 10:20', 0.031, 5, 5),
('2025-12-07 11:45', 0.045, 6, 6),
('2025-12-06 13:50', 27.9, 7, 7),
('2025-12-05 17:10', 63.3, 8, 8),
('2025-12-04 18:40', 5.1, 9, 9),
('2025-12-03 19:00', 29.7, 10, 2);
-----------------------------------------
-- Measurements del último mes
INSERT INTO measurement (m_date, m_value, sensor_id, variable_id) VALUES
('2025-12-02 09:30', 24.2, 11, 1),
('2025-12-01 15:00', 0.052, 12, 3),
('2025-11-30 13:40', 0.061, 13, 4),
('2025-11-29 11:10', 0.075, 14, 5),
('2025-11-28 10:05', 0.082, 15, 6),
('2025-11-25 16:20', 59.8, 16, 8),
('2025-11-22 14:15', 4.9, 17, 9),
('2025-11-19 17:50', 21.7, 18, 7),
('2025-11-15 12:00', 32.4, 19, 2),
('2025-11-10 08:45', 38.9, 20, 1);

-----------------------------------------
-- INSERT INTO report (20 registros)
-----------------------------------------
INSERT INTO report (r_type, r_description, institution_id) VALUES
('CalidadAire', 'Reporte general diario', 1),
('Tendencias', 'Tendencias de la semana', 2),
('Alertas', 'Niveles críticos', 3),
('CalidadAire', 'Reporte automático', 4),
('Infraestructura', 'Mantenimiento estaciones', 5),
('CalidadAire', 'Reporte mensual', 6),
('Tendencias', 'Comparación regional', 7),
('Alertas', 'Notificación por niveles altos', 8),
('CalidadAire', 'Reporte PM10', 9),
('CalidadAire', 'Reporte PM2.5', 10),
('Infraestructura', 'Estado sensores', 11),
('Tendencias', 'Histórico contaminantes', 12),
('CalidadAire', 'Reporte zonas norte', 13),
('CalidadAire', 'Reporte zonas sur', 14),
('CalidadAire', 'Reporte estaciones sin admin', 15),
('Alertas', 'Alertas tempranas', 16),
('Infraestructura', 'Log de mantenimiento', 17),
('CalidadAire', 'Reporte general', 18),
('Tendencias', 'Tendencias por estación', 19),
('Alertas', 'Notificaciones automáticas', 20);

-----------------------------------------
-- INSERT INTO report_log (20 registros)
-----------------------------------------
INSERT INTO report_log (report_id, institution_id, description) VALUES
(1,1,'Log generado'),
(2,2,'Log generado'),
(3,3,'Log generado'),
(4,4,'Log generado'),
(5,5,'Log generado'),
(6,6,'Log generado'),
(7,7,'Log generado'),
(8,8,'Log generado'),
(9,9,'Log generado'),
(10,10,'Log generado'),
(11,11,'Log generado'),
(12,12,'Log generado'),
(13,13,'Log generado'),
(14,14,'Log generado'),
(15,15,'Log generado'),
(16,16,'Log generado'),
(17,17,'Log generado'),
(18,18,'Log generado'),
(19,19,'Log generado'),
(20,20,'Log generado');
-----------------------------------------