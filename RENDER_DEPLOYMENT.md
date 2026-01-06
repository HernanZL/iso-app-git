# 🚀 GUÍA DE DESPLIEGUE A RENDER.COM

Render.com es una plataforma gratuita para desplegar aplicaciones web. Es **mucho más fácil** que Google Cloud y no requiere tarjeta de crédito.

---

## ✅ VENTAJAS DE RENDER

- ✅ **100% Gratis** (plan Free tier permanente)
- ✅ **Sin tarjeta de crédito** requerida
- ✅ **Despliegue automático** desde GitHub
- ✅ **HTTPS gratis** (certificado SSL)
- ✅ **Muy fácil de configurar** (5 minutos)

---

## 📋 PREREQUISITOS

1. ✅ Cuenta de GitHub
2. ✅ Código subido a GitHub
3. ⚠️ Cuenta de Render.com (la crearemos juntos)

---

## PASO 1: SUBIR CÓDIGO A GITHUB

Si aún no has subido tu código:

```powershell
# En la carpeta del proyecto
git init
git add .
git commit -m "Initial commit: Fraud Sentinel AI"
git branch -M main

# Crear repositorio en GitHub primero, luego:
git remote add origin https://github.com/TU_USUARIO/fraud-sentinel-ai.git
git push -u origin main
```

---

## PASO 2: CREAR CUENTA EN RENDER

1. Ve a: https://render.com
2. Click en **"Get Started"**
3. Elige **"Sign up with GitHub"** (más fácil)
4. Autoriza a Render a acceder a tus repositorios

**¡Listo! No necesitas tarjeta de crédito.**

---

## PASO 3: CREAR WEB SERVICE

1. En el dashboard de Render, click **"New +"** → **"Web Service"**

2. **Conectar repositorio:**
   - Busca `fraud-sentinel-ai`
   - Click **"Connect"**

3. **Configuración del servicio:**
   
   | Campo | Valor |
   |-------|-------|
   | **Name** | `fraud-sentinel-ai` |
   | **Region** | `Oregon (US West)` |
   | **Branch** | `main` |
   | **Runtime** | `Python 3` |
   | **Build Command** | `pip install -r requirements.txt` |
   | **Start Command** | `gunicorn app:app` |
   | **Plan** | `Free` |

4. Click **"Create Web Service"**

---

## PASO 4: ESPERAR EL DESPLIEGUE

Render comenzará a construir tu app automáticamente:

```
📦 Clonando repositorio...
📦 Instalando dependencias...
🚀 Iniciando aplicación...
✅ ¡Desplegado!
```

**Tiempo estimado:** 2-3 minutos

---

## PASO 5: ACCEDER A TU APP

Una vez desplegado, tu app estará en:

```
https://fraud-sentinel-ai.onrender.com
```

(O el nombre que hayas elegido)

**¡Listo! Tu app está en internet.** 🎉

---

## 🔄 DESPLIEGUE AUTOMÁTICO (CI/CD)

Cada vez que hagas `git push`:

1. **GitHub Actions** ejecuta los tests
2. Si pasan ✅, **Render detecta el cambio**
3. **Render despliega automáticamente**
4. Tu app se actualiza en ~2 minutos

**No necesitas hacer nada más.** Es completamente automático.

---

## 📊 MONITOREO

### Ver Logs en Tiempo Real

1. En Render Dashboard → Tu servicio
2. Pestaña **"Logs"**
3. Verás todos los logs de tu app

### Ver Métricas

1. Pestaña **"Metrics"**
2. CPU, Memoria, Requests, etc.

---

## ⚠️ LIMITACIONES DEL PLAN GRATUITO

| Limitación | Detalle |
|------------|---------|
| **Sleep** | Se duerme después de 15 min sin tráfico |
| **Wake-up** | Tarda ~30 segundos en despertar |
| **Horas** | 750 horas gratis al mes (suficiente) |
| **RAM** | 512 MB |
| **CPU** | Compartida |

**Para proyectos académicos/personales, es perfecto.**

---

## 🐛 TROUBLESHOOTING

### Error: "Build failed"
**Causa:** Falta alguna dependencia en `requirements.txt`  
**Solución:** Verifica que todas las librerías estén listadas

### Error: "Application failed to start"
**Causa:** El comando de inicio está mal  
**Solución:** Asegúrate de que sea `gunicorn app:app`

### La app se ve lenta
**Causa:** Está "dormida" (plan gratuito)  
**Solución:** Espera 30 segundos, se despertará automáticamente

---

## 🔧 CONFIGURACIÓN AVANZADA (Opcional)

### Variables de Entorno

Si necesitas agregar variables secretas:

1. En Render → Tu servicio → **"Environment"**
2. Click **"Add Environment Variable"**
3. Ejemplo:
   - Key: `SECRET_KEY`
   - Value: `mi-clave-secreta`

### Custom Domain

Si tienes un dominio propio:

1. Pestaña **"Settings"** → **"Custom Domain"**
2. Agrega tu dominio
3. Configura DNS según instrucciones

---

## ✅ CHECKLIST FINAL

- [ ] Código subido a GitHub
- [ ] Cuenta de Render creada
- [ ] Web Service creado en Render
- [ ] App desplegada exitosamente
- [ ] URL funcionando: `https://tu-app.onrender.com`
- [ ] Tests pasando en GitHub Actions
- [ ] Despliegue automático configurado

---

## 🎉 ¡FELICIDADES!

Ahora tienes:
- ✅ App en producción (internet)
- ✅ CI/CD completamente funcional
- ✅ Despliegue automático
- ✅ **Todo gratis**

**Esto es MLOps de nivel profesional.** 🚀

---

## 📖 RECURSOS ADICIONALES

- **Dashboard:** https://dashboard.render.com
- **Documentación:** https://render.com/docs
- **Status:** https://status.render.com
- **Soporte:** https://render.com/support

---

**¿Preguntas?** Render tiene excelente documentación y soporte por email.
