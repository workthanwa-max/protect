# Backend image for Node + SQLite
FROM node:18-alpine

WORKDIR /usr/src/app

# Install dependencies first (package.json may have prod and dev deps)
COPY package.json package-lock.json* ./
RUN npm install --production || npm install

# Copy source
COPY . .

# Ensure DB file directory exists
RUN mkdir -p /data

# Expose port
EXPOSE 4000

ENV PORT=4000
# If you want the DB file in a separate path inside the container, set DB_FILE env
ENV DB_FILE=/data/data.sqlite

CMD ["node", "server.js"]
