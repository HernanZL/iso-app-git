# 🕵️ FRAUD SENTINEL AI

Sistema de detección de fraude en tiempo real utilizando **Isolation Forest** con interfaz web interactiva y pipeline de MLOps completo.

![Status](https://img.shields.io/badge/status-production-green)
![Python](https://img.shields.io/badge/python-3.10-blue)
![License](https://img.shields.io/badge/license-MIT-blue)

---

## 🎯 Características

### 🤖 Machine Learning
- **Modelo:** Isolation Forest (Aprendizaje No Supervisado)
- **Dataset:** Credit Card Fraud Detection
- **Métricas:** Silhouette Score, Anomaly Detection Rate
- **Optimización:** Hiperparámetros ajustados para máxima precisión

### 🎨 Interfaz Visual
- **Diseño:** Matte Black Monochromatic (Tema oscuro profesional)
- **Interactividad:** Drag & Drop para analizar transacciones
- **Visualizaciones:**
  - Cámara de Aislamiento (animación del algoritmo)
  - Radar Chart (comparación de features)
  - Histograma de distribución de scores
- **Feed en Vivo:** Simulación de transacciones entrantes cada 6 segundos

### 🔄 MLOps (CI/CD)
- **Tests Automatizados:** 8 tests unitarios y de integración con pytest
- **GitHub Actions:** Pipeline de CI/CD automático
- **Despliegue Continuo:** Auto-deploy a Google Cloud App Engine
- **Monitoreo:** Logs y métricas en tiempo real

---

## 🚀 Quick Start

### Instalación Local

```bash
# Clonar el repositorio
git clone https://github.com/TU_USUARIO/fraud-sentinel-ai.git
cd fraud-sentinel-ai

# Instalar dependencias
pip install -r requirements.txt

# Ejecutar la aplicación
python app.py
```

Abre tu navegador en: `http://localhost:8080`

### Ejecutar Tests

```bash
pytest test_app.py -v
```

---

## 📁 Estructura del Proyecto

```
fraud-sentinel-ai/
├── app.py                          # Backend Flask
├── modelo_iforest_fraude.joblib    # Modelo ML entrenado
├── test_app.py                     # Tests automatizados
├── requirements.txt                # Dependencias Python
├── app.yaml                        # Configuración Google Cloud
├── .github/
│   └── workflows/
│       └── ci-cd.yml              # Pipeline CI/CD
├── static/
│   ├── casos.json                 # Dataset de casos de prueba
│   ├── script.js                  # Lógica frontend
│   └── style.css                  # Estilos (Matte Black)
├── templates/
│   └── index.html                 # Interfaz principal
└── docs/
    ├── MLOPS_GUIDE.md             # Guía completa de MLOps
    ├── GITHUB_SETUP.md            # Configuración paso a paso
    └── guide_to_gcloud.txt        # Despliegue a Google Cloud
```

---

## 🛠️ Tecnologías

| Categoría | Tecnología |
|-----------|-----------|
| **Backend** | Flask, Python 3.10 |
| **ML** | scikit-learn, NumPy, joblib |
| **Frontend** | HTML5, CSS3, JavaScript (Vanilla) |
| **Visualización** | Chart.js |
| **Testing** | pytest |
| **CI/CD** | GitHub Actions |
| **Cloud** | Google Cloud App Engine |
| **Servidor** | gunicorn |

---

## 📊 Pipeline de MLOps

```
┌─────────────────┐
│ 1. Desarrollo   │  → Código en local
└─────────────────┘
        ↓
┌─────────────────┐
│ 2. Git Push     │  → Subir a GitHub
└─────────────────┘
        ↓
┌─────────────────┐
│ 3. Tests Auto   │  → pytest en GitHub Actions
└─────────────────┘
        ↓
    ¿Pasan?
    /     \
  ✅ SÍ   ❌ NO
  /         \
┌─────────────────┐  ┌─────────────────┐
│ 4. Deploy Auto  │  │ 4. Notificar    │
│    a GCloud     │  │    Error        │
└─────────────────┘  └─────────────────┘
        ↓
┌─────────────────┐
│ 5. Producción   │  → App en la nube
└─────────────────┘
```

---

## 🎓 Documentación

- **[MLOPS_GUIDE.md](MLOPS_GUIDE.md):** Explicación completa de todos los conceptos de MLOps
- **[GITHUB_SETUP.md](GITHUB_SETUP.md):** Guía paso a paso para configurar CI/CD
- **[guide_to_gcloud.txt](guide_to_gcloud.txt):** Comandos para desplegar a Google Cloud

---

## 🧪 Tests

El proyecto incluye 8 tests automatizados:

1. ✅ Verificación de carga del modelo
2. ✅ Página principal carga correctamente
3. ✅ Endpoint `/distribution` funciona
4. ✅ Predicción de transacción normal
5. ✅ Predicción de transacción anómala
6. ✅ Manejo de datos inválidos
7. ✅ Funcionalidad del umbral de sensibilidad
8. ✅ Velocidad de predicción (<1s)

**Ejecutar:** `pytest test_app.py -v`

---

## 🌐 Despliegue

### Render.com (Gratis y Fácil)

```bash
# 1. Sube tu código a GitHub
git push origin main

# 2. Conecta Render con tu repositorio
# (Ver RENDER_DEPLOYMENT.md para guía completa)

# 3. ¡Listo! Tu app estará en:
# https://fraud-sentinel-ai.onrender.com
```

**Guía completa:** Ver [RENDER_DEPLOYMENT.md](RENDER_DEPLOYMENT.md)

---

## 📈 Roadmap

- [x] Modelo de Isolation Forest entrenado
- [x] Interfaz web interactiva
- [x] Tests automatizados
- [x] Pipeline CI/CD con GitHub Actions
- [x] Despliegue a Google Cloud
- [ ] Monitoreo de drift del modelo
- [ ] Re-entrenamiento automático
- [ ] API REST documentada con Swagger
- [ ] Dashboard de métricas en tiempo real

---

## 👨‍💻 Autor

**Tu Nombre**  
Proyecto de MLOps - Detección de Fraude con Aprendizaje No Supervisado

---

## 📄 Licencia

MIT License - Ver [LICENSE](LICENSE) para más detalles

---

## 🙏 Agradecimientos

- Dataset: [Credit Card Fraud Detection](https://www.kaggle.com/mlg-ulb/creditcardfraud)
- Inspiración: Proyectos de MLOps de la comunidad

---

**⭐ Si te gustó este proyecto, dale una estrella en GitHub!**
