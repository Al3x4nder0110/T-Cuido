import { generarEnlaceWhatsApp } from './whatsapp.js';

const API_URL = "/api";

document.addEventListener("DOMContentLoaded", () => {
    cargarProfesionales();

    const btnFiltrar = document.getElementById("btn-aplicar-filtros");
    if (btnFiltrar) {
        btnFiltrar.addEventListener("click", () => {
            const tipo = document.getElementById("filtro-tipo").value;
            cargarProfesionales(tipo);
        });
    }
});

async function cargarProfesionales(tipoFiltro = "") {
    const contenedor = document.getElementById("contenedor-tarjetas");
    const estadoVacio = document.getElementById("estado-vacio");
    contenedor.innerHTML = "<p class='text-center col-span-2 py-8 text-texto/60'>Cuidadores disponibles...</p>";

    try {
        let url = `${API_URL}/profesionales`;
        if (tipoFiltro) {
            url += `?tipo=${tipoFiltro}`;
        }

        const response = await fetch(url);
        const profesionales = await response.json();

        contenedor.innerHTML = "";

        if (!profesionales || profesionales.length === 0) {
            estadoVacio.classList.remove("hidden");
            return;
        }

        estadoVacio.classList.add("hidden");

        profesionales.forEach(prof => {
            // Si perfiles_usuario no viene, usamos valores por defecto para la prueba
            const usuario = prof.perfiles_usuario || { nombres: "Enfermero", apellidos: "Especialista", telefono: "51999999999" };
            const nombreCompleto = `${usuario.nombres || 'Profesional'} ${usuario.apellidos || 'T-CUIDO'}`;
            const telefono = usuario.telefono || "51999999999";
            
            const linkWhatsApp = generarEnlaceWhatsApp(telefono, nombreCompleto);

            const tarjeta = document.createElement("div");
            tarjeta.className = "bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between";
            
            tarjeta.innerHTML = `
                <div>
                    <div class="flex items-center space-x-4 mb-4">
                        <div class="w-14 h-14 bg-salvia/30 rounded-full flex items-center justify-center font-bold text-oscuro text-xl">
                            ${(usuario.nombres || 'P').charAt(0)}
                        </div>
                        <div>
                            <h3 class="font-bold text-lg text-oscuro">${nombreCompleto}</h3>
                            <p class="text-xs text-terracota font-semibold uppercase tracking-wider">${prof.tipo_profesional ? prof.tipo_profesional.replace('_', ' ') : 'Cuidador'}</p>
                        </div>
                    </div>
                    <p class="text-sm text-texto/80 mb-4 line-clamp-2">${prof.presentacion || "Profesional comprometido con el cuidado y bienestar de los pacientes."}</p>
                    <div class="text-sm space-y-1 mb-6 text-texto/70">
                        <p><strong>Experiencia:</strong> ${prof.anos_experiencia || 0} años</p>
                        <p><strong>Tarifa orientativa:</strong> S/ ${prof.tarifa_orientativa || 'A tratar'} / turno</p>
                    </div>
                </div>
                <div class="flex space-x-2">
                    <a href="perfil.html?id=${prof.id}" class="flex-1 text-center py-2.5 border border-oscuro text-oscuro rounded-xl text-sm font-medium hover:bg-beige/40 transition">Ver Perfil</a>
                    <a href="${linkWhatsApp}" target="_blank" rel="noopener noreferrer" class="flex-1 text-center py-2.5 bg-green-600 text-white rounded-xl text-sm font-medium hover:bg-green-700 transition flex items-center justify-center space-x-1">
                        <span>WhatsApp</span>
                    </a>
                </div>
            `;
            contenedor.appendChild(tarjeta);
        });

    } catch (error) {
        console.error("Error al cargar profesionales:", error);
        contenedor.innerHTML = "<p class='text-center col-span-2 text-red-500'>Error al conectar con el servidor.</p>";
    }
}