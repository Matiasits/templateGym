function obtenerAsistenciasDelDia() {
    fetch('https://backendgym-qbkn.onrender.com/api/Asistencias/del-dia')
        .then(response => {
            if (!response.ok) throw new Error('Error en la respuesta del servidor');
            return response.json();
        })
        .then(data => {
            const lista = document.getElementById("lista-asistencias");
            const contenedor = document.getElementById("asistencia-container");
            
            lista.innerHTML = "";
    
            const listaAsistencias = data.$values;
            
            const tituloExistente = contenedor.querySelector('.titulo-asistencias');
            if (tituloExistente) {
                tituloExistente.remove();
            }
            
            var cantidadAlumnos = listaAsistencias.length;
            const div = document.createElement('div');
            div.innerHTML = `
                <div class="titulo-asistencias">
                    <span>Asistencias de hoy: ${cantidadAlumnos}</span>
                </div>
            `;
            lista.parentElement.insertBefore(div, lista);
            
            
            listaAsistencias.forEach(asistencia => {
                const nombreCompleto = `${asistencia.alumno.nombre} ${asistencia.alumno.apellido}`;
                const hora = new Date(asistencia.fhRegistro).toLocaleTimeString();
                
                
                const li = document.createElement("li");
                li.innerHTML = `
                    <div class="example container justify-content-center mt-5 border-left border-right">
                        <div class="d-flex justify-content-center py-2">
                            <div class="second py-2 px-2">
                                <span class="text1">${nombreCompleto}</span>
                                <div class="d-flex justify-content-between py-1 pt-2">
                                    <div><span class="text2">${hora}</span></div>
                                </div>
                            </div>
                        </div>
                    </div>
                `;

                lista.appendChild(li);
            });
        })
        .catch(error => {
            console.error('Error al obtener asistencias:', error);
        });
}

obtenerAsistenciasDelDia();
setInterval(obtenerAsistenciasDelDia, 600000); 
