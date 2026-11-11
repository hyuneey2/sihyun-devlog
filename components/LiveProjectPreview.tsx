"use client";

import { useState } from "react";

type LiveProjectPreviewProps = {
  src: string;
  title: string;
  fallback: { src: string; alt: string };
};

export function LiveProjectPreview({
  src,
  title,
  fallback,
}: LiveProjectPreviewProps) {
  const [showImage, setShowImage] = useState(false);

  // Cross-origin frame-policy failures cannot reliably be inferred from load or
  // error events. Always offer an explicit alternative without guessing a timeout.
  return (
    <div className="project-live-preview">
      <div className="project-live-preview-viewport">
        {showImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={fallback.src} alt={fallback.alt} />
        ) : (
          <iframe
            src={src}
            title={title}
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
          />
        )}
      </div>
      <div className="project-preview-controls">
        <p>
          미리보기가 보이지 않으면 이미지로 확인하거나 사이트를 열어 주세요.
        </p>
        <button
          type="button"
          aria-pressed={showImage}
          onClick={() => setShowImage((value) => !value)}
        >
          {showImage ? "웹사이트로 보기" : "이미지로 보기"}
        </button>
        <a href={src} target="_blank" rel="noopener noreferrer">
          실제 사이트 방문 ↗
        </a>
      </div>
    </div>
  );
}
