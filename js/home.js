document.addEventListener("DOMContentLoaded", () => {
    obtenerAlumnos();
});

document.addEventListener("click", function (event) {
    const btn = event.target.closest(".dropdown-btn");
    if (!btn) return; // Si no es un botón de dropdown, salir

    event.stopPropagation(); // Evita que se cierre inmediatamente

    const dropdown = btn.closest(".dropdown");
    const dropdownList = dropdown.querySelector(".dropdown-list");

    // Ocultar otros dropdowns antes de abrir uno nuevo
    document.querySelectorAll(".dropdown").forEach(drop => {
        if (drop !== dropdown) {
            drop.classList.remove("active");
        }
    });

    // Alternar visibilidad del dropdown actual
    dropdown.classList.toggle("active");
});

// Cerrar dropdowns si se hace clic fuera de ellos
document.addEventListener("click", function () {
    document.querySelectorAll(".dropdown-list").forEach(list => {
        list.style.display = "none";
    });
});

async function obtenerAlumnos() {
    try {
        const response = await fetch("https://localhost:7207/api/Alumno", {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error("Error al obtener alumnos");
        }

        let data = await response.json();
    
        // Verifica si la respuesta contiene $values (caso Newtonsoft.Json)
        const listaAlumnos = data.$values ?? data; 

        if (!Array.isArray(listaAlumnos)) {
            return;
        }

        mostrarAlumnos(listaAlumnos);
    } catch (error) {
        console.error("Error:", error);
    }
}

function mostrarAlumnos(alumnos) {
    const alumnosContainer = document.getElementById("alumnos-container");
    alumnosContainer.innerHTML = ""; // Limpiar contenido previo
    
    alumnos.forEach(alumno => {
        const plan = alumno.alumnoPlanes?.$values[0] ?? {};
        const alumnoHTML = `
            <tr class="products-row">
                <td class="product-cell sales">${alumno.dni}</td>
                <td class="product-cell sales">${alumno.planId ?? "N/A"}</td>
                <td class="product-cell sales">${alumno.nombre} ${alumno.apellido}</td>
                <td class="product-cell sales">${alumno.domicilio ?? "N/A"}</td>
                <td class="product-cell sales">${alumno.telefono ?? "N/A"}</td>
                <td class="product-cell sales">${alumno.telefonoEmergencia ?? "N/A"}</td>
                <td class="product-cell sales">${alumno.fechaRegistroFormateada}</td>
                <td class="product-cell sales">${plan.fechaInicioFormateada ?? "N/A"}</td>
                <td class="product-cell sales">${plan.fechaVencimientoFormateada ?? "N/A"}</td>
                <td class="product-cell sales">${plan.plan?.nombre ?? "Sin Plan"}</td>
                <td class="product-cell sales"><span class="status disabled">En deuda</span></td>
                <td class="product-cell sales">
                    <div class="dropdown">
                        <button class="dropdown-btn" type="button" data-dni="${alumno.dni}">
                            ⋮
                        </button>
                        <ul class="dropdown-list" id="dropdown-${alumno.dni}">
                            <li><a class="dropdown-item actualizar" href="#" data-dni="${alumno.dni}">Actualizar</a></li>
                            <li><a class="dropdown-item dropdown-danger eliminar" href="#" data-dni="${alumno.dni}">Eliminar</a></li>
                        </ul>
                    </div>
                </td>
            </tr>
        `;

        alumnosContainer.innerHTML += alumnoHTML;
    });

    // Agregar eventos a los botones después de insertar el HTML
    document.querySelectorAll(".actualizar").forEach(button => {
        button.addEventListener("click", function (event) {
            event.preventDefault();
            const dni = this.dataset.dni;
            abrirModalActualizar(dni);
        });
    });

    document.querySelectorAll(".eliminar").forEach(button => {
        button.addEventListener("click", function (event) {
            event.preventDefault();
            const dni = this.dataset.dni;
            abrirModalEliminar(dni);
        });
    });
}

async function abrirModalActualizar(dni) {
    const dniInt = parseInt(dni, 10)
    try {
        const response = await fetch(`https://localhost:7207/api/Alumno/${dniInt}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        
        if (!response.ok) throw new Error("Error al obtener datos del alumno");

        const alumno = await response.json();

        // Verifica que los elementos existen antes de modificarlos
        const dniActualizar = document.getElementById("dni-actualizar");
        const nombreActualizar = document.getElementById("nombre-actualizar");
        const apellidoActualizar = document.getElementById("apellido-actualizar");
        const domicilioActualizar = document.getElementById("domicilio-actualizar");
        const telefonoActualizar = document.getElementById("telefono-actualizar");
        const telefonoEmergenciaActualizar = document.getElementById("telefonoEmergencia-actualizar");
        const planIdActualizar = document.getElementById("planId-actualizar");

        if (!dniActualizar || !nombreActualizar || !apellidoActualizar || !domicilioActualizar || 
            !telefonoActualizar || !telefonoEmergenciaActualizar || !planIdActualizar) {
            throw new Error("Error: No se encontraron los campos del formulario");
        }

        // Llenar los campos del modal con los datos actuales del alumno
        dniActualizar.textContent = alumno.dni;
        nombreActualizar.value = alumno.nombre;
        apellidoActualizar.value = alumno.apellido;
        domicilioActualizar.value = alumno.domicilio;
        telefonoActualizar.value = alumno.telefono;
        telefonoEmergenciaActualizar.value = alumno.telefonoEmergencia;
        planIdActualizar.value = alumno.planId ?? "";

        // Mostrar el modal
        const modal = document.getElementById("modal-actualizar");
        if (!modal) throw new Error("Error: Modal de actualización no encontrado");

        modal.classList.add("show");
        modal.style.display = "block";
        modal.setAttribute("aria-hidden", "false"); // Accesibilidad
    } catch (error) {
        console.error("Error:", error);
        alert(error.message);
    }
}


async function guardarCambios() {
    const dni = document.getElementById("dni-actualizar").textContent;
    const dniInt = parseInt(dni, 10)
    const alumnoActualizado = {
        nombre: document.getElementById("nombre-actualizar").value,
        apellido: document.getElementById("apellido-actualizar").value,
        domicilio: document.getElementById("domicilio-actualizar").value,
        telefono: document.getElementById("telefono-actualizar").value,
        telefonoEmergencia: document.getElementById("telefonoEmergencia-actualizar").value,
        planId: parseInt(document.getElementById("planId-actualizar").value, 10)
    };

    try {
        const response = await fetch(`https://localhost:7207/api/Alumno/${dniInt}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(alumnoActualizado)
        });

        const mensaje = await response.text();
        if (!response.ok) throw new Error(mensaje);

        alert(mensaje);
        
        // Cerrar el modal después de actualizar
        cerrarModal("modal-actualizar");

        // Recargar la lista de alumnos
        obtenerAlumnos();
    } catch (error) {
        console.error("Error:", error);
        alert(error.message);
    }
}


function abrirModalEliminar(dni) {
    const modal = document.getElementById("modal-eliminar");
    document.getElementById("dni-eliminar").textContent = dni;
    modal.classList.add("show");
    modal.style.display = "block";
}


function cerrarModal(id) {
    const modal = document.getElementById(id);
    modal.classList.remove("show");
    modal.style.display = "none";
}

// Cerrar el modal si el usuario hace clic en la "X"
document.querySelectorAll(".modal .close").forEach(button => {
    button.addEventListener("click", function () {
        cerrarModal(this.closest(".modal").id);
    });
});

// Cerrar el modal si el usuario hace clic fuera de él
window.addEventListener("click", function (event) {
    document.querySelectorAll(".modal").forEach(modal => {
        if (event.target === modal) {
            cerrarModal(modal.id);
        }
    });
});

