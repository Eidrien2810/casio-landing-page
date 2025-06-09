document.addEventListener('DOMContentLoaded', function() {
    const carouselTrack = document.querySelector('.carousel-track');
    const slides = document.querySelectorAll('.carousel-slide');
    const slideWidth = slides[0].offsetWidth + 20; // Ancho + gap
    
    // Configuración del carrusel
    let baseSpeed = 1; // Velocidad base (px/frame)
    let currentSpeed = baseSpeed;
    let currentPosition = 0;
    let animationId;
    let isDragging = false;
    let startX, startPosition;
    let velocity = 0;
    let lastTime, lastPosition;
    let inertia = 0.95; // Factor de inercia (0.9-0.99)
    let minSpeed = 0.1; // Velocidad mínima para seguir animando
    
    // Clonar slides para efecto infinito
    function cloneSlides() {
        const firstSlides = Array.from(slides).slice(0, 3);
        firstSlides.forEach(slide => {
            const clone = slide.cloneNode(true);
            carouselTrack.appendChild(clone);
        });
    }
    
    cloneSlides();
    
    // Calcular velocidad basada en movimiento del mouse/touch
    function calculateVelocity(newPosition, newTime) {
        if (lastPosition !== undefined && lastTime !== undefined) {
            const deltaPosition = newPosition - lastPosition;
            const deltaTime = (newTime - lastTime) / 1000; // en segundos
            velocity = deltaTime ? deltaPosition / deltaTime : 0;
        }
        lastPosition = newPosition;
        lastTime = newTime;
    }
    
    // Función de animación con inercia
    function animate(timestamp) {
        if (!isDragging) {
            // Movimiento automático
            currentPosition -= currentSpeed;
            
            // Si llegamos al final, reiniciamos sin transición
            if (currentPosition <= -slideWidth * slides.length) {
                currentPosition = 0;
                carouselTrack.style.transition = 'none';
                carouselTrack.style.transform = `translateX(${currentPosition}px)`;
                void carouselTrack.offsetWidth; // Forzar reflow
                carouselTrack.style.transition = 'transform 0.3s ease';
            }
        } else {
            // Aplicar inercia cuando se suelta el arrastre
            if (Math.abs(velocity) > minSpeed) {
                currentSpeed = -velocity * 0.02; // Factor de conversión de velocidad
                velocity *= inertia; // Reducir velocidad por fricción
            } else {
                velocity = 0;
                currentSpeed = baseSpeed; // Volver a velocidad base
            }
            
            currentPosition -= currentSpeed;
        }
        
        carouselTrack.style.transform = `translateX(${currentPosition}px)`;
        animationId = requestAnimationFrame(animate);
    }
    
    // Eventos para arrastrar
    carouselTrack.addEventListener('mousedown', dragStart);
    carouselTrack.addEventListener('touchstart', dragStart, { passive: false });
    
    function dragStart(e) {
        isDragging = true;
        currentSpeed = 0;
        startX = e.clientX || e.touches[0].clientX;
        startPosition = currentPosition;
        lastPosition = startPosition;
        lastTime = performance.now();
        
        carouselTrack.style.transition = 'none';
        carouselTrack.style.cursor = 'grabbing';
        
        document.addEventListener('mousemove', dragMove);
        document.addEventListener('touchmove', dragMove, { passive: false });
        document.addEventListener('mouseup', dragEnd);
        document.addEventListener('touchend', dragEnd);
    }
    
    function dragMove(e) {
        if (!isDragging) return;
        e.preventDefault();
        
        const x = e.clientX || e.touches[0].clientX;
        const walk = (x - startX) * 2; // Factor de desplazamiento
        currentPosition = startPosition + walk;
        
        const now = performance.now();
        calculateVelocity(currentPosition, now);
        
        carouselTrack.style.transform = `translateX(${currentPosition}px)`;
    }
    
    function dragEnd() {
        isDragging = false;
        carouselTrack.style.cursor = 'grab';
        carouselTrack.style.transition = 'transform 0.3s ease';
        
        // Si la velocidad es significativa, mantenerla
        if (Math.abs(velocity) > 50) {
            currentSpeed = -velocity * 0.02;
        } else {
            currentSpeed = baseSpeed;
        }
        
        document.removeEventListener('mousemove', dragMove);
        document.removeEventListener('touchmove', dragMove);
        document.removeEventListener('mouseup', dragEnd);
        document.removeEventListener('touchend', dragEnd);
    }
    
    // Iniciar animación
    function startAnimation() {
        if (!animationId) {
            lastTime = performance.now();
            animationId = requestAnimationFrame(animate);
        }
    }
    
    // Iniciar la animación
    startAnimation();
    
    // Limpiar al salir de la página
    window.addEventListener('beforeunload', () => {
        cancelAnimationFrame(animationId);
    });
});