import { useEffect, useRef, useState } from "react";
import { Lock, Pause, Play } from "lucide-react";
import { STAGES, type StageKey } from "@/config/site";
import { formatDuration, type VoiceNote } from "@/lib/voice-notes";
import { cn } from "@/lib/utils";
import { isSampleVoice, SAMPLE_VOICE_LABEL } from "@/content/sample-audio";

/** Only one note plays at a time across the page. */
const PLAY_EVENT = "sbc:voice-note-play";

export function VoiceNoteCard({ note, locked }: { note: VoiceNote; locked: boolean }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(note.duration_seconds || 0);
  const stage = STAGES[note.stage as StageKey];

  useEffect(() => {
    const onOther = (e: Event) => {
      if ((e as CustomEvent).detail !== note.id) audioRef.current?.pause();
    };
    window.addEventListener(PLAY_EVENT, onOther);
    return () => window.removeEventListener(PLAY_EVENT, onOther);
  }, [note.id]);

  const toggle = () => {
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) {
      window.dispatchEvent(new CustomEvent(PLAY_EVENT, { detail: note.id }));
      void a.play();
    } else a.pause();
  };

  const pct = duration ? Math.min(100, (time / duration) * 100) : 0;

  return (
    <article className="relative flex flex-col rounded-[24px] bg-card p-6 md:p-7" aria-label={note.title}>
      <div className={cn("flex flex-1 flex-col", locked && "locked-blur")} aria-hidden={locked}>
        <div className="flex items-center justify-between gap-3 text-sm">
          <span className="inline-flex items-center gap-2 font-semibold">
            <span className="flex size-7 items-center justify-center rounded-full bg-ink text-xs font-bold text-marigold">{stage.letter}</span>
            {stage.name}
          </span>
          <span className="tabular-nums text-soft">{formatDuration(duration)}</span>
        </div>
        <h3 className="mt-5 text-2xl font-bold tracking-tight">{note.title}</h3>
        {note.situation && <p className="mt-2 text-muted-foreground">{note.situation}</p>}
        <div className="mt-auto flex items-center gap-4 pt-7">
          <button
            type="button"
            onClick={toggle}
            disabled={locked || !note.audio_url}
            aria-label={playing ? `Pause ${note.title}` : `Play ${note.title}`}
            className="flex size-14 shrink-0 items-center justify-center rounded-full bg-marigold text-marigold-foreground transition-transform hover:scale-105 disabled:opacity-60"
          >
            {playing ? <Pause className="size-5 fill-current" /> : <Play className="ml-0.5 size-5 fill-current" />}
          </button>
          <div className="flex-1">
            <input
              type="range"
              min={0}
              max={duration || 1}
              step={1}
              value={time}
              disabled={locked}
              aria-label={`Seek ${note.title}`}
              onChange={(e) => {
                const v = Number(e.target.value);
                if (audioRef.current) audioRef.current.currentTime = v;
                setTime(v);
              }}
              className="w-full cursor-pointer accent-[var(--ink)]"
              style={{ background: "transparent" }}
            />
            <div className="mt-1 h-0.5 w-full overflow-hidden rounded bg-muted" aria-hidden>
              <div className="h-full bg-ink" style={{ width: `${pct}%` }} />
            </div>
            <div className="mt-1.5 flex justify-between text-xs tabular-nums text-soft">
              <span>{formatDuration(time)}</span>
              <span>{note.is_free ? "Free" : "Library"}</span>
            </div>
          </div>
        </div>
        {isSampleVoice(note.audio_url) && <p className="mt-3 text-xs text-soft">{SAMPLE_VOICE_LABEL}</p>}
        {!locked && note.audio_url && (
          <audio
            ref={audioRef}
            src={note.audio_url}
            preload="none"
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            onEnded={() => setPlaying(false)}
            onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
            onLoadedMetadata={(e) => isFinite(e.currentTarget.duration) && setDuration(e.currentTarget.duration)}
          />
        )}
      </div>
      {locked && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-[24px] bg-card/40 p-6 text-center">
          <span className="flex size-11 items-center justify-center rounded-full bg-ink text-ink-foreground"><Lock className="size-4" /></span>
          <p className="font-semibold">{note.title}</p>
          <a href="#unlock" className="text-sm font-semibold underline underline-offset-4">Unlock with your email</a>
        </div>
      )}
    </article>
  );
}
