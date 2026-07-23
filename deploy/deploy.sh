#!/usr/bin/env bash
set -euo pipefail

# ── Configuration ─────────────────────────────────────────────
PROJECT_ID="${GCP_PROJECT_ID:-}"
SERVICE_NAME="${CLOUD_RUN_SERVICE:-ifc-prototype}"
REGION="${CLOUD_RUN_REGION:-asia-south2}"
API_BACKEND_URL="${API_BACKEND_URL:-https://ifc-datacommons-web-service-1052341507045.asia-south2.run.app}"
# ──────────────────────────────────────────────────────────────

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

info()  { echo -e "${GREEN}[INFO]${NC}  $*"; }
warn()  { echo -e "${YELLOW}[WARN]${NC}  $*"; }
error() { echo -e "${RED}[ERROR]${NC} $*"; exit 1; }

# ── Preflight checks ─────────────────────────────────────────
command -v gcloud >/dev/null 2>&1 || error "gcloud CLI not found. Install it from https://cloud.google.com/sdk/docs/install"

if [ -z "$PROJECT_ID" ]; then
    PROJECT_ID="$(gcloud config get-value project 2>/dev/null)"
    [ -z "$PROJECT_ID" ] && error "No GCP project set. Run: gcloud config set project <PROJECT_ID>  or export GCP_PROJECT_ID=<PROJECT_ID>"
fi

info "Project:  $PROJECT_ID"
info "Service:  $SERVICE_NAME"
info "Region:   $REGION"
echo ""

# ── Enable required APIs ─────────────────────────────────────
info "Enabling required APIs..."
gcloud services enable \
    cloudbuild.googleapis.com \
    run.googleapis.com \
    artifactregistry.googleapis.com \
    --project="$PROJECT_ID" --quiet

# ── Ensure Artifact Registry repo exists ─────────────────────
AR_REPO="cloud-run-builds"
AR_HOST="${REGION}-docker.pkg.dev"
IMAGE="${AR_HOST}/${PROJECT_ID}/${AR_REPO}/${SERVICE_NAME}"

info "Ensuring Artifact Registry repository exists..."
gcloud artifacts repositories describe "$AR_REPO" \
    --location="$REGION" \
    --project="$PROJECT_ID" >/dev/null 2>&1 || \
gcloud artifacts repositories create "$AR_REPO" \
    --repository-format=docker \
    --location="$REGION" \
    --project="$PROJECT_ID" \
    --quiet

# ── Build & deploy with Cloud Build ──────────────────────────
info "Building container image with Cloud Build..."
gcloud builds submit "$ROOT_DIR" \
    --config="$SCRIPT_DIR/cloudbuild.yaml" \
    --substitutions="_IMAGE=$IMAGE" \
    --project="$PROJECT_ID" \
    --quiet

info "Deploying to Cloud Run..."
gcloud run deploy "$SERVICE_NAME" \
    --image "$IMAGE" \
    --platform managed \
    --region "$REGION" \
    --port 8080 \
    --set-env-vars="API_BACKEND_URL=$API_BACKEND_URL" \
    --allow-unauthenticated \
    --project="$PROJECT_ID" \
    --quiet

# ── Done ──────────────────────────────────────────────────────
URL="$(gcloud run services describe "$SERVICE_NAME" --region="$REGION" --project="$PROJECT_ID" --format='value(status.url)')"
echo ""
info "Deployed successfully!"
info "URL: $URL"
