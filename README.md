# 🥚 Eggscape Build Notes

Sistema de notas para builds de Eggscape con organización automática mediante AI de Anthropic (Claude 4.5).

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
   - **Key**: `ANTHROPIC_API_KEY`
   - **Value**: Tu API key de Anthropic (sk-ant-api03-...)
   - Click en "Save Changes"

4. **Acceso**: Render te dará una URL como `https://tareas-eggscape.onrender.com`

✅ **Seguridad**: La API key está protegida en el servidor y no se expone al navegador.

## 🖥️ Uso Local

1. **Instalar dependencias**:
   ```bash
   npm install
   ```

2. **Configurar API Key**:
   - Crea un archivo `.env` en la raíz del proyecto
   - Agrega tu API key:
     ```
     ANTHROPIC_API_KEY=tu_api_key_aqui
     ```

3. **Iniciar servidor**:
   ```bash
   node server.js
   ```

4. **Abrir en navegador**: `http://localhost:3000`

## 📋 Características

- ✨ Interface tipo terminal con tema oscuro
- 🤖 Organización automática de notas con AI de Claude 4.5
- 📂 Categorías: Bug, Feature, Performance, UI, Sound, Gameplay, Backend, Tools, Other
- 👥 Sistema de asignación de tareas a personas
- 📊 Niveles de dificultad: Easy, Medium, Hard
- ⚡ Prioridades: Low, Medium, High, Critical
- 🏷️ Tags automáticos por el AI
- 💾 Persistencia local con localStorage
- 📥 Exportar/Importar notas en JSON
- 👥 Exportar tareas organizadas por persona
- 📱 Diseño totalmente responsivo
- ⌨️ Optimizado para mínimos clicks (Enter para agregar)

## 🛠️ Uso

1. Escribe tu nota en el campo de texto
2. Presiona Enter
3. La AI categorizará y agregará tags automáticamente

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
- El botón "🔄 Recategorizar y Agrupar" reorganiza todas las notas
- En modo revisión, filtra por persona u oculta tareas aceptadas
