<div align="center">
  <img src="./resources/icon.png" alt="WBot Logo" width="128" height="128">
  <h1>WBot</h1>
  <p><strong>Automatización Inteligente de Mensajería WhatsApp</strong></p>
  <p>
    <img src="https://img.shields.io/badge/version-1.0.0-blue.svg" alt="Version">
    <img src="https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey.svg" alt="Platform">
    <img src="https://img.shields.io/badge/electron-38.1.2-47848F.svg" alt="Electron">
    <img src="https://img.shields.io/badge/react-19.1.1-61DAFB.svg" alt="React">
    <img src="https://img.shields.io/badge/license-MIT-green.svg" alt="License">
  </p>
</div>

---

## 📋 Descripción

**WBot** es una aplicación de escritorio multiplataforma construida con **Electron + React** que automatiza el envío masivo de mensajes personalizados vía **WhatsApp Web**. Ideal para empresas que necesitan comunicarse con sus clientes de forma eficiente — cobranzas, recordatorios, notificaciones — importando contactos desde **Excel** o directamente desde una **base de datos MySQL**.

---

## ✨ Características

| Funcionalidad | Detalle |
|---|---|
| **🧩 Varias fuentes de Datos** | Carga desde archivos `.xlsx` o conexión dinámica a bases de datos MySQL |
| **📝 Plantillas dinámicas** | Mensajes personalizados con variables `{name}`, `{telephone}`, `{remainingDebt}` |
| **🔍 Filtro inteligente de balance** | Excluye automáticamente registros con saldo ≤ 0 |
| **🚫 Lista de excepciones** | Exclusiones por ID desde archivo Excel dedicado |
| **⚙️ Filtros personalizados** | Condiciones numéricas por columna (>, <, ≥, ≤, =, ≠) |
| **📊 Vista previa de datos** | Tabla interactiva con los registros filtrados antes de enviar |
| **📈 Barra de progreso** | Seguimiento en tiempo real del envío de mensajes |
| **🔐 Autenticación QR** | Escaneo de código QR de WhatsApp Web integrado |
| **💻 Multiplataforma** | Instaladores nativos para Windows, macOS y Linux |

---

## 🛠️ Stack Tecnológico

| Capa | Tecnología |
|---|---|
| **Frontend** | React 19, React Router v7, Vite |
| **Backend (main process)** | Node.js, Electron 38 |
| **WhatsApp API** | whatsapp-web.js + Puppeteer |
| **Base de Datos** | MySQL 2 + Sequelize ORM |
| **Excel** | SheetJS (xlsx) |
| **Packaging** | electron-builder, electron-vite |

---

## 🚀 Inicio Rápido

### Prerrequisitos

- [Node.js](https://nodejs.org/) (LTS recomendada)
- npm

### Instalación

```bash
git clone https://github.com/tu-usuario/WBot.git
cd WBot
npm install
```

### Desarrollo (con hot-reload)

```bash
npm run dev
```

### Preview de producción

```bash
npm run build
npm run start
```

---

## 📦 Builds de Producción

```bash
# Windows — instalador NSIS (.exe)
npm run build:win

# macOS — DMG
npm run build:mac

# Linux — AppImage + Snap + Deb
npm run build:linux
```

---

## 📖 Flujo de Uso

```mermaid
graph LR
    A[Excel / DB] --> B[Filtros]
    B --> C[Vista Previa]
    C --> D[Plantilla]
    D --> E[Envío WhatsApp]
    E --> F[Resultados]
```

1. **Selecciona fuente** — Elige entre archivo Excel o conexión a base de datos MySQL.
2. **Configura filtros** — Excluye saldos en cero, clientes no deseados y aplica condiciones personalizadas.
3. **Redacta tu mensaje** — Usa `{name}`, `{telephone}` y `{remainingDebt}` como variables dinámicas.
4. **Previsualiza** — Revisa los datos filtrados en una tabla interactiva.
5. **Envía** — Escanea el código QR de WhatsApp e inicia el envío masivo.

> Los números de teléfono se normalizan automáticamente: se eliminan caracteres no dígitos, se agrega el código de país `1` (República Dominicana) a números de 10 dígitos y se invalidan aquellos que no cumplan con el formato esperado.

---

## 🧪 Linting y Formateo

```bash
# ESLint
npm run lint

# Prettier (escribe en lugar)
npm run format
```

---

## 📁 Estructura del Proyecto

```
src/
├── main/          # Proceso principal de Electron
│   ├── index.js   # Creación de ventana + IPC handlers
│   └── backend/   # Lógica de negocio (DB, modelos, controladores)
├── preload/       # Bridge IPC → contextBridge (window.api.*)
└── renderer/      # Aplicación React
    └── src/
        ├── components/   # 6 componentes modulares en pipeline
        ├── hooks/        # useClientSource — estado central
        └── App.jsx       # Punto de entrada con router
```

---

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor abre un _issue_ o _pull request_ en el repositorio.

---



