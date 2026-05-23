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
- **Conversor de moneda**: el cliente puede ver precios en USD, EUR o Bolívares (tasa
  configurable por el administrador).
- Catálogo completo (página independiente) con filtros avanzados, vista de ofertas, etc.
- Diseño 100 % responsive (móvil, tablet, escritorio).

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
- **Apariencia**: paleta de colores completa (primario, secundario, header, footer,
  textos, botones) con previsualización instantánea.
- **Redes sociales** y **Ubicación** (con enlace a Google Maps).
- **Chatbot**: editor de preguntas y respuestas frecuentes que se reflejan en tiempo
  real en la tienda pública.
- **Formulario de pedido**: campos personalizables que el cliente debe llenar antes
  de enviar su carrito por WhatsApp.
- **Estudio de contenido (Katalog Studio)**: genera imágenes profesionales para
  historias de Instagram (9:16) con plantillas prediseñadas (Amazon Style, Fotografía,
  Instagram Post, Producto Destacado, Ficha Técnica). Edita textos, colores, logo,
  resplandor y descarga la imagen a 1080 × 1920 píxeles.
- **Sistema de envíos**: estados, zonas, precios únicos o rangos, tiempos de entrega,
  envío gratis a partir de un monto, categorías de tamaño para costo adicional.
- **Módulo de inventario** (subpestañas):
  - **Stock**: vista con búsqueda, filtros (categoría, oferta, stock bajo),
    ordenación, barra de progreso visual, desglose por colores y exportación CSV.
  - **Ventas**: registro manual de ventas, descuento automático de stock,
    múltiples productos por venta, filtro por período y exportación CSV.
  - **Compras**: registro de compras a proveedores (fijos u ocasionales),
    incremento automático de stock, filtro por período y exportación CSV.
  - **Finanzas**: historial de ingresos y egresos (ventas, compras, gastos
    operativos), registro automático de gastos fijos mensuales, filtro por período
    y exportación CSV.
  - **Gastos fijos**: gastos recurrentes configurables que se registran
    automáticamente cada mes en finanzas.
  - **Proveedores**: CRUD completo de proveedores.
- **Control de acceso por planes**: cada herramienta puede activarse/desactivarse
  para los planes Gratis, Pro o Business desde el panel de Super Admin.
- **Notificaciones de plan**: el dueño de la tienda ve las herramientas bloqueadas
  con un candado y un botón para ver los planes disponibles.

### 🛡️ Super Administrador
- **Dashboard global** con KPIs: total de tiendas, productos, ventas, ingresos y
  distribución por planes.
- **Gestión de usuarios**: búsqueda, cambio de plan, renovación, fecha de
  vencimiento personalizada, cancelación.
- **Visor de tienda**: ve productos, ventas y envíos de cualquier tienda con un clic.
- **Configuración de planes**: define el límite de productos y las herramientas
  activas (chatbot, estudio, inventario, envíos, formulario de pedido, etc.) para
  cada plan.
- Interfaz oscura idéntica al panel de administración, con sidebar colapsable.

### 👤 Autenticación y registro
- Registro con email/contraseña (Firebase Auth).
- Generación automática de slug único para la tienda.
- Configuración inicial predefinida (slide de bienvenida, colores, etc.).
- Protección de rutas con verificación de sesión.

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

---
