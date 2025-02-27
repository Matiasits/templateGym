
function abrirModalActualizar(dni) {
    const modal = document.getElementById("modal-actualizar");
    document.getElementById("dni-actualizar").textContent = dni; // Mostrar el DNI en el modal
    modal.classList.add("show");
    modal.style.display = "block";
}

function abrirModalEliminar(dni) {
    const modal = document.getElementById("modal-eliminar");
    document.getElementById("dni-eliminar").textContent = dni;
    modal.classList.add("show");
    modal.style.display = "block";
}

// Cerrar los modales cuando se haga clic en el botón de cerrar
document.querySelectorAll(".modal .close").forEach(button => {
    button.addEventListener("click", function () {
        const modal = this.closest(".modal");
        modal.classList.remove("show");
        modal.style.display = "none";
    });
});

// Cerrar el modal si el usuario hace clic fuera de él
window.addEventListener("click", function (event) {
    document.querySelectorAll(".modal").forEach(modal => {
        if (event.target === modal) {
            modal.classList.remove("show");
            modal.style.display = "none";
        }
    });
});
