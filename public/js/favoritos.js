class FavoritesApp {
  constructor() {
    // Cargar favoritos desde localStorage de forma más robusta
    this.loadFavoritesFromStorage()
    this.allProducts = []
    this.favoriteProducts = []
    this.currentView = "grid"
    this.currentSort = "recent"
    this.searchQuery = ""

    this.init()
  }

  async init() {
    console.log("Inicializando página de favoritos...")
    this.showLoading()
    await this.loadProducts()
    this.setupEventListeners()
    this.updateFavoritesCount()
    this.updateCartCount() // Agregar esta línea
    this.renderFavorites()
    this.loadRecommendations()
  }

  loadFavoritesFromStorage() {
    try {
      const storedFavorites = localStorage.getItem("favorites")
      this.favorites = storedFavorites ? JSON.parse(storedFavorites) : []
      console.log("Favoritos cargados en página de favoritos:", this.favorites)
    } catch (error) {
      console.error("Error al cargar favoritos:", error)
      this.favorites = []
    }
  }

  // Actualizar la función loadProducts para usar IDs consistentes
  async loadProducts() {
    try {
      const response = await fetch("../public/assets/json/relojes_listos_para_sql.json")
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      this.allProducts = await response.json()

      if (!Array.isArray(this.allProducts) || this.allProducts.length === 0) {
        throw new Error("No se encontraron productos en el archivo JSON")
      }

      // Filter favorite products usando IDs consistentes
      this.favoriteProducts = this.allProducts.filter((product) => {
        const productId = this.getConsistentProductId(product)
        return this.favorites.includes(String(productId))
      })

      console.log(`Productos cargados: ${this.allProducts.length}`)
      console.log(`Favoritos encontrados: ${this.favoriteProducts.length}`)
    } catch (error) {
      console.error("Error al cargar productos:", error)
      this.showError("No se pudieron cargar los productos")
    }
  }

  // Agregar la misma función para obtener ID consistente
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

  showLoading() {
    document.getElementById("loading-container").style.display = "flex"
    document.getElementById("empty-state").style.display = "none"
    document.getElementById("favorites-container").classList.remove("active")
  }

  hideLoading() {
    document.getElementById("loading-container").style.display = "none"
  }

  showEmpty() {
    this.hideLoading()
    document.getElementById("empty-state").style.display = "flex"
    document.getElementById("favorites-container").classList.remove("active")
    document.getElementById("recommendations-section").style.display = "none"
  }

  showFavorites() {
    this.hideLoading()
    document.getElementById("empty-state").style.display = "none"
    document.getElementById("favorites-container").classList.add("active")
    document.getElementById("recommendations-section").style.display = "block"
  }

  showError(message) {
    this.hideLoading()
    const container = document.getElementById("favorites-container")
    container.innerHTML = `
      <div style="text-align: center; padding: 60px 20px; color: #666;">
        <h2>Error</h2>
        <p>${message}</p>
        <button onclick="window.location.reload()" style="margin-top: 20px; padding: 12px 24px; background: #0066cc; color: white; border: none; border-radius: 4px; cursor: pointer;">
          Reintentar
        </button>
      </div>
    `
    container.classList.add("active")
  }

  renderFavorites() {
    if (this.favoriteProducts.length === 0) {
      this.showEmpty()
      return
    }

    this.showFavorites()
    this.updateSubtitle()

    // Sort products
    this.sortProducts()

    // Filter by search
    let filteredProducts = this.favoriteProducts
    if (this.searchQuery) {
      filteredProducts = this.favoriteProducts.filter((product) => {
        const searchableText = [
          product.nombre || "",
          product.marca || "",
          product.descripcion || "",
          this.getCategoryName(product.id_categoria) || "",
        ]
          .join(" ")
          .toLowerCase()

        return searchableText.includes(this.searchQuery.toLowerCase())
      })
    }

    const grid = document.getElementById("favorites-grid")
    grid.innerHTML = ""
    grid.className = `favorites-grid ${this.currentView === "list" ? "list-view" : ""}`

    if (filteredProducts.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #666;">
          <p>No se encontraron favoritos que coincidan con "${this.searchQuery}"</p>
          <button onclick="favoritesApp.clearSearch()" style="margin-top: 16px; padding: 8px 16px; background: #0066cc; color: white; border: none; border-radius: 4px; cursor: pointer;">
            Limpiar búsqueda
          </button>
        </div>
      `
      return
    }

    filteredProducts.forEach((product) => {
      const card = this.createFavoriteCard(product)
      grid.appendChild(card)
    })
  }

  // Actualizar createFavoriteCard para usar IDs consistentes
  createFavoriteCard(product) {
    const productId = this.getConsistentProductId(product)
    const card = document.createElement("div")
    card.className = `favorite-card ${this.currentView === "list" ? "list-view" : ""}`

    card.innerHTML = `
      <div class="favorite-image-container" onclick="favoritesApp.openProductDetail('${productId}')">
        <img src="${product.imagen_principal || "https://via.placeholder.com/300x300/f8f9fa/333?text=No+Image"}" 
             alt="${product.nombre || "Producto"}" 
             class="favorite-image"
             onerror="this.src='https://via.placeholder.com/300x300/f8f9fa/333?text=No+Image'">
      <button class="remove-favorite-btn" onclick="event.stopPropagation(); favoritesApp.removeFavorite('${productId}')" title="Quitar de favoritos">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
        </svg>
      </button>
    </div>
    <div class="favorite-info" onclick="favoritesApp.openProductDetail('${productId}')">
      <div class="favorite-brand">${(product.marca || "CASIO").toUpperCase()}</div>
      <div class="favorite-name">${product.nombre || "Producto sin nombre"}</div>
      <div class="favorite-price">${this.formatPrice(product.precio)}</div>
      <div class="favorite-actions">
        <button class="action-btn primary" onclick="event.stopPropagation(); favoritesApp.addToCart('${productId}')">
          <span class="material-symbols-outlined">shopping_cart</span>
          Agregar
        </button>
        <button class="action-btn secondary" onclick="event.stopPropagation(); favoritesApp.openProductDetail('${productId}')">
          <span class="material-symbols-outlined">visibility</span>
          Ver
        </button>
      </div>
    </div>
  `

    return card
  }

  sortProducts() {
    switch (this.currentSort) {
      case "name":
        this.favoriteProducts.sort((a, b) => (a.nombre || "").localeCompare(b.nombre || ""))
        break
      case "brand":
        this.favoriteProducts.sort((a, b) => (a.marca || "").localeCompare(b.marca || ""))
        break
      case "price-low":
        this.favoriteProducts.sort((a, b) => (a.precio || 0) - (b.precio || 0))
        break
      case "price-high":
        this.favoriteProducts.sort((a, b) => (b.precio || 0) - (a.precio || 0))
        break
      case "recent":
      default:
        // Keep original order (most recently added first)
        this.favoriteProducts.reverse()
        break
    }
  }

  // Actualizar loadRecommendations para usar IDs consistentes
  loadRecommendations() {
    if (this.allProducts.length === 0) return

    // Get random products that are not in favorites
    const nonFavorites = this.allProducts.filter((product) => {
      const productId = this.getConsistentProductId(product)
      return !this.favorites.includes(String(productId))
    })

    const recommendations = nonFavorites.sort(() => 0.5 - Math.random()).slice(0, 4)

    const grid = document.getElementById("recommendations-grid")
    grid.innerHTML = ""

    recommendations.forEach((product) => {
      const productId = this.getConsistentProductId(product)
      const card = document.createElement("div")
      card.className = "recommendation-card"
      card.onclick = () => this.openProductDetail(productId)

      card.innerHTML = `
        <img src="${product.imagen_principal || "https://via.placeholder.com/200x200/f8f9fa/333?text=No+Image"}" 
             alt="${product.nombre || "Producto"}" 
             class="recommendation-image"
             onerror="this.src='https://via.placeholder.com/200x200/f8f9fa/333?text=No+Image'">
        <div class="recommendation-name">${product.nombre || "Producto"}</div>
        <div class="recommendation-price">${this.formatPrice(product.precio)}</div>
      `

      grid.appendChild(card)
    })
  }

  // Actualizar removeFavorite para usar IDs consistentes
  removeFavorite(productId) {
    this.showConfirmModal(`¿Estás seguro de que quieres quitar este producto de tus favoritos?`, () => {
      // Recargar favoritos desde localStorage antes de modificar
      this.loadFavoritesFromStorage()

      this.favorites = this.favorites.filter((id) => id !== String(productId))
      localStorage.setItem("favorites", JSON.stringify(this.favorites))

      // Remove from favoriteProducts array usando ID consistente
      this.favoriteProducts = this.favoriteProducts.filter((product) => {
        const id = this.getConsistentProductId(product)
        return String(id) !== String(productId)
      })

      this.updateFavoritesCount()
      this.renderFavorites()
      this.loadRecommendations()
      this.showNotification("Producto eliminado de favoritos", "success")
    })
  }

  clearAllFavorites() {
    if (this.favorites.length === 0) return

    this.showConfirmModal(
      `¿Estás seguro de que quieres eliminar todos los favoritos? Esta acción no se puede deshacer.`,
      () => {
        this.favorites = []
        this.favoriteProducts = []
        localStorage.setItem("favorites", JSON.stringify(this.favorites))

        this.updateFavoritesCount()
        this.renderFavorites()
        this.showNotification("Todos los favoritos han sido eliminados", "success")
      },
    )
  }

  // Actualizar addToCart para usar IDs consistentes
  addToCart(productId) {
    const product = this.favoriteProducts.find((p) => {
      const id = this.getConsistentProductId(p)
      return String(id) === String(productId)
    })

    if (!product) return

    const cartItems = JSON.parse(localStorage.getItem("cart") || "[]")
    const existingItem = cartItems.find((item) => item.id === productId)

    if (existingItem) {
      existingItem.quantity += 1
    } else {
      cartItems.push({
        id: productId,
        name: product.nombre,
        price: product.precio,
        image: product.imagen_principal,
        quantity: 1,
      })
    }

    localStorage.setItem("cart", JSON.stringify(cartItems))
    this.updateCartCount() // Agregar esta línea
    this.showNotification("Producto agregado al carrito", "success")
  }

  // Actualizar openProductDetail para usar IDs consistentes
  openProductDetail(productId) {
    const product = this.allProducts.find((p) => this.getConsistentProductId(p) === String(productId))

    if (!product) {
      console.error("Producto no encontrado:", productId)
      return
    }

    localStorage.setItem("selectedProduct", JSON.stringify(product))
    window.location.href = "producto-detalle.html"
  }

  handleSearch(event) {
    event.preventDefault()
    const searchInput = document.getElementById("search-input")
    this.searchQuery = searchInput.value.trim()
    this.renderFavorites()
  }

  clearSearch() {
    this.searchQuery = ""
    document.getElementById("search-input").value = ""
    this.renderFavorites()
  }

  changeView(view) {
    this.currentView = view
    document.querySelectorAll(".view-btn").forEach((btn) => {
      btn.classList.toggle("active", btn.getAttribute("data-view") === view)
    })
    this.renderFavorites()
  }

  changeSort(sort) {
    this.currentSort = sort
    this.renderFavorites()
  }

  updateFavoritesCount() {
    const countElement = document.getElementById("favorites-count")
    if (countElement) {
      countElement.textContent = this.favorites.length
    }
  }

  updateSubtitle() {
    const subtitle = document.getElementById("favorites-subtitle")
    if (subtitle) {
      const count = this.favoriteProducts.length
      subtitle.textContent = count === 1 ? "1 reloj guardado" : `${count} relojes guardados`
    }
  }

  showConfirmModal(message, onConfirm) {
    const modal = document.getElementById("modal-overlay")
    const messageEl = document.getElementById("modal-message")
    const confirmBtn = document.getElementById("confirm-btn")

    messageEl.textContent = message
    modal.classList.add("active")

    // Remove previous event listeners
    const newConfirmBtn = confirmBtn.cloneNode(true)
    confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn)

    newConfirmBtn.addEventListener("click", () => {
      onConfirm()
      this.closeModal()
    })
  }

  closeModal() {
    document.getElementById("modal-overlay").classList.remove("active")
  }

  setupEventListeners() {
    // Search
    const searchForm = document.getElementById("search-form")
    if (searchForm) {
      searchForm.addEventListener("submit", (e) => this.handleSearch(e))
    }

    const searchInput = document.getElementById("search-input")
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        this.searchQuery = e.target.value.trim()
        this.renderFavorites()
      })
    }

    // Clear all button
    const clearAllBtn = document.getElementById("clear-all-btn")
    if (clearAllBtn) {
      clearAllBtn.addEventListener("click", () => this.clearAllFavorites())
    }

    // Sort select
    const sortSelect = document.getElementById("sort-select")
    if (sortSelect) {
      sortSelect.addEventListener("change", (e) => this.changeSort(e.target.value))
    }

    // View toggle
    const viewBtns = document.querySelectorAll(".view-btn")
    viewBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const view = btn.getAttribute("data-view")
        this.changeView(view)
      })
    })

    // Modal close on background click
    const modalOverlay = document.getElementById("modal-overlay")
    if (modalOverlay) {
      modalOverlay.addEventListener("click", (e) => {
        if (e.target === modalOverlay) {
          this.closeModal()
        }
      })
    }

    // Escape key to close modal
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        this.closeModal()
      }
    })
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

  formatPrice(price) {
    if (!price) return "$0.00"
    return `$${Number.parseFloat(price).toFixed(2)}`
  }

  showNotification(message, type = "info") {
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

    setTimeout(() => {
      notification.style.transform = "translateX(0)"
    }, 100)

    setTimeout(() => {
      notification.style.transform = "translateX(100%)"
      setTimeout(() => {
        document.body.removeChild(notification)
      }, 300)
    }, 3000)
  }

  updateCartCount() {
    const cartItems = JSON.parse(localStorage.getItem("cart") || "[]")
    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0)
    const countElement = document.getElementById("cart-count")
    if (countElement) {
      countElement.textContent = totalItems
    }
  }
}

// Global functions for HTML onclick events
function closeModal() {
  if (window.favoritesApp) {
    window.favoritesApp.closeModal()
  }
}

// Initialize app when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  window.favoritesApp = new FavoritesApp()
})
