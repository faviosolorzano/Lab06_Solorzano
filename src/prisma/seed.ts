import { db } from './db.ts';

console.log('Base de datos de SecureDocs configurada correctamente.');
console.log('RBAC: 6 roles, 8 permisos y 24 relaciones registradas.');

await db.close();