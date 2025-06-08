document.addEventListener('DOMContentLoaded', function () {
  // Hero Carousel
  const slides = document.querySelectorAll('.hero-slide');
  const leftBtn = document.querySelector('.hero-arrow-left');
  const rightBtn = document.querySelector('.hero-arrow-right');
  const radios = document.querySelectorAll('.hero-radio-buttons .material-symbols-outlined');
  let current = 0;

  function showSlide(idx) {
    slides.forEach((slide, i) => {
      slide.classList.toggle('active', i === idx);
    });
    radios.forEach((radio, i) => {
      if (i === idx) {
        radio.textContent = 'radio_button_checked';
        radio.classList.add('checked');
        radio.classList.remove('unchecked');
      } else {
        radio.textContent = 'radio_button_unchecked';
        radio.classList.remove('checked');
        radio.classList.add('unchecked');
      }
    });
    current = idx;
  }

  leftBtn.addEventListener('click', () => {
    const idx = (current - 1 + slides.length) % slides.length;
    showSlide(idx);
  });
  rightBtn.addEventListener('click', () => {
    const idx = (current + 1) % slides.length;
    showSlide(idx);
  });
  radios.forEach((radio, i) => {
    radio.addEventListener('click', () => showSlide(i));
  });

  showSlide(0);

  // Navegación lateral animada
  const desktopNavbar = document.querySelector('.desktop-navbar');
  const closeBtn = document.querySelector('.span--close');
  const menuBtn = document.querySelector('.span--menu');

  if (closeBtn && desktopNavbar) {
    closeBtn.addEventListener('click', () => {
      if (!desktopNavbar.classList.contains('closed')) {
        desktopNavbar.classList.add('closed');
      }
    });
  }

  if (menuBtn && desktopNavbar) {
    menuBtn.addEventListener('click', () => {
      if (desktopNavbar.classList.contains('closed')) {
        desktopNavbar.classList.remove('closed');
        // Forzar reflow para que la transición funcione si estaba oculta
        void desktopNavbar.offsetWidth;
      }
    });
  }

  // Asegurarse de que el menú esté oculto al cargar la página
  if (desktopNavbar) {
    desktopNavbar.classList.add('closed');
  }

  
});