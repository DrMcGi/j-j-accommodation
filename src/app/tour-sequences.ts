export type TourKey = "two-bedroom" | "bachelor" | "property";

export type TourScene = {
  end: number;
  label: string;
  title: string;
  description: string;
};

export type TourDefinition = {
  frameCount: number;
  label: string;
  poster: string;
  scenes: readonly TourScene[];
};

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

// Angle 1 keeps original source IDs 1-31 after earlier approved cuts.
const PROPERTY_ANGLE_ONE_FRAMES = SOURCE_FRAMES.filter((frame) => frame <= 31);
// The new angle plays the retained source IDs 92 down to 70 in reverse order.
const PROPERTY_ANGLE_TWO_FOLDER_FRAMES = SOURCE_FRAMES.filter(
  (frame) => frame > 31 && frame <= 94,
);
const PROPERTY_ANGLE_TWO_FRAMES = PROPERTY_ANGLE_TWO_FOLDER_FRAMES.filter(
  (frame) => frame >= 70 && frame <= 92,
).reverse();
const PROPERTY_ANGLE_THREE_FRAME_COUNT = 28;
const PROPERTY_FRAME_COUNT =
  PROPERTY_ANGLE_ONE_FRAMES.length +
  PROPERTY_ANGLE_TWO_FRAMES.length +
  PROPERTY_ANGLE_THREE_FRAME_COUNT;
const PROPERTY_ANGLE_ONE_END =
  (PROPERTY_ANGLE_ONE_FRAMES.length - 1) / (PROPERTY_FRAME_COUNT - 1);
const PROPERTY_ANGLE_TWO_END =
  (PROPERTY_ANGLE_ONE_FRAMES.length + PROPERTY_ANGLE_TWO_FRAMES.length - 1) /
  (PROPERTY_FRAME_COUNT - 1);

const PROPERTY_SCENES: readonly TourScene[] = [
  {
    end: PROPERTY_ANGLE_ONE_END,
    label: "FULL PROPERTY - ANGLE 1",
    title: "Arrive along the accommodation row.",
    description: "The first camera pass follows the frontage and covered walkway.",
  },
  {
    end: PROPERTY_ANGLE_TWO_END,
    label: "FULL PROPERTY - ANGLE 2",
    title: "Follow the walkway from the other end.",
    description: "This reverse-ordered pass runs from source frame 92 back to 70, creating a forward-moving view from the opposite direction.",
  },
  {
    end: 1,
    label: "FULL PROPERTY - ANGLE 3",
    title: "See the grounds from another side.",
    description: "A third exterior pass looks around Unit 3 and the farm buildings.",
  },
];

const BACHELOR_SOURCE_FRAMES = SOURCE_FRAMES.filter((frame) => frame > 94);
const BACHELOR_FRAME_COUNT = BACHELOR_SOURCE_FRAMES.length;
const BACHELOR_SCENES: readonly TourScene[] = [
  {
    end: 26 / (BACHELOR_FRAME_COUNT - 1),
    label: "ENTRY AND KITCHEN",
    title: "Step inside the bachelor unit.",
    description: "Enter the unit and follow the path through its kitchen area.",
  },
  {
    end: 39 / (BACHELOR_FRAME_COUNT - 1),
    label: "LIVING AREA",
    title: "Explore the living space.",
    description: "Move from the kitchen and seating area toward the sleeping space.",
  },
  {
    end: 136 / (BACHELOR_FRAME_COUNT - 1),
    label: "BACHELOR ROOM",
    title: "Take a closer look at the room.",
    description: "Follow the camera around the bedroom and its furnishings.",
  },
  {
    end: 1,
    label: "BATHROOM",
    title: "Finish with the bathroom.",
    description: "The final frames show the bathroom inside this unit.",
  },
];

const TWO_BEDROOM_FRAME_COUNT = 172;
const TWO_BEDROOM_SCENES: readonly TourScene[] = [
  {
    end: 26 / (TWO_BEDROOM_FRAME_COUNT - 1),
    label: "THE APPROACH",
    title: "Come in to Unit 3.",
    description: "Begin at the accommodation walkway and head toward the unit.",
  },
  {
    end: 120 / (TWO_BEDROOM_FRAME_COUNT - 1),
    label: "LIVING AND BEDROOMS",
    title: "Explore the furnished interior.",
    description: "Move through the living area and into the bedrooms.",
  },
  {
    end: 149 / (TWO_BEDROOM_FRAME_COUNT - 1),
    label: "BEDROOMS",
    title: "Take a closer look at the sleeping spaces.",
    description: "Continue along the recorded path through the bedroom area.",
  },
  {
    end: 1,
    label: "BATHROOM",
    title: "Finish with the bathroom.",
    description: "The final part of this sequence moves through the bathroom.",
  },
];

export const TOUR_CONFIG: Record<TourKey, TourDefinition> = {
  "two-bedroom": {
    frameCount: TWO_BEDROOM_FRAME_COUNT,
    label: "Two-bedroom rental",
    poster: "/images/rentals/two-bedroom/tour-sequence/frame-0001.webp",
    scenes: TWO_BEDROOM_SCENES,
  },
  bachelor: {
    frameCount: BACHELOR_FRAME_COUNT,
    label: "Bachelor room",
    poster: "/images/rentals/bachelor/tour-sequence/frame-0001.webp",
    scenes: BACHELOR_SCENES,
  },
  property: {
    frameCount: PROPERTY_FRAME_COUNT,
    label: "Full property walkthrough",
    poster: "/images/tours/full-property/angle-1/frame-001.webp",
    scenes: PROPERTY_SCENES,
  },
};

export function frameSource(index: number, tour: TourKey) {
  if (tour === "two-bedroom") {
    return `/images/rentals/two-bedroom/tour-sequence/frame-${String(index + 1).padStart(4, "0")}.webp`;
  }

  if (tour === "bachelor") {
    return `/images/rentals/bachelor/tour-sequence/frame-${String(index + 1).padStart(4, "0")}.webp`;
  }

  if (index < PROPERTY_ANGLE_ONE_FRAMES.length) {
    return `/images/tours/full-property/angle-1/frame-${String(index + 1).padStart(3, "0")}.webp`;
  }

  const afterAngleOne = index - PROPERTY_ANGLE_ONE_FRAMES.length;
  if (afterAngleOne < PROPERTY_ANGLE_TWO_FRAMES.length) {
    const sourceFrame = PROPERTY_ANGLE_TWO_FRAMES[afterAngleOne];
    const folderIndex = PROPERTY_ANGLE_TWO_FOLDER_FRAMES.indexOf(sourceFrame) + 1;
    return `/images/tours/full-property/angle-2/frame-${String(folderIndex).padStart(3, "0")}.webp`;
  }

  const angleThreeFrame =
    afterAngleOne - PROPERTY_ANGLE_TWO_FRAMES.length + 1;
  return `/images/tours/full-property/angle-3/frame-${String(angleThreeFrame).padStart(3, "0")}.webp`;
}
