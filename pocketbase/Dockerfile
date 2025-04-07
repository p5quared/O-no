FROM alpine:latest

ARG PB_VERSION=0.26.6

# Install required packages
RUN apk add --no-cache \
    unzip \
    ca-certificates \
    wget \
    bash

# Download and unzip PocketBase
RUN wget https://github.com/pocketbase/pocketbase/releases/download/v${PB_VERSION}/pocketbase_${PB_VERSION}_linux_amd64.zip \
    && unzip pocketbase_${PB_VERSION}_linux_amd64.zip \
    && rm pocketbase_${PB_VERSION}_linux_amd64.zip \
    && chmod +x /pocketbase

# Create directory for PocketBase data
RUN mkdir -p /pb_data /pb_public /pb_migrations

# Create startup script
COPY start-pocketbase.sh /start-pocketbase.sh
RUN chmod +x /start-pocketbase.sh

# Set working directory
WORKDIR /

# Expose the PocketBase port
EXPOSE 8090

# Start PocketBase with our custom script
CMD ["/start-pocketbase.sh"]
