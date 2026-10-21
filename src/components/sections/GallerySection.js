"use client";

import { useGsapAnimation, gsapPresets } from "../../lib/motion/gsapAnimations.js";

export default function GallerySection({ content, theme, motionPreset = "cinematic" }) {
  const containerRef = useGsapAnimation((ctx, isReduced) => {
    if (containerRef.current) {
      gsapPresets.staggerCards(containerRef.current, "[data-gsap='card']", { isReduced, motionPreset });
    }
  }, [content, motionPreset]);

  if (!content) return null;
  const { sectionTitle, subtitle, images = [] } = content;

  if (!Array.isArray(images) || images.length === 0) {
    return null;
  }

  return (
    <section
      ref={containerRef}
      className="w-full py-20 md:py-32 px-6 md:px-12 border-b"
      style={{
        backgroundColor: theme?.bg || "#0B0D0C",
        borderColor: theme?.border || "#232825",
      }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="max-w-2xl mb-16">
          <span
            className="text-xs font-mono uppercase tracking-widest mb-3 block"
            style={{ color: theme?.accent || "#C5FF65" }}
          >
            Visual Gallery
          </span>
          <h2
            className="text-3xl sm:text-5xl font-bold tracking-tight headline-editorial mb-4"
            style={{ color: theme?.text || "#F5F5F0" }}
          >
            {sectionTitle}
          </h2>
          {subtitle && (
            <p className="text-base" style={{ color: theme?.muted || "#8E928F" }}>
              {subtitle}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {images.map((img, idx) => (
            <div
              key={idx}
              data-gsap="card"
              className="group relative rounded-2xl overflow-hidden aspect-[4/3] border"
              style={{
                backgroundColor: theme?.surface || "#121514",
                borderColor: theme?.border || "#232825",
              }}
            >
              <img
                src={img.url}
                alt={img.alt || "Gallery preview"}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                {img.caption && (
                  <span className="text-xs font-mono text-white/90">
                    {img.caption}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
