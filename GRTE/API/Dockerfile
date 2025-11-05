FROM node:20.19-alpine

WORKDIR /app

# Copy package manifests first to install dependencies
COPY package.json package-lock.json ./

# For development we want devDependencies (nodemon)
RUN npm ci

# Copy app
COPY . .

ENV PORT=3456
EXPOSE 3456

# Default to dev so docker-compose can run nodemon; override in production if needed
CMD ["npm", "run", "dev"]
