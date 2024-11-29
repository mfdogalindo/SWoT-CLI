/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

-- Crear la base de datos
CREATE DATABASE IF NOT EXISTS nursing_home_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE nursing_home_db;

-- Tabla de zonas
CREATE TABLE zones (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  type ENUM('ROOM', 'BATHROOM', 'LIVING_ROOM', 'DINING_ROOM', 'YARD') NOT NULL,
  description TEXT,
  default_temperature DECIMAL(4,1) DEFAULT 22.0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_zone_type (type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de personas
CREATE TABLE persons (
  id VARCHAR(36) PRIMARY KEY,
  type ENUM('resident', 'nurse', 'staff') NOT NULL,
  name VARCHAR(100) NOT NULL,
  preferred_temp DECIMAL(4,1),
  room_id VARCHAR(36),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (room_id) REFERENCES zones(id),
  INDEX idx_person_type (type),
  INDEX idx_person_active (active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de sensores
CREATE TABLE sensors (
  id VARCHAR(36) PRIMARY KEY,
  type ENUM('LOCATION', 'MOVEMENT') NOT NULL,
  person_id VARCHAR(36) NOT NULL,
  description TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (person_id) REFERENCES persons(id),
  INDEX idx_sensor_type (type),
  INDEX idx_sensor_active (active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de actuadores
CREATE TABLE actuators (
  id VARCHAR(36) PRIMARY KEY,
  type ENUM('TEMPERATURE', 'LIGHT', 'ALARM') NOT NULL,
  zone_id VARCHAR(36) NOT NULL,
  current_value VARCHAR(50),
  description TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (zone_id) REFERENCES zones(id),
  INDEX idx_actuator_type (type),
  INDEX idx_actuator_active (active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de horarios de iluminación por zona
CREATE TABLE lighting_schedules (
  id VARCHAR(36) PRIMARY KEY,
  zone_id VARCHAR(36) NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (zone_id) REFERENCES zones(id),
  INDEX idx_zone_schedule (zone_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insertar datos de ejemplo para zonas
INSERT INTO zones (id, name, type, description, default_temperature) VALUES
('room1', 'Habitación 1', 'ROOM', 'Habitación individual con baño', 22.0),
('room2', 'Habitación 2', 'ROOM', 'Habitación individual con baño', 22.0),
('room3', 'Habitación 3', 'ROOM', 'Habitación individual con baño', 22.0),
('room4', 'Habitación 4', 'ROOM', 'Habitación individual con baño', 22.0),
('room5', 'Habitación 5', 'ROOM', 'Habitación individual con baño', 22.0),
('bathroom1', 'Baño 1', 'BATHROOM', 'Baño de habitación 1', 23.0),
('bathroom2', 'Baño 2', 'BATHROOM', 'Baño de habitación 2', 23.0),
('bathroom3', 'Baño 3', 'BATHROOM', 'Baño de habitación 3', 23.0),
('bathroom4', 'Baño 4', 'BATHROOM', 'Baño de habitación 4', 23.0),
('bathroom5', 'Baño 5', 'BATHROOM', 'Baño de habitación 5', 23.0),
('living_room', 'Sala de Estar', 'LIVING_ROOM', 'Sala común de estar', 22.0),
('dining_room', 'Comedor', 'DINING_ROOM', 'Sala común de comidas', 22.0),
('yard', 'Patio', 'YARD', 'Área exterior', NULL);

-- Insertar datos de ejemplo para personas
INSERT INTO persons (id, type, name, preferred_temp, room_id) VALUES
('resident1', 'resident', 'Juan Pérez', 23.5, 'room1'),
('resident2', 'resident', 'María García', 22.0, 'room2'),
('resident3', 'resident', 'Carlos López', 21.5, 'room3'),
('resident4', 'resident', 'Ana Martínez', 23.0, 'room4'),
('resident5', 'resident', 'Luis Rodríguez', 22.5, 'room5'),
('nurse1', 'nurse', 'Patricia Sánchez', NULL, NULL),
('nurse2', 'nurse', 'Roberto Fernández', NULL, NULL),
('staff1', 'staff', 'Carmen Torres', NULL, NULL);

-- Insertar datos de ejemplo para sensores
INSERT INTO sensors (id, type, person_id, description) VALUES
('location_resident1', 'LOCATION', 'resident1', 'Sensor de ubicación residente 1'),
('movement_resident1', 'MOVEMENT', 'resident1', 'Sensor de movimiento residente 1'),
('location_resident2', 'LOCATION', 'resident2', 'Sensor de ubicación residente 2'),
('movement_resident2', 'MOVEMENT', 'resident2', 'Sensor de movimiento residente 2'),
('location_resident3', 'LOCATION', 'resident3', 'Sensor de ubicación residente 3'),
('movement_resident3', 'MOVEMENT', 'resident3', 'Sensor de movimiento residente 3'),
('location_resident4', 'LOCATION', 'resident4', 'Sensor de ubicación residente 4'),
('movement_resident4', 'MOVEMENT', 'resident4', 'Sensor de movimiento residente 4'),
('location_resident5', 'LOCATION', 'resident5', 'Sensor de ubicación residente 5'),
('movement_resident5', 'MOVEMENT', 'resident5', 'Sensor de movimiento residente 5'),
('location_nurse1', 'LOCATION', 'nurse1', 'Sensor de ubicación enfermera 1'),
('location_nurse2', 'LOCATION', 'nurse2', 'Sensor de ubicación enfermera 2'),
('location_staff1', 'LOCATION', 'staff1', 'Sensor de ubicación personal 1');

-- Insertar datos de ejemplo para actuadores
INSERT INTO actuators (id, type, zone_id, current_value, description) VALUES
('temp_room1', 'TEMPERATURE', 'room1', '22.0', 'Control de temperatura habitación 1'),
('light_room1', 'LIGHT', 'room1', 'false', 'Control de luz habitación 1'),
('temp_room2', 'TEMPERATURE', 'room2', '22.0', 'Control de temperatura habitación 2'),
('light_room2', 'LIGHT', 'room2', 'false', 'Control de luz habitación 2'),
('temp_room3', 'TEMPERATURE', 'room3', '22.0', 'Control de temperatura habitación 3'),
('light_room3', 'LIGHT', 'room3', 'false', 'Control de luz habitación 3'),
('temp_room4', 'TEMPERATURE', 'room4', '22.0', 'Control de temperatura habitación 4'),
('light_room4', 'LIGHT', 'room4', 'false', 'Control de luz habitación 4'),
('temp_room5', 'TEMPERATURE', 'room5', '22.0', 'Control de temperatura habitación 5'),
('light_room5', 'LIGHT', 'room5', 'false', 'Control de luz habitación 5'),
('temp_bathroom1', 'TEMPERATURE', 'bathroom1', '23.0', 'Control de temperatura baño 1'),
('light_bathroom1', 'LIGHT', 'bathroom1', 'false', 'Control de luz baño 1'),
('temp_bathroom2', 'TEMPERATURE', 'bathroom2', '23.0', 'Control de temperatura baño 2'),
('light_bathroom2', 'LIGHT', 'bathroom2', 'false', 'Control de luz baño 2'),
('temp_bathroom3', 'TEMPERATURE', 'bathroom3', '23.0', 'Control de temperatura baño 3'),
('light_bathroom3', 'LIGHT', 'bathroom3', 'false', 'Control de luz baño 3'),
('temp_bathroom4', 'TEMPERATURE', 'bathroom4', '23.0', 'Control de temperatura baño 4'),
('light_bathroom4', 'LIGHT', 'bathroom4', 'false', 'Control de luz baño 4'),
('temp_bathroom5', 'TEMPERATURE', 'bathroom5', '23.0', 'Control de temperatura baño 5'),
('light_bathroom5', 'LIGHT', 'bathroom5', 'false', 'Control de luz baño 5'),
('temp_living_room', 'TEMPERATURE', 'living_room', '22.0', 'Control de temperatura sala de estar'),
('light_living_room', 'LIGHT', 'living_room', 'false', 'Control de luz sala de estar'),
('alarm_living_room', 'ALARM', 'living_room', 'false', 'Alarma sala de estar'),
('temp_dining_room', 'TEMPERATURE', 'dining_room', '22.0', 'Control de temperatura comedor'),
('light_dining_room', 'LIGHT', 'dining_room', 'false', 'Control de luz comedor'),
('temp_yard', 'TEMPERATURE', 'yard', '22.0', 'Control de temperatura patio'),
('light_yard', 'LIGHT', 'yard', 'false', 'Control de luz patio');

-- Insertar horarios de iluminación para zonas comunes
INSERT INTO lighting_schedules (id, zone_id, start_time, end_time) VALUES
(UUID(), 'living_room', '17:00:00', '07:00:00'),
(UUID(), 'dining_room', '17:00:00', '07:00:00'),
(UUID(), 'yard', '17:00:00', '07:00:00');

-- Crear un usuario para la aplicación
CREATE USER IF NOT EXISTS 'nursing_home_user'@'%' IDENTIFIED BY 'your_secure_password';
GRANT SELECT, INSERT, UPDATE, DELETE ON nursing_home_db.* TO 'nursing_home_user'@'%';
FLUSH PRIVILEGES;


/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;