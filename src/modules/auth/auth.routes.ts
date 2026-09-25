import { Router } from 'express';
import { login } from './auth.service.ts';
import { autenticarToken, type AuthRequest } from '../../middleware/auth.middleware.ts';
import { requierePermiso } from '../../authorization/rbac/rbac.middleware.ts';
import {
  autorizarABAC,
  type AbacRequest
} from '../../authorization/abac/abac.middleware.ts';

const router = Router();

router.post('/login', async (req, res) => {
  try {
    const { correo, password } = req.body;

    if (!correo || !password) {
      return res.status(400).json({
        mensaje: 'El correo y la contraseña son obligatorios'
      });
    }

    const resultado = await login(correo, password);

    return res.status(200).json({
      mensaje: 'Inicio de sesión correcto',
      token: resultado.token,
      usuario: resultado.usuario
    });

  } catch (error) {
    if (error instanceof Error) {
      return res.status(401).json({
        mensaje: error.message
      });
    }

    return res.status(500).json({
      mensaje: 'Error interno del servidor'
    });
  }
});

router.get('/me', autenticarToken, (req: AuthRequest, res) => {
  return res.status(200).json({
    mensaje: 'Usuario autenticado',
    usuario: req.usuario
  });
});


router.get(
  '/admin-test',
  autenticarToken,
  requierePermiso('GESTIONAR_USUARIOS'),
  (req: AuthRequest, res) => {
    return res.status(200).json({
      mensaje: 'Acceso autorizado por RBAC',
      usuario: req.usuario
    });
  }
);

router.get(
  '/abac-test',
  autenticarToken,

  (req: AbacRequest, res, next) => {
    req.recursoABAC = {
      propietarioId: 1,
      departamentoId: 1,
      nivelConfidencialidad: 3,
      pais: 'PERU'
    };

    next();
  },

  autorizarABAC('CONSULTAR_DOCUMENTO'),

  (req: AbacRequest, res) => {
    return res.status(200).json({
      mensaje: 'Acceso autorizado por ABAC',
      usuario: req.usuario
    });
  }
);
export default router;