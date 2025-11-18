# DataClean – MVP

## Requisitos
- Docker (para MySQL)
- Node 18+

## Pasos
1. **Base de datos**
   ```bash
   cd docker
   docker compose -f docker-compose.mysql.yml up -d
   mysql -h 127.0.0.1 -P 3306 -u root -psecret < ../backend/sql/schema.sql
   mysql -h 127.0.0.1 -P 3306 -u root -psecret < ../backend/sql/seed.sql
   ```

2. **Backend**
   ```bash
   cd ../backend
   cp .env.example .env
   npm i
   npm run dev
   ```

3. **Frontend**
   ```bash
   cd ../frontend
   npm i
   npm run dev
   ```

4. **Ingreso**
   - Usuario: `admin@dataclean.local`
   - Contraseña: `admin`

## Rutas
- Backend: http://localhost:4000
- Frontend: http://localhost:5173

> Nota: El seed crea usuarios con la misma contraseña para facilidad de prueba.