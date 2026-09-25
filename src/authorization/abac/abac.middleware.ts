import type {
  Response,
  NextFunction
} from 'express';

import type {
  AuthRequest
} from '../../middleware/auth.middleware.ts';

import { db } from '../../prisma/db.ts';

import {
  evaluarABAC
} from './abac.engine.ts';

import {
  registrarAuditoria
} from '../../modules/audit/audit.service.ts';


export interface AbacRequest extends AuthRequest {

  recursoABAC?: {
    id?: number;
    propietarioId: number;
    departamentoId: number;
    nivelConfidencialidad: number;
    pais: string;
  };
}


export function autorizarABAC(accion: string) {

  return async (
    req: AbacRequest,
    res: Response,
    next: NextFunction
  ) => {

    try {

      if (!req.usuario) {

        return res.status(401).json({
          mensaje: 'Usuario no autenticado'
        });

      }


      const usuario = await db.orm.public.Usuario
        .where({
          id: req.usuario.id
        })
        .first();


      if (!usuario) {

        return res.status(401).json({
          mensaje: 'Usuario no encontrado'
        });

      }


      if (!req.recursoABAC) {

        return res.status(400).json({
          mensaje: 'No se encontró el recurso para evaluar ABAC'
        });

      }


      const resultado = evaluarABAC({

        sujeto: {

          id: usuario.id,

          rol: req.usuario.rol,

          departamentoId:
            usuario.departamentoId,

          nivelSeguridad:
            usuario.nivelSeguridad,

          pais:
            usuario.pais,

          tipoContrato:
            usuario.tipoContrato

        },


        recurso: {

          propietarioId:
            req.recursoABAC.propietarioId,

          departamentoId:
            req.recursoABAC.departamentoId,

          nivelConfidencialidad:
            req.recursoABAC.nivelConfidencialidad,

          pais:
            req.recursoABAC.pais

        },


        accion,


        contexto: {

          hora:
            new Date().getHours(),

          direccionIp:
            req.ip

        }

      });


      if (!resultado.permitido) {

        await registrarAuditoria({

          usuarioId:
            usuario.id,

          documentoId:
            req.recursoABAC.id ?? null,

          accion,

          recurso:
            'DOCUMENTO',

          resultado:
            'DENEGADO',

          motivo:
            resultado.motivo,

          direccionIp:
            req.ip ?? null,

          dispositivo:
            req.headers['user-agent'] ?? null

        });


        return res.status(403).json({

          mensaje:
            'Acceso denegado por ABAC',

          motivo:
            resultado.motivo

        });

      }


      await registrarAuditoria({

        usuarioId:
          usuario.id,

        documentoId:
          req.recursoABAC.id ?? null,

        accion,

        recurso:
          'DOCUMENTO',

        resultado:
          'PERMITIDO',

        motivo:
          resultado.motivo,

        direccionIp:
          req.ip ?? null,

        dispositivo:
          req.headers['user-agent'] ?? null

      });


      next();


    } catch (error) {

      console.error(
        'Error ABAC:',
        error
      );


      return res.status(500).json({

        mensaje:
          'Error al evaluar las políticas ABAC'

      });

    }

  };

}