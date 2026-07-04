# Use an official Node runtime as the base image
FROM node:20-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json first to leverage Docker cache
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application code
COPY . .

# Build the full-stack application (frontend + backend)
RUN npm run build

# Expose the port the app runs on (AI Studio default is 3000)
EXPOSE 3000

# Command to run the application
CMD ["npm", "start"]
