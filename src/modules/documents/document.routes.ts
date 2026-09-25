import { Router } from 'express';

import {
  autenticarToken,
  type AuthRequest
} from '../../middleware/auth.middleware.ts';

import {
  requierePermiso
} from '../../authorization/rbac/rbac.middleware.ts';

import {
  autorizarABAC,
  type AbacRequest
} from '../../authorization/abac/abac.middleware.ts';

import {
  crearDocumento,
  listarDocumentos,
  buscarDocumentoPorId,
  modificarDocumento,
  eliminarDocumento,
  aprobarDocumento
} from './document.service.ts';

const router = Router();


// =====================================================
// CREAR DOCUMENTO
// =====================================================

router.post(
  '/',
  autenticarToken,
  requierePermiso('CREAR_DOCUMENTO'),

  async (req: AuthRequest, res) => {
    try {

      if (!req.usuario) {
        return res.status(401).json({
          mensaje: 'Usuario no autenticado'
        });
      }

      const {
        titulo,
        descripcion,
        departamentoId,
        nivelConfidencialidad,
        pais
      } = req.body;

      if (!titulo || !departamentoId || !nivelConfidencialidad) {
        return res.status(400).json({
          mensaje:
            'Título, departamento y nivel de confidencialidad son obligatorios'
        });
      }

      const documento = await crearDocumento({
        titulo,
        descripcion,
        propietarioId: req.usuario.id,
        departamentoId: Number(departamentoId),
        nivelConfidencialidad: Number(nivelConfidencialidad),
        pais: pais ?? 'PERU'
      });

      return res.status(201).json({
        mensaje: 'Documento creado correctamente',
        documento
      });

    } catch (error) {

      console.error(error);

      return res.status(500).json({
        mensaje: 'Error al crear el documento'
      });
    }
  }
);


// =====================================================
// LISTAR DOCUMENTOS
// =====================================================

router.get(
  '/',
  autenticarToken,
  requierePermiso('CONSULTAR_DOCUMENTO'),

  async (_req, res) => {
    try {

      const documentos = await listarDocumentos();

      return res.status(200).json({
        total: documentos.length,
        documentos
      });

    } catch (error) {

      console.error(error);

      return res.status(500).json({
        mensaje: 'Error al consultar los documentos'
      });
    }
  }
);


// =====================================================
// CONSULTAR DOCUMENTO POR ID
// RBAC + ABAC
// =====================================================

router.get(
  '/:id',

  autenticarToken,

  requierePermiso('CONSULTAR_DOCUMENTO'),

  // Cargar el documento real para que ABAC pueda evaluarlo
  async (req: AbacRequest, res, next) => {
    try {

      const id = Number(req.params.id);

      if (Number.isNaN(id)) {
        return res.status(400).json({
          mensaje: 'ID de documento inválido'
        });
      }

      const documento = await buscarDocumentoPorId(id);

      if (!documento) {
        return res.status(404).json({
          mensaje: 'Documento no encontrado'
        });
      }

      req.recursoABAC = {
        id: documento.id,
        propietarioId: documento.propietarioId,
        departamentoId: documento.departamentoId,
        nivelConfidencialidad: documento.nivelConfidencialidad,
        pais: documento.pais
      };

      next();

    } catch (error) {

      console.error(error);

      return res.status(500).json({
        mensaje: 'Error al cargar el documento para ABAC'
      });
    }
  },

  autorizarABAC('CONSULTAR_DOCUMENTO'),

  async (req, res) => {
    try {

      const id = Number(req.params.id);

      const documento = await buscarDocumentoPorId(id);

      return res.status(200).json({
        mensaje: 'Acceso autorizado por RBAC y ABAC',
        documento
      });

    } catch (error) {

      console.error(error);

      return res.status(500).json({
        mensaje: 'Error al consultar el documento'
      });
    }
  }
);


// =====================================================
// MODIFICAR DOCUMENTO
// =====================================================

router.put(
  '/:id',

  autenticarToken,

  requierePermiso('MODIFICAR_DOCUMENTO'),

  async (req, res) => {
    try {

      const id = Number(req.params.id);

      if (Number.isNaN(id)) {
        return res.status(400).json({
          mensaje: 'ID de documento inválido'
        });
      }

      const existente = await buscarDocumentoPorId(id);

      if (!existente) {
        return res.status(404).json({
          mensaje: 'Documento no encontrado'
        });
      }

      const documento = await modificarDocumento(id, {
        titulo: req.body.titulo,
        descripcion: req.body.descripcion,

        nivelConfidencialidad:
          req.body.nivelConfidencialidad !== undefined
            ? Number(req.body.nivelConfidencialidad)
            : undefined
      });

      return res.status(200).json({
        mensaje: 'Documento modificado correctamente',
        documento
      });

    } catch (error) {

      console.error(error);

      return res.status(500).json({
        mensaje: 'Error al modificar el documento'
      });
    }
  }
);


// =====================================================
// APROBAR DOCUMENTO
// =====================================================

router.patch(
  '/:id/aprobar',

  autenticarToken,

  requierePermiso('APROBAR_DOCUMENTO'),

  async (req, res) => {
    try {

      const id = Number(req.params.id);

      if (Number.isNaN(id)) {
        return res.status(400).json({
          mensaje: 'ID de documento inválido'
        });
      }

      const existente = await buscarDocumentoPorId(id);

      if (!existente) {
        return res.status(404).json({
          mensaje: 'Documento no encontrado'
        });
      }

      const documento = await aprobarDocumento(id);

      return res.status(200).json({
        mensaje: 'Documento aprobado correctamente',
        documento
      });

    } catch (error) {

      console.error(error);

      return res.status(500).json({
        mensaje: 'Error al aprobar el documento'
      });
    }
  }
);


// =====================================================
// ELIMINAR DOCUMENTO
// =====================================================

router.delete(
  '/:id',

  autenticarToken,

  requierePermiso('ELIMINAR_DOCUMENTO'),

  async (req, res) => {
    try {

      const id = Number(req.params.id);

      if (Number.isNaN(id)) {
        return res.status(400).json({
          mensaje: 'ID de documento inválido'
        });
      }

      const existente = await buscarDocumentoPorId(id);

      if (!existente) {
        return res.status(404).json({
          mensaje: 'Documento no encontrado'
        });
      }

      await eliminarDocumento(id);

      return res.status(200).json({
        mensaje: 'Documento eliminado correctamente'
      });

    } catch (error) {

      console.error(error);

      return res.status(500).json({
        mensaje: 'Error al eliminar el documento'
      });
    }
  }
);


export default router;