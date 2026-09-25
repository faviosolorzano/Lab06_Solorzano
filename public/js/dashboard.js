const token = localStorage.getItem("securedocs_token");

const usuario = JSON.parse(
    localStorage.getItem("securedocs_usuario") || "null"
);

// =====================================================
// VALIDAR SESIÓN
// =====================================================

if (!token || !usuario) {
    window.location.href = "/";
}

const headers = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`
};

const rol = usuario?.rol || "";


// =====================================================
// INFORMACIÓN DEL USUARIO
// =====================================================

document.getElementById("nombreUsuario").textContent =
    usuario?.nombre || usuario?.correo || "Usuario";

document.getElementById("rolUsuario").textContent =
    rol || "-";

document.getElementById("rolResumen").textContent =
    rol || "-";


// =====================================================
// CONFIGURACIÓN DE INTERFAZ SEGÚN ROL
// =====================================================

// Auditoría:
// ADMINISTRADOR, GERENTE y AUDITOR
const btnAuditoria = document.getElementById("btnAuditoria");

if (
    rol !== "ADMINISTRADOR" &&
    rol !== "GERENTE" &&
    rol !== "AUDITOR"
) {
    if (btnAuditoria) {
        btnAuditoria.style.display = "none";
    }
}


// Nuevo documento:
// AUDITOR e INVITADO no pueden crear
const btnNuevoDocumento = document.querySelector(
    '[data-section="nuevo"]'
);

if (
    rol === "AUDITOR" ||
    rol === "INVITADO"
) {
    if (btnNuevoDocumento) {
        btnNuevoDocumento.style.display = "none";
    }
}


// =====================================================
// NAVEGACIÓN
// =====================================================

const botones = document.querySelectorAll(".nav-button");
const secciones = document.querySelectorAll(".section");

botones.forEach(boton => {

    boton.addEventListener("click", () => {

        botones.forEach(b => {
            b.classList.remove("active");
        });

        secciones.forEach(s => {
            s.classList.remove("active-section");
        });

        boton.classList.add("active");

        const id = boton.dataset.section;

        const seccion = document.getElementById(id);

        if (seccion) {
            seccion.classList.add("active-section");
        }

        if (id === "documentos") {
            cargarDocumentos();
        }

        if (id === "auditoria") {
            cargarAuditoria();
        }

    });

});


// =====================================================
// CARGAR DOCUMENTOS
// =====================================================

async function cargarDocumentos() {

    const tabla = document.getElementById("tablaDocumentos");

    if (!tabla) {
        return;
    }

    tabla.innerHTML =
        `<tr><td colspan="6">Cargando...</td></tr>`;

    try {

        const response = await fetch(
            "/api/documentos",
            {
                method: "GET",
                headers
            }
        );

        if (response.status === 401) {
            cerrarSesion();
            return;
        }

        const data = await response.json();

        if (!response.ok) {

            tabla.innerHTML =
                `<tr>
                    <td colspan="6">
                        ${data.mensaje || "Error al consultar documentos"}
                    </td>
                </tr>`;

            return;
        }

        const totalDocumentos =
            document.getElementById("totalDocumentos");

        if (totalDocumentos) {
            totalDocumentos.textContent =
                String(data.total ?? 0);
        }

        tabla.innerHTML = "";

        if (!data.documentos || data.documentos.length === 0) {

            tabla.innerHTML =
                `<tr>
                    <td colspan="6">
                        No existen documentos.
                    </td>
                </tr>`;

            return;
        }

        data.documentos.forEach(documento => {

            const fila = document.createElement("tr");

            // Solamente estos roles pueden aprobar
            const puedeAprobar =
                rol === "ADMINISTRADOR" ||
                rol === "GERENTE" ||
                rol === "SUPERVISOR";

            fila.innerHTML = `
                <td>${documento.id}</td>

                <td>${documento.titulo}</td>

                <td>
                    <span class="badge">
                        ${documento.estado}
                    </span>
                </td>

                <td>
                    Nivel ${documento.nivelConfidencialidad}
                </td>

                <td>
                    ${documento.pais}
                </td>

                <td>

                    <button
                        class="action-button"
                        onclick="verDocumento(${documento.id})"
                    >
                        Ver
                    </button>

                    ${
                        puedeAprobar
                            ? `
                                <button
                                    class="action-button"
                                    onclick="aprobarDocumento(${documento.id})"
                                >
                                    Aprobar
                                </button>
                              `
                            : ""
                    }

                </td>
            `;

            tabla.appendChild(fila);

        });

    } catch (error) {

        console.error(
            "Error cargando documentos:",
            error
        );

        tabla.innerHTML =
            `<tr>
                <td colspan="6">
                    Error de conexión con el servidor.
                </td>
            </tr>`;

    }

}


// =====================================================
// CONSULTAR DOCUMENTO
// RBAC + ABAC SE VALIDAN EN EL BACKEND
// =====================================================

window.verDocumento = async function(id) {

    try {

        const response = await fetch(
            `/api/documentos/${id}`,
            {
                method: "GET",
                headers
            }
        );

        if (response.status === 401) {
            cerrarSesion();
            return;
        }

        const data = await response.json();

        if (!response.ok) {

            const motivo =
                data.motivo
                    ? `\nMotivo: ${data.motivo}`
                    : "";

            alert(
                `${data.mensaje || "Acceso denegado"}${motivo}`
            );

            // Actualizamos auditoría si el usuario puede verla
            if (
                rol === "ADMINISTRADOR" ||
                rol === "GERENTE" ||
                rol === "AUDITOR"
            ) {
                cargarAuditoria();
            }

            return;
        }

        const documento = data.documento;

        if (!documento) {
            alert("Documento no encontrado");
            return;
        }

        alert(
            `Documento #${documento.id}\n\n` +
            `Título: ${documento.titulo}\n` +
            `Descripción: ${documento.descripcion || "-"}\n` +
            `Estado: ${documento.estado}\n` +
            `Confidencialidad: Nivel ${documento.nivelConfidencialidad}\n` +
            `País: ${documento.pais}`
        );

        if (
            rol === "ADMINISTRADOR" ||
            rol === "GERENTE" ||
            rol === "AUDITOR"
        ) {
            cargarAuditoria();
        }

    } catch (error) {

        console.error(
            "Error consultando documento:",
            error
        );

        alert(
            "Error al consultar el documento"
        );

    }

};


// =====================================================
// CREAR DOCUMENTO
// =====================================================

const documentForm =
    document.getElementById("documentForm");

if (documentForm) {

    documentForm.addEventListener(
        "submit",
        async event => {

            event.preventDefault();

            const mensaje =
                document.getElementById(
                    "mensajeDocumento"
                );

            try {

                const response = await fetch(
                    "/api/documentos",
                    {
                        method: "POST",

                        headers,

                        body: JSON.stringify({

                            titulo:
                                document
                                    .getElementById("titulo")
                                    .value,

                            descripcion:
                                document
                                    .getElementById("descripcion")
                                    .value,

                            departamentoId:
                                Number(
                                    document
                                        .getElementById("departamentoId")
                                        .value
                                ),

                            nivelConfidencialidad:
                                Number(
                                    document
                                        .getElementById("nivelConfidencialidad")
                                        .value
                                ),

                            pais:
                                document
                                    .getElementById("pais")
                                    .value
                        })
                    }
                );

                if (response.status === 401) {
                    cerrarSesion();
                    return;
                }

                const data = await response.json();

                if (mensaje) {

                    mensaje.textContent =
                        data.mensaje ||
                        "Operación terminada";

                }

                if (response.ok) {

                    event.target.reset();

                    await cargarDocumentos();

                    alert(
                        "Documento creado correctamente"
                    );

                }

            } catch (error) {

                console.error(
                    "Error creando documento:",
                    error
                );

                if (mensaje) {

                    mensaje.textContent =
                        "Error al crear el documento";

                }

            }

        }
    );

}


// =====================================================
// APROBAR DOCUMENTO
// =====================================================

window.aprobarDocumento = async function(id) {

    try {

        const response = await fetch(
            `/api/documentos/${id}/aprobar`,
            {
                method: "PATCH",
                headers
            }
        );

        if (response.status === 401) {
            cerrarSesion();
            return;
        }

        const data = await response.json();

        if (!response.ok) {

            alert(
                data.mensaje ||
                "No tiene permiso para aprobar este documento"
            );

            return;
        }

        alert(
            data.mensaje ||
            "Documento aprobado correctamente"
        );

        await cargarDocumentos();

    } catch (error) {

        console.error(
            "Error aprobando documento:",
            error
        );

        alert(
            "Error al aprobar el documento"
        );

    }

};


// =====================================================
// CARGAR AUDITORÍA
// =====================================================

async function cargarAuditoria() {

    const tabla =
        document.getElementById("tablaAuditoria");

    if (!tabla) {
        return;
    }

    tabla.innerHTML =
        `<tr>
            <td colspan="6">
                Cargando...
            </td>
        </tr>`;

    try {

        const response = await fetch(
            "/api/auditoria",
            {
                method: "GET",
                headers
            }
        );

        if (response.status === 401) {
            cerrarSesion();
            return;
        }

        const data = await response.json();

        if (!response.ok) {

            tabla.innerHTML =
                `<tr>
                    <td colspan="6">
                        ${data.mensaje || "Acceso denegado"}
                    </td>
                </tr>`;

            return;
        }

        tabla.innerHTML = "";

        if (
            !data.registros ||
            data.registros.length === 0
        ) {

            tabla.innerHTML =
                `<tr>
                    <td colspan="6">
                        No existen registros de auditoría.
                    </td>
                </tr>`;

            return;
        }

        data.registros.forEach(registro => {

            const fila =
                document.createElement("tr");

            fila.innerHTML = `
                <td>
                    ${registro.id}
                </td>

                <td>
                    ${registro.accion}
                </td>

                <td>
                    ${registro.recurso}
                </td>

                <td>
                    <span class="badge">
                        ${registro.resultado}
                    </span>
                </td>

                <td>
                    ${registro.motivo || "-"}
                </td>

                <td>
                    ${
                        registro.fecha
                            ? new Date(
                                registro.fecha
                              ).toLocaleString()
                            : "-"
                    }
                </td>
            `;

            tabla.appendChild(fila);

        });

    } catch (error) {

        console.error(
            "Error cargando auditoría:",
            error
        );

        tabla.innerHTML =
            `<tr>
                <td colspan="6">
                    Error de conexión.
                </td>
            </tr>`;

    }

}


// =====================================================
// BOTÓN ACTUALIZAR DOCUMENTOS
// =====================================================

const recargarDocumentos =
    document.getElementById(
        "recargarDocumentos"
    );

if (recargarDocumentos) {

    recargarDocumentos.addEventListener(
        "click",
        cargarDocumentos
    );

}


// =====================================================
// CERRAR SESIÓN
// =====================================================

function cerrarSesion() {

    localStorage.removeItem(
        "securedocs_token"
    );

    localStorage.removeItem(
        "securedocs_usuario"
    );

    window.location.href = "/";

}

const btnCerrarSesion =
    document.getElementById(
        "cerrarSesion"
    );

if (btnCerrarSesion) {

    btnCerrarSesion.addEventListener(
        "click",
        cerrarSesion
    );

}


// =====================================================
// CARGA INICIAL
// =====================================================

cargarDocumentos();