document.addEventListener("DOMContentLoaded", () => {
    
    const fadeElements = document.querySelectorAll(".fade-in, .fade-in-two");

    const observerOptions = {
        root: null,         // Usa el viewport del navegador
        threshold: 0.15,    // Se activa cuando el 15% del elemento es visible
        rootMargin: "0px 0px -50px 0px" // Margen inferior para que no aparezca tan al borde
    };

    const scrollObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Añade la clase que activa la animación CSS
                entry.target.classList.add("appear");
                // Una vez que aparece, dejamos de observarlo para mejorar rendimiento
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Decirle al observador que vigile cada elemento seleccionado
    fadeElements.forEach(element => {
        scrollObserver.observe(element);
    });
});