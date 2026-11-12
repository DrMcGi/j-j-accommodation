"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const FRAME_COUNT = 328;

const SCENES = [
  {
    end: 0.11,
    label: "THE FARM",
    title: "Arrive at Grootboom Farm.",
    description: "Begin outside and take in the accommodation buildings.",
  },
  {
    end: 0.23,
    label: "AROUND THE PROPERTY",
    title: "Follow the walkway.",
    description: "Move through the covered walkway and views from the farm.",
  },
  {
    end: 0.31,
    label: "AROUND THE COURTYARD",
    title: "Take in the farm surroundings.",
    description: "The walkthrough crosses the courtyard before heading inside.",
  },
  {
    end: 0.6,
    label: "INSIDE",
    title: "Step into the accommodation.",
    description: "The camera moves through furnished interior and kitchen spaces.",
  },
  {
    end: 0.75,
    label: "THE BEDROOM",
    title: "See the room for yourself.",
    description: "Explore a bedroom shown in the supplied walkthrough.",
  },
  {
    end: 0.9,
    label: "MORE OF THE INTERIOR",
    title: "Take a closer look around.",
    description: "Keep scrolling to move through the furnished spaces.",
  },
  {
    end: 1,
    label: "THE FINAL ROOMS",
    title: "A final look inside.",
    description: "Continue through the living area and other interior spaces.",
  },
] as const;

function frameSource(index: number) {
  return `/images/tour-sequence/frame-${String(index + 1).padStart(3, "0")}.webp`;
}

export default function ScrollTour() {
  const trackRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const progressFillRef = useRef<HTMLSpanElement>(null);
  const [activeScene, setActiveScene] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [frameError, setFrameError] = useState(false);

  useEffect(() => {
    const track = trackRef.current;
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d", { alpha: false });

    if (!track || !stage || !canvas || !context) {
      setFrameError(true);
      return;
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const scrollTrack = track;
    const stickyStage = stage;
    const frameCanvas = canvas;
    const drawingContext = context;
    const images = new Map<number, HTMLImageElement>();
    let currentFrame = -1;
    let currentScene = 0;
    let animationFrame = 0;
    let disposed = false;

    function draw(image: HTMLImageElement) {
      if (disposed || !image.naturalWidth || !image.naturalHeight) {
        return;
      }

      if (
        frameCanvas.width !== image.naturalWidth ||
        frameCanvas.height !== image.naturalHeight
      ) {
        frameCanvas.width = image.naturalWidth;
        frameCanvas.height = image.naturalHeight;
      }

      drawingContext.clearRect(0, 0, frameCanvas.width, frameCanvas.height);
      drawingContext.drawImage(
        image,
        0,
        0,
        frameCanvas.width,
        frameCanvas.height,
      );
      setIsReady(true);
      setFrameError(false);
    }

    function loadImage(index: number) {
      const cached = images.get(index);
      if (cached) {
        if (index === currentFrame && cached.complete && !cached.naturalWidth) {
          setFrameError(true);
          setIsReady(false);
        }
        return cached;
      }

      const image = new window.Image();
      image.decoding = "async";
      image.onload = () => {
        if (index === currentFrame) {
          draw(image);
        }
      };
      image.onerror = () => {
        if (index === currentFrame) {
          setFrameError(true);
          setIsReady(false);
        }
      };
      images.set(index, image);
      image.src = frameSource(index);

      for (const cachedIndex of images.keys()) {
        if (Math.abs(cachedIndex - currentFrame) > 4) {
          images.delete(cachedIndex);
        }
      }

      return image;
    }

    function showFrame(index: number) {
      currentFrame = index;
      const image = loadImage(index);
      if (image.complete && image.naturalWidth) {
        draw(image);
      }

      for (let offset = 1; offset <= 2; offset += 1) {
        if (index + offset < FRAME_COUNT) {
          loadImage(index + offset);
        }
      }

      if (index > 0) {
        loadImage(index - 1);
      }
    }

    function updateFromScroll() {
      animationFrame = 0;
      const trackBounds = scrollTrack.getBoundingClientRect();
      const stageHeight = stickyStage.getBoundingClientRect().height;
      const stickyTop =
        Number.parseFloat(window.getComputedStyle(stickyStage).top) || 0;
      const scrollDistance = Math.max(1, trackBounds.height - stageHeight);
      const progress = Math.min(
        1,
        Math.max(0, (stickyTop - trackBounds.top) / scrollDistance),
      );
      const frameIndex = Math.round(progress * (FRAME_COUNT - 1));

      if (frameIndex !== currentFrame) {
        showFrame(frameIndex);

        const sceneIndex = SCENES.findIndex((scene) => progress <= scene.end);
        const nextScene = sceneIndex < 0 ? SCENES.length - 1 : sceneIndex;
        if (nextScene !== currentScene) {
          currentScene = nextScene;
          setActiveScene(nextScene);
        }
      }

      progressFillRef.current?.style.setProperty(
        "transform",
        `scaleX(${progress})`,
      );
      progressBarRef.current?.setAttribute(
        "aria-valuenow",
        String(Math.round(progress * 100)),
      );
    }

    function scheduleUpdate() {
      if (!animationFrame) {
        animationFrame = window.requestAnimationFrame(updateFromScroll);
      }
    }

    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    scheduleUpdate();

    return () => {
      disposed = true;
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      if (animationFrame) {
        window.cancelAnimationFrame(animationFrame);
      }
      images.clear();
    };
  }, []);

  const scene = SCENES[activeScene];

  return (
    <section
      aria-labelledby="tour-title"
      className="tour-section tour-scroll-section section-space"
      id="tour"
    >
      <div className="page-shell">
        <div className="tour-intro">
          <p className="eyebrow eyebrow-green">A CLOSER LOOK</p>
          <h2 id="tour-title">
            See where
            <br />
            you’ll settle in.
          </h2>
          <p>
            Scroll through real frames from the accommodation walkthrough. The
            view moves with you—scroll back up to revisit a moment.
          </p>
        </div>

        <div
          aria-label="Scroll-controlled room tour"
          className="tour-scroll-track"
          ref={trackRef}
          role="group"
        >
          <div className={`tour-scroll-stage${isReady ? " is-ready" : ""}`} ref={stageRef}>
            <div className="tour-scroll-copy">
              <p className="tour-scroll-prompt">
                <span aria-hidden="true" className="status-dot" />
                <span className="tour-scroll-instruction">SCROLL TO EXPLORE</span>
                <span className="tour-reduced-instruction">STATIC PREVIEW</span>
              </p>

              <div aria-atomic="true" aria-live="polite" className="tour-scene-copy">
                <span className="tour-scene-label">{scene.label}</span>
                <h3>{scene.title}</h3>
                <p>{scene.description}</p>
              </div>

              <div className="tour-progress-panel">
                <div className="tour-progress-heading">
                  <span>WALKTHROUGH PROGRESS</span>
                  <span>
                    {String(activeScene + 1).padStart(2, "0")} /{" "}
                    {String(SCENES.length).padStart(2, "0")}
                  </span>
                </div>
                <div
                  aria-label="Walkthrough progress"
                  aria-valuemax={100}
                  aria-valuemin={0}
                  aria-valuenow={0}
                  className="tour-progress-bar"
                  ref={progressBarRef}
                  role="progressbar"
                >
                  <span className="tour-progress-fill" ref={progressFillRef} />
                </div>
                <p className="tour-scroll-instruction">
                  Scroll the page to move through the video frames.
                </p>
                <p className="tour-reduced-instruction">
                  A static preview is shown when reduced motion is enabled.
                </p>
              </div>
            </div>

            <div
              aria-label={`Frame sequence from the accommodation tour: ${scene.label.toLowerCase()}.`}
              className="tour-sequence-visual"
              role="img"
            >
              <Image
                alt=""
                aria-hidden="true"
                className="tour-sequence-poster"
                height={1000}
                loading="lazy"
                src="/images/media/farm-exterior-hero.webp"
                unoptimized
                width={900}
              />
              <canvas aria-hidden="true" className="tour-sequence-canvas" ref={canvasRef} />
              <span aria-hidden="true" className="tour-sequence-stamp">
                FRAME-BY-FRAME TOUR
              </span>
              {frameError && (
                <span className="tour-frame-error" role="status">
                  The frame sequence could not load. A static property image is shown instead.
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
