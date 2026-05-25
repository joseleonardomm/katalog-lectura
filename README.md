# 🛍️ Katalog – Plataforma integral para pequeños negocios

Katalog es una solución SaaS (Software as a Service) que permite a emprendedores y
pequeños negocios crear su propio catálogo digital profesional, gestionar inventarios,
ventas, finanzas, envíos y generar contenido para redes sociales, todo desde un mismo
panel de control. El cliente final compra a través de un catálogo público optimizado
y envía su pedido directamente por WhatsApp.

---

## 🚀 Demo en vivo

👉 [https://katal.site](https://katal.site)  
*(Regístrate y obtén tu tienda automáticamente)*

---

## ✨ Características principales

### 🛒 Tienda pública
- Catálogo de productos con búsqueda, filtro por categorías y precios.
- Página de producto con galería de imágenes, selector de colores, stock visible y
  precio de oferta tachado.
- Modal de producto con botones de **Agregar al carrito**, **Consultar por WhatsApp**
  y **Compartir**.
- Carrito lateral con resumen, ajuste de cantidades y **cálculo de envío en tiempo real**
  (selección de estado → zona → costo / rango de precios).
- **Formulario de pedido personalizable** que el cliente llena antes de enviar su
  pedido por WhatsApp.
- **Chatbot de preguntas frecuentes** (widget flotante) gestionable desde el panel.
- **Conversor de moneda**: el cliente puede ver precios en USD, EUR, BS y otras monedas.
- Catálogo completo (página independiente) con filtros avanzados, vista de ofertas, etc.
- **Sección de información del negocio**: bloques personalizables de texto, imágenes y
  parallax con opciones de color y alineación.
- **Métodos de pago visibles en el carrito**, con datos bancarios y opción de copia.
- **Aceptación de Términos y Condiciones** al registrarse.
- **Diseño responsive** optimizado para escritorio y dispositivos móviles.
- **Carrito con overlay oscuro** y bloqueo de scroll del fondo.
- **Scroll horizontal en productos** en móviles.

### 🔧 Panel de administración
- **Interfaz oscura profesional** con barra lateral colapsable y navegación intuitiva.
- Gestión de productos: nombre, descripción, precio base, precio de costo, moneda,
  variantes de color (con imágenes, stock y precio propio por variante), ofertas,
  ficha técnica y categoría.
- Gestión de categorías con iconos personalizables (más de 100 disponibles) e imagen
  de portada.
- Gestión de slides del banner principal (imágenes para escritorio y móvil,
  posiciones de texto configurables).
- **Configuración general**: nombre del sitio, moneda base, WhatsApp, logo,
  pie de página, tasas de cambio para Bolívares.
- **Apariencia**: paleta de colores completa para todos los elementos de la tienda,
  incluyendo títulos de sección, portadas de categorías, botones, cabecera, footer,
  textos de productos, etc.
- **Redes sociales** y **Ubicación** (con enlace a Google Maps).
- **Chatbot**: editor de preguntas y respuestas frecuentes que se reflejan en tiempo
  real en la tienda pública.
- **Formulario de pedido**: campos personalizables que el cliente debe llenar antes
  de enviar su carrito por WhatsApp.
- **Estudio de contenido (Katalog Studio)**: genera imágenes profesionales para
  historias de Instagram con plantillas prediseñadas.
- **Sistema de envíos**: estados, zonas, precios únicos o rangos, tiempos de entrega,
  envío gratis a partir de un monto.
- **Módulo de inventario** (subpestañas):
  - **Stock**: vista con búsqueda, filtros, barra de progreso visual y exportación CSV.
  - **Ventas**: registro manual de ventas, descuento automático de stock.
  - **Compras**: registro de compras a proveedores.
  - **Finanzas**: historial de ingresos y egresos, gastos fijos automáticos.
  - **Gastos fijos**: gastos recurrentes configurables.
  - **Proveedores**: CRUD completo de proveedores.
- **Cotizaciones**: creación, edición y vista previa de cotizaciones con diseño
  profesional, estados, monedas y descarga como imagen.
- **Información del negocio**: bloques de texto, imagen y parallax totalmente
  personalizables.
- **Métodos de pago**: configuración de métodos de pago (pago móvil, transferencia,
  PayPal, personalizado).
- **Panel responsive** con menú hamburguesa para móviles.
- **Control de acceso por planes**: cada herramienta puede activarse/desactivarse
  para los planes Gratis, Pro o Business desde el panel de Super Admin.

### 🛡️ Super Administrador
- **Dashboard global** con KPIs: total de tiendas, productos, ventas, ingresos y
  distribución por planes.
- **Gestión de usuarios**: búsqueda, cambio de plan, renovación, fecha de
  vencimiento personalizada, cancelación.
- **Visor de tienda**: ve productos, ventas y envíos de cualquier tienda con un clic.
- **Configuración de planes**: define el límite de productos y las herramientas
  activas (chatbot, estudio, inventario, envíos, formulario de pedido, cotizaciones,
  métodos de pago, información del negocio, etc.) para cada plan.
- Interfaz oscura idéntica al panel de administración, con sidebar colapsable.

### 👤 Autenticación y registro
- Registro con email/contraseña (Firebase Auth).
- Generación automática de slug único para la tienda.
- Configuración inicial predefinida (slide de bienvenida, colores, etc.).
- Protección de rutas con verificación de sesión.
- **Página de registro profesional** con landing informativo, efecto parallax y
  partículas.
- **Página de login profesional** con diseño glassmorphism.

---

## 🧰 Tecnologías utilizadas

| Área | Tecnologías |
|------|-------------|
| **Frontend** | React 18, Vite, React Router DOM, Swiper, React Icons, html2canvas |
| **Backend / DB** | Firebase Auth, Firestore (NoSQL), Firebase Storage |
| **Estilos** | CSS puro (responsivo, grid, flexbox, variables CSS, tema oscuro) |
| **Autenticación** | Firebase Auth (Email/Password) |
| **Despliegue** | Netlify (con redirecciones SPA) |
| **Control de versiones** | Git, GitHub |