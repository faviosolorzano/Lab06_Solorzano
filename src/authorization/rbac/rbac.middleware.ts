import type { Response, NextFunction } from 'express';
import type { AuthRequest } from '../../middleware/auth.middleware.ts';
import { tienePermiso } from './rbac.service.ts';

export function requierePermiso(nombrePermiso: string) {

  return async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {

    if (!req.usuario) {
      return res.status(401).json({
        mensaje: 'Usuario no autenticado'
      });
    }

    try {
      const autorizado = await tienePermiso(
        req.usuario.rol,
        nombrePermiso
      );

      if (!autorizado) {
        return res.status(403).json({
          mensaje: 'No tiene permisos para realizar esta acción'
        });
      }

      next();

    } catch (error) {
      console.error('Error RBAC:', error);

      return res.status(500).json({
        mensaje: 'Error al verificar los permisos'
      });
    }
  };
}