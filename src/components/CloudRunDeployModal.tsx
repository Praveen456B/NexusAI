import React, { useState } from 'react';
import { 
  X, 
  Cloud, 
  Terminal, 
  Copy, 
  Check, 
  ExternalLink, 
  Server, 
  Cpu, 
  ShieldCheck, 
  Download,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

interface CloudRunDeployModalProps {
  onClose: () => void;
}

export const CloudRunDeployModal: React.FC<CloudRunDeployModalProps> = ({ onClose }) => {
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'quick' | 'dockerfile' | 'build'>('quick');

  const gcloudDeployCommand = `gcloud run deploy nexusai \\
  --source . \\
  --region us-central1 \\
  --platform managed \\
  --allow-unauthenticated \\
  --port 8080 \\
  --memory 1Gi \\
  --cpu 1 \\
  --min-instances 0 \\
  --set-env-vars NODE_ENV=production,GEMINI_API_KEY="YOUR_GEMINI_API_KEY"`;

  const dockerBuildCommand = `# 1. Build Docker image locally
docker build -t nexusai .

# 2. Run locally to test
docker run -p 8080:8080 -e GEMINI_API_KEY="YOUR_KEY" nexusai`;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(id);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col relative my-auto"
      >
        {/* Header */}
        <div className="sticky top-0 z-20 flex items-center justify-between px-6 py-4 bg-slate-950/90 border-b border-slate-800 backdrop-blur-md">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold text-white">
                  Host in Your Workspace on Google Cloud Run
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Ready to Deploy
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Serverless container hosting with autoscaling to zero and low latency
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 pt-4 border-b border-slate-800/80 flex items-center space-x-3 text-xs">
          <button
            onClick={() => setActiveTab('quick')}
            className={`pb-2.5 font-bold transition-all border-b-2 ${
              activeTab === 'quick'
                ? 'text-cyan-400 border-cyan-400'
                : 'text-slate-400 border-transparent hover:text-white'
            }`}
          >
            1-Click gcloud Deploy
          </button>
          <button
            onClick={() => setActiveTab('dockerfile')}
            className={`pb-2.5 font-bold transition-all border-b-2 ${
              activeTab === 'dockerfile'
                ? 'text-cyan-400 border-cyan-400'
                : 'text-slate-400 border-transparent hover:text-white'
            }`}
          >
            Dockerfile & Container
          </button>
          <button
            onClick={() => setActiveTab('build')}
            className={`pb-2.5 font-bold transition-all border-b-2 ${
              activeTab === 'build'
                ? 'text-cyan-400 border-cyan-400'
                : 'text-slate-400 border-transparent hover:text-white'
            }`}
          >
            Cloud Build CI/CD
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 text-xs sm:text-sm">
          {activeTab === 'quick' && (
            <div className="space-y-4">
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Step 1: Run in your project terminal
                </span>
                <p className="text-xs text-slate-300 mb-3">
                  Google Cloud Run will automatically build the container from source using our multi-stage Dockerfile and host it on a public HTTPS URL.
                </p>

                <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                  <div className="flex items-center justify-between px-3 py-1.5 bg-slate-950 border-b border-slate-800 text-[11px]">
                    <span className="font-mono text-slate-400">Terminal Command</span>
                    <button
                      onClick={() => handleCopy(gcloudDeployCommand, 'gcloud')}
                      className="flex items-center space-x-1 text-slate-400 hover:text-white"
                    >
                      {copiedCmd === 'gcloud' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedCmd === 'gcloud' ? 'Copied' : 'Copy Command'}</span>
                    </button>
                  </div>
                  <pre className="p-3 font-mono text-xs text-cyan-300 overflow-x-auto leading-relaxed">
                    {gcloudDeployCommand}
                  </pre>
                </div>
              </div>

              {/* Cloud Run Specs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Scale to Zero</span>
                  <span className="text-xs font-bold text-emerald-400 mt-1 block">Free Tier Friendly</span>
                  <span className="text-[10px] text-slate-500">Only pay when requests arrive</span>
                </div>
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Dual Runtime</span>
                  <span className="text-xs font-bold text-indigo-400 mt-1 block">Node 20 + Python 3.10</span>
                  <span className="text-[10px] text-slate-500">Runs both Vite & AI scraper</span>
                </div>
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">SSL & Custom Domain</span>
                  <span className="text-xs font-bold text-cyan-400 mt-1 block">Automated HTTPS</span>
                  <span className="text-[10px] text-slate-500">Google managed certificate</span>
                </div>
              </div>

              {/* Step 2 info */}
              <div className="bg-indigo-950/20 border border-indigo-500/20 rounded-xl p-3.5 text-xs text-slate-300 space-y-1">
                <span className="font-bold text-indigo-300 block">💡 Setting your Gemini API Key in Cloud Run:</span>
                <p>
                  You can pass <code className="bg-black/30 px-1 py-0.5 rounded text-indigo-200">--set-env-vars GEMINI_API_KEY=YOUR_KEY</code> or mount it securely via <strong>Google Secret Manager</strong> in Cloud Run settings.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'dockerfile' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-300">
                A production-ready <strong className="text-white">Dockerfile</strong> and <strong className="text-white">.dockerignore</strong> have been generated in your project root.
              </p>

              <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
                <div className="flex items-center justify-between px-3.5 py-2 bg-slate-900 border-b border-slate-800 text-xs">
                  <span className="font-mono text-slate-300">Dockerfile Highlights</span>
                  <button
                    onClick={() => handleCopy(dockerBuildCommand, 'docker')}
                    className="flex items-center space-x-1 text-slate-400 hover:text-white"
                  >
                    {copiedCmd === 'docker' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCmd === 'docker' ? 'Copied' : 'Copy Local Test'}</span>
                  </button>
                </div>
                <div className="p-3.5 font-mono text-xs text-slate-300 space-y-1.5 bg-slate-950">
                  <div className="text-slate-500"># Multi-stage production build:</div>
                  <div className="text-cyan-300">FROM node:20-bookworm-slim AS builder</div>
                  <div className="text-slate-400">... builds frontend assets with Vite &amp; generates PNG icons</div>
                  <div className="text-cyan-300">FROM node:20-bookworm-slim AS runner</div>
                  <div className="text-slate-400">... installs Python 3.10 runtime &amp; serves on PORT 8080</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'build' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-300">
                You can automate deployments with <strong className="text-white">cloudbuild.yaml</strong> using Cloud Build triggers whenever you push to GitHub or Google Cloud Source Repositories.
              </p>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 font-mono text-xs text-emerald-300">
                gcloud builds submit --config=cloudbuild.yaml
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-400">
            Files in root: <code className="text-slate-200">Dockerfile</code>, <code className="text-slate-200">deploy-cloudrun.sh</code>
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
