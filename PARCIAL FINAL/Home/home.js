// Elementos del DOM
const paginaActual = document.getElementById('paginaActual');
const paginaSiguiente = document.getElementById('paginaSiguiente');

// Variables de estado
let isDragging = false;
let startY = 0;
let currentTranslateY = 0;

// Escuchar el inicio del arrastre
paginaActual.addEventListener('mousedown', (e) => {
    isDragging = true;
    startY = e.clientY; // Registro del punto inicial del clic
    paginaSiguiente.style.display = 'block'; // Asegurar que la página siguiente está visible
});

// Escuchar el movimiento del ratón
document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;

    const deltaY = startY - e.clientY; // Diferencia de desplazamiento
    if (deltaY > 0) {
        currentTranslateY = Math.min(deltaY, window.innerHeight); // Limitar el movimiento
        paginaActual.style.transform = `translateY(-${currentTranslateY}px)`;
        paginaSiguiente.style.transform = `translateY(${window.innerHeight - currentTranslateY}px)`;
        paginaSiguiente.style.opacity = `${currentTranslateY / window.innerHeight}`;
    }
});

// Escuchar el fin del arrastre
document.addEventListener('mouseup', () => {
    if (!isDragging) return;
    isDragging = false;

    // Determinar si completar el cambio de página
    if (currentTranslateY > window.innerHeight / 2) {
        paginaActual.style.transform = 'translateY(-100%)';
        paginaSiguiente.style.transform = 'translateY(0)';
        paginaSiguiente.style.opacity = '1';

        // Redirigir después de la animación
        setTimeout(() => {
            window.location.href = '../Inicio Sesion/InicioSesion.html'; // Cambia esta ruta
        }, 300); // Tiempo suficiente para que la transición termine
    } else {
        // Restaurar al estado inicial si no se arrastró lo suficiente
        paginaActual.style.transform = 'translateY(0)';
        paginaSiguiente.style.transform = `translateY(100%)`;
        paginaSiguiente.style.opacity = '0';
    }
});

