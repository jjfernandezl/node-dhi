
# Use the official Node.js runtime as base image
FROM node:24.10.0

# Set the working directory in the container
WORKDIR /app

# Copy the application file
COPY app.js .

# Expose the port the app runs on
EXPOSE 3000

# Command to run the application
CMD ["node", "app.js"]