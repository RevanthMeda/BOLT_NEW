# Stage 1: Build Stage
FROM node:18-slim AS build
WORKDIR /app

# Install OpenSSL for Prisma
RUN apt-get update && apt-get install -y openssl

# Copy all necessary package files and the prisma schema
COPY server/package.json server/package-lock.json ./server/
COPY prisma ./prisma/

# Install ALL dependencies (dev and production) needed for the build
RUN cd server && npm install

# Copy the rest of the source code
COPY . .

# Generate Prisma Client and then build the TypeScript project
RUN cd server && npx prisma generate --schema=../prisma/schema.prisma
RUN cd server && npm run build

# Prune development dependencies
RUN cd server && npm prune --production

# Stage 2: Final Production Image
FROM node:18-slim AS production
WORKDIR /app
ENV NODE_ENV=production

# Install OpenSSL for Prisma runtime
RUN apt-get update && apt-get install -y openssl

# Copy pruned production node_modules from the build stage
COPY --from=build /app/server/node_modules ./server/node_modules

# Copy the built code from the build stage
COPY --from=build /app/server/dist ./server/dist

# Copy Prisma schema and the server's package.json
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/server/package.json ./server/

# Create uploads directory
RUN mkdir -p uploads logs

EXPOSE 3001
WORKDIR /app/server
CMD ["npm", "run", "start"]