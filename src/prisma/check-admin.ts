import { db } from './db.ts';
import { compararPassword } from '../modules/users/user.service.ts';

const usuario = await db.orm.public.Usuario
  .where({ correo: 'admin@securedocs.com' })
  .first();

if (!usuario) {
  throw new Error('No se encontró el usuario administrador');
}

console.log('Usuario encontrado:', usuario.correo);

console.log(
  '¿La contraseña está cifrada?',
  usuario.password !== 'Admin123!'
);

console.log(
  '¿La contraseña correcta coincide?',
  await compararPassword('Admin123!', usuario.password)
);

console.log(
  '¿Una contraseña incorrecta coincide?',
  await compararPassword('ClaveIncorrecta', usuario.password)
);

await db.close();