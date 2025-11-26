/*CREATE DATABASE IF NOT EXISTS dataclean CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci;
USE dataclean;*/

-- Usuarios
CREATE TABLE IF NOT EXISTS usuario (
  id CHAR(36) PRIMARY KEY,
  nombre VARCHAR(120) NOT NULL,
  rol ENUM('ADMIN','LAVADO','DESPACHO') NOT NULL,
  email VARCHAR(120) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Clientes
CREATE TABLE IF NOT EXISTS cliente (
  id CHAR(36) PRIMARY KEY,
  nombre VARCHAR(120) NOT NULL,
  identificacion VARCHAR(30) NOT NULL UNIQUE,
  direccion VARCHAR(160),
  telefono VARCHAR(30),
  correo VARCHAR(120),
  ciudad VARCHAR(80),
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Lavado
CREATE TABLE IF NOT EXISTS lavado (
  id CHAR(36) PRIMARY KEY,
  cliente_id CHAR(36) NOT NULL,
  fecha DATETIME NOT NULL,
  turno VARCHAR(20) NOT NULL,
  bajaKg DECIMAL(10,2) NOT NULL DEFAULT 0,
  altaKg DECIMAL(10,2) NOT NULL DEFAULT 0,
  infectoKg DECIMAL(10,2) NOT NULL DEFAULT 0,
  reprocesoKg DECIMAL(10,2) NOT NULL DEFAULT 0,
  desmancheKg DECIMAL(10,2) NOT NULL DEFAULT 0,
  totalKg DECIMAL(10,2) AS (bajaKg+altaKg+infectoKg+reprocesoKg+desmancheKg) STORED,
  creado_por CHAR(36) NOT NULL,
  CONSTRAINT fk_lavado_cliente FOREIGN KEY (cliente_id) REFERENCES cliente(id),
  CONSTRAINT fk_lavado_usuario FOREIGN KEY (creado_por) REFERENCES usuario(id),
  INDEX idx_lavado_cliente_fecha (cliente_id, fecha),
  INDEX idx_lavado_turno (turno)
) ENGINE=InnoDB;

-- Despacho
CREATE TABLE IF NOT EXISTS despacho (
  id CHAR(36) PRIMARY KEY,
  cliente_id CHAR(36) NOT NULL,
  fecha DATETIME NOT NULL,
  turno VARCHAR(20) NOT NULL,
  kilosDespachados DECIMAL(10,2) NOT NULL CHECK (kilosDespachados >= 0),
  estado ENUM('PENDIENTE','ENTREGADO','CERRADO') NOT NULL DEFAULT 'PENDIENTE',
  creado_por CHAR(36) NOT NULL,
  CONSTRAINT fk_despacho_cliente FOREIGN KEY (cliente_id) REFERENCES cliente(id),
  CONSTRAINT fk_despacho_usuario FOREIGN KEY (creado_por) REFERENCES usuario(id),
  INDEX idx_despacho_cliente_fecha (cliente_id, fecha),
  INDEX idx_despacho_estado (estado)
) ENGINE=InnoDB;

-- Remisión
CREATE TABLE IF NOT EXISTS remision (
  id CHAR(36) PRIMARY KEY,
  despacho_id CHAR(36) NOT NULL,
  numero VARCHAR(40) NOT NULL UNIQUE,
  tipo ENUM('DIGITAL','FISICO') NOT NULL,
  fecha DATETIME NOT NULL,
  CONSTRAINT fk_remision_despacho FOREIGN KEY (despacho_id) REFERENCES despacho(id)
) ENGINE=InnoDB;

-- Incidencias
CREATE TABLE IF NOT EXISTS incidencia (
  id CHAR(36) PRIMARY KEY,
  despacho_id CHAR(36) NOT NULL,
  fecha DATETIME NOT NULL,
  detalle TEXT NOT NULL,
  creado_por CHAR(36) NOT NULL,
  CONSTRAINT fk_incidencia_despacho FOREIGN KEY (despacho_id) REFERENCES despacho(id),
  CONSTRAINT fk_incidencia_usuario FOREIGN KEY (creado_por) REFERENCES usuario(id),
  INDEX idx_incidencia_despacho_fecha (despacho_id, fecha)
) ENGINE=InnoDB;

-- Relación despacho-lavado
CREATE TABLE IF NOT EXISTS r_despacho_lavado (
  id CHAR(36) PRIMARY KEY,
  despacho_id CHAR(36) NOT NULL,
  lavado_id CHAR(36) NOT NULL,
  kilosAsignados DECIMAL(10,2) NOT NULL CHECK (kilosAsignados >= 0),
  CONSTRAINT fk_rdl_despacho FOREIGN KEY (despacho_id) REFERENCES despacho(id),
  CONSTRAINT fk_rdl_lavado FOREIGN KEY (lavado_id) REFERENCES lavado(id),
  CONSTRAINT uq_rdl UNIQUE (despacho_id, lavado_id)
) ENGINE=InnoDB;

-- KPIs
CREATE OR REPLACE VIEW v_kpi_diario AS
SELECT DATE(fecha) AS dia,
       SUM(totalKg) AS kg_lavados,
       (SELECT IFNULL(SUM(kilosDespachados),0) FROM despacho d2 WHERE DATE(d2.fecha)=DATE(l.fecha)) AS kg_despachados
FROM lavado l
GROUP BY DATE(fecha);