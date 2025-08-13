# server/Dockerfile

# ---- Base Stage ----
FROM node:18-alpine AS base
WORKDIR /app
# Copy package files from the server directory
COPY server/package*.json ./
# Copy the prisma directory from the root
COPY prisma ./prisma/

# ---- Dependencies Stage ----
FROM base AS dependencies
RUN npm ci

# ---- Build Stage ----
FROM dependencies AS build
# Copy the server source code
COPY server/. .
RUN npx prisma generate --schema=./prisma/schema.prisma
RUN npm run build

# ---- Production Stage ----
FROM node:18-alpine AS production
WORKDIR /app
ENV NODE_ENV=production

COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
# The schema is needed for the prisma client in production
COPY --from=build /app/prisma ./prisma

# Create uploads directory
RUN mkdir -p uploads logs

EXPOSE 3001

# Start the application
CMD ["npm", "run", "start"]