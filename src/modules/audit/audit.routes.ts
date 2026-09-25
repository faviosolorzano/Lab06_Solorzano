import { Router } from 'express';

import {
  autenticarToken
} from '../../middleware/auth.middleware.ts';

import {
  requierePermiso
} from '../../authorization/rbac/rbac.middleware.ts';

import {
  listarAuditoria
} from './audit.service.ts';

const router = Router();

router.get(
  '/',
  autenticarToken,
  requierePermiso('VER_AUDITORIA'),

  async (_req, res) => {
    try {
      const registros = await listarAuditoria();

      return res.status(200).json({
        total: registros.length,
        registros
      });

    } catch (error) {
      console.error(error);

      return res.status(500).json({
        mensaje: 'Error al consultar la auditoría'
      });
    }
  }
);

export default router;