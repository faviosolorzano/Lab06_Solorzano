import { login, verificarToken } from '../modules/auth/auth.service.ts';
import { db } from './db.ts';

try {
  const resultado = await login(
    'admin@securedocs.com',
    'Admin123!'
  );

  console.log('Login correcto.');

  console.log('Usuario:');
  console.log(resultado.usuario);

  console.log('¿Se generó token?', Boolean(resultado.token));

  const contenidoToken = verificarToken(resultado.token);

  console.log('Contenido del token:');
  console.log(contenidoToken);

} catch (error) {
  if (error instanceof Error) {
    console.error('Error:', error.message);
  } else {
    console.error('Error desconocido');
  }
} finally {
  await db.close();
}