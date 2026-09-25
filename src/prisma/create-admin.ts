import { db } from './db.ts';
import { crearUsuario } from '../modules/users/user.service.ts';

const rolAdministrador = await db.orm.public.Rol
  .where({ nombre: 'ADMINISTRADOR' })
  .first();

if (!rolAdministrador) {
  throw new Error('No se encontró el rol ADMINISTRADOR');
}

const usuario = await crearUsuario({
  nombre: 'Administrador SecureDocs',
  correo: 'admin@securedocs.com',
  password: 'Admin123!',
  rolId: rolAdministrador.id,
  nivelSeguridad: 5,
  pais: 'PERU',
  tipoContrato: 'INTERNO'
});

console.log('Usuario creado correctamente:');
console.log({
  id: usuario.id,
  nombre: usuario.nombre,
  correo: usuario.correo,
  rolId: usuario.rolId,
  estado: usuario.estado
});

await db.close();