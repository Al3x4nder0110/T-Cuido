const API_URL = "http://localhost:5000/api";

document.addEventListener("DOMContentLoaded", async () => {
    const selectDep = document.getElementById("select-departamento");
    const btnBuscar = document.getElementById("btn-buscar");

    if (selectDep) {
        try {
            const response = await fetch(`${API_URL}/departamentos`);
            const departamentos = await response.json();
            
            departamentos.forEach(dep => {
                const option = document.createElement("option");
                option.value = dep.id;
                option.textContent = dep.nombre;
                selectDep.appendChild(option);
            });
        } catch (error) {
            console.error("Error al conectar con la API de Flask:", error);
        }
    }

    if (btnBuscar) {
        btnBuscar.addEventListener("click", () => {
            const depId = selectDep.value;
            const tipo = document.getElementById("select-tipo").value;
            // Redirigir al catálogo con los filtros seleccionados mediante query parameters
            window.location.href = `pages/catalogo.html?dep=${depId}&tipo=${tipo}`;
        });
    }
});