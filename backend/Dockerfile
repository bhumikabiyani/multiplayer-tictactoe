# Use Ubuntu as base image for Nakama compatibility
FROM ubuntu:22.04

# Install dependencies
RUN apt-get update && apt-get install -y \
    curl \
    ca-certificates \
    gettext-base \
    && rm -rf /var/lib/apt/lists/*

# Download and install Nakama
RUN curl -L "https://github.com/heroiclabs/nakama/releases/download/v3.21.1/nakama-3.21.1-linux-amd64.tar.gz" \
    | tar -xzC /usr/local/bin/ \
    && chmod +x /usr/local/bin/nakama

# Create app directory
WORKDIR /app

# Copy configuration and modules
COPY nakama-config-render.yml ./nakama-config-template.yml
COPY modules/ ./modules/

# Create data directory
RUN mkdir -p ./data

# Expose ports
EXPOSE 7350 7351

# Create startup script
RUN echo '#!/bin/bash' > start.sh && \
    echo 'envsubst < nakama-config-template.yml > nakama-config.yml' >> start.sh && \
    echo 'exec nakama --config nakama-config.yml' >> start.sh && \
    chmod +x start.sh

# Start Nakama server
CMD ["./start.sh"]