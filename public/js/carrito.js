class CartApp {
  constructor() {
    this.cartItems = []
    this.allProducts = []
    this.subtotal = 0
    this.shipping = 0
    this.taxes = 0
    this.discount = 0
    this.total = 0
    this.promoCode = null

    this.init()
  }

  async init() {
    console.log("Inicializando página del carrito...")
    this.showLoading()
    await this.loadProducts()
    this.loadCartFromStorage()
    this.setupEventListeners()
    this.updateCartCount()
    this.updateFavoritesCount()
    
    // Delay to show loading animation
    setTimeout(() => {
      this.renderCart()
      this.loadRecommendations()
    }, 800)
  }

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

      console.log(`Productos cargados: ${this.allProducts.length}`)
    } catch (error) {
      console.error("Error al cargar productos:", error)
      this.showError("No se pudieron cargar los productos")
    }
  }

  loadCartFromStorage() {
    try {
      const storedCart = localStorage.getItem("cart")
      this.cartItems = storedCart ? JSON.parse(storedCart) : []
      console.log("Carrito cargado desde localStorage:", this.cartItems)
    } catch (error) {
      console.error("Error al cargar carrito:", error)
      this.cartItems = []
    }
  }

  saveCartToStorage() {
    localStorage.setItem("cart", JSON.stringify(this.cartItems))
    console.log("Carrito guardado en localStorage:", this.cartItems)
    
    // Dispatch custom event for other pages to listen
    window.dispatchEvent(new CustomEvent('cartUpdated', { 
      detail: { cartItems: this.cartItems } 
    }))
  }

  showLoading() {
    document.getElementById("loading-container").style.display = "flex"
    document.getElementById("empty-state").style.display = "none"
    document.getElementById("cart-container").classList.remove("active")
    document.getElementById("recommendations-section").style.display = "none"
  }

  hideLoading() {
    document.getElementById("loading-container").style.display = "none"
  }

  showEmpty() {
    this.hideLoading()
    document.getElementById("empty-state").style.display = "flex"
    document.getElementById("cart-container").classList.remove("active")
    document.getElementById("recommendations-section").style.display = "none"
  }

  showCart() {
    this.hideLoading()
    document.getElementById("empty-state").style.display = "none"
    document.getElementById("cart-container").classList.add("active")
    document.getElementById("recommendations-section").style.display = "block"
  }

  showError(message) {
    this.hideLoading()
    const container = document.getElementById("cart-container")
    container.innerHTML = `
      <div style="text-align: center; padding: 80px 20px; color: #666; background: white; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
        <div style="font-size: 48px; margin-bottom: 20px; opacity: 0.3;">⚠️</div>
        <h2 style="font-size: 24px; margin-bottom: 16px; color: #333;">Error</h2>
        <p style="font-size: 16px; margin-bottom: 32px;">${message}</p>
        <button onclick="window.location.reload()" style="padding: 16px 32px; background: linear-gradient(135deg, #0066cc, #004499); color: white; border: none; border-radius: 10px; cursor: pointer; font-size: 16px; font-weight: 600;">
          🔄 Reintentar
        </button>
      </div>
    `
    container.classList.add("active")
  }

  renderCart() {
    if (this.cartItems.length === 0) {
      this.showEmpty()
      return
    }

    this.showCart()
    this.updateCartSubtitle()
    this.renderCartItems()
    this.calculateTotals()
    this.updateSummary()
  }

  updateCartSubtitle() {
    const subtitle = document.getElementById("cart-subtitle")
    if (subtitle) {
      const totalItems = this.cartItems.reduce((sum, item) => sum + item.quantity, 0)
      subtitle.textContent = totalItems === 1 ? "1 producto seleccionado" : `${totalItems} productos seleccionados`
    }
  }

  renderCartItems() {
    const cartItemsContainer = document.getElementById("cart-items")
    const itemsCount = document.getElementById("items-count")

    if (!cartItemsContainer) return

    cartItemsContainer.innerHTML = ""

    // Update items count
    const totalItems = this.cartItems.reduce((sum, item) => sum + item.quantity, 0)
    if (itemsCount) {
      itemsCount.textContent = totalItems === 1 ? "1 producto" : `${totalItems} productos`
    }

    this.cartItems.forEach((item, index) => {
      const cartItem = this.createCartItemElement(item, index)
      cartItemsContainer.appendChild(cartItem)
    })
  }

  createCartItemElement(item, index) {
    const cartItem = document.createElement("div")
    cartItem.className = "cart-item"

    cartItem.innerHTML = `
      <div class="cart-item-image" onclick="cartApp.openProductDetail('${item.id}')">
        <img src="${item.image || "/placeholder.svg?height=100&width=100&text=CASIO"}" 
             alt="${item.name || "Producto"}" 
             onerror="this.src='/placeholder.svg?height=100&width=100&text=CASIO'">
      </div>
      <div class="cart-item-info" onclick="cartApp.openProductDetail('${item.id}')">
        <div class="cart-item-brand">CASIO</div>
        <div class="cart-item-name">${item.name || "Producto sin nombre"}</div>
        <div class="cart-item-price">${this.formatPrice(item.price)}</div>
      </div>
      <div class="cart-item-controls">
        <div class="quantity-controls">
          <button class="quantity-btn" onclick="cartApp.updateQuantity(${index}, ${item.quantity - 1})" ${item.quantity <= 1 ? "disabled" : ""}>
            <span class="material-symbols-outlined">remove</span>
          </button>
          <input type="number" class="quantity-input" value="${item.quantity}" min="1" max="10" onchange="cartApp.updateQuantity(${index}, parseInt(this.value) || 1)">
          <button class="quantity-btn" onclick="cartApp.updateQuantity(${index}, ${item.quantity + 1})" ${item.quantity >= 10 ? "disabled" : ""}>
            <span class="material-symbols-outlined">add</span>
          </button>
        </div>
        <button class="remove-item-btn" onclick="cartApp.removeItem(${index})" title="Eliminar producto">
          <span class="material-symbols-outlined">delete</span>
        </button>
      </div>
    `

    return cartItem
  }

  updateQuantity(index, newQuantity) {
    if (index < 0 || index >= this.cartItems.length) return

    newQuantity = Math.max(1, Math.min(10, parseInt(newQuantity) || 1))

    if (newQuantity !== this.cartItems[index].quantity) {
      this.cartItems[index].quantity = newQuantity
      this.saveCartToStorage()
      this.updateCartCount()
      this.renderCart()
      this.showNotification("✅ Cantidad actualizada", "success")
    }
  }

  removeItem(index) {
    if (index < 0 || index >= this.cartItems.length) return

    const item = this.cartItems[index]
    this.showConfirmModal(
      `¿Estás seguro de que quieres eliminar "${item.name}" del carrito?`, 
      () => {
        this.cartItems.splice(index, 1)
        this.saveCartToStorage()
        this.updateCartCount()
        this.renderCart()
        this.showNotification("🗑️ Producto eliminado del carrito", "success")
      }
    )
  }

  clearCart() {
    if (this.cartItems.length === 0) {
      this.showNotification("⚠️ El carrito ya está vacío", "info")
      return
    }

    this.showConfirmModal(
      `¿Estás seguro de que quieres vaciar el carrito? Esta acción eliminará todos los ${this.cartItems.length} productos.`,
      () => {
        this.cartItems = []
        this.saveCartToStorage()
        this.updateCartCount()
        this.renderCart()
        this.showNotification("🧹 Carrito vaciado completamente", "success")
      },
    )
  }

  calculateTotals() {
    this.subtotal = this.cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)

    // Calculate shipping (free over $50)
    this.shipping = this.subtotal >= 50 ? 0 : 9.99

    // Calculate taxes (18%)
    this.taxes = this.subtotal * 0.18

    // Apply discount if promo code is active
    let discountAmount = 0
    if (this.promoCode) {
      discountAmount = this.subtotal * (this.promoCode.discount / 100)
    }
    this.discount = discountAmount

    // Calculate total
    this.total = Math.max(0, this.subtotal + this.shipping + this.taxes - this.discount)
  }

  updateSummary() {
    const elements = {
      subtotal: this.formatPrice(this.subtotal),
      shipping: this.shipping === 0 ? "GRATIS" : this.formatPrice(this.shipping),
      taxes: this.formatPrice(this.taxes),
      discount: this.formatPrice(this.discount),
      total: this.formatPrice(this.total),
    }

    Object.entries(elements).forEach(([id, value]) => {
      const element = document.getElementById(id)
      if (element) element.textContent = value
    })

    // Show/hide discount line
    const discountLine = document.getElementById("discount-line")
    if (discountLine) {
      discountLine.classList.toggle("active", this.discount > 0)
    }
  }

  applyPromoCode() {
    const promoInput = document.getElementById("promo-code")
    const promoMessage = document.getElementById("promo-message")

    if (!promoInput || !promoMessage) return

    const code = promoInput.value.trim().toUpperCase()

    if (!code) {
      this.showPromoMessage("⚠️ Por favor ingresa un código de descuento", "error")
      return
    }

    // Simulate promo codes
    const promoCodes = {
      WELCOME10: { discount: 10, description: "10% de descuento de bienvenida" },
      SAVE20: { discount: 20, description: "20% de descuento especial" },
      CASIO15: { discount: 15, description: "15% de descuento en relojes CASIO" },
      STUDENT: { discount: 25, description: "25% de descuento estudiantil" },
      FIRST: { discount: 30, description: "30% de descuento primera compra" }
    }

    if (promoCodes[code]) {
      this.promoCode = promoCodes[code]
      this.calculateTotals()
      this.updateSummary()
      this.showPromoMessage(`🎉 ¡Código aplicado! ${this.promoCode.description}`, "success")
      promoInput.disabled = true

      // Change button to remove promo
      const applyBtn = document.getElementById("apply-promo")
      if (applyBtn) {
        applyBtn.textContent = "Quitar"
        applyBtn.onclick = () => this.removePromoCode()
      }
    } else {
      this.showPromoMessage("❌ Código de descuento inválido", "error")
    }
  }

  removePromoCode() {
    this.promoCode = null
    this.calculateTotals()
    this.updateSummary()

    const promoInput = document.getElementById("promo-code")
    const applyBtn = document.getElementById("apply-promo")

    if (promoInput) {
      promoInput.value = ""
      promoInput.disabled = false
    }

    if (applyBtn) {
      applyBtn.textContent = "Aplicar"
      applyBtn.onclick = () => this.applyPromoCode()
    }

    this.showPromoMessage("🗑️ Código de descuento removido", "success")
  }

  showPromoMessage(message, type) {
    const promoMessage = document.getElementById("promo-message")
    if (promoMessage) {
      promoMessage.textContent = message
      promoMessage.className = `promo-message ${type}`

      // Clear message after 4 seconds
      setTimeout(() => {
        promoMessage.textContent = ""
        promoMessage.className = "promo-message"
      }, 4000)
    }
  }

  openProductDetail(productId) {
    // Find product in allProducts array
    const product = this.allProducts.find((p) => this.getConsistentProductId(p) === String(productId))

    if (!product) {
      console.error("Producto no encontrado:", productId)
      this.showNotification("❌ Producto no encontrado", "error")
      return
    }

    localStorage.setItem("selectedProduct", JSON.stringify(product))
    window.location.href = "producto-detalle.html"
  }

  getConsistentProductId(producto) {
    if (producto.id) {
      return String(producto.id)
    }

    const uniqueString = `${producto.nombre || "unnamed"}_${producto.marca || "nobrand"}_${producto.codigo || "nocode"}_${producto.precio || "0"}`

    let hash = 0
    for (let i = 0; i < uniqueString.length; i++) {
      const char = uniqueString.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash
    }

    return `product_${Math.abs(hash)}`
  }

  loadRecommendations() {
    if (this.allProducts.length === 0) return

    // Get random products excluding items already in cart
    const cartProductIds = this.cartItems.map(item => item.id)
    const availableProducts = this.allProducts.filter(product => 
      !cartProductIds.includes(this.getConsistentProductId(product))
    )
    
    const recommendations = availableProducts
      .sort(() => 0.5 - Math.random())
      .slice(0, 4)

    const grid = document.getElementById("recommendations-grid")
    if (!grid) return

    grid.innerHTML = ""

    recommendations.forEach((product) => {
      const productId = this.getConsistentProductId(product)
      const card = document.createElement("div")
      card.className = "recommendation-card"
      card.onclick = () => this.openProductDetail(productId)

      card.innerHTML = `
        <img src="${product.imagen_principal || "/placeholder.svg?height=200&width=200&text=CASIO"}" 
             alt="${product.nombre || "Producto"}" 
             class="recommendation-image"
             onerror="this.src='/placeholder.svg?height=200&width=200&text=CASIO'">
        <div class="recommendation-name">${product.nombre || "Producto"}</div>
        <div class="recommendation-price">${this.formatPrice(product.precio)}</div>
      `

      grid.appendChild(card)
    })
  }

  openCheckout() {
    if (this.cartItems.length === 0) {
      this.showNotification("🛒 Tu carrito está vacío", "error")
      return
    }

    const modal = document.getElementById("checkout-modal")
    if (modal) {
      modal.classList.add("active")
      document.body.style.overflow = "hidden"
      
      // Focus on first input
      setTimeout(() => {
        const firstInput = modal.querySelector('input')
        if (firstInput) firstInput.focus()
      }, 300)
    }
  }

  closeCheckoutModal() {
    const modal = document.getElementById("checkout-modal")
    if (modal) {
      modal.classList.remove("active")
      document.body.style.overflow = "auto"
    }
  }

  completeOrder() {
    // Validate form
    const requiredFields = [
      "checkout-email",
      "checkout-firstname", 
      "checkout-lastname",
      "checkout-address",
      "checkout-city",
      "checkout-zip",
      "checkout-card",
      "checkout-expiry",
      "checkout-cvv",
    ]

    let isValid = true
    const invalidFields = []
    
    requiredFields.forEach((fieldId) => {
      const field = document.getElementById(fieldId)
      if (field && !field.value.trim()) {
        field.style.borderColor = "#dc3545"
        field.style.backgroundColor = "#fff5f5"
        invalidFields.push(field.placeholder || fieldId)
        isValid = false
      } else if (field) {
        field.style.borderColor = "#28a745"
        field.style.backgroundColor = "#f8fff8"
      }
    })

    if (!isValid) {
      this.showNotification(`❌ Completa los campos: ${invalidFields.join(", ")}`, "error")
      return
    }

    // Show processing state
    const completeBtn = document.getElementById("complete-order")
    const originalText = completeBtn.innerHTML
    completeBtn.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px;">
        <div style="width: 16px; height: 16px; border: 2px solid #ffffff40; border-top: 2px solid #ffffff; border-radius: 50%; animation: spin 1s linear infinite;"></div>
        Procesando...
      </div>
    `
    completeBtn.disabled = true

    // Simulate order processing
    setTimeout(() => {
      // Generate order number
      const orderNumber = `CASIO-${Date.now().toString().slice(-6)}`
      
      // Clear cart
      this.cartItems = []
      this.saveCartToStorage()
      this.updateCartCount()

      // Close modal
      this.closeCheckoutModal()

      // Show success message
      this.showNotification(`🎉 ¡Pedido #${orderNumber} completado! Recibirás confirmación por email.`, "success")

      // Reset button
      completeBtn.innerHTML = originalText
      completeBtn.disabled = false

      // Redirect to catalog after delay
      setTimeout(() => {
        window.location.href = "catalogo.html"
      }, 3000)
    }, 2500)
  }

  showConfirmModal(message, onConfirm) {
    const modal = document.getElementById("modal-overlay")
    const messageEl = document.getElementById("modal-message")
    const confirmBtn = document.getElementById("confirm-btn")

    if (!modal || !messageEl || !confirmBtn) return

    messageEl.textContent = message
    modal.classList.add("active")
    document.body.style.overflow = "hidden"

    // Remove previous event listeners
    const newConfirmBtn = confirmBtn.cloneNode(true)
    confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn)

    newConfirmBtn.addEventListener("click", () => {
      onConfirm()
      this.closeModal()
    })
  }

  closeModal() {
    const modal = document.getElementById("modal-overlay")
    if (modal) {
      modal.classList.remove("active")
      document.body.style.overflow = "auto"
    }
  }

  setupEventListeners() {
    // Clear cart button
    const clearCartBtn = document.getElementById("clear-cart-btn")
    if (clearCartBtn) {
      clearCartBtn.addEventListener("click", () => this.clearCart())
    }

    // Promo code
    const applyPromoBtn = document.getElementById("apply-promo")
    if (applyPromoBtn) {
      applyPromoBtn.addEventListener("click", () => this.applyPromoCode())
    }

    const promoInput = document.getElementById("promo-code")
    if (promoInput) {
      promoInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
          e.preventDefault()
          this.applyPromoCode()
        }
      })
    }

    // Checkout button
    const checkoutBtn = document.getElementById("checkout-btn")
    if (checkoutBtn) {
      checkoutBtn.addEventListener("click", () => this.openCheckout())
    }

    // Complete order button
    const completeOrderBtn = document.getElementById("complete-order")
    if (completeOrderBtn) {
      completeOrderBtn.addEventListener("click", () => this.completeOrder())
    }

    // Modal close on background click
    const modalOverlay = document.getElementById("modal-overlay")
    if (modalOverlay) {
      modalOverlay.addEventListener("click", (e) => {
        if (e.target === modalOverlay) {
          this.closeModal()
        }
      })
    }

    const checkoutModal = document.getElementById("checkout-modal")
    if (checkoutModal) {
      checkoutModal.addEventListener("click", (e) => {
        if (e.target === checkoutModal) {
          this.closeCheckoutModal()
        }
      })
    }

    // Escape key to close modals
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        this.closeModal()
        this.closeCheckoutModal()
      }
    })

    // Form validation on input
    const inputs = document.querySelectorAll('#checkout-modal input')
    inputs.forEach(input => {
      input.addEventListener('input', () => {
        if (input.value.trim()) {
          input.style.borderColor = "#e0e0e0"
          input.style.backgroundColor = "#f8f9fa"
        }
      })
    })
  }

  updateCartCount() {
    const cartItems = JSON.parse(localStorage.getItem("cart") || "[]")
    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0)
    const countElement = document.getElementById("cart-count")
    if (countElement) {
      countElement.textContent = totalItems
    }
  }

  updateFavoritesCount() {
    const favorites = JSON.parse(localStorage.getItem("favorites") || "[]")
    const countElement = document.getElementById("favorites-count")
    if (countElement) {
      countElement.textContent = favorites.length
    }
  }

  formatPrice(price) {
    if (!price || isNaN(price)) return "$0.00"
    return `$${Number.parseFloat(price).toFixed(2)}`
  }

  showNotification(message, type = "info") {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification')
    existingNotifications.forEach(n => n.remove())

    const notification = document.createElement("div")
    notification.className = "notification"
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === "success" ? "linear-gradient(135deg, #28a745, #20c997)" : 
                   type === "error" ? "linear-gradient(135deg, #dc3545, #c82333)" : 
                   "linear-gradient(135deg, #0066cc, #004499)"};
      color: white;
      padding: 16px 24px;
      border-radius: 12px;
      z-index: 1001;
      font-weight: 600;
      box-shadow: 0 8px 25px rgba(0,0,0,0.2);
      transform: translateX(100%);
      transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
      max-width: 350px;
      font-size: 14px;
    `
    notification.textContent = message

    document.body.appendChild(notification)

    setTimeout(() => {
      notification.style.transform = "translateX(0)"
    }, 100)

    setTimeout(() => {
      notification.style.transform = "translateX(100%)"
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification)
        }
      }, 400)
    }, 4000)
  }
}

// Global functions for HTML onclick events
function closeModal() {
  if (window.cartApp) {
    window.cartApp.closeModal()
  }
}

function closeCheckoutModal() {
  if (window.cartApp) {
    window.cartApp.closeCheckoutModal()
  }
}

// Initialize app when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  window.cartApp = new CartApp()
})
