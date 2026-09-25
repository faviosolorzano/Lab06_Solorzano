const form = document.getElementById("loginForm");
const mensaje = document.getElementById("mensajeLogin");

form.addEventListener("submit", async (event) => {

    event.preventDefault();

    mensaje.textContent = "Verificando...";

    const correo = document.getElementById("correo").value;
    const password = document.getElementById("password").value;

    try {

        const response = await fetch("/api/auth/login", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                correo,
                password
            })

        });

        const data = await response.json();

        if (!response.ok) {
            mensaje.textContent =
                data.mensaje || "No se pudo iniciar sesión";
            return;
        }

        localStorage.setItem(
            "securedocs_token",
            data.token
        );

        localStorage.setItem(
            "securedocs_usuario",
            JSON.stringify(data.usuario)
        );

        window.location.href = "/dashboard.html";

    } catch (error) {

        console.error(error);

        mensaje.textContent =
            "No se pudo conectar con SecureDocs";

    }

});