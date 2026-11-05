import { useLayoutEffect, useRef } from "react";

const HERO_WORDS = ["pace.", "person.", "crew.", "pace."] as const;

type TextFlipProps = {
  words?: readonly string[];
  className?: string;
};

export default function TextFlip({
  words = HERO_WORDS,
  className = "hero__flip-word",
}: TextFlipProps = {}) {
  const tallestRef = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const track = tallestRef.current;
    if (!track) return;

    let maxHeight = 0;

    words.forEach((word) => {
      const span = document.createElement("span");
      span.className = "text-flip__measure";
      span.textContent = word;
      track.appendChild(span);
      maxHeight = Math.max(maxHeight, span.offsetHeight);
      track.removeChild(span);
    });

    track.style.height = `${maxHeight}px`;
  }, [words]);

  return (
    <span ref={tallestRef} className={`text-flip__track ${className}`} aria-hidden="true">
      {words.map((word, index) => (
        <span key={`${word}-${index}`} className="animate-flip-words">
          {word}
        </span>
      ))}
    </span>
  );
}
