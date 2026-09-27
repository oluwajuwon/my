import React, { act } from "react";
import { createRoot } from "react-dom/client";
import WorkGallery from ".";

const images = [
  { src: "/one.png", alt: "First product screen", caption: "Discovery feed", width: 100, height: 200 },
  { src: "/two.png", alt: "Second product screen", caption: "Place details", width: 100, height: 200 },
  { src: "/three.png", alt: "Third product screen", caption: "Event details", width: 100, height: 200 },
];

let appRoot;
let reactRoot;

beforeAll(() => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  window.requestAnimationFrame = (callback) => {
    callback();
    return 1;
  };
});

beforeEach(() => {
  appRoot = document.createElement("div");
  appRoot.id = "root";
  document.body.appendChild(appRoot);
  reactRoot = createRoot(appRoot);
  act(() => reactRoot.render(<WorkGallery images={images} />));
});

afterEach(() => {
  act(() => reactRoot.unmount());
  appRoot.remove();
  document.body.style.overflow = "";
});

it("opens a complete image and supports button and keyboard navigation", () => {
  const firstTrigger = document.querySelector('button[aria-label="Open Discovery feed"]');
  act(() => firstTrigger.click());

  const dialog = document.querySelector('[role="dialog"]');
  expect(dialog).not.toBeNull();
  expect(document.body.style.overflow).toBe("hidden");
  expect(document.querySelector(".work-lightbox-image").alt).toBe("First product screen");
  expect(document.querySelector(".work-lightbox-figure figcaption").textContent).toContain("01 / 03");

  act(() => document.querySelector('button[aria-label="View next image"]').click());
  expect(document.querySelector(".work-lightbox-image").alt).toBe("Second product screen");

  act(() => document.querySelector('button[aria-label="View previous image"]').click());
  expect(document.querySelector(".work-lightbox-image").alt).toBe("First product screen");

  act(() => document.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true })));
  expect(document.querySelector(".work-lightbox-image").alt).toBe("Second product screen");

  act(() => document.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true })));
  expect(document.querySelector(".work-lightbox-image").alt).toBe("Third product screen");

  act(() => document.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowLeft", bubbles: true })));
  expect(document.querySelector(".work-lightbox-image").alt).toBe("Second product screen");

  act(() => document.querySelector('button[aria-label="Close image viewer"]').click());
  expect(document.querySelector('[role="dialog"]')).toBeNull();
});

it("closes with Escape and returns focus to its originating thumbnail", () => {
  const secondTrigger = document.querySelector('button[aria-label="Open Place details"]');
  act(() => secondTrigger.click());
  expect(document.activeElement.getAttribute("aria-label")).toBe("Close image viewer");

  act(() => document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true })));
  expect(document.querySelector('[role="dialog"]')).toBeNull();
  expect(document.activeElement).toBe(secondTrigger);
  expect(document.body.style.overflow).toBe("");
});

it("closes from the backdrop but not from the enlarged image", () => {
  const firstTrigger = document.querySelector('button[aria-label="Open Discovery feed"]');
  act(() => firstTrigger.click());

  act(() => document.querySelector(".work-lightbox-figure").dispatchEvent(new MouseEvent("mousedown", { bubbles: true })));
  expect(document.querySelector('[role="dialog"]')).not.toBeNull();

  act(() => document.querySelector(".work-lightbox").dispatchEvent(new MouseEvent("mousedown", { bubbles: true })));
  expect(document.querySelector('[role="dialog"]')).toBeNull();
});
