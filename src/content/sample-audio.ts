import sample from "@/assets/kids-just-left-sample.mp3.asset.json";

/** Demo narrator recording for "The kids just left for the weekend"; Sam's own recording replaces it. */
export const SAMPLE_VOICE_URL = sample.url;
export const SAMPLE_VOICE_LABEL = "Sample voice for demo. Sam’s own recording will replace it";
export const isSampleVoice = (url?: string | null) => !!url && url === SAMPLE_VOICE_URL;
