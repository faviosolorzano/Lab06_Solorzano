import type { Response, NextFunction } from 'express';
import type { AbacRequest } from './abac.middleware.ts';
import { buscarDocumentoPorId } from '../../modules/documents/document.service.ts';

export async function cargarDocumentoABAC(
  req: AbacRequest,
  res: Response,
  next: NextFunction
) {
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
      propietarioId: documento.propietarioId,
      departamentoId: documento.departamentoId,
      nivelConfidencialidad: documento.nivelConfidencialidad,
      pais: documento.pais
    };

    next();

  } catch (error) {
    console.error('Error al cargar recurso ABAC:', error);

    return res.status(500).json({
      mensaje: 'Error al cargar el documento'
    });
  }
}