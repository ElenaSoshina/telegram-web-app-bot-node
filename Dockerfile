FROM node:14

# Устанавливаем рабочую директорию в контейнере
WORKDIR /app

# Копируем package.json и package-lock.json для установки зависимостей
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем оставшиеся файлы проекта
COPY . .

# Копируем SSL-сертификаты в контейнер
COPY server.key server.cert /app/

# Открываем порт 8010
EXPOSE 8020

# Указываем команду для запуска бота
CMD ["node", "index.js"]
