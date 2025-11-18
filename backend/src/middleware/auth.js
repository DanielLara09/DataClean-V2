import jwt from 'jsonwebtoken';

export function auth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({error:'No token'});
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload; // { id, rol, nombre }
    return next();
  } catch (e) {
    return res.status(401).json({error:'Token inválido'});
  }
}

export function allow(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.rol)) return res.status(403).json({error:'Sin permisos'});
    next();
  };
}