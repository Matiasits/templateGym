const API_URL = "http://localhost:7207/api/Alumno"; // Asegúrate de que la URL coincide con la de tu backend

// 🔹 Crear un nuevo alumno
async function crearAlumno(alumno) {
    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(alumno)
        });

        const mensaje = await response.text();
        if (!response.ok) throw new Error(mensaje);

        console.log(mensaje);
        alert(mensaje);
        obtenerAlumnos(); // Refrescar lista después de crear
    } catch (error) {
        console.error("Error:", error);
        alert(error.message);
    }
}

// 🔹 Actualizar un alumno
async function actualizarAlumno(dni) {
    const alumnoActualizado = {
        nombre: "Nuevo Nombre",
        apellido: "Nuevo Apellido",
        domicilio: "Nueva Dirección",
        telefono: "123456789",
        telefonoEmergencia: "987654321",
        planId: 1 
    };

    try {
        const response = await fetch(`${API_URL}/${dni}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(alumnoActualizado)
        });

        const mensaje = await response.text();
        if (!response.ok) throw new Error(mensaje);

        console.log(mensaje);
        alert(mensaje);
        obtenerAlumnos(); // Refrescar lista después de actualizar
    } catch (error) {
        console.error("Error:", error);
        alert(error.message);
    }
}

// 🔹 Eliminar un alumno
async function eliminarAlumno(dni) {
    if (!confirm("¿Estás seguro de que deseas eliminar este alumno?")) return;

    try {
        const response = await fetch(`${API_URL}/${dni}`, {
            method: "DELETE"
        });

        const mensaje = await response.text();
        if (!response.ok) throw new Error(mensaje);

        console.log(mensaje);
        alert(mensaje);
        obtenerAlumnos(); // Refrescar lista después de eliminar
    } catch (error) {
        console.error("Error:", error);
        alert(error.message);
    }
}
