document.addEventListener("DOMContentLoaded", () => {
  // Variables globales
  let productos = []

  // Hero Carousel
  const slides = document.querySelectorAll(".hero-slide")
  const leftBtn = document.querySelector(".hero-arrow-left")
  const rightBtn = document.querySelector(".hero-arrow-right")
  const radios = document.querySelectorAll(".hero-radio-buttons .material-symbols-outlined")
  let current = 0

  function showSlide(idx) {
    slides.forEach((slide, i) => {
      slide.classList.toggle("active", i === idx)
    })
    radios.forEach((radio, i) => {
      if (i === idx) {
        radio.textContent = "radio_button_checked"
        radio.classList.add("checked")
        radio.classList.remove("unchecked")
      } else {
        radio.textContent = "radio_button_unchecked"
        radio.classList.remove("checked")
        radio.classList.add("unchecked")
      }
    })
    current = idx
  }

  leftBtn.addEventListener("click", () => {
    const idx = (current - 1 + slides.length) % slides.length
    showSlide(idx)
  })
  rightBtn.addEventListener("click", () => {
    const idx = (current + 1) % slides.length
    showSlide(idx)
  })
  radios.forEach((radio, i) => {
    radio.addEventListener("click", () => showSlide(i))
  })

  showSlide(0)

  // Navegación lateral animada
  const desktopNavbar = document.querySelector(".desktop-navbar")
  const closeBtn = document.querySelector(".span--close")
  const menuBtn = document.querySelector(".span--menu")

  if (closeBtn && desktopNavbar) {
    closeBtn.addEventListener("click", () => {
      if (!desktopNavbar.classList.contains("closed")) {
        desktopNavbar.classList.add("closed")
      }
    })
  }

  if (menuBtn && desktopNavbar) {
    menuBtn.addEventListener("click", () => {
      if (desktopNavbar.classList.contains("closed")) {
        desktopNavbar.classList.remove("closed")
        // Forzar reflow para que la transición funcione si estaba oculta
        void desktopNavbar.offsetWidth
      }
    })
  }

  // Asegurarse de que el menú esté oculto al cargar la página
  if (desktopNavbar) {
    desktopNavbar.classList.add("closed")
  }
  desktopNavbar
    .querySelectorAll("a")
    .forEach((link) => link.addEventListener("click", () => desktopNavbar.classList.add("closed")))

  // Cargar productos y hacer clickeables los productos del carousel
  loadProductsAndMakeClickable()

  async function loadProductsAndMakeClickable() {
    try {
      // Cargar productos del JSON
      const response = await fetch("../public/assets/json/relojes_listos_para_sql.json")
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      productos = await response.json()

      if (!Array.isArray(productos) || productos.length === 0) {
        console.warn("No se encontraron productos en el archivo JSON")
        return
      }

      console.log(`Productos cargados exitosamente: ${productos.length}`)

      // Hacer clickeables los productos del carousel
      makeProductsClickable()
    } catch (error) {
      console.error("Error al cargar productos:", error)
      // Si no se pueden cargar los productos, al menos hacer clickeables con datos básicos
      makeProductsClickableWithBasicData()
    }
  }

  function makeProductsClickable() {
    // Mapeo de códigos de productos mostrados en el HTML con los del JSON
    const productCodes = [
      "G-5600SFJ-9",
      "PRW-35LD-5",
      "MRG-BF1000RG-3A",
      "MTG-B2000YBD-2A",
      "GBX-100S-1",
      "GBX-100S-2",
      "GA-B2100BBR-1A",
      "GA-700BBR-1A",
      "GD-010BBR-1",
      "GX-56BBR-1",
      "DW-5600BBR-1",
      "GA-110HDS-7A",
    ]

    const productArticles = document.querySelectorAll(".section--new_watches .article--product")

    productArticles.forEach((article, index) => {
      const productCode = productCodes[index]

      // Buscar el producto en el JSON por código o nombre similar
      let matchedProduct = findProductByCode(productCode)

      // Si no se encuentra por código, crear un producto básico
      if (!matchedProduct) {
        matchedProduct = createBasicProduct(article, productCode, index)
      }

      // Hacer el artículo clickeable
      article.style.cursor = "pointer"
      article.addEventListener("click", () => {
        openProductDetail(matchedProduct)
      })

      // Agregar efecto hover
      article.addEventListener("mouseenter", () => {
        article.style.transform = "scale(1.05)"
        article.style.transition = "transform 0.2s ease"
      })

      article.addEventListener("mouseleave", () => {
        article.style.transform = "scale(1)"
      })
    })
  }

  function makeProductsClickableWithBasicData() {
    // Fallback si no se pueden cargar los productos del JSON
    const productArticles = document.querySelectorAll(".section--new_watches .article--product")

    productArticles.forEach((article, index) => {
      const productTitle = article.querySelector(".product--title")?.textContent || "CASIO"
      const productCode = article.querySelector(".product--code")?.textContent || `PRODUCT-${index}`
      const productImage = article.querySelector(".product--img img")?.src || ""

      const basicProduct = {
        id: `index_product_${index}`,
        nombre: productCode,
        marca: productTitle,
        codigo: productCode,
        imagen_principal: productImage,
        descripcion: `Reloj ${productTitle} modelo ${productCode}`,
        precio: 299.99 + index * 50, // Precio simulado
        id_categoria: productTitle === "G-SHOCK" ? 1 : 2,
        id_material: 1,
        color: "negro",
      }

      article.style.cursor = "pointer"
      article.addEventListener("click", () => {
        openProductDetail(basicProduct)
      })

      // Agregar efecto hover
      article.addEventListener("mouseenter", () => {
        article.style.transform = "scale(1.05)"
        article.style.transition = "transform 0.2s ease"
      })

      article.addEventListener("mouseleave", () => {
        article.style.transform = "scale(1)"
      })
    })
  }

  function findProductByCode(code) {
    if (!productos || productos.length === 0) return null

    // Buscar por código exacto
    let product = productos.find((p) => p.codigo === code || p.nombre === code || (p.nombre && p.nombre.includes(code)))

    // Si no se encuentra, buscar por similitud en el nombre
    if (!product) {
      product = productos.find((p) => {
        if (!p.nombre) return false
        const cleanCode = code.replace(/[-\s]/g, "").toLowerCase()
        const cleanName = p.nombre.replace(/[-\s]/g, "").toLowerCase()
        return cleanName.includes(cleanCode) || cleanCode.includes(cleanName)
      })
    }

    return product
  }

  // Actualizar la función createBasicProduct para usar IDs consistentes
  function createBasicProduct(article, code, index) {
    const productTitle = article.querySelector(".product--title")?.textContent || "CASIO"
    const productImage = article.querySelector(".product--img img")?.src || ""

    const product = {
      id: null, // No tiene ID real
      nombre: code,
      marca: productTitle,
      codigo: code,
      imagen_principal: productImage,
      descripcion: `Reloj ${productTitle} modelo ${code}. Diseño innovador con tecnología avanzada y resistencia superior.`,
      precio: 299.99 + index * 50,
      id_categoria: getCategory(productTitle),
      id_material: 1,
      color: "negro",
      peso: 65,
      resistencia_agua: "200M",
      ancho: 45,
      alto: 50,
      grosor: 15,
    }

    return product
  }

  // Agregar función para obtener ID consistente (igual que en otros archivos)
  function getConsistentProductId(producto) {
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

  function getCategory(brand) {
    const categories = {
      "G-SHOCK": 1,
      "PRO TREK": 2,
      EDIFICE: 4,
      "BABY-G": 5,
      CASIO: 2,
    }
    return categories[brand] || 2
  }

  function openProductDetail(product) {
    if (!product) {
      console.error("No se pudo abrir el detalle del producto")
      return
    }

    console.log("Abriendo detalle del producto:", product)

    // Guardar el producto en localStorage
    localStorage.setItem("selectedProduct", JSON.stringify(product))

    // Navegar a la página de detalles
    window.location.href = "/views/producto-detalle.html"
  }

  // Auto-advance carousel (opcional)
  let autoAdvanceInterval

  function startAutoAdvance() {
    autoAdvanceInterval = setInterval(() => {
      const nextIdx = (current + 1) % slides.length
      showSlide(nextIdx)
    }, 5000) // Cambiar cada 5 segundos
  }

  function stopAutoAdvance() {
    if (autoAdvanceInterval) {
      clearInterval(autoAdvanceInterval)
    }
  }

  // Iniciar auto-advance
  startAutoAdvance()

  // Pausar auto-advance cuando el usuario interactúa
  const heroCarousel = document.querySelector(".hero-carousel")
  if (heroCarousel) {
    heroCarousel.addEventListener("mouseenter", stopAutoAdvance)
    heroCarousel.addEventListener("mouseleave", startAutoAdvance)
  }

  // Pausar auto-advance cuando se hace clic en controles
  leftBtn.addEventListener("click", () => {
    stopAutoAdvance()
    setTimeout(startAutoAdvance, 10000) // Reanudar después de 10 segundos
  })

  rightBtn.addEventListener("click", () => {
    stopAutoAdvance()
    setTimeout(startAutoAdvance, 10000)
  })

  radios.forEach((radio) => {
    radio.addEventListener("click", () => {
      stopAutoAdvance()
      setTimeout(startAutoAdvance, 10000)
    })
  })
})
