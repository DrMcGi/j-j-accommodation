"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const SOURCE_FRAME_COUNT = 328;
const SKIPPED_SOURCE_FRAMES = new Set([
  ...Array.from({ length: 25 }, (_, index) => (index + 1) * 2),
  85, 86, 87, 88,
  100, 101, 106, 108, 110, 111,
  176, 178, 179, 180, 181,
  197, 230, 231,
  242, 243, 244, 245, 246, 247,
  253, 254,
  51, 95, 96, 97,
  109, 112,
  122, 123, 124, 125,
  130, 132,
  140, 141, 142, 144, 146, 148,
  150, 151, 152, 153,
  ...Array.from({ length: 17 }, (_, index) => index + 155),
  ...Array.from({ length: 9 }, (_, index) => index + 175),
  186, 188, 189, 190, 191, 192, 193,
  154, 172, 173,
]);
const SOURCE_FRAMES = Array.from(
  { length: SOURCE_FRAME_COUNT },
  (_, index) => index + 1,
).filter((frame) => !SKIPPED_SOURCE_FRAMES.has(frame));

const PROPERTY_SCENES = [
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

const TWO_BEDROOM_SCENES = [
  {
    end: 0.275,
    label: "THE ARRIVAL",
    title: "Come in to Unit 3.",
    description: "Start outside, then follow the camera through the entrance.",
  },
  {
    end: 0.745,
    label: "LIVING AND BEDROOMS",
    title: "Explore the furnished interior.",
    description: "Move through the living area and into the bedrooms.",
  },
  {
    end: 0.89,
    label: "BEDROOMS",
    title: "Take a closer look at the sleeping space.",
    description: "Continue along the recorded path through the bedroom area.",
  },
  {
    end: 1,
    label: "BATHROOM",
    title: "Finish with the bathroom.",
    description: "The final part of this sequence moves through the bathroom.",
  },
] as const;

type TourKey = "two-bedroom" | "property";

const TOUR_CONFIG = {
  "two-bedroom": {
    frameCount: 200,
    label: "Two-bedroom rental",
    poster: "/images/rentals/two-bedroom/tour-sequence/frame-0001.webp",
    scenes: TWO_BEDROOM_SCENES,
  },
  property: {
    frameCount: SOURCE_FRAMES.length,
    label: "Full property walkthrough",
    poster: "/images/media/farm-exterior-hero.webp",
    scenes: PROPERTY_SCENES,
  },
} as const;

function frameSource(index: number, tour: TourKey) {
  if (tour === "two-bedroom") {
    return `/images/rentals/two-bedroom/tour-sequence/frame-${String(index + 1).padStart(4, "0")}.webp`;
  }

  const sourceFrame = SOURCE_FRAMES[index];
  return `/images/tour-sequence/frame-${String(sourceFrame).padStart(3, "0")}.webp`;
}

export default function ScrollTour() {
  const trackRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const progressFillRef = useRef<HTMLSpanElement>(null);
  const [selectedTour, setSelectedTour] = useState<TourKey>("two-bedroom");
  const [activeScene, setActiveScene] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [frameError, setFrameError] = useState(false);
  const tour = TOUR_CONFIG[selectedTour];
  const scenes = tour.scenes;

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
    const frameCount = tour.frameCount;
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
      image.src = frameSource(index, selectedTour);

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
        if (index + offset < frameCount) {
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
      const frameIndex = Math.round(progress * (frameCount - 1));

      if (frameIndex !== currentFrame) {
        showFrame(frameIndex);

        const sceneIndex = scenes.findIndex((scene) => progress <= scene.end);
        const nextScene = sceneIndex < 0 ? scenes.length - 1 : sceneIndex;
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
  }, [scenes, selectedTour, tour.frameCount]);

  const scene = scenes[activeScene] ?? scenes[0];

  return (
    <section
      aria-labelledby="tour-title"
      className="tour-section tour-scroll-section section-space"
      id="tour"
    >
      <div className="tour-shell">
        <div className="tour-intro">
          <p className="eyebrow eyebrow-green">A CLOSER LOOK</p>
          <h2 id="tour-title">
            See where
            <br />
            you’ll settle in.
          </h2>
          <p>
            Choose a rental tour, then scroll to follow the camera through the
            supplied footage.
          </p>
        </div>

        <div aria-label="Choose a room tour" className="tour-selector" role="group">
          <button
            aria-pressed={selectedTour === "two-bedroom"}
            className="tour-selector-button"
            onClick={() => {
              setSelectedTour("two-bedroom");
              setActiveScene(0);
              setIsReady(false);
              setFrameError(false);
            }}
            type="button"
          >
            Two-bedroom rental
          </button>
          <button
            aria-pressed={selectedTour === "property"}
            className="tour-selector-button"
            onClick={() => {
              setSelectedTour("property");
              setActiveScene(0);
              setIsReady(false);
              setFrameError(false);
            }}
            type="button"
          >
            Full property walkthrough
          </button>
          <button
            aria-describedby="bachelor-tour-status"
            className="tour-selector-button tour-selector-coming-soon"
            disabled
            type="button"
          >
            Bachelor room tour · in preparation
          </button>
        </div>
        <p className="tour-selector-note" id="bachelor-tour-status">
          The bachelor tour will show only that room once its room-only sequence
          is prepared. The two-bedroom rental tour is available now.
        </p>

        <div
          aria-label={`Scroll-controlled ${tour.label.toLowerCase()}`}
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
                    {String(scenes.length).padStart(2, "0")}
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
                height={960}
                loading="lazy"
                src={tour.poster}
                unoptimized
                width={540}
              />
              <canvas aria-hidden="true" className="tour-sequence-canvas" ref={canvasRef} />
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
