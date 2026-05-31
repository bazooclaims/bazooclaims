/** True during `next build` static generation — avoid live Supabase/network calls. */
export function isNextBuildPhase(): boolean {
  return process.env.NEXT_PHASE === "phase-production-build";
}
