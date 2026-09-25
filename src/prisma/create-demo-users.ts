import { db } from './db.ts';
import { crearUsuario } from '../modules/users/user.service.ts';

const usuarios = [
  {
    nombre: 'Gerente SecureDocs',
    correo: 'gerente@securedocs.com',
    password: 'Gerente123!',
    rolId: 3,
    departamentoId: 4,
    nivelSeguridad: 4,
    pais: 'PERU',
    tipoContrato: 'INTERNO'
  },
  {
    nombre: 'Supervisor SecureDocs',
    correo: 'supervisor@securedocs.com',
    password: 'Supervisor123!',
    rolId: 4,
    departamentoId: 4,
    nivelSeguridad: 3,
    pais: 'PERU',
    tipoContrato: 'INTERNO'
  },
  {
    nombre: 'Empleado SecureDocs',
    correo: 'empleado@securedocs.com',
    password: 'Empleado123!',
    rolId: 5,
    departamentoId: 4,
    nivelSeguridad: 2,
    pais: 'PERU',
    tipoContrato: 'INTERNO'
  },
  {
    nombre: 'Auditor SecureDocs',
    correo: 'auditor@securedocs.com',
    password: 'Auditor123!',
    rolId: 6,
    departamentoId: 4,
    nivelSeguridad: 4,
    pais: 'PERU',
    tipoContrato: 'INTERNO'
  },
  {
    nombre: 'Invitado SecureDocs',
    correo: 'invitado@securedocs.com',
    password: 'Invitado123!',
    rolId: 7,
    departamentoId: 4,
    nivelSeguridad: 1,
    pais: 'PERU',
    tipoContrato: 'EXTERNO'
  }
];

try {

  for (const datos of usuarios) {

    const existente = await db.orm.public.Usuario
      .where({ correo: datos.correo })
      .first();

    if (existente) {
      console.log(`Ya existe: ${datos.correo}`);
      continue;
    }

    const usuario = await crearUsuario(datos);

    console.log(
      `Creado: ${usuario.correo} - rolId ${usuario.rolId}`
    );
  }

  console.log('\nUsuarios de demostración configurados correctamente.');

} catch (error) {

  console.error('Error creando usuarios:', error);

} finally {

  await db.close();

}