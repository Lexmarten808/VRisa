--------------- usuarios ------------------------
CREATE TABLE user (
    id SERIAL PRIMARY KEY,
    u_name VARCHAR(50)  NOT NULL,
    last_name VARCHAR(50)  NOT NULL,
    u_password VARCHAR(50) NOT NULL,
    creation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- hora de creaccion
    u_type VARCHAR(20) NOT NULL --tipo de usuario: admin, regular,invitado (super_admin admite nuevos usuarios)
);
----------------- relaciones de contacto ------------------------
CREATE TABLE email (
    email_id SERIAL PRIMARY KEY,
    u_id INT REFERENCES user(id),
    email VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE phone_number(
    p_number_id SERIAL PRIMARY KEY,
    u_id INT REFERENCES user(id),
    p_number VARCHAR(15) UNIQUE NOT NULL
);
---- un usuario puede tener varios emails y numeros de telefono
-------------- email y phone number ------------------------ usados para el login en la aplicacion
    
------------------ instituciones ------------------------
CREATE TABLE institution(
    institution_id SERIAL PRIMARY KEY,
    i_name VARCHAR(100) NOT NULL,
    logo VARCHAR(100),
    color_set VARCHAR(50),  -- set de colores de la institucion
    street VARCHAR(100),    -- calle
    neighborhood VARCHAR(100), --barrio djanjo no soporta tipos personalizados
    validado BOOLEAN DEFAULT FALSE
);

------------------ estaciones ------------------------
CREATE TABLE station(
    station_id SERIAL PRIMARY KEY,
    s_name VARCHAR(100) NOT NULL,
    lat DECIMAL(9,6) NOT NULL,
    lon DECIMAL(9,6) NOT NULL,
    calibration_certificate VARCHAR(100),
    maintenance_date TIMESTAMP,
    admin_id INT REFERENCES user(id),
    s_state VARCHAR(20) NOT NULL, -- activo, inactivo, mantenimiento
    institution_id INT REFERENCES institution(institution_id) ON DELETE SET NULL
);
------------------ sensores ------------------------
CREATE TABLE sensor(
    sensor_id SERIAL PRIMARY KEY,
    s_type VARCHAR(50) NOT NULL,
    installment_date TIMESTAMP,
    s_state VARCHAR(20) NOT NULL, -- activo, inactivo, mantenimiento
    station_id INT REFERENCES station(station_id) ON DELETE RESTRICT,
    last_calibration_date TIMESTAMP
);
------------------ variables ------------------------
CREATE TABLE variable(
    v_id SERIAL PRIMARY KEY,
    v_name VARCHAR(100) NOT NULL,
    v_unit VARCHAR(20) NOT NULL,
    v_type VARCHAR(50) NOT NULL
);
------------------ mediciones ------------------------
CREATE TABLE measurement(
    m_id SERIAL PRIMARY KEY,
    m_date TIMESTAMP NOT NULL,
    m_value DECIMAL(10,4) NOT NULL,
    sensor_id INT REFERENCES sensor(sensor_id) ON DELETE RESTRICT,
    variable_id INT REFERENCES variable(v_id) ON DELETE RESTRICT
);
------------------ reportes ------------------------
CREATE TABLE report(
    report_id SERIAL PRIMARY KEY,
    r_type VARCHAR(50) NOT NULL,
    generation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    r_description TEXT,
    institution_id INT REFERENCES institution(institution_id) ON DELETE RESTRICT
);
-- creacion del log para los reportes 
CREATE TABLE report_log (
    log_id SERIAL PRIMARY KEY,
    report_id INT NOT NULL,
    institution_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    description TEXT,

    FOREIGN KEY (report_id) REFERENCES report(report_id) ON DELETE RESTRICT,
    FOREIGN KEY (institution_id) REFERENCES institution ON DELETE RESTRICT (institution_id)
);
------ se utilizara un trigger para insertar en el log cada vez que se cree un reporte
-------------------------------------------------------------------------------------