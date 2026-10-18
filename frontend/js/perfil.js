import { generarEnlaceWhatsApp } from './whatsapp.js';

const API_URL = "/api";

document.addEventListener("DOMContentLoaded", async () => {
    const params = new URLSearchParams(window.location.search);
    const profId = params.get("id");

    if (!profId) {
        window.location.href = "catalogo.html";
        return;
    }

    try {
        const response = await fetch(`${API_URL}/profesionales/${profId}`);
        if (!response.ok) throw new Error("No encontrado");

        const prof = await response.json();
        
        document.getElementById("cargando").classList.add("hidden");
        document.getElementById("detalle-profesional").classList.remove("hidden");

        const usuario = prof.perfiles_usuario || { nombres: "Profesional", apellidos: "T-CUIDO", telefono: "51999999999" };
        const nombreCompleto = `${usuario.nombres || 'Profesional'} ${usuario.apellidos || ''}`;

        document.getElementById("nombre-profesional").textContent = nombreCompleto;
        document.getElementById("avatar").textContent = (usuario.nombres || 'P').charAt(0);
        document.getElementById("tipo-profesional").textContent = (prof.tipo_profesional || 'Cuidador').replace('_', ' ');
        document.getElementById("tarifa").textContent = `S/ ${prof.tarifa_orientativa || 'A tratar'}`;
        document.getElementById("presentacion").textContent = prof.presentacion || "Sin presentación registrada.";
        document.getElementById("formacion").textContent = prof.formacion || "Información no especificada.";
        document.getElementById("experiencia").textContent = `${prof.anos_experiencia || 0} años de experiencia laboral comprobada.`;

        const btnWs = document.getElementById("btn-whatsapp");
        btnWs.href = generarEnlaceWhatsApp(usuario.telefono || "51999999999", nombreCompleto);

    } catch (error) {
        console.error("Error al cargar perfil:", error);
        document.getElementById("cargando").textContent = "Error al cargar la información del profesional.";
    }
});