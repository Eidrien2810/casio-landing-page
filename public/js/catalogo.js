const categorias = {
  1: "G-SHOCK",
  2: "CASIO",
  3: "ELEGANT",
  4: "EDIFICE",
  5: "BABY-G",
}

const materiales = {
  1: "Acero Inoxidable",
  2: "Cuero",
  3: "Titanio",
  4: "Plástico",
}

// Color mapping from Spanish (JSON) to English (color picker)
const colorMapping = {
  negro: "black",
  azul: "blue",
  verde: "green",
  rojo: "red",
  marrón: "brown",
  marron: "brown",
  beige: "beige",
  púrpura: "purple",
  purpura: "purple",
  morado: "purple",
  blanco: "white",
  gris: "gray",
  amarillo: "yellow",
  naranja: "orange",
  rosa: "pink",
  rosado: "pink",
  esqueleto: "skeleton",
  transparente: "skeleton",
  plata: "silver",
  plateado: "silver",
  oro: "gold",
  dorado: "gold",
}

// Application state
let productos = []
let productosFiltrados = []
let favorites = []
let selectedColor = null
let isSearching = false

const filtros = {
  marca: "",
  categoria: "",
  material: "",
  precioMin: "",
  precioMax: "",
  bezelColor: "",
  brandSeries: [],
  search: "",
}

// DOM elements
const productosContainer = document.getElementById("product-grid")
const filtroMarca = document.getElementById("filtro-marca")
const filtroCategoria = document.getElementById("filtro-categoria")
const filtroMaterial = document.getElementById("filtro-material")
const filtroPrecioMin = document.getElementById("filtro-precio-min")
const filtroPrecioMax = document.getElementById("filtro-precio-max")

// Main application class
class CatalogoApp {
  constructor() {
    this.init()
  }

  async init() {
    console.log("Inicializando catálogo...")
    await this.loadProductos()
    this.setupEventListeners()
  }

  async loadProductos() {
    try {
      const response = await fetch("../public/assets/json/relojes_listos_para_sql.json")
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      productos = await response.json()

      if (!Array.isArray(productos) || productos.length === 0) {
        throw new Error("No se encontraron productos en el archivo JSON")
      }

      productosFiltrados = [...productos]
      this.renderFiltros()
      this.renderProductos(productosFiltrados)
      console.log(`Productos cargados exitosamente: ${productos.length}`)
    } catch (error) {
      console.error("Error al cargar productos:", error)
      if (productosContainer) {
        productosContainer.innerHTML = `
          <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #666;">
            <h3>Error al cargar los productos</h3>
            <p>No se pudo cargar el archivo JSON.</p>
            <p><strong>Ruta esperada:</strong> public/assets/json/relojes_listos_para_sql.json</p>
            <p><strong>Error:</strong> ${error.message}</p>
          </div>
        `
      }
    }
  }

  renderFiltros() {
    if (!productos || productos.length === 0) return

    console.log("Renderizando filtros...")

    // Populate brand filter (marca)
    const marcas = [...new Set(productos.map((p) => p.marca))].filter(Boolean).sort()
    this.populateSelect(filtroMarca, marcas)

    // Populate category filter (id_categoria)
    const categoriasUnicas = [...new Set(productos.map((p) => p.id_categoria))].filter(Boolean).sort()
    this.populateSelectWithMapping(filtroCategoria, categoriasUnicas, categorias)

    // Populate material filter (id_material)
    const materialesUnicos = [...new Set(productos.map((p) => p.id_material))].filter(Boolean).sort()
    this.populateSelectWithMapping(filtroMaterial, materialesUnicos, materiales)

    // Populate brand series checkboxes
    this.renderBrandSeries()

    // Log available colors for debugging
    const colores = [...new Set(productos.map((p) => p.color))].filter(Boolean)
    console.log("Colores encontrados en JSON:", colores)
  }

  populateSelect(selectElement, options) {
    if (!selectElement || !options) return

    // Clear existing options except the first one
    while (selectElement.children.length > 1) {
      selectElement.removeChild(selectElement.lastChild)
    }

    options.forEach((optionValue) => {
      const option = document.createElement("option")
      option.value = optionValue
      option.textContent = optionValue
      selectElement.appendChild(option)
    })
  }

  populateSelectWithMapping(selectElement, options, mapping) {
    if (!selectElement || !options) return

    // Clear existing options except the first one
    while (selectElement.children.length > 1) {
      selectElement.removeChild(selectElement.lastChild)
    }

    options.forEach((optionValue) => {
      const option = document.createElement("option")
      option.value = optionValue
      option.textContent = mapping[optionValue] || `ID ${optionValue}`
      selectElement.appendChild(option)
    })
  }

  renderBrandSeries() {
    const brandSeriesContent = document.getElementById("brand-series-content")
    if (!brandSeriesContent) return

    // Get unique categories from JSON data
    const categoriasUnicas = [...new Set(productos.map((p) => p.id_categoria))].filter(Boolean).sort()

    brandSeriesContent.innerHTML = ""

    categoriasUnicas.forEach((catId) => {
      const brandOption = document.createElement("div")
      brandOption.className = "brand-option"

      const checkbox = document.createElement("input")
      checkbox.type = "checkbox"
      checkbox.id = `brand-${catId}`
      checkbox.value = catId
      checkbox.addEventListener("change", () => this.handleBrandSeriesChange())

      const label = document.createElement("label")
      label.htmlFor = `brand-${catId}`
      label.textContent = categorias[catId] || `Category ${catId}`

      // Highlight EDIFICE if it exists
      if (catId === 4) {
        brandOption.classList.add("highlighted")
        checkbox.checked = true
      }

      brandOption.appendChild(checkbox)
      brandOption.appendChild(label)
      brandSeriesContent.appendChild(brandOption)
    })

    // Initialize brand series filter
    this.handleBrandSeriesChange()
  }

  renderProductos(productos) {
    if (!productosContainer) return

    productosContainer.innerHTML = ""

    if (!productos || productos.length === 0) {
      productosContainer.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #666;">
          <p>No se encontraron productos con los filtros seleccionados.</p>
        </div>
      `
      return
    }

    productos.forEach((producto) => {
      const card = document.createElement("div")
      card.className = "product-card"

      // Extract brand from name if needed
      const displayBrand = producto.marca || "CASIO"
      const displayName = producto.nombre || "Sin nombre"

      card.innerHTML = `
        <div class="product-image-container">
          <img src="${producto.imagen_principal || "https://via.placeholder.com/300x300/f8f9fa/333?text=No+Image"}" 
               alt="${displayName}" 
               class="product-image"
               onerror="this.src='https://via.placeholder.com/300x300/f8f9fa/333?text=No+Image'">
          <button class="favorite-btn" onclick="catalogoApp.toggleFavorite('${producto.id || Math.random()}')">
            <svg class="favorite-icon" viewBox="0 0 24 24">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
          </button>
          ${Math.random() > 0.6 ? '<div class="new-badge">NEW</div>' : ""}
        </div>
        <div class="product-info">
          <div class="product-brand">${displayBrand.toUpperCase()}</div>
          <div class="product-model">${displayName}</div>
        </div>
      `
      productosContainer.appendChild(card)
    })

    console.log(`Productos renderizados: ${productos.length}`)
  }

  filtrarProductos() {
    if (!productos || productos.length === 0) return

    productosFiltrados = productos.filter((p) => {
      // Brand filter
      const marcaOk = !filtros.marca || p.marca === filtros.marca

      // Category filter
      const catOk = !filtros.categoria || String(p.id_categoria) === String(filtros.categoria)

      // Material filter
      const matOk = !filtros.material || String(p.id_material) === String(filtros.material)

      // Price filters
      const precioMinOk = !filtros.precioMin || (p.precio && p.precio >= Number(filtros.precioMin))
      const precioMaxOk = !filtros.precioMax || (p.precio && p.precio <= Number(filtros.precioMax))

      // Bezel color filter - map Spanish colors to English
      const colorOk = !filtros.bezelColor || (p.color && colorMapping[p.color.toLowerCase()] === filtros.bezelColor)

      // Brand series filter
      const brandSeriesOk = filtros.brandSeries.length === 0 || filtros.brandSeries.includes(String(p.id_categoria))

      // Search filter
      const searchOk =
        !filtros.search ||
        (() => {
          const searchableText = [
            p.nombre || "",
            p.marca || "",
            p.descripcion || "",
            categorias[p.id_categoria] || "",
            materiales[p.id_material] || "",
          ]
            .join(" ")
            .toLowerCase()

          return searchableText.includes(filtros.search.toLowerCase())
        })()

      return marcaOk && catOk && matOk && precioMinOk && precioMaxOk && colorOk && brandSeriesOk && searchOk
    })

    this.renderProductos(productosFiltrados)
    console.log(`Productos filtrados: ${productosFiltrados.length} de ${productos.length}`)

    // Update content header to show search results
    const contentHeader = document.querySelector(".content-subtitle")
    if (contentHeader) {
      if (isSearching && filtros.search) {
        contentHeader.textContent = `Resultados de búsqueda para "${filtros.search}" (${productosFiltrados.length} productos)`
      } else {
        contentHeader.textContent = "Forged carbon"
      }
    }
  }

  // Search functionality
  handleSearch(event) {
    event.preventDefault()
    const searchInput = document.getElementById("search-input")
    const query = searchInput.value.trim()

    if (query.length === 0) {
      this.clearSearch()
      return
    }

    filtros.search = query
    isSearching = true
    this.filtrarProductos()
    this.hideSearchResults()
  }

  clearSearch() {
    filtros.search = ""
    isSearching = false
    const searchInput = document.getElementById("search-input")
    if (searchInput) {
      searchInput.value = ""
    }
    this.hideSearchResults()
    this.filtrarProductos()
  }

  performLiveSearch(query) {
    if (!query || query.length < 2) {
      this.hideSearchResults()
      return
    }

    const results = productos.filter((producto) => {
      const searchableText = [
        producto.nombre || "",
        producto.marca || "",
        producto.descripcion || "",
        categorias[producto.id_categoria] || "",
        materiales[producto.id_material] || "",
      ]
        .join(" ")
        .toLowerCase()

      return searchableText.includes(query.toLowerCase())
    })

    this.showSearchResults(results)
  }

  showSearchResults(results) {
    const searchBox = document.querySelector(".search-box")
    let resultsContainer = document.getElementById("search-results")

    if (!resultsContainer) {
      resultsContainer = document.createElement("div")
      resultsContainer.id = "search-results"
      resultsContainer.className = "search-results"
      searchBox.appendChild(resultsContainer)
    }

    if (results.length === 0) {
      resultsContainer.innerHTML = '<div class="no-results">No se encontraron productos</div>'
    } else {
      resultsContainer.innerHTML = results
        .slice(0, 8)
        .map(
          (producto) => `
          <div class="search-result-item" onclick="catalogoApp.selectSearchResult('${producto.id || Math.random()}')">
            <img src="${producto.imagen_principal || "https://via.placeholder.com/40x40/f8f9fa/333?text=No+Image"}" 
                 alt="${producto.nombre}" 
                 class="search-result-image"
                 onerror="this.src='https://via.placeholder.com/40x40/f8f9fa/333?text=No+Image'">
            <div class="search-result-info">
              <div class="search-result-brand">${(producto.marca || "CASIO").toUpperCase()}</div>
              <div class="search-result-name">${this.highlightSearchTerm(producto.nombre || "Sin nombre", filtros.search)}</div>
            </div>
          </div>
        `,
        )
        .join("")
    }

    resultsContainer.style.display = "block"
  }

  hideSearchResults() {
    const resultsContainer = document.getElementById("search-results")
    if (resultsContainer) {
      resultsContainer.style.display = "none"
    }
  }

  selectSearchResult(productId) {
    this.hideSearchResults()
    // Scroll to the product in the grid
    const productCards = document.querySelectorAll(".product-card")
    productCards.forEach((card) => {
      if (card.innerHTML.includes(productId)) {
        card.scrollIntoView({ behavior: "smooth", block: "center" })
        card.style.boxShadow = "0 8px 25px rgba(0, 123, 204, 0.3)"
        setTimeout(() => {
          card.style.boxShadow = ""
        }, 2000)
      }
    })
  }

  highlightSearchTerm(text, term) {
    if (!term || !text) return text
    const regex = new RegExp(`(${term})`, "gi")
    return text.replace(regex, '<span class="search-highlight">$1</span>')
  }

  // Filter methods
  toggleFavorite(productId) {
    if (favorites.includes(productId)) {
      favorites = favorites.filter((id) => id !== productId)
    } else {
      favorites.push(productId)
    }
    this.renderProductos(productosFiltrados)
  }

  toggleBrandSeries() {
    const content = document.getElementById("brand-series-content")
    const toggle = document.getElementById("brand-toggle")

    if (content && toggle) {
      if (content.classList.contains("hidden")) {
        content.classList.remove("hidden")
        toggle.textContent = "−"
      } else {
        content.classList.add("hidden")
        toggle.textContent = "+"
      }
    }
  }

  toggleBezelColor() {
    const content = document.getElementById("bezel-color-content")
    const toggle = document.getElementById("bezel-toggle")

    if (content && toggle) {
      if (content.classList.contains("hidden")) {
        content.classList.remove("hidden")
        toggle.textContent = "−"
      } else {
        content.classList.add("hidden")
        toggle.textContent = "+"
      }
    }
  }

  selectColor(color) {
    // Remove previous selection
    document.querySelectorAll(".color-square").forEach((square) => {
      square.classList.remove("selected")
    })

    // Toggle selection
    if (selectedColor === color) {
      // Deselect
      selectedColor = null
      filtros.bezelColor = ""
    } else {
      // Select new color
      selectedColor = color
      filtros.bezelColor = color

      // Add visual selection
      const colorSquare = document.querySelector(`[data-color="${color}"]`)
      if (colorSquare) {
        colorSquare.classList.add("selected")
      }
    }

    this.filtrarProductos()
    console.log("Color seleccionado:", selectedColor)
  }

  handleBrandSeriesChange() {
    const checkedBoxes = document.querySelectorAll('#brand-series-content input[type="checkbox"]:checked')
    filtros.brandSeries = Array.from(checkedBoxes).map((cb) => cb.value)
    this.filtrarProductos()
    console.log("Brand series seleccionadas:", filtros.brandSeries)
  }

  sortProducts(sortType) {
    if (!productosFiltrados || productosFiltrados.length === 0) return

    switch (sortType) {
      case "price-high-low":
        productosFiltrados.sort((a, b) => (b.precio || 0) - (a.precio || 0))
        break
      case "price-low-high":
        productosFiltrados.sort((a, b) => (a.precio || 0) - (b.precio || 0))
        break
      case "newest":
      default:
        // Keep original order or sort by name
        productosFiltrados.sort((a, b) => (a.nombre || "").localeCompare(b.nombre || ""))
        break
    }
    this.renderProductos(productosFiltrados)
    console.log("Productos ordenados por:", sortType)
  }

  setupEventListeners() {
    // Filter event listeners
    if (filtroMarca) {
      filtroMarca.addEventListener("change", (e) => {
        filtros.marca = e.target.value
        this.filtrarProductos()
      })
    }

    if (filtroCategoria) {
      filtroCategoria.addEventListener("change", (e) => {
        filtros.categoria = e.target.value
        this.filtrarProductos()
      })
    }

    if (filtroMaterial) {
      filtroMaterial.addEventListener("change", (e) => {
        filtros.material = e.target.value
        this.filtrarProductos()
      })
    }

    if (filtroPrecioMin) {
      filtroPrecioMin.addEventListener("input", (e) => {
        filtros.precioMin = e.target.value
        this.filtrarProductos()
      })
    }

    if (filtroPrecioMax) {
      filtroPrecioMax.addEventListener("input", (e) => {
        filtros.precioMax = e.target.value
        this.filtrarProductos()
      })
    }

    // Sort options
    const sortRadios = document.querySelectorAll('input[name="sort"]')
    sortRadios.forEach((radio) => {
      radio.addEventListener("change", (e) => {
        this.sortProducts(e.target.value)
      })
    })

    // Search functionality
    const searchForm = document.getElementById("search-form")
    const searchInput = document.getElementById("search-input")

    if (searchForm) {
      searchForm.addEventListener("submit", (e) => this.handleSearch(e))
    }

    if (searchInput) {
      // Live search as user types
      searchInput.addEventListener("input", (e) => {
        const query = e.target.value.trim()
        this.performLiveSearch(query)
      })

      // Clear search results when input loses focus
      searchInput.addEventListener("blur", () => {
        setTimeout(() => this.hideSearchResults(), 200)
      })

      // Handle escape key to clear search
      searchInput.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
          this.clearSearch()
          searchInput.blur()
        }
      })
    }

    // Toggle sections
    const brandSeriesToggle = document.getElementById("brand-series-toggle")
    if (brandSeriesToggle) {
      brandSeriesToggle.addEventListener("click", () => this.toggleBrandSeries())
    }

    const bezelColorToggle = document.getElementById("bezel-color-toggle")
    if (bezelColorToggle) {
      bezelColorToggle.addEventListener("click", () => this.toggleBezelColor())
    }

    // Color selection
    const colorOptions = document.querySelectorAll(".color-option")
    colorOptions.forEach((option) => {
      option.addEventListener("click", () => {
        const color = option.getAttribute("data-color")
        this.selectColor(color)
      })
    })

    // Close search results when clicking outside
    document.addEventListener("click", (e) => {
      const searchBox = document.querySelector(".search-box")
      if (searchBox && !searchBox.contains(e.target)) {
        this.hideSearchResults()
      }
    })
  }
}

// Initialize application when DOM is loaded
let catalogoApp
document.addEventListener("DOMContentLoaded", () => {
  catalogoApp = new CatalogoApp()
})
