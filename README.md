# Dashboard online para Xiaomi Smart Band 10

Este proyecto crea un **dashboard web** para visualizar datos de tu pulsera (pasos, frecuencia cardiaca, calorías y sueño).

## 1) Cómo sacar datos de la Smart Band 10

Xiaomi no ofrece una API pública oficial para extraer todos los datos históricos directamente desde Zepp Life/Mi Fitness.
La forma más práctica es:

1. Instalar **Gadgetbridge** en Android.
2. Conectar la Smart Band 10 a Gadgetbridge.
3. Exportar datos a CSV.
4. Reemplazar el archivo `data/sample_band_data.csv` por tu exportación (mismo formato de columnas).

Columnas esperadas:

- `timestamp` (ISO 8601, ejemplo `2026-02-15T17:00:00`)
- `steps`
- `heart_rate`
- `calories`
- `sleep_minutes`

## 2) Ejecutar vista previa (sin dependencias externas)

```bash
python server.py
```

Abre: `http://localhost:8000`

> Esta opción usa solo librerías estándar de Python, por lo que funciona incluso en entornos sin acceso a internet.

## 3) Ejecutar tests

```bash
python -m pip install -r requirements.txt
python -m pytest -q
```

## 4) Publicar online rápido

Puedes desplegar en Render/Railway/Fly.io usando este mismo repo.

Ejemplo con Render:

- Build command: `pip install -r requirements.txt`
- Start command: `python server.py`

## 5) Endpoints API

- `GET /api/summary`
- `GET /api/daily`

Así puedes conectar luego un front más avanzado (React/Next.js/Grafana, etc.).
