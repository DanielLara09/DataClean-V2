/**
 * Middleware de autorización por rol.
 * Uso:
 *   app.get('/ruta', auth, allow('ADMIN', 'LAVADO'), handler);
 *   router.post('/x', auth, allow('ADMIN'), handler);
 */
export default function allow(...rolesPermitidos) {
  return (req, res, next) => {
    // auth.js debe haber puesto req.user
    if (!req.user) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    const rol = req.user.rol;

    if (!rolesPermitidos.includes(rol)) {
      return res.status(403).json({ error: 'No autorizado' });
    }

    next();
  };
}
