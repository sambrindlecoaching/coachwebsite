/**
 * Phase 2 feature flag. Off by default: hides the shop/course, Photos, Tasks,
 * client pages and progress letters, extra doors and extra admin sections.
 * Nothing is deleted; set VITE_PHASE2=true (or flip the default) to bring them back.
 */
export const PHASE2: boolean = import.meta.env["VITE_PHASE2"] === "true";
