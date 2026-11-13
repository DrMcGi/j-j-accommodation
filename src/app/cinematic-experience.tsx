"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type ReactNode } from "react";

const FRAME_COUNT = 88;
const CHAPTER_RANGES = [
  { from: 0, to: 30 },
  { from: 30, to: 68 },
  { from: 68, to: 78 },
  { from: 78, to: FRAME_COUNT - 1 },
] as const;

export default function CinematicExperience({
  children,
}: {
  children: ReactNode;
}) {
  const experienceRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const progressRef = useRef<HTMLSpanElement>(null);
  const chapterRef = useRef<HTMLSpanElement>(null);
  const [isReady, setIsReady] = useState(false);
  const [frameError, setFrameError] = useState(false);

  useEffect(() => {
    const experience = experienceRef.current;
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d", { alpha: false });
    if (!experience || !stage || !canvas || !context) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const chapters = Array.from(
      experience.querySelectorAll<HTMLElement>("[data-cinematic-chapter]"),
    );
    if (!chapters.length) return;

    const images = new Map<number, HTMLImageElement>();
    let currentFrame = -1;
    let raf = 0;
    let disposed = false;

    function draw(image: HTMLImageElement) {
      if (disposed || !image.naturalWidth || !image.naturalHeight) return;
      if (canvas!.width !== image.naturalWidth || canvas!.height !== image.naturalHeight) {
        canvas!.width = image.naturalWidth;
        canvas!.height = image.naturalHeight;
      }
      context!.clearRect(0, 0, canvas!.width, canvas!.height);
      context!.drawImage(image, 0, 0, canvas!.width, canvas!.height);
      setIsReady(true);
      setFrameError(false);
    }

    function load(index: number) {
      const cached = images.get(index);
      if (cached) return cached;
      const image = new window.Image();
      image.decoding = "async";
      image.onload = () => {
        if (index === currentFrame) draw(image);
      };
      image.onerror = () => {
        if (index === currentFrame) setFrameError(true);
      };
      image.src = `/images/experience/room-journey/frame-${String(index + 1).padStart(4, "0")}.webp`;
      images.set(index, image);
      return image;
    }

    function showFrame(index: number) {
      const bounded = Math.max(0, Math.min(FRAME_COUNT - 1, index));
      if (bounded === currentFrame) return;
      currentFrame = bounded;
      const image = load(bounded);
      if (image.complete && image.naturalWidth) draw(image);
      else setFrameError(false);
      for (let offset = 1; offset <= 3; offset += 1) {
        if (bounded + offset < FRAME_COUNT) load(bounded + offset);
      }
      if (bounded > 0) load(bounded - 1);
      for (const key of images.keys()) {
        if (Math.abs(key - bounded) > 5) images.delete(key);
      }
    }

    function update() {
      raf = 0;
      const stageTop =
        Number.parseFloat(window.getComputedStyle(stage!).top) || 0;
      const stageHeight = stage!.getBoundingClientRect().height;
      stage!.classList.toggle(
        "is-compact",
        window.matchMedia("(max-width: 680px)").matches && window.scrollY > 180,
      );
      experience!.classList.toggle(
        "is-mobile-compact",
        window.matchMedia("(max-width: 680px)").matches && window.scrollY > 180,
      );
      const anchorY = window.scrollY + stageTop;
      const activeLine =
        window.scrollY + Math.max(stageTop + stageHeight * 0.22, window.innerHeight * 0.65);
      let activeIndex = 0;
      for (let i = 0; i < chapters.length; i += 1) {
        const start = chapters[i].getBoundingClientRect().top + window.scrollY;
        if (activeLine >= start) {
          activeIndex = i;
        } else {
          break;
        }
      }

      const chapter = chapters[activeIndex];
      const chapterTop = chapter.getBoundingClientRect().top + window.scrollY;
      const chapterHeight = chapter.getBoundingClientRect().height;
      const local = Math.max(0, Math.min(1, (anchorY - chapterTop) / Math.max(1, chapterHeight)));
      const moveProgress = Math.min(1, local / 0.38);
      const range = CHAPTER_RANGES[Math.min(activeIndex, CHAPTER_RANGES.length - 1)];
      const nextFrame = Math.round(range.from + (range.to - range.from) * moveProgress);
      const isCover = activeIndex === chapters.length - 1 && moveProgress >= 1;
      showFrame(nextFrame);
      stage!.querySelector(".cinematic-stage")?.classList.toggle(
        "is-cover",
        isCover,
      );

      progressRef.current?.style.setProperty(
        "transform",
        `scaleX(${nextFrame / (FRAME_COUNT - 1)})`,
      );
      chapterRef.current!.textContent = isCover
        ? "A room to return to"
        : chapter.dataset.cinematicLabel ?? "A stay at your pace";
      stage!.querySelector(".cinematic-stage")?.setAttribute(
        "aria-label",
        isCover
          ? "Bedroom cover, a room to return to"
          : `Cinematic room walk, ${chapter.dataset.cinematicLabel ?? "tour"}`,
      );
    }

    function schedule() {
      if (!raf) raf = window.requestAnimationFrame(update);
    }

    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    schedule();
    return () => {
      disposed = true;
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (raf) window.cancelAnimationFrame(raf);
      images.clear();
    };
  }, []);

  return (
    <section
      aria-label="A cinematic walkthrough of J and J Grootboom Farm Accommodation"
      className="cinematic-experience"
      ref={experienceRef}
    >
      <div className="cinematic-stage-shell" ref={stageRef}>
        <div className="cinematic-preview">
          <div className="cinematic-overlay-top">
            <span className="cinematic-live-dot" />
            <span ref={chapterRef}>A stay at your pace</span>
          </div>
          <div
            aria-label="Cinematic walk through the accommodation"
            className={`cinematic-stage${isReady ? " is-ready" : ""}`}
            role="img"
          >
            <Image
              alt=""
              aria-hidden="true"
              className="cinematic-poster"
              height={960}
              priority
              src="/images/experience/room-journey/frame-0001.webp"
              width={540}
            />
            <canvas aria-hidden="true" className="cinematic-canvas" ref={canvasRef} />
            <Image
              alt="A welcoming bedroom at J and J Grootboom Farm Accommodation"
              className="cinematic-cover"
              height={960}
              src="/images/media/accommodation-bedroom-video-frame.webp"
              width={540}
            />
            {frameError ? (
              <span className="cinematic-error" role="status">
                The walk-through is still loading. The opening view remains available.
              </span>
            ) : null}
          </div>
          <div className="cinematic-overlay-bottom">
            <span>SCROLL TO WALK THROUGH</span>
            <div aria-hidden="true" className="cinematic-progress-track">
              <span ref={progressRef} />
            </div>
          </div>
        </div>
      </div>
      <div className="cinematic-content">{children}</div>
    </section>
  );
}
