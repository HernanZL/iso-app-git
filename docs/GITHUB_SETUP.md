# 🚀 GUÍA DE CONFIGURACIÓN DE GITHUB Y GOOGLE CLOUD

Esta guía te llevará paso a paso para configurar el despliegue automático.

---

## 📋 PREREQUISITOS

✅ Cuenta de GitHub  
✅ Cuenta de Google Cloud Platform  
✅ Google Cloud SDK instalado (`gcloud` CLI)  
✅ Git instalado en tu PC

---

## PARTE 1: SUBIR EL PROYECTO A GITHUB

### Paso 1: Crear Repositorio en GitHub

1. Ve a https://github.com
2. Click en el botón **"+"** (arriba derecha) → **"New repository"**
3. Configuración:
   - **Repository name:** `fraud-sentinel-ai`
   - **Description:** "Sistema de detección de fraude con Isolation Forest y MLOps"
   - **Visibility:** Public (o Private si prefieres)
   - ❌ **NO** marques "Add a README file" (ya tienes archivos)
4. Click **"Create repository"**

### Paso 2: Inicializar Git en tu Proyecto

Abre PowerShell en la carpeta del proyecto y ejecuta:

```powershell
# Inicializar repositorio Git
git init

# Agregar todos los archivos
git add .

# Hacer el primer commit
git commit -m "Initial commit: Fraud Sentinel AI with CI/CD"

# Cambiar la rama a 'main' (si es necesario)
git branch -M main

# Conectar con GitHub (reemplaza TU_USUARIO)
git remote add origin https://github.com/TU_USUARIO/fraud-sentinel-ai.git

# Subir el código
git push -u origin main
```

**⚠️ IMPORTANTE:** Reemplaza `TU_USUARIO` con tu nombre de usuario de GitHub.

**Si te pide credenciales:**
- Username: Tu usuario de GitHub
- Password: Usa un **Personal Access Token** (no tu contraseña)
  - Créalo en: Settings → Developer settings → Personal access tokens → Generate new token
  - Permisos necesarios: `repo` (Full control of private repositories)

---

## PARTE 2: CONFIGURAR GOOGLE CLOUD

### Paso 3: Crear Service Account (Cuenta de Servicio)

Una **Service Account** es como un "usuario robot" que GitHub usará para desplegar tu app.

```powershell
# 1. Autenticarte con Google Cloud
gcloud auth login

# 2. Configurar tu proyecto (reemplaza PROJECT_ID con el ID de tu proyecto)
gcloud config set project PROJECT_ID

# 3. Crear la Service Account
gcloud iam service-accounts create github-actions `
  --description="Service Account para GitHub Actions" `
  --display-name="GitHub Actions"

# 4. Darle permisos de App Engine Admin
gcloud projects add-iam-policy-binding PROJECT_ID `
  --member="serviceAccount:github-actions@PROJECT_ID.iam.gserviceaccount.com" `
  --role="roles/appengine.appAdmin"

# 5. Darle permisos de Storage Admin (para subir archivos)
gcloud projects add-iam-policy-binding PROJECT_ID `
  --member="serviceAccount:github-actions@PROJECT_ID.iam.gserviceaccount.com" `
  --role="roles/storage.admin"

# 6. Darle permisos de Service Account User
gcloud projects add-iam-policy-binding PROJECT_ID `
  --member="serviceAccount:github-actions@PROJECT_ID.iam.gserviceaccount.com" `
  --role="roles/iam.serviceAccountUser"

# 7. Crear una clave JSON (archivo de credenciales)
gcloud iam service-accounts keys create key.json `
  --iam-account=github-actions@PROJECT_ID.iam.gserviceaccount.com
```

**⚠️ IMPORTANTE:** Reemplaza `PROJECT_ID` con el ID de tu proyecto de Google Cloud.

Esto creará un archivo `key.json` en tu carpeta actual. **¡GUÁRDALO BIEN!**

---

## PARTE 3: CONFIGURAR SECRETS EN GITHUB

Los **Secrets** son variables secretas que GitHub guarda de forma segura.

### Paso 4: Agregar GCP_SA_KEY (Clave de Service Account)

1. Abre el archivo `key.json` con un editor de texto
2. Copia **TODO** el contenido (desde `{` hasta `}`)
3. Ve a tu repositorio en GitHub
4. Click en **"Settings"** (pestaña superior)
5. En el menú izquierdo: **"Secrets and variables"** → **"Actions"**
6. Click **"New repository secret"**
7. Configuración:
   - **Name:** `GCP_SA_KEY`
   - **Secret:** Pega el contenido completo de `key.json`
8. Click **"Add secret"**

### Paso 5: Agregar GCP_PROJECT_ID

1. En la misma página de Secrets
2. Click **"New repository secret"**
3. Configuración:
   - **Name:** `GCP_PROJECT_ID`
   - **Secret:** El ID de tu proyecto (ej: `fraud-sentinel-demo`)
4. Click **"Add secret"**

**✅ Deberías tener 2 secrets:**
- `GCP_SA_KEY`
- `GCP_PROJECT_ID`

---

## PARTE 4: ACTIVAR APP ENGINE

### Paso 6: Inicializar App Engine (Solo primera vez)

```powershell
# Crear la aplicación de App Engine
gcloud app create --region=us-central
```

**Nota:** Elige la región más cercana a ti (ej: `us-central`, `southamerica-east1`).

---

## PARTE 5: PROBAR EL CI/CD

### Paso 7: Hacer un Cambio y Ver la Magia ✨

1. Abre `templates/index.html`
2. Cambia algo pequeño (ej: el subtítulo)
3. Guarda el archivo
4. En PowerShell:

```powershell
git add .
git commit -m "Test: Cambio en el título"
git push
```

5. Ve a tu repositorio en GitHub
6. Click en la pestaña **"Actions"**
7. Verás el workflow ejecutándose en tiempo real:
   - 🟡 Amarillo = Ejecutando
   - ✅ Verde = Éxito
   - ❌ Rojo = Error

8. Si todo sale bien, en ~3-5 minutos tu app estará desplegada en:
   ```
   https://PROJECT_ID.appspot.com
   ```

---

## 🔍 VERIFICAR QUE TODO FUNCIONA

### Ver los Logs del Workflow

1. En GitHub → Actions
2. Click en el workflow que se ejecutó
3. Click en el job "🧪 Ejecutar Tests"
4. Verás la salida de pytest con todos los tests

### Ver los Logs de Google Cloud

```powershell
# Ver logs en tiempo real
gcloud app logs tail -s default

# Ver instancias activas
gcloud app instances list
```

---

## 🐛 TROUBLESHOOTING (Solución de Problemas)

### Error: "Authentication failed"
**Causa:** El secret `GCP_SA_KEY` está mal configurado.  
**Solución:** Verifica que copiaste TODO el contenido de `key.json` (incluyendo `{` y `}`).

### Error: "Permission denied"
**Causa:** La Service Account no tiene los permisos necesarios.  
**Solución:** Repite el Paso 3, asegurándote de dar los 3 roles.

### Error: "Tests failed"
**Causa:** Algún test en `test_app.py` está fallando.  
**Solución:** 
1. Ejecuta los tests localmente: `pytest test_app.py -v`
2. Arregla el error
3. Haz commit y push de nuevo

### El workflow no se ejecuta
**Causa:** El archivo `.github/workflows/ci-cd.yml` no está en la rama `main`.  
**Solución:** Verifica que hiciste `git add .` antes del commit.

---

## 📊 FLUJO COMPLETO (Resumen Visual)

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Haces cambio en el código                               │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. git add . && git commit -m "..." && git push            │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. GitHub detecta el push                                  │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. GitHub Actions ejecuta el workflow                      │
│    - Instala Python y dependencias                          │
│    - Ejecuta pytest                                         │
└─────────────────────────────────────────────────────────────┘
                        ↓
                   ¿Tests pasan?
                   /          \
                 ✅ SÍ        ❌ NO
                 /              \
┌─────────────────────┐   ┌─────────────────────┐
│ 5. Despliega a      │   │ 5. Te notifica      │
│    Google Cloud     │   │    el error         │
└─────────────────────┘   └─────────────────────┘
         ↓
┌─────────────────────────────────────────────────────────────┐
│ 6. App actualizada en https://PROJECT_ID.appspot.com       │
└─────────────────────────────────────────────────────────────┘
```

---

## ✅ CHECKLIST FINAL

- [ ] Repositorio creado en GitHub
- [ ] Código subido con `git push`
- [ ] Service Account creada en Google Cloud
- [ ] `key.json` descargado
- [ ] Secret `GCP_SA_KEY` configurado en GitHub
- [ ] Secret `GCP_PROJECT_ID` configurado en GitHub
- [ ] App Engine inicializado
- [ ] Primer despliegue exitoso
- [ ] Workflow de GitHub Actions ejecutándose correctamente

---

## 🎉 ¡FELICIDADES!

Ahora tienes un pipeline de CI/CD completamente funcional. Cada vez que hagas `git push`, tu código:

1. ✅ Se probará automáticamente
2. ✅ Se desplegará automáticamente (si los tests pasan)
3. ✅ Estará disponible en internet en minutos

**Esto es MLOps de nivel profesional.** 🚀
