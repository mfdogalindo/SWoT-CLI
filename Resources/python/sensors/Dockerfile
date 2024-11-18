FROM python:3.11-slim as builder

# Establecer variables de entorno
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

# Crear usuario no root
RUN groupadd -r sensor && useradd -r -g sensor sensor

# Crear y establecer el directorio de trabajo
WORKDIR /app

# Copiar archivos de requisitos
COPY requirements.txt .

# Instalar dependencias
RUN pip install --no-cache-dir -r requirements.txt

# Copiar el código fuente
COPY src/ ./src/
COPY setup.py .

# Instalar la aplicación
RUN pip install --no-cache-dir -e .

# Cambiar al usuario no root
USER sensor

# Comando por defecto
CMD ["python", "-m", "main"]