#!/bin/bash
# -----------------------------------------------------------------------------
# NexusAI - Google Cloud Run One-Click Deployment Script
# -----------------------------------------------------------------------------
set -e

# Configuration
SERVICE_NAME="nexusai"
REGION="${GCP_REGION:-us-central1}"
PROJECT_ID="${GCP_PROJECT_ID:-$(gcloud config get-value project)}"

echo "======================================================="
echo " Deploying NexusAI to Google Cloud Run"
echo " Project: $PROJECT_ID"
echo " Region:  $REGION"
echo " Service: $SERVICE_NAME"
echo "======================================================="

# Verify gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo "Error: gcloud CLI is not installed. Please install Google Cloud SDK."
    exit 1
fi

# 1. Enable required Google Cloud APIs
echo "Enabling Cloud Run, Artifact Registry, and Cloud Build APIs..."
gcloud services enable run.googleapis.com \
    cloudbuild.googleapis.com \
    artifactregistry.googleapis.com \
    --project="$PROJECT_ID"

# 2. Deploy directly from source to Cloud Run
echo "Building container and deploying to Cloud Run..."
gcloud run deploy "$SERVICE_NAME" \
    --source . \
    --project="$PROJECT_ID" \
    --region="$REGION" \
    --platform=managed \
    --allow-unauthenticated \
    --port=8080 \
    --memory=1Gi \
    --cpu=1 \
    --min-instances=0 \
    --max-instances=10 \
    --set-env-vars="NODE_ENV=production"

echo ""
echo "======================================================="
echo " Deployment Complete!"
echo " Your app is live on Google Cloud Run!"
echo " Run: gcloud run services describe $SERVICE_NAME --region=$REGION --format='value(status.url)'"
echo "======================================================="
