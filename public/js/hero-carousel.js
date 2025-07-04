// Hero Carousel JavaScript
class HeroCarousel {
  constructor() {
    this.currentSlide = 0
    this.slides = document.querySelectorAll(".hero-slide")
    this.radioButtons = document.querySelectorAll(".hero-radio-buttons .material-symbols-outlined")
    this.totalSlides = this.slides.length
    this.autoAdvanceInterval = null

    this.init()
  }

  init() {
    this.setupEventListeners()
    this.startAutoAdvance()
    this.showSlide(0)
  }

  setupEventListeners() {
    // Previous button
    const prevBtn = document.getElementById("prev-slide")
    if (prevBtn) {
      prevBtn.addEventListener("click", () => this.previousSlide())
    }

    // Next button
    const nextBtn = document.getElementById("next-slide")
    if (nextBtn) {
      nextBtn.addEventListener("click", () => this.nextSlide())
    }

    // Radio button indicators
    this.radioButtons.forEach((button, index) => {
      button.addEventListener("click", () => this.goToSlide(index))
    })

    // Pause auto-advance on hover
    const carousel = document.querySelector(".hero-carousel")
    if (carousel) {
      carousel.addEventListener("mouseenter", () => this.pauseAutoAdvance())
      carousel.addEventListener("mouseleave", () => this.startAutoAdvance())
    }
  }

  showSlide(index) {
    // Remove active class from all slides
    this.slides.forEach((slide) => slide.classList.remove("active"))

    // Add active class to current slide
    if (this.slides[index]) {
      this.slides[index].classList.add("active")
    }

    // Update radio buttons
    this.radioButtons.forEach((button, i) => {
      if (i === index) {
        button.classList.remove("unchecked")
        button.classList.add("checked")
        button.textContent = "radio_button_checked"
      } else {
        button.classList.remove("checked")
        button.classList.add("unchecked")
        button.textContent = "radio_button_unchecked"
      }
    })
  }

  nextSlide() {
    this.currentSlide = (this.currentSlide + 1) % this.totalSlides
    this.showSlide(this.currentSlide)
  }

  previousSlide() {
    this.currentSlide = (this.currentSlide - 1 + this.totalSlides) % this.totalSlides
    this.showSlide(this.currentSlide)
  }

  goToSlide(index) {
    this.currentSlide = index
    this.showSlide(this.currentSlide)
  }

  startAutoAdvance() {
    this.pauseAutoAdvance() // Clear any existing interval
    this.autoAdvanceInterval = setInterval(() => {
      this.nextSlide()
    }, 5000)
  }

  pauseAutoAdvance() {
    if (this.autoAdvanceInterval) {
      clearInterval(this.autoAdvanceInterval)
      this.autoAdvanceInterval = null
    }
  }
}

// Initialize carousel when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new HeroCarousel()
})
