import { PHASE_PRODUCTION_BUILD } from "next/constants.js";

const DEFAULT_POSTGRES_URL =
  "postgresql://postgres:%40126Ve960repeat@db.mxjsppfyorwqqoiorqia.supabase.co:5432/postgres";

/** @type {import('next').NextConfig} */
const nextConfig = (phase) => ({
  reactStrictMode: true,
  env: {
    IS_NEXT_BUILD: phase === PHASE_PRODUCTION_BUILD ? "true" : "false",
    DATABASE_URL: process.env.DATABASE_URL || DEFAULT_POSTGRES_URL,
  },
});

export default nextConfig;
