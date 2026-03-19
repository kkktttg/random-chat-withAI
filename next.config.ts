import type { NextConfig } from "next";
import { execSync } from "child_process";

function getGitCommit(): string {
  // Vercel injects this automatically
  if (process.env.VERCEL_GIT_COMMIT_SHA) {
    return process.env.VERCEL_GIT_COMMIT_SHA.slice(0, 7);
  }
  try {
    return execSync("git rev-parse --short HEAD").toString().trim();
  } catch {
    return "unknown";
  }
}

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_GIT_COMMIT: getGitCommit(),
  },
};

export default nextConfig;
