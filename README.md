# 🥚 Eggscape Build Notes

Sistema de notas para builds de Eggscape con organización automática mediante AI de Anthropic (Claude 4.5).

## 🌐 Despliegue en Render

### Pasos para desplegar:

1. **Sube el código a GitHub**:
   ```bash
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/TU_USUARIO/Tareas.git
   git push -u origin main
   ```

2. **Crea un Web Service en Render**:
   - Ve a [Render](https://render.com) y crea una cuenta
   - Click en "New +" → "Web Service"
   - Conecta tu repositorio de GitHub
   - Configuración:
     - **Name**: tareas-eggscape
     - **Environment**: Node
     - **Build Command**: (dejar vacío)
     - **Start Command**: `npm start`
     - **Plan**: Free

3. **Variables de entorno** (si quieres proteger la API key):
   - En Render, ve a Environment
   - Agrega: `ANTHROPIC_API_KEY` con tu clave
   - Modifica server.js para usar `process.env.ANTHROPIC_API_KEY`

4. **Accede a tu app**: Render te dará una URL como `https://tareas-eggscape.onrender.com`

## 🚀 Inicio Rápido Local

```bash
npm start
```

Luego abre tu navegador en: http://localhost:3000

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

## 💡 Tips

- Usa Enter para agregar notas rápidamente
- El historial guarda todas las acciones
- Click en una nota para editarla
- El botón "🔄 Recategorizar y Agrupar" reorganiza todas las notas
