import { db } from '../../prisma/db.ts';

export interface CrearDocumentoDTO {
  titulo: string;
  descripcion?: string;
  propietarioId: number;
  departamentoId: number;
  nivelConfidencialidad: number;
  pais?: string;
}

export async function crearDocumento(datos: CrearDocumentoDTO) {
  return db.orm.public.Documento.create({
    titulo: datos.titulo,
    descripcion: datos.descripcion ?? null,
    propietarioId: datos.propietarioId,
    departamentoId: datos.departamentoId,
    nivelConfidencialidad: datos.nivelConfidencialidad,
    pais: datos.pais ?? 'PERU',
    estado: 'PENDIENTE'
  });
}

export async function buscarDocumentoPorId(id: number) {
  return db.orm.public.Documento
    .where({ id })
    .first();
}

export async function listarDocumentos() {
  return db.orm.public.Documento.all();
}

export async function modificarDocumento(
  id: number,
  datos: {
    titulo?: string;
    descripcion?: string;
    nivelConfidencialidad?: number;
  }
) {
  return db.orm.public.Documento
    .where({ id })
    .update({
      ...datos
    });
}

export async function eliminarDocumento(id: number) {
  return db.orm.public.Documento
    .where({ id })
    .delete();
}

export async function aprobarDocumento(id: number) {
  return db.orm.public.Documento
    .where({ id })
    .update({
      estado: 'APROBADO'
    });
}