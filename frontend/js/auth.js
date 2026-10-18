const API_URL = "/api";

document.addEventListener("DOMContentLoaded", () => {
    
    // 1. Manejo del Login
    const formLogin = document.getElementById("form-login");
    if (formLogin) {
        formLogin.addEventListener("submit", async (e) => {
            e.preventDefault();
            const email = document.getElementById("correo").value;
            const password = document.getElementById("password").value;

            try {
                const res = await fetch(`${API_URL}/auth/login`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, password })
                });

                const data = await res.json();
                if (!res.ok) throw new Error(data.error || "Error al iniciar sesión");

                // Guardar token y datos del usuario
                localStorage.setItem("tcuido_token", data.token);
                localStorage.setItem("tcuido_usuario", JSON.stringify(data.usuario));

                alert(`¡Bienvenido/a ${data.usuario.nombres}!`);

                // Redirección según rol de usuario
                if (data.usuario.tipo_usuario === "administrador") {
                    window.location.href = "panel-admin.html";
                } else if (data.usuario.tipo_usuario === "profesional") {
                    window.location.href = "panel-profesional.html";
                } else {
                    window.location.href = "panel-cliente.html";
                }

            } catch (err) {
                alert(err.message);
            }
        });
    }

    // 2. Manejo del Registro
    const formRegistro = document.getElementById("form-registro");
    if (formRegistro) {
        formRegistro.addEventListener("submit", async (e) => {
            e.preventDefault();
            const nombres = document.getElementById("nombres").value;
            const apellidos = document.getElementById("apellidos").value;
            const email = document.getElementById("correo").value;
            const password = document.getElementById("password").value;
            const tipo_usuario = document.getElementById("tipo_usuario").value;

            try {
                const res = await fetch(`${API_URL}/auth/registro`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ nombres, apellidos, email, password, tipo_usuario })
                });

                const data = await res.json();
                if (!res.ok) throw new Error(data.error || "Error al registrarse");

                alert("¡Cuenta creada exitosamente! Ahora puedes iniciar sesión.");
                window.location.href = "login.html";

            } catch (err) {
                alert(err.message);
            }
        });
    }

    // 3. Manejo de Recuperación de Contraseña
    const formRecuperar = document.getElementById("form-recuperar");
    if (formRecuperar) {
        formRecuperar.addEventListener("submit", async (e) => {
            e.preventDefault();
            const email = formRecuperar.querySelector("input[type='email']").value;

            try {
                const res = await fetch(`${API_URL}/auth/recuperar`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email })
                });

                const data = await res.json();
                if (!res.ok) throw new Error(data.error || "Error al enviar solicitud");

                alert("Se han enviado las instrucciones a tu correo electrónico.");
                window.location.href = "login.html";

            } catch (err) {
                alert(err.message);
            }
        });
    }
});

// Función global de Logout
export function cerrarSesion() {
    localStorage.removeItem("tcuido_token");
    localStorage.removeItem("tcuido_usuario");
    window.location.href = "/pages/login.html";
}