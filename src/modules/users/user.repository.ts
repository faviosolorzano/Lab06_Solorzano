import { db } from '../../prisma/db.ts';

export async function buscarUsuarioPorCorreo(correo: string) {
  return db.orm.public.Usuario
    .where({ correo })
    .first();
}