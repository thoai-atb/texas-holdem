# Use Debian-based Node.js image
FROM node:20-bullseye

# Install required packages
RUN apt-get update && apt-get install -y \
    git vim iproute2 iputils-ping netcat \
    && rm -rf /var/lib/apt/lists/*

# Set the working directory
WORKDIR /app

# Install react-scripts globally
RUN npm install -g react-scripts

# Clone the Texas Hold'em repository
RUN git clone https://github.com/thoai-atb/texas-holdem.git

# Replace package.json with package.linux.json from the build folder
COPY package.linux.json /app/texas-holdem/package.json

# Set the working directory
WORKDIR /app/texas-holdem

# Install dependencies and build the project
RUN npm run install-deps && npm run build

# Set executable permission for start.sh
RUN chmod +x /app/texas-holdem/build/start.sh

# Expose ports
EXPOSE 40143

# Start the application from the build directory
WORKDIR /app/texas-holdem/build
CMD ["./start.sh"]
