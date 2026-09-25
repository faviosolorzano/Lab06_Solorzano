export interface SujetoABAC {
  id: number;
  rol: string;
  departamentoId?: number | null;
  nivelSeguridad: number;
  pais: string;
  tipoContrato: string;
}

export interface RecursoABAC {
  propietarioId: number;
  departamentoId: number;
  nivelConfidencialidad: number;
  pais: string;
}

export interface ContextoABAC {
  hora: number;
  direccionIp?: string;
  dispositivoConfiable?: boolean;
}

export interface SolicitudABAC {
  sujeto: SujetoABAC;
  recurso: RecursoABAC;
  accion: string;
  contexto: ContextoABAC;
}

export interface ResultadoABAC {
  permitido: boolean;
  motivo: string;
}

export function evaluarABAC(
  solicitud: SolicitudABAC
): ResultadoABAC {

  const { sujeto, recurso, contexto } = solicitud;

  // Regla 1: nivel de seguridad
  if (sujeto.nivelSeguridad < recurso.nivelConfidencialidad) {
    return {
      permitido: false,
      motivo: 'Nivel de seguridad insuficiente'
    };
  }

  // Regla 2: país
  if (sujeto.pais !== recurso.pais) {
    return {
      permitido: false,
      motivo: 'Acceso denegado por ubicación'
    };
  }

  // Regla 3: departamento
  if (
    sujeto.rol !== 'ADMINISTRADOR' &&
    sujeto.departamentoId !== recurso.departamentoId
  ) {
    return {
      permitido: false,
      motivo: 'El recurso pertenece a otro departamento'
    };
  }

  // Regla 4: horario laboral
  if (
    sujeto.rol !== 'ADMINISTRADOR' &&
    (contexto.hora < 8 || contexto.hora >= 18)
  ) {
    return {
      permitido: false,
      motivo: 'Acceso fuera del horario permitido'
    };
  }

  return {
    permitido: true,
    motivo: 'Políticas ABAC cumplidas'
  };
}