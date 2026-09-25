import { Router } from 'express';

import {
  autenticarToken,
  type AuthRequest
} from '../../middleware/auth.middleware.ts';

import { requierePermiso } from '../../authorization/rbac/rbac.middleware.ts';

import {
  crearUsuario,
  listarUsuarios,
  buscarUsuarioPorId,
  modificarUsuario,
  activarUsuario,
  desactivarUsuario
} from './user.service.ts';

const router = Router();

// LISTAR USUARIOS
router.get(
  '/',
  autenticarToken,
  requierePermiso('GESTIONAR_USUARIOS'),
  async (_req, res) => {
    try {
      const usuarios = await listarUsuarios();

      return res.status(200).json({
        total: usuarios.length,
        usuarios
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        mensaje: 'Error al consultar los usuarios'
      });
    }
  }
);

// CONSULTAR USUARIO
router.get(
  '/:id',
  autenticarToken,
  requierePermiso('GESTIONAR_USUARIOS'),
  async (req, res) => {
    try {
      const id = Number(req.params.id);

      if (Number.isNaN(id)) {
        return res.status(400).json({
          mensaje: 'ID inválido'
        });
      }

      const usuario = await buscarUsuarioPorId(id);

      if (!usuario) {
        return res.status(404).json({
          mensaje: 'Usuario no encontrado'
        });
      }

      return res.status(200).json({
        usuario
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        mensaje: 'Error al consultar el usuario'
      });
    }
  }
);

// CREAR USUARIO
router.post(
  '/',
  autenticarToken,
  requierePermiso('GESTIONAR_USUARIOS'),
  async (req: AuthRequest, res) => {
    try {
      const {
        nombre,
        correo,
        password,
        rolId,
        departamentoId,
        nivelSeguridad,
        pais,
        tipoContrato
      } = req.body;

      if (!nombre || !correo || !password || !rolId) {
        return res.status(400).json({
          mensaje:
            'Nombre, correo, contraseña y rol son obligatorios'
        });
      }

      const usuario = await crearUsuario({
        nombre,
        correo,
        password,
        rolId: Number(rolId),
        departamentoId:
          departamentoId !== undefined
            ? Number(departamentoId)
            : undefined,
        nivelSeguridad:
          nivelSeguridad !== undefined
            ? Number(nivelSeguridad)
            : undefined,
        pais,
        tipoContrato
      });

      return res.status(201).json({
        mensaje: 'Usuario creado correctamente',
        usuario
      });
    } catch (error) {
      console.error(error);

      const mensaje =
        error instanceof Error
          ? error.message
          : 'Error al crear el usuario';

      return res.status(400).json({
        mensaje
      });
    }
  }
);

// MODIFICAR USUARIO
router.put(
  '/:id',
  autenticarToken,
  requierePermiso('GESTIONAR_USUARIOS'),
  async (req, res) => {
    try {
      const id = Number(req.params.id);

      if (Number.isNaN(id)) {
        return res.status(400).json({
          mensaje: 'ID inválido'
        });
      }

      const usuario = await modificarUsuario(id, {
        nombre: req.body.nombre,
        correo: req.body.correo,
        password: req.body.password,

        rolId:
          req.body.rolId !== undefined
            ? Number(req.body.rolId)
            : undefined,

        departamentoId:
          req.body.departamentoId !== undefined
            ? req.body.departamentoId === null
              ? null
              : Number(req.body.departamentoId)
            : undefined,

        nivelSeguridad:
          req.body.nivelSeguridad !== undefined
            ? Number(req.body.nivelSeguridad)
            : undefined,

        pais: req.body.pais,
        tipoContrato: req.body.tipoContrato,
        estado: req.body.estado
      });

      return res.status(200).json({
        mensaje: 'Usuario modificado correctamente',
        usuario
      });
    } catch (error) {
      console.error(error);

      const mensaje =
        error instanceof Error
          ? error.message
          : 'Error al modificar el usuario';

      return res.status(400).json({
        mensaje
      });
    }
  }
);

// ACTIVAR
router.patch(
  '/:id/activar',
  autenticarToken,
  requierePermiso('GESTIONAR_USUARIOS'),
  async (req, res) => {
    try {
      const id = Number(req.params.id);

      if (Number.isNaN(id)) {
        return res.status(400).json({
          mensaje: 'ID inválido'
        });
      }

      const usuario = await activarUsuario(id);

      return res.status(200).json({
        mensaje: 'Usuario activado correctamente',
        usuario
      });
    } catch (error) {
      console.error(error);

      return res.status(400).json({
        mensaje:
          error instanceof Error
            ? error.message
            : 'Error al activar el usuario'
      });
    }
  }
);

// DESACTIVAR
router.patch(
  '/:id/desactivar',
  autenticarToken,
  requierePermiso('GESTIONAR_USUARIOS'),
  async (req, res) => {
    try {
      const id = Number(req.params.id);

      if (Number.isNaN(id)) {
        return res.status(400).json({
          mensaje: 'ID inválido'
        });
      }

      const usuario = await desactivarUsuario(id);

      return res.status(200).json({
        mensaje: 'Usuario desactivado correctamente',
        usuario
      });
    } catch (error) {
      console.error(error);

      return res.status(400).json({
        mensaje:
          error instanceof Error
            ? error.message
            : 'Error al desactivar el usuario'
      });
    }
  }
);

export default router;