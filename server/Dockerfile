# server/Dockerfile

# ---- Base ----
# Use the 'slim' variant for better compatibility with Prisma
FROM node:18-slim AS base
WORKDIR /app

# ---- Dependencies ----
# Copy all necessary package files and the prisma schema
COPY server/package.json server/package-lock.json ./server/
COPY prisma ./prisma/

# Install ALL dependencies (dev and production) needed for the build
RUN cd server && npm install

# ---- Build ----
# Copy the rest of the source code
COPY . .

# Generate Prisma Client and then build the TypeScript project
RUN cd server && npx prisma generate --schema=../prisma/schema.prisma
RUN cd server && npm run build

# ---- Prune Dev Dependencies ---
# Remove development dependencies to create a smaller production image
RUN cd server && npm prune --production

# ---- Final Production Image ----
FROM node:18-slim AS production
WORKDIR /app
ENV NODE_ENV=production

# Copy built code and production node_modules from the previous stage
COPY --from=build /app/server/dist ./server/dist
COPY --from=build /app/server/node_modules ./server/node_modules
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/server/package.json ./server/

# Create uploads directory
RUN mkdir -p uploads logs

EXPOSE 3001
WORKDIR /app/server
CMD ["npm", "run", "start"]