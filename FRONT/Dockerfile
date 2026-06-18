# Use an official Node.js runtime as a parent image
FROM node:20-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock)
COPY package*.json ./

# Install project dependencies
RUN npm install

# Copy the rest of the application's source code from the host to the container
COPY . .

# Make port 5173 available to the world outside this container
EXPOSE 5173

# The command to run the app will be provided by docker-compose
# But a default is useful:
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
