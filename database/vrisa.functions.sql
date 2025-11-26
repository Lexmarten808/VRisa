--------------------- transacion de creacion de usuario ------------------------
CREATE OR REPLACE FUNCTION create_user(
    p_u_name VARCHAR,
    p_last_name VARCHAR,
    p_password VARCHAR,
    p_type VARCHAR,
    p_email VARCHAR,
    p_phone VARCHAR
)
RETURNS VOID AS $$
DECLARE
    new_user_id INT;
BEGIN
    -- iniciar transacción
    BEGIN

        INSERT INTO users (u_name, last_name, u_password, u_type)
        VALUES (p_u_name, p_last_name, p_password, p_type)
        RETURNING id INTO new_user_id;

        INSERT INTO email (u_id, email)
        VALUES (new_user_id, p_email);

        INSERT INTO phone_number (u_id, p_number)
        VALUES (new_user_id, p_phone);

        -- si todo OK
        COMMIT;

    EXCEPTION WHEN OTHERS THEN
        -- si algo falla, reversa todo
        ROLLBACK;
        RAISE NOTICE 'Error: %', SQLERRM;
    END;
END;
$$ LANGUAGE plpgsql;

---------------------- transacion de creacion de institucion ------------------------
CREATE OR REPLACE FUNCTION create_institution(
    p_name VARCHAR,
    p_logo VARCHAR,
    p_color_set VARCHAR,
    p_street VARCHAR,
    p_neighborhood VARCHAR
)
RETURNS INT AS $$
DECLARE
    new_institution_id INT;
BEGIN
    BEGIN
        INSERT INTO institution (
            i_name, logo, color_set, street, neighborhood
        ) VALUES (
            p_name, p_logo, p_color_set, p_street, p_neighborhood
        )
        RETURNING institution_id INTO new_institution_id;

        COMMIT;
        RETURN new_institution_id;

    EXCEPTION WHEN OTHERS THEN
        ROLLBACK;
        RAISE NOTICE 'Error creating institution: %', SQLERRM;
        RETURN NULL;
    END;
END;
$$ LANGUAGE plpgsql;
-------------------------------------------------------------------------------------

---------------------- transacion de creacion de estacion ------------------------
CREATE OR REPLACE FUNCTION create_station(
    p_s_name VARCHAR,
    p_lat DECIMAL,
    p_lon DECIMAL,
    p_calibration_certificate VARCHAR,
    p_maintenance_date TIMESTAMP,
    p_admin_id INT,
    p_institution_id INT,
    p_s_state VARCHAR
)
RETURNS INT AS $$
DECLARE
    new_station_id INT;
    admin_exists BOOLEAN;
    inst_exists BOOLEAN;
BEGIN
    -- Iniciar transacción
    BEGIN

        -- Validar que el admin exista
        SELECT EXISTS(
            SELECT 1 FROM user WHERE id = p_admin_id
        ) INTO admin_exists;

        IF NOT admin_exists THEN
            RAISE EXCEPTION 'Admin with ID % does not exist', p_admin_id;
        END IF;

        -- Validar que la institución exista
        SELECT EXISTS(
            SELECT 1 FROM institution WHERE institution_id = p_institution_id
        ) INTO inst_exists;

        IF NOT inst_exists THEN
            RAISE EXCEPTION 'Institution with ID % does not exist', p_institution_id;
        END IF;

        -- Insertar estación
        INSERT INTO station (
            s_name, lat, lon, calibration_certificate,
            maintenance_date, admin_id, s_state, institution_id
        )
        VALUES (
            p_s_name, p_lat, p_lon, p_calibration_certificate,
            p_maintenance_date, p_admin_id, p_s_state, p_institution_id
        )
        RETURNING station_id INTO new_station_id;

        COMMIT;
        RETURN new_station_id;

    EXCEPTION WHEN OTHERS THEN
        ROLLBACK;
        RAISE NOTICE 'Error creating station: %', SQLERRM;
        RETURN NULL;
    END;

END;
$$ LANGUAGE plpgsql;
-------------------------------------------------------------------------------------

---------------------- transacion de creacion de sensor ------------------------
CREATE OR REPLACE FUNCTION create_sensor(
    p_s_type VARCHAR,
    p_installment_date TIMESTAMP,
    p_s_state VARCHAR,
    p_station_id INT
)
RETURNS INT AS $$
DECLARE
    new_sensor_id INT;
    station_exists BOOLEAN;
BEGIN
    BEGIN
        -- Validar que la estación exista
        SELECT EXISTS(
            SELECT 1 FROM station WHERE station_id = p_station_id
        ) INTO station_exists;

        IF NOT station_exists THEN
            RAISE EXCEPTION 'Station with ID % does not exist', p_station_id;
        END IF;

        -- Insertar sensor
        INSERT INTO sensor (
            s_type,
            installment_date,
            s_state,
            station_id,
            last_calibration_date
        )
        VALUES (
            p_s_type,
            p_installment_date,
            p_s_state,
            p_station_id,
            NOW()   -- esto puedes cambiarlo si quieres
        )
        RETURNING sensor_id INTO new_sensor_id;

        COMMIT;
        RETURN new_sensor_id;

    EXCEPTION WHEN OTHERS THEN
        ROLLBACK;
        RAISE NOTICE 'Error creating sensor: %', SQLERRM;
        RETURN NULL;
    END;
END;
$$ LANGUAGE plpgsql;
-------------------------------------------------------------------------------------

---------------------- transacion de creacion de medicion ------------------------
CREATE OR REPLACE FUNCTION create_measurement(
    p_m_date TIMESTAMP,
    p_m_value DECIMAL,
    p_sensor_id INT,
    p_variable_id INT
)
RETURNS INT AS $$
DECLARE
    new_measurement_id INT;
    sensor_exists BOOLEAN;
    variable_exists BOOLEAN;
BEGIN
    BEGIN
        -- Valida la existencia del sensor
        SELECT EXISTS(
            SELECT 1 FROM sensor WHERE sensor_id = p_sensor_id
        ) INTO sensor_exists;

        IF NOT sensor_exists THEN
            RAISE EXCEPTION 'Sensor with ID % does not exist', p_sensor_id;
        END IF;

        -- Valida la existencia de la variable
        SELECT EXISTS(
            SELECT 1 FROM variable WHERE v_id = p_variable_id
        ) INTO variable_exists;

        IF NOT variable_exists THEN
            RAISE EXCEPTION 'Variable with ID % does not exist', p_variable_id;
        END IF;

        -- Insertar medición
        INSERT INTO measurement (
            m_date, m_value, sensor_id, variable_id
        )
        VALUES (
            p_m_date, p_m_value, p_sensor_id, p_variable_id
        )
        RETURNING m_id INTO new_measurement_id;

        COMMIT;
        RETURN new_measurement_id;

    EXCEPTION WHEN OTHERS THEN
        ROLLBACK;
        RAISE NOTICE 'Error creating measurement: %', SQLERRM;
        RETURN NULL;
    END;

END;
$$ LANGUAGE plpgsql;
-------------------------------------------------------------------------------------