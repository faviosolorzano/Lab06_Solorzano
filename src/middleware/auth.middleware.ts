import type { Request, Response, NextFunction } from 'express';
import { verificarToken, type TokenPayload } from '../modules/auth/auth.service.ts';

export interface AuthRequest extends Request {
  usuario?: TokenPayload;
}

export function autenticarToken(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const authorization = req.headers.authorization;

  if (!authorization) {
    return res.status(401).json({
      mensaje: 'Token de acceso requerido'
    });
  }

  const [tipo, token] = authorization.split(' ');

  if (tipo !== 'Bearer' || !token) {
    return res.status(401).json({
      mensaje: 'Formato de token inválido'
    });
  }

  try {
    const usuario = verificarToken(token);

    req.usuario = usuario;

    next();
  } catch {
    return res.status(401).json({
      mensaje: 'Token inválido o expirado'
    });
  }
}