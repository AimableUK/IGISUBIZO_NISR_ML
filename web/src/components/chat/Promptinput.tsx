"use client";

import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { ArrowUp, Loader2 } from "lucide-react";
import VoiceButton from "../VoiceButton";

// Runs before paint in the browser so the box never flashes at the wrong height.
const useIsoLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

export type PromptInputProps = {
  /** Controlled text. The parent owns it, so it can prefill, clear, or fill from example chips. */
  value: string;
  onChange: (value: string) => void;
  /** Called with the trimmed text on Enter or on the send button. May be async. */
  onSubmit: (value: string) => void | Promise<void>;
  /** Parent-controlled busy state (for example while a request is running). */
  busy?: boolean;
  placeholder?: string;
  /** Accessible name for the text box. Pass a translated string. */
  label: string;
  /** Accessible name for the send button. Pass a translated string. */
  sendLabel: string;
  maxLength?: number;
  minLength?: number;
  /** The box grows with the text up to this height in px, then scrolls. */
  maxHeight?: number;
  /** Show the microphone button and its status line. */
  voice?: boolean;
  className?: string;
};

/**
 * The shared question box: [mic] [input that grows as you type] [send], in one row.
 * Enter sends, Shift+Enter adds a new line. Reuse it anywhere a question is typed.
 */
export default function PromptInput({
  value,
  onChange,
  onSubmit,
  busy = false,
  placeholder,
  label,
  sendLabel,
  maxLength = 500,
  minLength = 3,
  maxHeight = 168,
  voice = true,
  className = "",
}: PromptInputProps) {
  const id = useId();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [submitting, setSubmitting] = useState(false);
  const [voiceMessage, setVoiceMessage] = useState("");

  // Auto-grow: measure the content, then set the height. Shrinks again when text is cleared.
  useIsoLayoutEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, maxHeight)}px`;
  }, [value, maxHeight]);

  const isBusy = busy || submitting;
  const canSubmit = value.trim().length >= minLength && !isBusy;

  async function submit(event?: FormEvent) {
    event?.preventDefault();
    const text = value.trim();
    if (text.length < minLength || isBusy) return;

    setSubmitting(true);
    try {
      await onSubmit(text);
      setVoiceMessage("");
    } finally {
      setSubmitting(false);
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (
      event.key === "Enter" &&
      !event.shiftKey &&
      !event.nativeEvent.isComposing
    ) {
      event.preventDefault();
      void submit();
    }
  }

  return (
    <div className={`w-full ${className}`}>
      <form onSubmit={submit} className="w-full">
        {/* items-end keeps the buttons at the bottom as the input grows. */}
        <div className="flex items-end gap-2 rounded-3xl border border-line bg-surface p-2 shadow-lg transition-colors focus-within:border-primary sm:gap-3 sm:p-2.5">
          {voice && (
            <VoiceButton
              onTranscript={(text) => onChange(text)}
              onMessage={setVoiceMessage}
            />
          )}

          <label htmlFor={id} className="sr-only">
            {label}
          </label>
          <textarea
            ref={inputRef}
            id={id}
            rows={1}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            onKeyDown={handleKeyDown}
            maxLength={maxLength}
            disabled={isBusy}
            placeholder={placeholder}
            className="min-h-[44px] flex-1 resize-none overflow-y-auto bg-transparent px-2 py-[10px] text-base leading-6 outline-none ring-0 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden placeholder:text-muted focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 sm:text-lg sm:leading-6"
          />

          <button
            type="submit"
            disabled={!canSubmit}
            aria-label={sendLabel}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-on-primary transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isBusy ? (
              <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
            ) : (
              <ArrowUp className="h-5 w-5" aria-hidden />
            )}
          </button>
        </div>
      </form>

      {voice && (
        <p
          role="status"
          aria-live="polite"
          className="mt-2 min-h-5 text-center text-sm text-muted"
        >
          {voiceMessage}
        </p>
      )}
    </div>
  );
}
