document.addEventListener('DOMContentLoaded', function() {

    const modal = document.getElementById("modal-crear");
    const btnAbrirModal = document.getElementById("crearAlumno");
    const btnCerrarModal = document.getElementById("close-modal");
    const btnGuardarCambios = document.getElementById("guardarCambiosCrear");

    // Función para abrir el modal
    btnAbrirModal.addEventListener("click", function() {
        modal.style.display = "flex"; // Mostrar el modal
        console.log(btnGuardarCambios);  // Asegúrate de que esto no sea null
        
        btnGuardarCambios.addEventListener("click", guardarCambiosCrear);
        console.log("Event listener asignado al botón de guardar.");
    });

    // Función para cerrar el modal
    btnCerrarModal.addEventListener("click", function() {
        modal.style.display = "none"; // Ocultar el modal
    });

    // Cerrar el modal si el usuario hace clic fuera del contenido
    window.addEventListener("click", function(event) {
        if (event.target === modal) {
            modal.style.display = "none";
        }
    });

    // Función para crear un alumno
    async function crearAlumno(alumno) {
        console.log("Intentando crear alumno...");
        try {
            const response = await fetch("https://localhost:7207/api/Alumno", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(alumno)
            });

            const mensaje = await response.text();
            if (!response.ok) throw new Error(mensaje);

            console.log("Alumno creado:", mensaje);
            alert(mensaje);
            obtenerAlumnos(); // Refrescar lista después de crear
        } catch (error) {
            console.error("Error al crear alumno:", error);
            alert(error.message);
        }
    }

    // Función para guardar los cambios y enviar el formulario
    async function guardarCambiosCrear() {
        console.log("Guardar cambios clickeado");

        const nombre = document.getElementById("nombre-crear").value.trim();
        const apellido = document.getElementById("apellido-crear").value.trim();
        const dni = document.getElementById("dni-crear").value.trim();
        const telefono = document.getElementById("telefono-crear").value.trim();
        const domicilio = document.getElementById("domicilio-crear").value.trim();
        const telefonoEmergencia = document.getElementById("telefonoEmergencia-crear").value.trim();
        const planId = document.getElementById("planId-crear").value.trim();

        // Validación de los campos
        if (!nombre || !apellido || !dni || !telefono || !direccion || !telefonoEmergencia || !planId) {
            alert("Todos los campos son obligatorios.");
            return;
        }

        const alumnoData = {
            
            nombre: nombre,
            apellido: apellido,
            dni: parseInt(dni),
            telefono: telefono,
            domicilio: domicilio,
            telefonoEmergencia: telefonoEmergencia,
            planId: parseInt(planId)
            
        };
        console.log(alumnoData)
        await crearAlumno(alumnoData);

        modal.style.display = "none";
        console.log("Cambios guardados");
    }
});
