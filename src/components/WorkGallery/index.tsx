import React, { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { WorkImage } from "../../pages/Portfolio/types";
import "./style.css";

interface WorkGalleryProps {
  images: WorkImage[];
  compact?: boolean;
  label?: string;
}

const WorkGallery: React.FC<WorkGalleryProps> = ({
  images,
  compact = false,
  label = "Product screenshots",
}) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const triggerRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const activeImage = activeIndex === null ? null : images[activeIndex];

  const close = useCallback(() => {
    const trigger = activeIndex === null ? null : triggerRefs.current[activeIndex];
    setActiveIndex(null);
    window.requestAnimationFrame(() => trigger?.focus());
  }, [activeIndex]);

  const previous = useCallback(() => {
    setActiveIndex((index) => index === null ? null : (index - 1 + images.length) % images.length);
  }, [images.length]);

  const next = useCallback(() => {
    setActiveIndex((index) => index === null ? null : (index + 1) % images.length);
  }, [images.length]);

  useEffect(() => {
    if (activeIndex === null) return;

    const previousOverflow = document.body.style.overflow;
    const appRoot = document.getElementById("root");
    const previousAriaHidden = appRoot?.getAttribute("aria-hidden");
    const hadInert = appRoot?.hasAttribute("inert") ?? false;
    document.body.style.overflow = "hidden";
    appRoot?.setAttribute("aria-hidden", "true");
    appRoot?.setAttribute("inert", "");
    closeButtonRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
      } else if (event.key === "ArrowLeft" && images.length > 1) {
        event.preventDefault();
        previous();
      } else if (event.key === "ArrowRight" && images.length > 1) {
        event.preventDefault();
        next();
      } else if (event.key === "Tab") {
        const focusable = Array.from(
          dialogRef.current?.querySelectorAll<HTMLButtonElement>("button:not([disabled])") ?? [],
        );
        if (focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      if (previousAriaHidden === null) appRoot?.removeAttribute("aria-hidden");
      else if (previousAriaHidden !== undefined) appRoot?.setAttribute("aria-hidden", previousAriaHidden);
      if (!hadInert) appRoot?.removeAttribute("inert");
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [activeIndex, close, images.length, next, previous]);

  if (images.length === 0) return null;

  return (
    <>
      <div className={compact ? "work-gallery work-gallery--compact" : "work-gallery"} aria-label={label}>
        {images.map((image, index) => (
          <figure className="work-gallery-item" key={image.src}>
            <button
              type="button"
              className="work-gallery-trigger"
              onClick={() => setActiveIndex(index)}
              ref={(element) => {
                triggerRefs.current[index] = element;
              }}
              aria-label={`Open ${image.caption ?? image.alt}`}
            >
              <img
                src={image.src}
                alt={image.alt}
                width={image.width}
                height={image.height}
                loading="lazy"
              />
              <span className="work-gallery-view" aria-hidden="true">View</span>
            </button>
            {image.caption && <figcaption>{image.caption}</figcaption>}
          </figure>
        ))}
      </div>

      {activeImage && createPortal(
        <div
          className="work-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={activeImage.caption ?? "Product screenshot"}
          ref={dialogRef}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) close();
          }}
        >
          <button
            type="button"
            className="work-lightbox-close"
            onClick={close}
            ref={closeButtonRef}
            aria-label="Close image viewer"
          >
            <span aria-hidden="true">×</span>
          </button>

          {images.length > 1 && (
            <button
              type="button"
              className="work-lightbox-navigation work-lightbox-previous"
              onClick={previous}
              aria-label="View previous image"
            >
              <span aria-hidden="true">←</span>
            </button>
          )}

          <figure className="work-lightbox-figure" onMouseDown={(event) => event.stopPropagation()}>
            <img
              className="work-lightbox-image"
              src={activeImage.src}
              alt={activeImage.alt}
              width={activeImage.width}
              height={activeImage.height}
            />
            <figcaption>
              <span>{activeImage.caption ?? activeImage.alt}</span>
              <span>{String((activeIndex ?? 0) + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}</span>
            </figcaption>
          </figure>

          {images.length > 1 && (
            <button
              type="button"
              className="work-lightbox-navigation work-lightbox-next"
              onClick={next}
              aria-label="View next image"
            >
              <span aria-hidden="true">→</span>
            </button>
          )}
        </div>,
        document.body,
      )}
    </>
  );
};

export default WorkGallery;
