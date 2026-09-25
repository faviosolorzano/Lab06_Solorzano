import { db } from './db.ts';

const departamentos = [
  {
    nombre: 'TECNOLOGIA',
    descripcion: 'Área de tecnología y sistemas'
  },
  {
    nombre: 'ADMINISTRACION',
    descripcion: 'Área administrativa'
  },
  {
    nombre: 'RECURSOS_HUMANOS',
    descripcion: 'Área de recursos humanos'
  },
  {
    nombre: 'FINANZAS',
    descripcion: 'Área financiera'
  }
];

try {
  for (const datos of departamentos) {

    const existente = await db.orm.public.Departamento
      .where({ nombre: datos.nombre })
      .first();

    if (existente) {
      console.log(`Ya existe: ${datos.nombre}`);
      continue;
    }

    const departamento = await db.orm.public.Departamento.create(datos);

    console.log(
      `Departamento creado: ${departamento.id} - ${departamento.nombre}`
    );
  }

  console.log('\nDepartamentos configurados correctamente.');

} catch (error) {
  console.error('Error al crear departamentos:', error);

} finally {
  await db.close();
}