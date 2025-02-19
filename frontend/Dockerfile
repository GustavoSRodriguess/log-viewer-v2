FROM node:18-alpine

WORKDIR /app

# Copie os arquivos de configuração primeiro
COPY package*.json ./
COPY postcss.config.cjs ./
COPY tailwind.config.js ./
COPY vite.config.js ./

# Instale as dependências
RUN npm install

# Depois copie o resto dos arquivos
COPY . .

EXPOSE 3000

ENV HOST=0.0.0.0
ENV PORT=3000

CMD ["npm", "run", "dev"]