import { db } from '../../prisma/db.ts';

export async function tienePermiso(
  nombreRol: string,
  nombrePermiso: string
): Promise<boolean> {

  const rol = await db.orm.public.Rol
    .where({ nombre: nombreRol })
    .first();

  if (!rol) {
    return false;
  }

  const permiso = await db.orm.public.Permiso
    .where({ nombre: nombrePermiso })
    .first();

  if (!permiso) {
    return false;
  }

  const relacion = await db.orm.public.RolPermiso
    .where({
      rolId: rol.id,
      permisoId: permiso.id
    })
    .first();

  return relacion !== null;
}