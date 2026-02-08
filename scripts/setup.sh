#!/bin/bash

# Setup Script for AutoDM SaaS
# Initializes the development environment

set -e

echo "Setting up AutoDM SaaS..."

# Install backend dependencies
echo "Installing backend dependencies..."
cd backend
npm install
cd ..

# Install frontend dependencies
echo "Installing frontend dependencies..."
cd frontend
npm install
cd ..

echo "Setup complete! Run 'npm run dev' in each folder to start development."
