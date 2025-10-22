# Use Debian-based Node.js image
FROM node:20-bullseye

# Set the working directory
WORKDIR /app

# Copy the application build code
COPY build /app/

# Expose ports
EXPOSE 40143

# Start the application
CMD ["node", "server.js"]
