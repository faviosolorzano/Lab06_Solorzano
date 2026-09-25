import { db } from '../../prisma/db.ts';

export interface AuditoriaDTO {
  usuarioId?: number | null;
  documentoId?: number | null;
  accion: string;
  recurso: string;
  resultado: 'PERMITIDO' | 'DENEGADO';
  motivo?: string | null;
  direccionIp?: string | null;
  ubicacion?: string | null;
  dispositivo?: string | null;
}

export async function registrarAuditoria(datos: AuditoriaDTO) {
  try {
    return await db.orm.public.Auditoria.create({
      usuarioId: datos.usuarioId ?? null,
      documentoId: datos.documentoId ?? null,
      accion: datos.accion,
      recurso: datos.recurso,
      resultado: datos.resultado,
      motivo: datos.motivo ?? null,
      direccionIp: datos.direccionIp ?? null,
      ubicacion: datos.ubicacion ?? null,
      dispositivo: datos.dispositivo ?? null
    });
  } catch (error) {
    console.error('Error registrando auditoría:', error);
    return null;
  }
}

export async function listarAuditoria() {
  return db.orm.public.Auditoria.all();
}