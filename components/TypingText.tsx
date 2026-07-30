"use client";

import { useEffect, useState } from "react";

type TypingTextProps = {
  text: string;
};

const TYPING_DELAY = 65;

export function TypingText({ text }: TypingTextProps) {
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReducedMotion) {
      const reducedMotionTimer = window.setTimeout(() => {
        setDisplayedText(text);
      }, 0);

      return () => {
        window.clearTimeout(reducedMotionTimer);
      };
    }

    let currentLength = 0;
    const typingTimer = window.setInterval(() => {
      currentLength += 1;
      setDisplayedText(text.slice(0, currentLength));

      if (currentLength >= text.length) {
        window.clearInterval(typingTimer);
      }
    }, TYPING_DELAY);

    return () => {
      window.clearInterval(typingTimer);
    };
  }, [text]);

  return (
    <span className="typing-text" aria-label={text}>
      <span aria-hidden="true">{displayedText}</span>
      <span className="typing-cursor" aria-hidden="true">
        |
      </span>
    </span>
  );
}
