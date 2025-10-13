# Configuración de PostgreSQL en Render

Esta aplicación usa **PostgreSQL** para almacenamiento persistente de notas. Esto garantiza que las notas nunca se pierdan y se sincronicen entre todas las máquinas.

## 🚀 Pasos para Configurar en Render

### 1. Crear Base de Datos PostgreSQL

1. Ve a tu **Dashboard de Render**: https://dashboard.render.com/
2. Click en **"New +"** → **"PostgreSQL"**
3. Configura:
   - **Name**: `eggscape-notes-db` (o el nombre que prefieras)
   - **Database**: `eggscape_notes`
   - **User**: (déjalo por defecto)
   - **Region**: Mismo que tu Web Service
   - **Plan**: **Free** (suficiente para este proyecto)
4. Click en **"Create Database"**
5. **IMPORTANTE**: Espera 2-3 minutos a que se cree la base de datos

### 2. Obtener la Connection String

1. Una vez creada la base de datos, ve a su página de detalles
2. En la sección **"Connections"**, busca **"Internal Database URL"**
3. Click en el ícono de **copiar** para copiar la URL completa
   - Debe verse algo como: `postgresql://user:password@host/database`

### 3. Configurar Variable de Entorno en tu Web Service

1. Ve a tu **Web Service** (donde está desplegada tu aplicación)
2. Ve a la pestaña **"Environment"**
3. Click en **"Add Environment Variable"**
4. Agrega:
   - **Key**: `DATABASE_URL`
   - **Value**: Pega la URL que copiaste en el paso anterior
5. Click en **"Save Changes"**

### 4. Redeploy (Automático)

Render automáticamente redeployará tu aplicación con la nueva variable de entorno.

## ✅ Verificación

Una vez desplegado, verifica que funcione:

```bash
curl https://tu-app.onrender.com/api/notes
```

Deberías ver:
```json
{"notes":[],"history":[]}
```

## 🔧 Desarrollo Local

Para desarrollo local (sin PostgreSQL):
- La aplicación automáticamente usa `notes.json` como fallback
- No necesitas configurar nada adicional
- Funciona igual que antes

## 📊 Características

Con PostgreSQL configurado:

✅ **Persistencia real**: Las notas NUNCA se borran, incluso con reinicios
✅ **Sincronización automática**: Todas las máquinas ven las mismas notas en tiempo real
✅ **Sin límite de espacio** (en el plan Free de Render)
✅ **Backups automáticos** (Render hace backups diarios)

## ⚠️ Troubleshooting

**Si ves "Not Found" en /api/notes:**
- Verifica que DATABASE_URL esté configurada en Environment variables
- Fuerza un redeploy desde Render Dashboard
- Revisa los logs en Render para ver errores de conexión

**Si aparece "Error inicializando base de datos":**
- Verifica que la Internal Database URL esté copiada correctamente
- Asegúrate de que la base de datos esté en estado "Available"

## 🎯 Próximos Pasos

Una vez configurado, todas tus notas:
- Se guardarán permanentemente en PostgreSQL
- Estarán disponibles desde cualquier máquina
- Sobrevivirán reinicios y redeploys
- Se sincronizarán automáticamente entre usuarios
