# 🥚 Eggscape Build Notes

Sistema de notas para builds de Eggscape.

## 🌐 Despliegue en Render (Web Service)

### Pasos para desplegar:

1. **El código ya está en GitHub**: https://github.com/G3dar/Tareas

2. **Crear Web Service en Render**:
   - Ve a [Render](https://render.com) e inicia sesión
   - Click en "New +" → **"Web Service"**
   - Conecta tu cuenta de GitHub
   - Selecciona el repositorio **"Tareas"**
   - Configuración:
     - **Name**: `tareas-eggscape` (o el que prefieras)
     - **Branch**: `main`
     - **Runtime**: `Node`
     - **Build Command**: `npm install`
     - **Start Command**: `node server.js`
   - Click en "Create Web Service"

3. **Configurar Variable de Entorno**:
   - Una vez creado el servicio, ve a la pestaña "Environment"
   - Click en "Add Environment Variable"
   - **Key**: `DATABASE_URL`
   - **Value**: Tu URL de conexión a PostgreSQL (ej: Supabase)
   - Click en "Save Changes"

4. **Acceso**: Render te dará una URL como `https://tareas-eggscape.onrender.com`

## 🖥️ Uso Local

1. **Instalar dependencias**:
   ```bash
   npm install
   ```

2. **Configurar variables de entorno**:
   - Crea un archivo `.env` en la raíz del proyecto
   - Agrega la URL de tu base de datos:
     ```
     DATABASE_URL=tu_url_de_base_de_datos_aqui
     ```

3. **Iniciar servidor**:
   ```bash
   node server.js
   ```

4. **Abrir en navegador**: `http://localhost:3000`

## 📋 Características

- ✨ Interface tipo terminal con tema oscuro
- 📂 Categorías: Bug, Feature, Performance, UI, Sound, Gameplay, Backend, Tools, Other
- 👥 Sistema de asignación de tareas a personas
- 📊 Niveles de dificultad: Easy, Medium, Hard
- ⚡ Prioridades: Low, Medium, High, Critical
- 🏷️ Sistema de tags personalizables
- 💾 Persistencia con PostgreSQL (Supabase)
- 📥 Exportar/Importar notas en JSON
- 👥 Exportar tareas organizadas por persona
- 📱 Diseño totalmente responsivo
- ⌨️ Optimizado para mínimos clicks (Enter para agregar)

## 🛠️ Uso

1. Escribe tu nota en el campo de texto
2. Presiona Enter para agregar la nota
3. Asigna categorías, tags, y otros atributos manualmente

### Modo Asignación

1. Click en "👥 MODO ASIGNACIÓN"
2. Para cada nota, selecciona:
   - Personas asignadas (checkboxes)
   - Dificultad (Easy/Medium/Hard)
   - Prioridad (Low/Medium/High/Critical)
3. Click en "✓ Aceptar" para guardar

### Exportar

- **📥 Exportar**: Descarga JSON con todas las notas
- **👥 Exportar por Persona**: Genera archivo de texto organizado por persona con sus tareas

## 🚀 Auto-Deploy

Este proyecto está configurado con GitHub Actions para desplegar automáticamente a Render en cada push a la rama `main`.

## 💡 Tips

- Usa Enter para agregar notas rápidamente
- El historial guarda todas las acciones
- Click en una nota para editarla
- En modo revisión, filtra por persona u oculta tareas aceptadas
