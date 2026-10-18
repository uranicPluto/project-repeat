import { PHASE_PRODUCTION_BUILD } from "next/constants.js";

const DEFAULT_POSTGRES_URL =
  "postgresql://postgres.mxjsppfyorwqqoiorqia:%40126Ve960repeat@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true";

/** @type {import('next').NextConfig} */
const nextConfig = (phase) => ({
  reactStrictMode: true,
  env: {
    IS_NEXT_BUILD: phase === PHASE_PRODUCTION_BUILD ? "true" : "false",
    DATABASE_URL: process.env.DATABASE_URL || DEFAULT_POSTGRES_URL,
  },
});

export default nextConfig;
