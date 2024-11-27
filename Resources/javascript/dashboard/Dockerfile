FROM node:23.3.0-alpine3.20

# Establecer el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar todo el código fuente al contenedor
COPY . .

# Establecer la variable de entorno para producción
ENV NODE_ENV=production

# Construir la aplicación
RUN npm run build

# Exponer el puerto que usará la aplicación
EXPOSE 3010

# Comando para ejecutar la aplicación
CMD ["npm", "run", "start"]