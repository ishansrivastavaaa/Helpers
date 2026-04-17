FROM node:20-alpine

# Use production environment
ENV NODE_ENV=production

# Expose port and disable vite HMR
ENV PORT=3000
ENV DISABLE_HMR=true

# Add bash and other debug tools if needed
RUN apk add --no-cache bash

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --omit=dev && npm install -g typescript tsx
# Ensure all dev dependencies (like vite) are installed to build the frontend
RUN npm ci

# Copy the rest of the application
COPY . .

# Build the frontend assets
RUN npm run build

# Start the application
CMD ["npm", "run", "start"]
