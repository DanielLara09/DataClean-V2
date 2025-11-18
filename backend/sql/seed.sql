USE dataclean;

INSERT INTO usuario (id, nombre, rol, email, password_hash) VALUES
  ('00000000-0000-0000-0000-000000000001','Admin','ADMIN','admin@dataclean.local','$2b$10$XGrgti8PJyjcPWKn8CmOauTuQ/Duht/qXmhbKfG2Jqx5Tk6h/jyvm'),
  ('00000000-0000-0000-0000-000000000002','Operario Lavado','LAVADO','lavado@dataclean.local','$2b$10$XGrgti8PJyjcPWKn8CmOauTuQ/Duht/qXmhbKfG2Jqx5Tk6h/jyvm'),
  ('00000000-0000-0000-0000-000000000003','Operario Despacho','DESPACHO','despacho@dataclean.local','$2b$10$XGrgti8PJyjcPWKn8CmOauTuQ/Duht/qXmhbKfG2Jqx5Tk6h/jyvm');

INSERT INTO cliente (id, nombre, identificacion, ciudad) VALUES
  ('c1111111-1111-1111-1111-111111111111','Hotel Caribe','900111222','Barranquilla'),
  ('c2222222-2222-2222-2222-222222222222','Clinica Norte','900333444','Barranquilla');