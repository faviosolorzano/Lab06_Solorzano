import jwt from 'jsonwebtoken';
import { buscarUsuarioPorCorreo } from '../users/user.repository.ts';
import { compararPassword } from '../users/user.service.ts';
import { db } from '../../prisma/db.ts';

function obtenerJwtSecret(): string {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error('JWT_SECRET no está configurado en el archivo .env');
  }

  return secret;
}

const JWT_SECRET: string = obtenerJwtSecret();

export interface TokenPayload {
  id: number;
  correo: string;
  rol: string;
}

export function generarToken(usuario: TokenPayload): string {
  return jwt.sign(
    {
      id: usuario.id,
      correo: usuario.correo,
      rol: usuario.rol
    },
    JWT_SECRET,
    {
      expiresIn: '8h'
    }
  );
}

export function verificarToken(token: string): TokenPayload {
  const decoded = jwt.verify(token, JWT_SECRET);

  if (
    typeof decoded === 'string' ||
    typeof decoded.id !== 'number' ||
    typeof decoded.correo !== 'string' ||
    typeof decoded.rol !== 'string'
  ) {
    throw new Error('Token inválido');
  }

  return {
    id: decoded.id,
    correo: decoded.correo,
    rol: decoded.rol
  };
}

export async function login(correo: string, password: string) {
  const usuario = await buscarUsuarioPorCorreo(correo);

  if (!usuario) {
    throw new Error('Credenciales incorrectas');
  }

  if (usuario.estado !== 'ACTIVO') {
    throw new Error('Usuario inactivo');
  }

  const passwordCorrecto = await compararPassword(
    password,
    usuario.password
  );

  if (!passwordCorrecto) {
    throw new Error('Credenciales incorrectas');
  }

  const rol = await db.orm.public.Rol
    .where({ id: usuario.rolId })
    .first();

  if (!rol) {
    throw new Error('El usuario no tiene un rol válido');
  }

  const token = generarToken({
    id: usuario.id,
    correo: usuario.correo,
    rol: rol.nombre
  });

  return {
    token,
    usuario: {
      id: usuario.id,
      nombre: usuario.nombre,
      correo: usuario.correo,
      rol: rol.nombre
    }
  };
}