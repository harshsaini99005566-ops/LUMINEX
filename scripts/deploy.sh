#!/bin/bash

# Deployment Script
# Handles production deployment

set -e

echo "Deploying AutoDM SaaS..."

# Build backend
echo "Building backend..."
cd backend
npm run build
cd ..

# Build frontend
echo "Building frontend..."
cd frontend
npm run build
cd ..

# Deploy containers
echo "Deploying Docker containers..."
docker-compose -f docker/docker-compose.yml up -d

echo "Deployment complete!"
