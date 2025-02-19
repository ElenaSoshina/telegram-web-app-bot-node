FROM node:14

# Устанавливаем рабочую директорию в контейнере
WORKDIR /app

# Копируем package.json и package-lock.json для установки зависимостей
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем оставшиеся файлы проекта
COPY . .

# Открываем порт, если он необходим (необязательно для Telegram бота)
EXPOSE 8001

# Указываем команду для запуска бота
CMD ["node", "index.js"]
