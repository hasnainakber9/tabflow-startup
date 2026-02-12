#!/bin/bash

# TabFlow Deployment Script
# This script automates the deployment of both extension and backend

set -e  # Exit on error

echo "⚡ TabFlow Deployment Script"
echo "============================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "README.md" ]; then
    echo -e "${RED}Error: Please run this script from the project root directory${NC}"
    exit 1
fi

echo "What would you like to deploy?"
echo "1) Extension only"
echo "2) Backend API only"
echo "3) Both extension and backend"
read -p "Enter your choice (1-3): " choice

echo ""

# Function to zip extension for Chrome Web Store
zip_extension() {
    echo -e "${YELLOW}Preparing extension package...${NC}"
    
    cd extension
    
    # Remove any existing zip
    rm -f tabflow-extension.zip
    
    # Create zip excluding unnecessary files
    zip -r tabflow-extension.zip . \
        -x "*.git*" \
        -x "*.DS_Store" \
        -x "node_modules/*" \
        -x "*.log"
    
    echo -e "${GREEN}✓ Extension packaged: extension/tabflow-extension.zip${NC}"
    echo "Upload this file to Chrome Web Store Developer Dashboard"
    echo "https://chrome.google.com/webstore/devconsole"
    
    cd ..
}

# Function to deploy backend to Vercel
deploy_backend() {
    echo -e "${YELLOW}Deploying backend to Vercel...${NC}"
    
    # Check if Vercel CLI is installed
    if ! command -v vercel &> /dev/null; then
        echo -e "${RED}Vercel CLI not found. Installing...${NC}"
        npm install -g vercel
    fi
    
    cd api
    
    # Check if dependencies are installed
    if [ ! -d "node_modules" ]; then
        echo "Installing dependencies..."
        npm install
    fi
    
    # Deploy to production
    echo "Deploying to Vercel..."
    vercel --prod
    
    echo -e "${GREEN}✓ Backend deployed successfully!${NC}"
    echo "Don't forget to set environment variables in Vercel dashboard:"
    echo "- MONGODB_URI"
    echo "- JWT_SECRET"
    
    cd ..
}

# Execute based on choice
case $choice in
    1)
        zip_extension
        ;;
    2)
        deploy_backend
        ;;
    3)
        zip_extension
        echo ""
        deploy_backend
        ;;
    *)
        echo -e "${RED}Invalid choice${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}=============================${NC}"
echo -e "${GREEN}✓ Deployment complete!${NC}"
echo -e "${GREEN}=============================${NC}"
echo ""
echo "Next steps:"
echo "1. Test the deployed version"
echo "2. Update version number in manifest.json"
echo "3. Create a git tag: git tag v1.0.0"
echo "4. Push tag: git push origin v1.0.0"
echo "5. Create GitHub release with changelog"
echo ""