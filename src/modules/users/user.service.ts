import bcrypt from 'bcrypt';
import { db } from '../../prisma/db.ts';
import { buscarUsuarioPorCorreo } from './user.repository.ts';

const SALT_ROUNDS = 10;

export async function cifrarPassword(password: string): Promise<string> {
  if (!password || password.length < 6) {
    throw new Error('La contraseña debe tener al menos 6 caracteres');
  }

  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function compararPassword(
  password: string,
  passwordHash: string
): Promise<boolean> {
  return bcrypt.compare(password, passwordHash);
}

interface CrearUsuarioDTO {
  nombre: string;
  correo: string;
  password: string;
  rolId: number;
  departamentoId?: number;
  nivelSeguridad?: number;
  pais?: string;
  tipoContrato?: string;
}

interface ModificarUsuarioDTO {
  nombre?: string;
  correo?: string;
  password?: string;
  rolId?: number;
  departamentoId?: number | null;
  nivelSeguridad?: number;
  pais?: string;
  tipoContrato?: string;
  estado?: string;
}

// CREAR USUARIO
export async function crearUsuario(datos: CrearUsuarioDTO) {
  const usuarioExistente = await buscarUsuarioPorCorreo(datos.correo);

  if (usuarioExistente) {
    throw new Error('El correo ya está registrado');
  }

  const passwordHash = await cifrarPassword(datos.password);

  return db.orm.public.Usuario.create({
    nombre: datos.nombre,
    correo: datos.correo,
    password: passwordHash,
    rolId: datos.rolId,
    departamentoId: datos.departamentoId ?? null,
    nivelSeguridad: datos.nivelSeguridad ?? 1,
    pais: datos.pais ?? 'PERU',
    tipoContrato: datos.tipoContrato ?? 'INTERNO',
    estado: 'ACTIVO'
  });
}

// LISTAR USUARIOS
export async function listarUsuarios() {
  return db.orm.public.Usuario.all();
}

// BUSCAR USUARIO POR ID
export async function buscarUsuarioPorId(id: number) {
  return db.orm.public.Usuario
    .where({ id })
    .first();
}

// MODIFICAR USUARIO
export async function modificarUsuario(
  id: number,
  datos: ModificarUsuarioDTO
) {
  const usuario = await buscarUsuarioPorId(id);

  if (!usuario) {
    throw new Error('Usuario no encontrado');
  }

  let passwordHash: string | undefined;

  if (datos.password) {
    passwordHash = await cifrarPassword(datos.password);
  }

  return db.orm.public.Usuario
    .where({ id })
    .update({
      ...(datos.nombre !== undefined && {
        nombre: datos.nombre
      }),

      ...(datos.correo !== undefined && {
        correo: datos.correo
      }),

      ...(passwordHash !== undefined && {
        password: passwordHash
      }),

      ...(datos.rolId !== undefined && {
        rolId: datos.rolId
      }),

      ...(datos.departamentoId !== undefined && {
        departamentoId: datos.departamentoId
      }),

      ...(datos.nivelSeguridad !== undefined && {
        nivelSeguridad: datos.nivelSeguridad
      }),

      ...(datos.pais !== undefined && {
        pais: datos.pais
      }),

      ...(datos.tipoContrato !== undefined && {
        tipoContrato: datos.tipoContrato
      }),

      ...(datos.estado !== undefined && {
        estado: datos.estado
      })
    });
}

// ACTIVAR USUARIO
export async function activarUsuario(id: number) {
  const usuario = await buscarUsuarioPorId(id);

  if (!usuario) {
    throw new Error('Usuario no encontrado');
  }

  return db.orm.public.Usuario
    .where({ id })
    .update({
      estado: 'ACTIVO'
    });
}

// DESACTIVAR USUARIO
export async function desactivarUsuario(id: number) {
  const usuario = await buscarUsuarioPorId(id);

  if (!usuario) {
    throw new Error('Usuario no encontrado');
  }

  return db.orm.public.Usuario
    .where({ id })
    .update({
      estado: 'INACTIVO'
    });
}