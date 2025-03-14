const API_URL = "https://backendgym-qbkn.onrender.com/api/Alumno"; 
let dniSeleccionado = null;
let currentPage = 1;
const pageSize = 10;

document.addEventListener("DOMContentLoaded", () => {
    obtenerAlumnos();
    
    document.getElementById("buscadorInput").addEventListener("input", () => {
        obtenerAlumnos();
    });
    
    document.getElementById("prevPage").addEventListener("click", () => {
        if (currentPage > 1) {
          currentPage--;
          obtenerAlumnos();
        }
      });
    
    document.getElementById("nextPage").addEventListener("click", () => {
      currentPage++;
      obtenerAlumnos();
    });
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

document.addEventListener("click", function (event) {
    const clickedInsideDropdown = event.target.closest(".dropdown");
    if (!clickedInsideDropdown) {
        document.querySelectorAll(".dropdown").forEach(drop => {
            drop.classList.remove("active");
        });
    }
});

async function actualizarAlumno(alumnoActualizado, dni) {
    try {
        const response = await fetch(`${API_URL}/${dni}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(alumnoActualizado)
        });

        const mensaje = await response.text();
        if (!response.ok) throw new Error(mensaje);

        alert(mensaje);
        obtenerAlumnos(); // Refrescar lista después de actualizar
    } catch (error) {
        console.error("Error:", error);
        alert(error.message);
    }
}

async function obtenerAlumnos() {
    try {
        const response = await fetch(`${API_URL}?page=${currentPage}&pageSize=${pageSize}`, {
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
        
        document.getElementById("pageInfo").textContent = `Página ${currentPage}`;

        mostrarAlumnos(listaAlumnos);
    } catch (error) {
        console.error("Error:", error);
    }
}

function mostrarAlumnos(alumnos) {
    const alumnosContainer = document.getElementById("alumnos-container");
    alumnosContainer.innerHTML = "";
    
    const textoBusqueda = document.getElementById("buscadorInput").value.toLowerCase();
    console.log(textoBusqueda)
    let alumnosFiltrados = alumnos.filter(alumno => {
        const nombreCompleto = `${alumno.nombre} ${alumno.apellido}`.toLowerCase();
        const dni = alumno.dni.toString();
        const numeroPlan = alumno.numeroPlan?.toString();
        
        return (
            nombreCompleto.includes(textoBusqueda) || 
            dni.includes(textoBusqueda) ||
            numeroPlan.includes(textoBusqueda)
        );
    });
    
    alumnosFiltrados.forEach(alumno => {
        const plan = alumno.alumnoPlanes?.$values[0] ?? {};
        const estadoAlumno = alumno.diasAdicionales > 0 
        ?  `<span class="status disabled">En deuda</span>`
        : `<span class="status active">Al dia</span>`;
        
        const alumnoHTML = `
            <tr class="products-row">
                <td class="product-cell sales">${alumno.dni}</td>
                <td class="product-cell sales">${alumno.numeroPlan}</td>
                <td class="product-cell sales">${alumno.nombre} ${alumno.apellido}</td>
                <td class="product-cell sales">${alumno.domicilio ?? "N/A"}</td>
                <td class="product-cell sales">${alumno.telefono ?? "N/A"}</td>
                <td class="product-cell sales">${alumno.plan.nombre}</td>
                <td class="product-cell sales">${estadoAlumno}</td>
                <td class="product-cell sales">
                    <div class="dropdown">
                        <button class="dropdown-btn" type="button" data-dni="${alumno.dni}">
                            ⋮
                        </button>
                        <ul class="dropdown-list" id="dropdown-${alumno.dni}">
                            <li><a class="dropdown-item actualizar" href="#" data-dni="${alumno.dni}">Actualizar</a></li>
                            <li><a class="dropdown-item renovar" href="#" data-dni="${alumno.dni}">Renovar</a></li>
                            <li><a class="dropdown-item detalles" href="#" data-dni="${alumno.dni}">Ver Detalles</a></li>
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

    document.querySelectorAll(".renovar").forEach(button => {
        button.addEventListener("click", function (event) {
            event.preventDefault();
            const dni = this.dataset.dni;
            abrirModalRenovar(dni);
        });
    });
    
    document.querySelectorAll(".detalles").forEach(button => {
        button.addEventListener("click", function (event) {
            event.preventDefault();
            const dni = this.dataset.dni;
            abrirModalDetalles(dni);
        });
    });
}

// Cargar opciones de planes en el select
async function cargarOpcionesDePlanes() {
    let planes;
    try{
        const response = await fetch("https://backendgym-qbkn.onrender.com/api/Planes", {
            method: 'GET',
            headers: {
                'Content-Type':'application/json',
            },
        });
        
        if (!response.ok) throw new Error("Error al obtener datos de planes");

        const data = await response.json();
    
        planes = data.$values;
    }catch(error) {
        console.error("Error:", error);
        alert(error.message);
    }
    
    const selectPlan = document.getElementById("plan-actualizar"); // Asegúrate de que este ID sea correcto
    selectPlan.innerHTML = ""; // Limpiar opciones previas

    
    planes.forEach(plan => {
        const option = document.createElement("option");
        option.value = plan.planId; 
        option.textContent = plan.nombre;
        selectPlan.appendChild(option);
    });
}

async function abrirModalDetalles(dni) {
    const dniInt = parseInt(dni, 10)
    try {
        const response = await fetch(`https://backendgym-qbkn.onrender.com/api/Alumno/${dniInt}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        
        if (!response.ok) throw new Error("Error al obtener datos del alumno");

        const alumno = await response.json();

        // Verifica que los elementos existen antes de modificarlos
        document.getElementById("dni-detalles").innerText = alumno.dni;
        document.getElementById("numeroPlan-detalles").innerText = alumno.numeroPlan;
        document.getElementById("nombre-detalles").innerText = alumno.nombre;
        document.getElementById("apellido-detalles").innerText = alumno.apellido;
        document.getElementById("domicilio-detalles").innerText = alumno.domicilio;
        document.getElementById("telefono-detalles").innerText = alumno.telefono;
        document.getElementById("telefonoEmergencia-detalles").innerText = alumno.telefonoEmergencia;
        document.getElementById("fechaIngreso-detalles").innerText = alumno.fechaRegistroFormateada;
        document.getElementById("fechaInicioPlan-detalles").innerText = alumno.alumnoPlanes.$values[0].fechaInicioFormateada;
        document.getElementById("fechaVencimientoPlan-detalles").innerText = alumno.alumnoPlanes.$values[0].fechaVencimientoFormateada;
        document.getElementById("tipoPlan-detalles").innerText = alumno.plan.nombre;
        document.getElementById("diasDeuda-detalles").innerText = alumno.diasAdicionales;
        
        // Mostrar el modal
        const modal = document.getElementById("modal-detalles");
        if (!modal) throw new Error("Error: Modal de actualización no encontrado");

        modal.classList.add("show");
        modal.style.display = "flex";
        modal.setAttribute("aria-hidden", "false"); // Accesibilidad
    } catch (error) {
        console.error("Error:", error);
        alert(error.message);
    }
}

async function abrirModalActualizar(dni) {
    const dniInt = parseInt(dni, 10)
    try {
        const response = await fetch(`https://backendgym-qbkn.onrender.com/api/Alumno/${dniInt}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        
        if (!response.ok) throw new Error("Error al obtener datos del alumno");

        const alumno = await response.json();

        // Verifica que los elementos existen antes de modificarlos
        document.getElementById("dni-actualizar").textContent = alumno.dni;
        document.getElementById("nombre-actualizar").value = alumno.nombre;
        document.getElementById("apellido-actualizar").value = alumno.apellido;
        document.getElementById("domicilio-actualizar").value = alumno.domicilio;
        document.getElementById("telefono-actualizar").value = alumno.telefono;
        document.getElementById("telefonoEmergencia-actualizar").value = alumno.telefonoEmergencia;
        document.getElementById("numeroPlan-actualizar").value = alumno.numeroPlan;
        document.getElementById("planPrevioAsignado").innerText = alumno.plan.nombre;
        await cargarOpcionesDePlanes();
    
        // Seleccionar el plan actual en el <select>
        document.getElementById("plan-actualizar").value = alumno.plan.planId;

        // Mostrar el modal
        const modal = document.getElementById("modal-actualizar");
        if (!modal) throw new Error("Error: Modal de actualización no encontrado");

        modal.classList.add("show");
        modal.style.display = "flex";
        modal.setAttribute("aria-hidden", "false"); // Accesibilidad
    } catch (error) {
        console.error("Error:", error);
        alert(error.message);
    }
}

async function guardarCambiosActualizar() {
    const dni = document.getElementById("dni-actualizar").textContent;
    const dniInt = parseInt(dni, 10)
    const alumnoActualizado = {
        nombre: document.getElementById("nombre-actualizar").value,
        apellido: document.getElementById("apellido-actualizar").value,
        domicilio: document.getElementById("domicilio-actualizar").value,
        telefono: document.getElementById("telefono-actualizar").value,
        telefonoEmergencia: document.getElementById("telefonoEmergencia-actualizar").value,
        planId: parseInt(document.getElementById("plan-actualizar").value, 10)
    };
        
    try {
        const response = await actualizarAlumno(alumnoActualizado, dniInt);

        alert("Alumno actualizado con éxito");
        
        cerrarModal("modal-actualizar");

        obtenerAlumnos();
    } catch (error) {
        console.error("Error:", error);
        alert(error.message);
    }
}

// Función para abrir el modal y cargar los datos del alumno
async function abrirModalRenovar(dni, diasARestar) {
    dniSeleccionado = dni; // Guardar el DNI en la variable global
    document.getElementById("dni-renovar").innerText = dni; // Mostrar DNI en el modal
    let alumno;
    try {
        let response = await fetch(`https://backendgym-qbkn.onrender.com/api/Alumno/${dniSeleccionado}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });
        
        alumno = await response.json();

    } catch (error) {
        alert("Error en la solicitud: " + error.message);
    }
    
    let fechaActual = new Date();
    let fechaVencimiento = new Date();
    fechaVencimiento.setMonth(fechaVencimiento.getMonth() + 1); // Sumar un mes a la fecha actual
    
    // Asignar valores a los elementos del modal
    document.getElementById("fhInicio-renovar").innerText = formatFecha(fechaActual);
    document.getElementById("fhVencimiento-renovar").innerText = formatFecha(fechaVencimiento);
    document.getElementById("diasDeuda-renovar").innerText = alumno.diasAdicionales;

    document.getElementById("modal-renovar").style.display = "flex"; // Mostrar el modal
}

// Función para formatear fecha (YYYY-MM-DD)
function formatFecha(fecha) {
    return fecha.toISOString().split("T")[0];
}

// Función para enviar la solicitud de renovación
async function confirmarRenovar() {
    if (!dniSeleccionado) {
        alert("Error: No se ha seleccionado ningún alumno.");
        return;
    }

    let diasARestar = document.getElementById("dias-restar").value;

    try {
        let response = await fetch(`https://backendgym-qbkn.onrender.com/api/AlumnoPlan/renovar/${dniSeleccionado}/${diasARestar}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            }
        });

        let result = await response.text();

        if (response.ok) {
            alert(result); // Mostrar respuesta del servidor
            cerrarModal("modal-renovar");
        } else {
            alert("Error al renovar suscripción: " + result);
        }
    } catch (error) {
        alert("Error en la solicitud: " + error.message);
    }
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

