FROM node:22-slim AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install --no-audit --no-fund

FROM node:22-slim AS runner
WORKDIR /app
ENV NODE_ENV=development
COPY --from=deps /app/node_modules ./node_modules
COPY . .
EXPOSE 3000

# Dev server rather than a production build: the demo stack is for looking at the app and
# changing it, and `next build` would need the API reachable at build time to statically
# generate the job pages.
CMD ["npm", "run", "dev", "--", "--hostname", "0.0.0.0"]
