import { db } from './db.ts';
import { crearUsuario } from '../modules/users/user.service.ts';

try {
  const rolEmpleado = await db.orm.public.Rol
    .where({ nombre: 'EMPLEADO' })
    .first();

  if (!rolEmpleado) {
    throw new Error('No se encontró el rol EMPLEADO');
  }

  const usuario = await crearUsuario({
    nombre: 'Empleado SecureDocs',
    correo: 'empleado@securedocs.com',
    password: 'Empleado123!',
    rolId: rolEmpleado.id,
    nivelSeguridad: 2,
    pais: 'PERU',
    tipoContrato: 'INTERNO'
  });

  console.log('Empleado creado correctamente:');
  console.log({
    id: usuario.id,
    nombre: usuario.nombre,
    correo: usuario.correo,
    rolId: usuario.rolId,
    estado: usuario.estado
  });

} catch (error) {
  if (error instanceof Error) {
    console.error('Error:', error.message);
  }
} finally {
  await db.close();
}