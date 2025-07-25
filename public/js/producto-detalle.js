class ProductDetailApp {
  constructor() {
    this.product = null
    this.currentImageIndex = 0
    this.productImages = []
    this.quantity = 1
    // Cargar favoritos de forma más robusta
    this.loadFavoritesFromStorage()

    this.init()
  }

  async init() {
    console.log("Inicializando página de detalles...")
    await this.loadProduct()
    this.setupEventListeners()
    this.setupTabs()
    this.updateFavoritesCount() // Agregar esta línea
  }

  async loadProduct() {
    try {
      // Get product from localStorage
      const productData = localStorage.getItem("selectedProduct")
      if (!productData) {
        throw new Error("No se encontró información del producto")
      }

      this.product = JSON.parse(productData)
      console.log("Producto cargado:", this.product)

      // Load additional data if needed
      await this.loadAllProducts()

      this.renderProductDetail()
      this.renderRelatedProducts()
    } catch (error) {
      console.error("Error al cargar el producto:", error)
      this.showError("No se pudo cargar la información del producto")
    }
  }

  async loadAllProducts() {
    try {
      const response = await fetch("../public/assets/json/relojes_listos_para_sql.json")
      if (!response.ok) throw new Error("Error al cargar productos")

      this.allProducts = await response.json()
    } catch (error) {
      console.error("Error al cargar todos los productos:", error)
      this.allProducts = []
    }
  }

  renderProductDetail() {
    if (!this.product) return

    // Update page title
    document.title = `${this.product.nombre || "Producto"} - CASIO`

    // Update breadcrumb
    const breadcrumbCategory = document.getElementById("breadcrumb-category")
    const breadcrumbProduct = document.getElementById("breadcrumb-product")

    if (breadcrumbCategory) {
      breadcrumbCategory.textContent = this.getCategoryName(this.product.id_categoria)
    }
    if (breadcrumbProduct) {
      breadcrumbProduct.textContent = this.product.nombre || "Producto"
    }

    // Update product information
    this.updateProductInfo()
    this.updateProductImages()
    this.updateProductSpecs()
    this.updateTechnicalDetails()
    this.updateFavoriteButton()
  }

  updateProductInfo() {
    const elements = {
      "product-brand-detail": this.product.marca || "CASIO",
      "product-title": this.product.nombre || "Producto sin nombre",
      "product-code": `Código: ${this.product.codigo || this.product.id || "N/A"}`,
      "current-price": this.formatPrice(this.product.precio),
      "product-description-text": this.product.descripcion || "Descripción no disponible",
    }

    Object.entries(elements).forEach(([id, content]) => {
      const element = document.getElementById(id)
      if (element) element.textContent = content
    })

    // Handle price display
    this.updatePriceDisplay()

    // Update availability
    const availability = document.getElementById("availability")
    if (availability) {
      const status = availability.querySelector(".availability-status")
      if (status) {
        status.textContent = this.product.stock > 0 ? "En stock" : "Agotado"
        status.style.color = this.product.stock > 0 ? "#28a745" : "#dc3545"
      }
    }
  }

  updatePriceDisplay() {
    const currentPriceEl = document.getElementById("current-price")
    const originalPriceEl = document.getElementById("original-price")
    const discountBadgeEl = document.getElementById("discount-badge")

    if (currentPriceEl) {
      currentPriceEl.textContent = this.formatPrice(this.product.precio)
    }

    // Simulate discount logic
    const hasDiscount = Math.random() > 0.7 // 30% chance of discount
    if (hasDiscount && originalPriceEl && discountBadgeEl) {
      const originalPrice = this.product.precio * 1.2
      originalPriceEl.textContent = this.formatPrice(originalPrice)
      originalPriceEl.style.display = "inline"
      discountBadgeEl.textContent = "-17%"
      discountBadgeEl.style.display = "inline"
    } else {
      if (originalPriceEl) originalPriceEl.style.display = "none"
      if (discountBadgeEl) discountBadgeEl.style.display = "none"
    }
  }

  updateProductImages() {
    const mainImage = document.getElementById("main-product-image")
    const thumbnailContainer = document.getElementById("thumbnail-images")

    // Prepare images array
    this.productImages = []

    if (this.product.imagen_principal) {
      this.productImages.push(this.product.imagen_principal)
    }

    // Add additional images if they exist in the product data
    if (this.product.imagenes_adicionales) {
      this.productImages.push(...this.product.imagenes_adicionales)
    }

    // If no images, add placeholder
    if (this.productImages.length === 0) {
      this.productImages.push("https://via.placeholder.com/500x500/f8f9fa/333?text=No+Image")
    }

    // Update main image
    if (mainImage) {
      mainImage.src = this.productImages[0]
      mainImage.alt = this.product.nombre || "Producto"
    }

    // Update thumbnails
    if (thumbnailContainer) {
      thumbnailContainer.innerHTML = ""

      this.productImages.forEach((imageSrc, index) => {
        const thumbnail = document.createElement("div")
        thumbnail.className = `thumbnail-image ${index === 0 ? "active" : ""}`
        thumbnail.innerHTML = `<img src="${imageSrc}" alt="Vista ${index + 1}" onerror="this.src='https://via.placeholder.com/80x80/f8f9fa/333?text=No+Image'">`

        thumbnail.addEventListener("click", () => {
          this.changeMainImage(index)
        })

        thumbnailContainer.appendChild(thumbnail)
      })
    }
  }

  updateProductSpecs() {
    const specsGrid = document.getElementById("specs-grid")
    const featuresList = document.getElementById("product-features-list")

    if (specsGrid) {
      specsGrid.innerHTML = ""

      const specs = [
        { label: "Marca", value: this.product.marca || "CASIO" },
        { label: "Categoría", value: this.getCategoryName(this.product.id_categoria) },
        { label: "Material", value: this.getMaterialName(this.product.id_material) },
        { label: "Color", value: this.product.color || "N/A" },
        { label: "Peso", value: this.product.peso ? `${this.product.peso}g` : "N/A" },
        { label: "Resistencia al agua", value: this.product.resistencia_agua || "N/A" },
      ]

      specs.forEach((spec) => {
        const specItem = document.createElement("div")
        specItem.className = "spec-item"
        specItem.innerHTML = `
          <div class="spec-label">${spec.label}</div>
          <div class="spec-value">${spec.value}</div>
        `
        specsGrid.appendChild(specItem)
      })
    }

    if (featuresList) {
      featuresList.innerHTML = ""

      const features = [
        "Resistente al agua",
        "Cronómetro integrado",
        "Alarma programable",
        "Luz LED",
        "Calendario automático",
        "Zona horaria mundial",
      ]

      features.forEach((feature) => {
        const li = document.createElement("li")
        li.textContent = feature
        featuresList.appendChild(li)
      })
    }
  }

  updateTechnicalDetails() {
    const technicalDetails = document.getElementById("technical-details")

    if (technicalDetails) {
      technicalDetails.innerHTML = ""

      const sections = [
        {
          title: "Dimensiones",
          details: [
            { label: "Ancho", value: this.product.ancho ? `${this.product.ancho}mm` : "N/A" },
            { label: "Alto", value: this.product.alto ? `${this.product.alto}mm` : "N/A" },
            { label: "Grosor", value: this.product.grosor ? `${this.product.grosor}mm` : "N/A" },
            { label: "Peso", value: this.product.peso ? `${this.product.peso}g` : "N/A" },
          ],
        },
        {
          title: "Características Técnicas",
          details: [
            { label: "Movimiento", value: this.product.movimiento || "Cuarzo" },
            { label: "Resistencia al agua", value: this.product.resistencia_agua || "50M" },
            { label: "Cristal", value: this.product.cristal || "Mineral" },
            { label: "Correa", value: this.getMaterialName(this.product.id_material) },
          ],
        },
        {
          title: "Funciones",
          details: [
            { label: "Cronómetro", value: "Sí" },
            { label: "Alarma", value: "Sí" },
            { label: "Luz", value: "LED" },
            { label: "Calendario", value: "Automático" },
          ],
        },
      ]

      sections.forEach((section) => {
        const sectionDiv = document.createElement("div")
        sectionDiv.className = "detail-section"

        sectionDiv.innerHTML = `
          <h4>${section.title}</h4>
          <ul class="detail-list">
            ${section.details
              .map(
                (detail) => `
              <li>
                <span class="detail-label">${detail.label}</span>
                <span class="detail-value">${detail.value}</span>
              </li>
            `,
              )
              .join("")}
          </ul>
        `

        technicalDetails.appendChild(sectionDiv)
      })
    }
  }

  renderRelatedProducts() {
    const relatedGrid = document.getElementById("related-products-grid")
    if (!relatedGrid || !this.allProducts) return

    // Filter related products by same category
    const relatedProducts = this.allProducts
      .filter((p) => p.id !== this.product.id && p.id_categoria === this.product.id_categoria)
      .slice(0, 4)

    relatedGrid.innerHTML = ""

    relatedProducts.forEach((product) => {
      const card = document.createElement("div")
      card.className = "related-product-card"
      card.onclick = () => this.openRelatedProduct(product)

      card.innerHTML = `
        <img src="${product.imagen_principal || "https://via.placeholder.com/200x200/f8f9fa/333?text=No+Image"}" 
             alt="${product.nombre}" 
             class="related-product-image"
             onerror="this.src='https://via.placeholder.com/200x200/f8f9fa/333?text=No+Image'">
        <div class="related-product-name">${product.nombre || "Producto"}</div>
        <div class="related-product-price">${this.formatPrice(product.precio)}</div>
      `

      relatedGrid.appendChild(card)
    })
  }

  openRelatedProduct(product) {
    localStorage.setItem("selectedProduct", JSON.stringify(product))
    window.location.reload()
  }

  changeMainImage(index) {
    const mainImage = document.getElementById("main-product-image")
    const thumbnails = document.querySelectorAll(".thumbnail-image")

    if (mainImage && this.productImages[index]) {
      mainImage.src = this.productImages[index]
      this.currentImageIndex = index

      // Update active thumbnail
      thumbnails.forEach((thumb, i) => {
        thumb.classList.toggle("active", i === index)
      })
    }
  }

  openImageModal() {
    const modal = document.getElementById("image-modal")
    const modalImage = document.getElementById("modal-image")

    if (modal && modalImage) {
      modalImage.src = this.productImages[this.currentImageIndex]
      modal.classList.add("active")
      document.body.style.overflow = "hidden"
    }
  }

  closeImageModal() {
    const modal = document.getElementById("image-modal")
    if (modal) {
      modal.classList.remove("active")
      document.body.style.overflow = "auto"
    }
  }

  changeQuantity(delta) {
    const quantityInput = document.getElementById("quantity")
    if (quantityInput) {
      const newQuantity = Math.max(1, Math.min(10, this.quantity + delta))
      this.quantity = newQuantity
      quantityInput.value = newQuantity
    }
  }

  addToCart() {
    const cartItems = JSON.parse(localStorage.getItem("cart") || "[]")

    const existingItem = cartItems.find((item) => item.id === this.product.id)

    if (existingItem) {
      existingItem.quantity += this.quantity
    } else {
      cartItems.push({
        id: this.product.id,
        name: this.product.nombre,
        price: this.product.precio,
        image: this.product.imagen_principal,
        quantity: this.quantity,
      })
    }

    localStorage.setItem("cart", JSON.stringify(cartItems))

    // Show success message
    this.showNotification("Producto agregado al carrito", "success")
  }

  buyNow() {
    this.addToCart()
    // Redirect to checkout or cart page
    this.showNotification("Redirigiendo al checkout...", "info")
    // window.location.href = 'checkout.html'
  }

  loadFavoritesFromStorage() {
    try {
      const storedFavorites = localStorage.getItem("favorites")
      this.favorites = storedFavorites ? JSON.parse(storedFavorites) : []
      console.log("Favoritos cargados en página de detalles:", this.favorites)
    } catch (error) {
      console.error("Error al cargar favoritos:", error)
      this.favorites = []
    }
  }

  toggleFavorite() {
    // Recargar favoritos desde localStorage antes de modificar
    this.loadFavoritesFromStorage()

    const productId = this.getConsistentProductId(this.product)
    const favoriteBtn = document.getElementById("favorite-btn-detail")

    if (this.favorites.includes(productId)) {
      this.favorites = this.favorites.filter((id) => id !== productId)
      favoriteBtn.classList.remove("active")
      console.log("Producto eliminado de favoritos:", productId)
    } else {
      this.favorites.push(productId)
      favoriteBtn.classList.add("active")
      console.log("Producto agregado a favoritos:", productId)
    }

    localStorage.setItem("favorites", JSON.stringify(this.favorites))
    console.log("Favoritos actualizados:", this.favorites)
    this.updateFavoritesCount()
  }

  updateFavoriteButton() {
    const favoriteBtn = document.getElementById("favorite-btn-detail")
    const productId = this.getConsistentProductId(this.product)
    if (favoriteBtn && this.favorites.includes(productId)) {
      favoriteBtn.classList.add("active")
    }
  }

  setupTabs() {
    const tabHeaders = document.querySelectorAll(".tab-header")
    const tabPanels = document.querySelectorAll(".tab-panel")

    tabHeaders.forEach((header) => {
      header.addEventListener("click", () => {
        const targetTab = header.getAttribute("data-tab")

        // Remove active class from all headers and panels
        tabHeaders.forEach((h) => h.classList.remove("active"))
        tabPanels.forEach((p) => p.classList.remove("active"))

        // Add active class to clicked header and corresponding panel
        header.classList.add("active")
        const targetPanel = document.getElementById(`${targetTab}-panel`)
        if (targetPanel) {
          targetPanel.classList.add("active")
        }
      })
    })
  }

  setupEventListeners() {
    // Main image click for modal
    const mainImageContainer = document.querySelector(".main-image-container")
    if (mainImageContainer) {
      mainImageContainer.addEventListener("click", () => this.openImageModal())
    }

    // Modal close
    const modalClose = document.querySelector(".modal-close")
    if (modalClose) {
      modalClose.addEventListener("click", () => this.closeImageModal())
    }

    // Modal navigation
    const modalPrev = document.getElementById("modal-prev")
    const modalNext = document.getElementById("modal-next")

    if (modalPrev) {
      modalPrev.addEventListener("click", () => {
        const newIndex = (this.currentImageIndex - 1 + this.productImages.length) % this.productImages.length
        this.changeMainImage(newIndex)
        document.getElementById("modal-image").src = this.productImages[newIndex]
      })
    }

    if (modalNext) {
      modalNext.addEventListener("click", () => {
        const newIndex = (this.currentImageIndex + 1) % this.productImages.length
        this.changeMainImage(newIndex)
        document.getElementById("modal-image").src = this.productImages[newIndex]
      })
    }

    // Quantity controls
    const quantityInput = document.getElementById("quantity")
    if (quantityInput) {
      quantityInput.addEventListener("change", (e) => {
        this.quantity = Math.max(1, Math.min(10, Number.parseInt(e.target.value) || 1))
        e.target.value = this.quantity
      })
    }

    // Action buttons
    const addToCartBtn = document.getElementById("add-to-cart")
    const buyNowBtn = document.getElementById("buy-now")
    const favoriteBtn = document.getElementById("favorite-btn-detail")

    if (addToCartBtn) {
      addToCartBtn.addEventListener("click", () => this.addToCart())
    }

    if (buyNowBtn) {
      buyNowBtn.addEventListener("click", () => this.buyNow())
    }

    if (favoriteBtn) {
      favoriteBtn.addEventListener("click", () => this.toggleFavorite())
    }

    // Close modal on escape key
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        this.closeImageModal()
      }
    })

    // Close modal on background click
    const modal = document.getElementById("image-modal")
    if (modal) {
      modal.addEventListener("click", (e) => {
        if (e.target === modal) {
          this.closeImageModal()
        }
      })
    }
  }

  // Utility methods
  getCategoryName(categoryId) {
    const categories = {
      1: "G-SHOCK",
      2: "CASIO",
      3: "ELEGANT",
      4: "EDIFICE",
      5: "BABY-G",
    }
    return categories[categoryId] || "Categoría"
  }

  getMaterialName(materialId) {
    const materials = {
      1: "Acero Inoxidable",
      2: "Cuero",
      3: "Titanio",
      4: "Plástico",
    }
    return materials[materialId] || "Material"
  }

  formatPrice(price) {
    if (!price) return "$0.00"
    return `$${Number.parseFloat(price).toFixed(2)}`
  }

  showError(message) {
    const mainContent = document.querySelector(".main-content")
    if (mainContent) {
      mainContent.innerHTML = `
        <div style="text-align: center; padding: 60px 20px; color: #666;">
          <h2>Error</h2>
          <p>${message}</p>
          <button onclick="window.history.back()" style="margin-top: 20px; padding: 12px 24px; background: #0066cc; color: white; border: none; border-radius: 4px; cursor: pointer;">
            Volver al Catálogo
          </button>
        </div>
      `
    }
  }

  showNotification(message, type = "info") {
    // Create notification element
    const notification = document.createElement("div")
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === "success" ? "#28a745" : type === "error" ? "#dc3545" : "#0066cc"};
      color: white;
      padding: 16px 24px;
      border-radius: 4px;
      z-index: 1001;
      font-weight: 500;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      transform: translateX(100%);
      transition: transform 0.3s ease;
    `
    notification.textContent = message

    document.body.appendChild(notification)

    // Animate in
    setTimeout(() => {
      notification.style.transform = "translateX(0)"
    }, 100)

    // Remove after 3 seconds
    setTimeout(() => {
      notification.style.transform = "translateX(100%)"
      setTimeout(() => {
        document.body.removeChild(notification)
      }, 300)
    }, 3000)
  }

  updateFavoritesCount() {
    const favorites = JSON.parse(localStorage.getItem("favorites") || "[]")
    const countElement = document.getElementById("favorites-count")
    if (countElement) {
      countElement.textContent = favorites.length
    }
  }

  // Agregar la función para obtener ID consistente
  getConsistentProductId(producto) {
    // Si el producto tiene un ID real, usarlo
    if (producto.id) {
      return String(producto.id)
    }

    // Si no tiene ID, crear uno basado en propiedades únicas del producto
    // Usar una combinación de propiedades que sea única y consistente
    const uniqueString = `${producto.nombre || "unnamed"}_${producto.marca || "nobrand"}_${producto.codigo || "nocode"}_${producto.precio || "0"}`

    // Crear un hash simple del string único
    let hash = 0
    for (let i = 0; i < uniqueString.length; i++) {
      const char = uniqueString.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash // Convert to 32bit integer
    }

    return `product_${Math.abs(hash)}`
  }
}

// Global functions for HTML onclick events
function changeQuantity(delta) {
  if (window.productDetailApp) {
    window.productDetailApp.changeQuantity(delta)
  }
}

function closeImageModal() {
  if (window.productDetailApp) {
    window.productDetailApp.closeImageModal()
  }
}

// Initialize app when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  window.productDetailApp = new ProductDetailApp()
})
