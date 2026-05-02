Chatbot1: Automatización de Mensajería 🤖📩
Chatbot1 es una aplicación de escritorio multiplataforma construida con Electron y React. Está diseñada para optimizar procesos de comunicación permitiendo el envío masivo y automatizado de mensajes personalizados a partir de fuentes de datos externas como archivos Excel o bases de datos (DB).

✨ Características Principales
Importación de Datos: Soporte nativo para hojas de cálculo de Excel (.xlsx, .csv) y conexiones a bases de datos.

Personalización Dinámica: Uso de variables en los mensajes basadas en las columnas de tu fuente de datos.

Interfaz Moderna: UI reactiva construida con React para una gestión de envíos fluida.

Multiplataforma: Ejecutable nativo para Windows, macOS y Linux.

🛠️ Tecnologías Utilizadas
Frontend: React.js

Runtime: Electron

Package Manager: npm

🚀 Guía de Inicio Rápido
Requisitos Previos
Node.js (Versión recomendada LTS)

VSCode + ESLint + Prettier (Configuración de IDE recomendada)

Instalación
Clona el repositorio y entra en la carpeta del proyecto:

Bash
git clone https://github.com/tu-usuario/chatbot1.git
cd chatbot1
npm install
Desarrollo
Para ejecutar la aplicación en modo desarrollo con Hot-Reload:

Bash
npm run dev
📦 Construcción (Build)
Para generar los instaladores de producción para cada sistema operativo, utiliza los siguientes comandos:

Windows:

Bash
npm run build:win
macOS:

Bash
npm run build:mac
Linux:

Bash
npm run build:linux
📖 Uso
Carga tu fuente: Selecciona tu archivo Excel o configura la cadena de conexión a tu DB.

Redacta el mensaje: Utiliza la sintaxis {nombre_columna} para insertar datos variables.

Ejecuta: Inicia el proceso de envío automatizado.
