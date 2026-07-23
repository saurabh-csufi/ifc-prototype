# IFC State Profile Dashboard

A React + TypeScript dashboard for exploring education indicators across Indian states, powered by [Data Commons](https://datacommons.org/) APIs. Features interactive charts (bar, grouped bar, stacked bar, dumbbell) and an AI chatbot assistant backed by Gemini.

## Tech Stack

- **Frontend:** React 19, TypeScript, Vite
- **Charts:** D3.js
- **AI Chatbot:** Google Gemini (`@google/genai`)
- **Deployment:** Google Cloud Run + nginx

## Prerequisites

- [Node.js](https://nodejs.org/) v22+
- npm (comes with Node.js)

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure the backend API

In development, Vite proxies `/api` requests to a local backend. Update `vite.config.ts` if your backend runs on a different port:

```ts
proxy: {
  '/api': {
    target: 'http://localhost:8080',  // your Data Commons API
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/api/, '/core/api/v2'),
  },
},
```

### 3. Configure the chatbot (optional)

Edit `public/config.json` to enable the Gemini-powered chatbot:

```json
{
  "chatbotEnabled": true,
  "geminiApiKey": "YOUR_GEMINI_API_KEY",
  "geminiModel": "gemini-2.5-flash"
}
```

### 4. Start the dev server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

### 5. Other commands

| Command | Description |
|---------|-------------|
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Lint with Oxlint |

## Project Structure

```
src/
  components/     # UI components (charts, selectors, chat)
  config/         # Indicator definitions, state lists
  context/        # React context (dashboard state)
  hooks/          # Custom React hooks
  services/       # API clients (Data Commons, Gemini chat agent)
  types/          # TypeScript type definitions
  utils/          # Utility functions
public/
  config.json     # Runtime config (chatbot settings)
deploy/
  Dockerfile      # Multi-stage build (node build + nginx serve)
  nginx.conf      # nginx config with API reverse proxy
  cloudbuild.yaml # Cloud Build config
  deploy.sh       # One-command deploy script
```

## Deploying to Cloud Run

The `deploy/` folder contains everything needed to deploy to Google Cloud Run with a single command.

### Prerequisites

1. [Google Cloud SDK](https://cloud.google.com/sdk/docs/install) (`gcloud` CLI) installed
2. Authenticated: `gcloud auth login`
3. A GCP project with billing enabled

### IAM Permissions

The deploying user needs these roles on the GCP project:

| Role | Purpose |
|------|---------|
| `roles/cloudbuild.builds.editor` | Submit Cloud Build jobs |
| `roles/run.admin` | Deploy Cloud Run services |
| `roles/storage.objectAdmin` | Upload build sources to GCS |
| `roles/artifactregistry.writer` | Push container images |
| `roles/iam.serviceAccountUser` | Act as the Cloud Run service account |

The **Cloud Build service account** (`<PROJECT_NUMBER>-compute@developer.gserviceaccount.com`) also needs:

| Role | Purpose |
|------|---------|
| `roles/storage.objectAdmin` | Read/write build sources |
| `roles/artifactregistry.writer` | Push images to Artifact Registry |

Grant permissions with:

```bash
# For your user account
gcloud projects add-iam-policy-binding PROJECT_ID --member=user:YOU@DOMAIN.COM --role=roles/cloudbuild.builds.editor
gcloud projects add-iam-policy-binding PROJECT_ID --member=user:YOU@DOMAIN.COM --role=roles/run.admin
gcloud projects add-iam-policy-binding PROJECT_ID --member=user:YOU@DOMAIN.COM --role=roles/storage.objectAdmin
gcloud projects add-iam-policy-binding PROJECT_ID --member=user:YOU@DOMAIN.COM --role=roles/iam.serviceAccountUser

# For the Cloud Build service account
gcloud projects add-iam-policy-binding PROJECT_ID --member=serviceAccount:PROJECT_NUMBER-compute@developer.gserviceaccount.com --role=roles/storage.objectAdmin
gcloud projects add-iam-policy-binding PROJECT_ID --member=serviceAccount:PROJECT_NUMBER-compute@developer.gserviceaccount.com --role=roles/artifactregistry.writer
```

### Deploy

```bash
./deploy/deploy.sh
```

The script will:
1. Enable required GCP APIs (Cloud Build, Cloud Run, Artifact Registry)
2. Create an Artifact Registry Docker repository (if it doesn't exist)
3. Build the container image via Cloud Build
4. Deploy to Cloud Run with public access
5. Print the live URL

### Configuration

Override defaults with environment variables:

| Variable | Default | Description |
|----------|---------|-------------|
| `GCP_PROJECT_ID` | Current `gcloud` project | GCP project to deploy to |
| `CLOUD_RUN_SERVICE` | `ifc-prototype` | Cloud Run service name |
| `CLOUD_RUN_REGION` | `asia-south2` | GCP region |
| `API_BACKEND_URL` | `https://ifc-datacommons-web-service-...` | Data Commons API backend URL |

Example:

```bash
CLOUD_RUN_REGION=us-central1 ./deploy/deploy.sh
```

### How It Works

The deployment uses a multi-stage Docker build:

1. **Build stage** - Node.js compiles TypeScript and bundles the app with Vite
2. **Serve stage** - nginx serves the static files and reverse-proxies `/api` requests to the Data Commons backend

The `API_BACKEND_URL` environment variable is injected into the nginx config at container startup using nginx's `envsubst` templating.
