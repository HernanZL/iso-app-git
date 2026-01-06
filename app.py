from flask import Flask, render_template, request, jsonify
import joblib
import numpy as np
import json

app = Flask(__name__)

# Carga robusta del modelo
try:
    model = joblib.load('modelo_iforest_fraude.joblib')
except:
    print("Error: No se encontró el archivo .joblib")

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/predict', methods=['POST'])
def predict():
    data = request.json
    features = np.array(data['features']).reshape(1, -1)
    
    # Sensibilidad personalizada: 
    # El modelo por defecto usa un umbral. Aquí obtenemos el score de anomalía.
    # Scores más bajos = más anómalo.
    score = model.decision_function(features)[0]
    
    # El usuario envía un umbral desde la web (slider)
    threshold = float(data.get('threshold', 0)) 
    
    # Decisión basada en score vs umbral de sensibilidad
    is_anomaly = score < threshold 

    return jsonify({
        'prediction': -1 if is_anomaly else 1,
        'score': round(float(score), 4),
        'confidence': f"{abs(score)*100:.2f}%",
        'is_anomaly': bool(is_anomaly)
    })

@app.route('/distribution')
def distribution():
    # Didactic: Generate a distribution that looks like typical Isolation Forest scores
    # Normal data usually clusters around positive values (e.g., 0.1 to 0.2)
    # Anomalies are negative (e.g., -0.1 to -0.3)
    
    # Simulate 1000 normal points
    normal = np.random.normal(loc=0.15, scale=0.05, size=800)
    # Simulate 50 anomalies
    anomalies = np.random.normal(loc=-0.15, scale=0.08, size=50)
    
    data = np.concatenate([normal, anomalies])
    data = np.clip(data, -0.5, 0.5) # Clip to match our slider range
    
    # Create histogram bins
    counts, bin_edges = np.histogram(data, bins=50, range=(-0.5, 0.5))
    
    return jsonify({
        'labels': [round(x, 2) for x in bin_edges[:-1]],
        'data': counts.tolist()
    })

import os

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8080))
    app.run(host='0.0.0.0', port=port, debug=True)