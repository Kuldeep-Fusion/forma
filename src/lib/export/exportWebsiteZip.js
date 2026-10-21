"use client";

import JSZip from "jszip";

/**
 * Generates a production-ready, standalone static website ZIP package from a Forma pageConfig.
 * Contains index.html, css/styles.css, js/main.js, and README.md.
 * Completely self-contained: runs in any browser, zero React / Next.js / API dependencies.
 */
export async function exportWebsiteZip(pageConfig) {
  if (!pageConfig || !pageConfig.sections) {
    throw new Error("Invalid pageConfig: cannot export empty project.");
  }

  const zip = new JSZip();
  const title = pageConfig.metadata?.title || "Forma Generated Site";
  const desc = pageConfig.metadata?.description || "High-performance animated landing page crafted with Forma Studio.";
  const theme = pageConfig.theme || {};
  const motion = pageConfig.motion || {};

  // 1. Generate index.html
  const htmlContent = generateHtml(pageConfig, title, desc, theme);
  zip.file("index.html", htmlContent);

  // 2. Generate css/styles.css
  const cssContent = generateCss(theme, motion, pageConfig.typography);
  zip.folder("css").file("styles.css", cssContent);

  // 3. Generate js/main.js
  const jsContent = generateJs(pageConfig, motion);
  zip.folder("js").file("main.js", jsContent);

  // 4. Generate README.md
  const readmeContent = generateReadme(title);
  zip.file("README.md", readmeContent);

  // 5. Generate ZIP Blob and trigger browser download
  const blob = await zip.generateAsync({ type: "blob" });
  const filename = `${(title || "forma-site").toLowerCase().replace(/[^a-z0-9]/g, "-")}-source.zip`;

  if (typeof window !== "undefined") {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  return blob;
}

function generateHtml(pageConfig, title, desc, theme) {
  const sectionsHtml = pageConfig.sections
    .filter((sec) => sec.isVisible !== false)
    .map((sec) => renderSectionHtml(sec, theme))
    .join("\n\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(desc)}">

  <!-- Open Graph -->
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(desc)}">
  <meta property="og:type" content="website">

  <!-- Google Fonts: Editorial Serif, JetBrains Mono, Plus Jakarta Sans, Space Grotesk, Syne, Inter -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Space+Grotesk:wght@500;700&family=Syne:wght@700;800&display=swap" rel="stylesheet">

  <!-- Stylesheet -->
  <link rel="stylesheet" href="css/styles.css">

  <!-- GSAP & ScrollTrigger CDN -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js" defer></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js" defer></script>
  <script src="js/main.js" defer></script>
</head>
<body>
  <div class="site-wrapper">
${sectionsHtml}
  </div>
</body>
</html>`;
}

function renderSectionHtml(section, theme) {
  const c = section.content || {};

  switch (section.type) {
    case "announcement":
      return `    <!-- Announcement Bar -->
    <aside class="announcement-bar" id="${section.id}">
      <div class="container announcement-inner">
        ${c.badge ? `<span class="badge badge-accent">${escapeHtml(c.badge)}</span>` : ""}
        <p class="announcement-text">${escapeHtml(c.message || "")}</p>
        ${c.linkText ? `<a href="${c.linkHref || "#"}" class="announcement-link">${escapeHtml(c.linkText)} →</a>` : ""}
      </div>
    </aside>`;

    case "navbar":
      const links = (c.links || [])
        .map((l) => `<a href="${l.href || "#"}" class="nav-link">${escapeHtml(l.label)}</a>`)
        .join("\n          ");
      return `    <!-- Navigation -->
    <header class="navbar" id="${section.id}">
      <div class="container navbar-inner">
        <a href="#" class="brand-logo">${escapeHtml(c.brandName || "Forma")}</a>
        <nav class="nav-menu">
          ${links}
        </nav>
        ${c.cta?.label ? `<a href="${c.cta.href || "#"}" class="btn btn-accent nav-cta">${escapeHtml(c.cta.label)}</a>` : ""}
      </div>
    </header>`;

    case "hero":
      return `    <!-- Hero Section -->
    <section class="hero-section" id="${section.id}">
      <div class="container hero-inner">
        <div class="hero-content">
          ${c.badge ? `<div class="badge badge-outline" data-gsap="badge">${escapeHtml(c.badge)}</div>` : ""}
          <h1 class="hero-headline" data-gsap="headline">${escapeHtml(c.headline || "")}</h1>
          <p class="hero-subheadline" data-gsap="subheadline">${escapeHtml(c.subheadline || "")}</p>
          <div class="hero-actions" data-gsap="actions">
            ${c.primaryCta?.label ? `<a href="${c.primaryCta.href || "#"}" class="btn btn-accent">${escapeHtml(c.primaryCta.label)}</a>` : ""}
            ${c.secondaryCta?.label ? `<a href="${c.secondaryCta.href || "#"}" class="btn btn-outline">${escapeHtml(c.secondaryCta.label)}</a>` : ""}
          </div>
        </div>
        ${
          c.media?.url
            ? `<div class="hero-media-wrap" data-gsap="media">
          <img src="${escapeHtml(c.media.url)}" alt="${escapeHtml(c.media.alt || "Showcase")}" class="hero-image" loading="lazy">
        </div>`
            : ""
        }
      </div>
    </section>`;

    case "logo_strip":
      const logos = (c.logos || [])
        .map((l) => `<div class="logo-item">${escapeHtml(l.name)}</div>`)
        .join("\n          ");
      return `    <!-- Logo Strip -->
    <section class="logo-strip-section" id="${section.id}">
      <div class="container">
        ${c.title ? `<p class="logo-strip-title">${escapeHtml(c.title)}</p>` : ""}
        <div class="logo-grid">
          ${logos}
        </div>
      </div>
    </section>`;

    case "features":
      const featureCards = (c.items || [])
        .map(
          (item) => `        <div class="card feature-card" data-gsap="card">
          ${item.tag ? `<span class="badge badge-accent">${escapeHtml(item.tag)}</span>` : ""}
          <h3>${escapeHtml(item.title)}</h3>
          <p>${escapeHtml(item.description)}</p>
          ${item.metric ? `<div class="feature-metric">${escapeHtml(item.metric)}</div>` : ""}
        </div>`
        )
        .join("\n");
      return `    <!-- Features Section -->
    <section class="features-section section-padding" id="${section.id}">
      <div class="container">
        <div class="section-header">
          ${c.tag ? `<span class="badge badge-outline">${escapeHtml(c.tag)}</span>` : ""}
          <h2>${escapeHtml(c.sectionTitle || "Capabilities")}</h2>
          <p class="section-subtitle">${escapeHtml(c.subtitle || "")}</p>
        </div>
        <div class="grid grid-3">
${featureCards}
        </div>
      </div>
    </section>`;

    case "stats":
      const statItems = (c.stats || [])
        .map(
          (s) => `        <div class="stat-card" data-gsap="card">
          <div class="stat-metric">${escapeHtml(s.metric)}</div>
          <div class="stat-label">${escapeHtml(s.label)}</div>
          ${s.description ? `<p class="stat-desc">${escapeHtml(s.description)}</p>` : ""}
        </div>`
        )
        .join("\n");
      return `    <!-- Stats Section -->
    <section class="stats-section section-padding" id="${section.id}">
      <div class="container">
        <div class="section-header">
          <h2>${escapeHtml(c.sectionTitle || "Proven Impact")}</h2>
          <p class="section-subtitle">${escapeHtml(c.subtitle || "")}</p>
        </div>
        <div class="grid grid-4 stats-grid">
${statItems}
        </div>
      </div>
    </section>`;

    case "benefits":
      const benefitItems = (c.items || [])
        .map(
          (b) => `        <div class="card benefit-card" data-gsap="card">
          <h3>${escapeHtml(b.title)}</h3>
          <p>${escapeHtml(b.description)}</p>
        </div>`
        )
        .join("\n");
      return `    <!-- Benefits Section -->
    <section class="benefits-section section-padding" id="${section.id}">
      <div class="container">
        <div class="section-header">
          <h2>${escapeHtml(c.sectionTitle || "Strategic Advantages")}</h2>
          <p class="section-subtitle">${escapeHtml(c.subtitle || "")}</p>
        </div>
        <div class="grid grid-3">
${benefitItems}
        </div>
      </div>
    </section>`;

    case "showcase":
      const showcaseItems = (c.items || [])
        .map(
          (item) => `        <div class="card showcase-card" data-gsap="card">
          ${item.image ? `<img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.title)}" class="showcase-img" loading="lazy">` : ""}
          <div class="showcase-info">
            ${item.category ? `<span class="badge badge-accent">${escapeHtml(item.category)}</span>` : ""}
            <h3>${escapeHtml(item.title)}</h3>
            <p>${escapeHtml(item.description || "")}</p>
          </div>
        </div>`
        )
        .join("\n");
      return `    <!-- Showcase Section -->
    <section class="showcase-section section-padding" id="${section.id}">
      <div class="container">
        <div class="section-header">
          <h2>${escapeHtml(c.sectionTitle || "Selected Work")}</h2>
          <p class="section-subtitle">${escapeHtml(c.subtitle || "")}</p>
        </div>
        <div class="grid grid-3">
${showcaseItems}
        </div>
      </div>
    </section>`;

    case "gallery":
      const galleryItems = (c.images || [])
        .map(
          (img) => `        <div class="gallery-item" data-gsap="card">
          <img src="${escapeHtml(img.url)}" alt="${escapeHtml(img.caption || "Gallery item")}" loading="lazy">
          ${img.caption ? `<p class="gallery-caption">${escapeHtml(img.caption)}</p>` : ""}
        </div>`
        )
        .join("\n");
      return `    <!-- Gallery Section -->
    <section class="gallery-section section-padding" id="${section.id}">
      <div class="container">
        <div class="section-header">
          <h2>${escapeHtml(c.sectionTitle || "Visual Gallery")}</h2>
          <p class="section-subtitle">${escapeHtml(c.subtitle || "")}</p>
        </div>
        <div class="grid grid-3 gallery-grid">
${galleryItems}
        </div>
      </div>
    </section>`;

    case "video_showcase":
      return `    <!-- Video Showcase Section -->
    <section class="video-section section-padding" id="${section.id}">
      <div class="container">
        <div class="section-header">
          <h2>${escapeHtml(c.sectionTitle || "Featured Showcase")}</h2>
          <p class="section-subtitle">${escapeHtml(c.subtitle || "")}</p>
        </div>
        <div class="video-container" data-gsap="card">
          <video src="${escapeHtml(c.videoUrl || "")}" poster="${escapeHtml(c.posterUrl || "")}" controls playsinline preload="none"></video>
        </div>
        ${c.caption ? `<p class="video-caption">${escapeHtml(c.caption)}</p>` : ""}
      </div>
    </section>`;

    case "testimonials":
      const testimonials = (c.items || [])
        .map(
          (t) => `        <div class="card testimonial-card" data-gsap="card">
          <p class="testimonial-quote">“${escapeHtml(t.quote)}”</p>
          <div class="testimonial-author">
            <strong>${escapeHtml(t.author)}</strong>
            <span>${escapeHtml(t.role || "")}${t.company ? `, ${escapeHtml(t.company)}` : ""}</span>
          </div>
          ${t.metric ? `<div class="badge badge-accent testimonial-metric">${escapeHtml(t.metric)}</div>` : ""}
        </div>`
        )
        .join("\n");
      return `    <!-- Testimonials Section -->
    <section class="testimonials-section section-padding" id="${section.id}">
      <div class="container">
        <div class="section-header">
          <h2>${escapeHtml(c.sectionTitle || "Client Praise")}</h2>
          <p class="section-subtitle">${escapeHtml(c.subtitle || "")}</p>
        </div>
        <div class="grid grid-3">
${testimonials}
        </div>
      </div>
    </section>`;

    case "pricing":
      const plans = (c.plans || [])
        .map(
          (p) => `        <div class="card pricing-card ${p.isHighlighted ? "pricing-featured" : ""}" data-gsap="card">
          ${p.isHighlighted ? `<div class="badge badge-accent badge-top">Most Popular</div>` : ""}
          <h3>${escapeHtml(p.name)}</h3>
          <div class="pricing-price">
            <span class="price-val">${escapeHtml(p.price)}</span>
            <span class="price-period">${escapeHtml(p.period || "/month")}</span>
          </div>
          <p class="pricing-desc">${escapeHtml(p.description || "")}</p>
          <ul class="pricing-features">
            ${(p.features || []).map((f) => `<li>✓ ${escapeHtml(f)}</li>`).join("\n            ")}
          </ul>
          <a href="#" class="btn ${p.isHighlighted ? "btn-accent" : "btn-outline"} btn-block">${escapeHtml(p.ctaText || "Select Plan")}</a>
        </div>`
        )
        .join("\n");
      return `    <!-- Pricing Section -->
    <section class="pricing-section section-padding" id="${section.id}">
      <div class="container">
        <div class="section-header">
          <h2>${escapeHtml(c.sectionTitle || "Transparent Pricing")}</h2>
          <p class="section-subtitle">${escapeHtml(c.subtitle || "")}</p>
        </div>
        <div class="grid grid-3 pricing-grid">
${plans}
        </div>
      </div>
    </section>`;

    case "faq":
      const faqs = (c.questions || [])
        .map(
          (q, i) => `        <div class="faq-accordion-item" data-gsap="card">
          <button class="faq-question" type="button" aria-expanded="false" data-faq-trigger>
            <span>${escapeHtml(q.q)}</span>
            <span class="faq-icon">+</span>
          </button>
          <div class="faq-answer">
            <p>${escapeHtml(q.a)}</p>
          </div>
        </div>`
        )
        .join("\n");
      return `    <!-- FAQ Section -->
    <section class="faq-section section-padding" id="${section.id}">
      <div class="container faq-container">
        <div class="section-header">
          <h2>${escapeHtml(c.sectionTitle || "Frequently Asked Questions")}</h2>
          <p class="section-subtitle">${escapeHtml(c.subtitle || "")}</p>
        </div>
        <div class="faq-list">
${faqs}
        </div>
      </div>
    </section>`;

    case "cta":
      return `    <!-- Call to Action Section -->
    <section class="cta-section section-padding" id="${section.id}">
      <div class="container">
        <div class="cta-box" data-gsap="card">
          <h2>${escapeHtml(c.headline || "Ready to build your next breakthrough?")}</h2>
          <p class="cta-sub">${escapeHtml(c.subheadline || "")}</p>
          <div class="cta-actions">
            <a href="${c.buttonHref || "#"}" class="btn btn-accent btn-lg">${escapeHtml(c.buttonText || "Get Started")}</a>
          </div>
          ${c.secondaryText ? `<p class="cta-note">${escapeHtml(c.secondaryText)}</p>` : ""}
        </div>
      </div>
    </section>`;

    case "form":
      const formFields = (c.fields || [])
        .map((f) => renderFormFieldHtml(f))
        .join("\n");
      return `    <!-- Customizable Bottom Form Section -->
    <section class="form-section section-padding" id="${section.id}">
      <div class="container form-container">
        <div class="section-header">
          ${c.badge ? `<span class="badge badge-accent">${escapeHtml(c.badge)}</span>` : ""}
          <h2>${escapeHtml(c.sectionTitle || "Get in Touch")}</h2>
          <p class="section-subtitle">${escapeHtml(c.subtitle || "")}</p>
        </div>

        <form class="lead-form card" data-form-handler data-gsap="card">
          <!-- Honeypot anti-spam -->
          <div style="display:none;" aria-hidden="true">
            <input type="text" name="_hp_company_field" tabindex="-1" autocomplete="off">
          </div>

          <div class="form-fields-grid">
${formFields}
          </div>

          <button type="submit" class="btn btn-accent btn-block btn-lg form-submit-btn">
            ${escapeHtml(c.submitButtonText || "Send Message")}
          </button>

          <div class="form-feedback hidden" data-form-feedback>
            <strong class="feedback-title">${escapeHtml(c.successTitle || "Thank you!")}</strong>
            <p class="feedback-desc">${escapeHtml(c.successMessage || "Your submission was received.")}</p>
          </div>
        </form>
      </div>
    </section>`;

    case "footer":
      const footerLinks = (c.links || [])
        .map((l) => `<a href="${l.href || "#"}">${escapeHtml(l.label)}</a>`)
        .join("\n          ");
      return `    <!-- Footer -->
    <footer class="footer-section" id="${section.id}">
      <div class="container footer-inner">
        <div class="footer-brand">
          <span class="footer-logo">${escapeHtml(c.brand || "Forma")}</span>
          <p class="footer-tagline">${escapeHtml(c.tagline || "")}</p>
        </div>
        <div class="footer-links">
          ${footerLinks}
        </div>
        <div class="footer-bottom">
          <p>${escapeHtml(c.copyright || "© All rights reserved.")}</p>
        </div>
      </div>
    </footer>`;

    default:
      return "";
  }
}

function renderFormFieldHtml(field) {
  const isHalf = field.width === "half";
  const colClass = isHalf ? "col-half" : "col-full";
  const reqAttr = field.required ? "required" : "";

  let inputHtml = "";

  switch (field.type) {
    case "textarea":
      inputHtml = `<textarea name="${field.name}" id="${field.id}" placeholder="${escapeHtml(field.placeholder || "")}" rows="4" class="form-control" ${reqAttr}></textarea>`;
      break;

    case "select":
      const options = (field.options || [])
        .map((opt) => `<option value="${escapeHtml(opt.value)}">${escapeHtml(opt.label)}</option>`)
        .join("\n            ");
      inputHtml = `<select name="${field.name}" id="${field.id}" class="form-control" ${reqAttr}>
            <option value="">${escapeHtml(field.placeholder || "Select an option...")}</option>
            ${options}
          </select>`;
      break;

    case "radio":
      inputHtml = `<div class="radio-group">
          ${(field.options || [])
            .map(
              (opt, idx) => `<label class="radio-label">
            <input type="radio" name="${field.name}" value="${escapeHtml(opt.value)}" ${reqAttr && idx === 0 ? "required" : ""}>
            <span>${escapeHtml(opt.label)}</span>
          </label>`
            )
            .join("\n          ")}
        </div>`;
      break;

    case "checkbox":
      inputHtml = `<div class="checkbox-group">
          ${(field.options || [])
            .map(
              (opt) => `<label class="checkbox-label">
            <input type="checkbox" name="${field.name}[]" value="${escapeHtml(opt.value)}">
            <span>${escapeHtml(opt.label)}</span>
          </label>`
            )
            .join("\n          ")}
        </div>`;
      break;

    default:
      inputHtml = `<input type="${field.type || "text"}" name="${field.name}" id="${field.id}" placeholder="${escapeHtml(field.placeholder || "")}" class="form-control" ${reqAttr}>`;
      break;
  }

  return `          <div class="form-group ${colClass}">
            <label for="${field.id}" class="form-label">${escapeHtml(field.label || field.name)}${field.required ? ' <span class="req">*</span>' : ""}</label>
            ${inputHtml}
          </div>`;
}

function generateCss(theme, motion, typography = {}) {
  const bg = theme.bg || "#0B0D0C";
  const text = theme.text || "#F5F5F0";
  const accent = theme.accent || "#C5FF65";
  const surface = theme.surface || "#121514";
  const border = theme.border || "#232825";
  const muted = theme.muted || "#8E928F";

  const headingFontMap = {
    serif: "'Playfair Display', Georgia, serif",
    mono: "'JetBrains Mono', monospace",
    sans: "'Plus Jakarta Sans', 'Inter', sans-serif",
    display: "'Space Grotesk', 'Syne', sans-serif",
  };
  const bodyFontMap = {
    serif: "'Playfair Display', Georgia, serif",
    mono: "'JetBrains Mono', monospace",
    sans: "'Plus Jakarta Sans', 'Inter', sans-serif",
  };

  const resolvedHeading = headingFontMap[typography?.headingFont] || headingFontMap.display;
  const resolvedBody = bodyFontMap[typography?.bodyFont] || bodyFontMap.sans;

  return `/* Forma Design System Tokens */
:root {
  --theme-bg: ${bg};
  --theme-text: ${text};
  --theme-accent: ${accent};
  --theme-surface: ${surface};
  --theme-border: ${border};
  --theme-muted: ${muted};

  --theme-heading-font: ${resolvedHeading};
  --theme-body-font: ${resolvedBody};
  --font-main: var(--theme-body-font);
  --font-heading: var(--theme-heading-font);
  --font-display: var(--theme-heading-font);
  --radius-sm: 8px;
  --radius-md: 14px;
  --radius-lg: 24px;
  --radius-pill: 9999px;
  --container-width: 1200px;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  background-color: var(--theme-bg);
  color: var(--theme-text);
  font-family: var(--font-main);
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
  overflow-x: hidden;
}

a {
  color: inherit;
  text-decoration: none;
}

img, video {
  max-width: 100%;
  height: auto;
  display: block;
}

.site-wrapper {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.container {
  width: 100%;
  max-width: var(--container-width);
  margin: 0 auto;
  padding: 0 24px;
}

.section-padding {
  padding: 96px 0;
}

/* Typography & Headers */
h1, h2, h3, h4 {
  font-family: var(--font-heading);
  line-height: 1.2;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.section-header {
  text-align: center;
  max-width: 720px;
  margin: 0 auto 56px auto;
}

.section-header h2 {
  font-size: clamp(2rem, 4vw, 2.75rem);
  margin: 12px 0 16px;
}

.section-subtitle {
  color: var(--theme-muted);
  font-size: 1.125rem;
}

/* Badges */
.badge {
  display: inline-flex;
  align-items: center;
  font-family: monospace;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  padding: 4px 12px;
  border-radius: var(--radius-pill);
  letter-spacing: 0.05em;
}

.badge-accent {
  background-color: rgba(255, 255, 255, 0.06);
  color: var(--theme-accent);
  border: 1px solid var(--theme-accent);
}

.badge-outline {
  background-color: rgba(255, 255, 255, 0.03);
  color: var(--theme-text);
  border: 1px solid var(--theme-border);
}

/* Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-heading);
  font-size: 0.9375rem;
  font-weight: 600;
  padding: 12px 24px;
  border-radius: var(--radius-pill);
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  border: 1px solid transparent;
}

.btn-accent {
  background-color: var(--theme-accent);
  color: var(--theme-bg);
}

.btn-accent:hover {
  transform: translateY(-2px);
  filter: brightness(1.1);
  box-shadow: 0 8px 24px -6px var(--theme-accent);
}

.btn-outline {
  background-color: rgba(255, 255, 255, 0.04);
  color: var(--theme-text);
  border-color: var(--theme-border);
}

.btn-outline:hover {
  background-color: rgba(255, 255, 255, 0.08);
  border-color: var(--theme-text);
  transform: translateY(-2px);
}

.btn-block {
  width: 100%;
}

.btn-lg {
  padding: 16px 36px;
  font-size: 1.0625rem;
}

/* Cards & Surfaces */
.card {
  background-color: var(--theme-surface);
  border: 1px solid var(--theme-border);
  border-radius: var(--radius-lg);
  padding: 32px;
  transition: transform 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
}

.card:hover {
  border-color: rgba(255, 255, 255, 0.15);
  box-shadow: 0 16px 32px -8px rgba(0, 0, 0, 0.5);
}

/* Grids */
.grid {
  display: grid;
  gap: 24px;
}

.grid-3 {
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
}

.grid-4 {
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
}

/* Announcement Bar */
.announcement-bar {
  background: var(--theme-surface);
  border-bottom: 1px solid var(--theme-border);
  padding: 10px 0;
  font-size: 0.8125rem;
}

.announcement-inner {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  flex-wrap: wrap;
}

.announcement-link {
  color: var(--theme-accent);
  font-weight: 600;
}

/* Navbar */
.navbar {
  position: sticky;
  top: 0;
  z-index: 100;
  background-color: rgba(11, 13, 12, 0.85);
  backdrop-filter: blur(16px);
  border-bottom: 1px solid var(--theme-border);
  padding: 18px 0;
}

.navbar-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.brand-logo {
  font-family: var(--font-display);
  font-size: 1.35rem;
  font-weight: 800;
  color: var(--theme-text);
  letter-spacing: -0.03em;
}

.nav-menu {
  display: flex;
  gap: 28px;
}

.nav-link {
  color: var(--theme-muted);
  font-size: 0.875rem;
  font-weight: 500;
  transition: color 0.2s ease;
}

.nav-link:hover {
  color: var(--theme-text);
}

/* Hero Section */
.hero-section {
  padding: 100px 0 80px;
  position: relative;
}

.hero-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 40px;
}

.hero-content {
  max-width: 840px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.hero-headline {
  font-family: var(--font-display);
  font-size: clamp(2.5rem, 6vw, 4.5rem);
  font-weight: 800;
  letter-spacing: -0.03em;
  line-height: 1.08;
}

.hero-subheadline {
  font-size: 1.25rem;
  color: var(--theme-muted);
  max-width: 640px;
}

.hero-actions {
  display: flex;
  gap: 16px;
  margin-top: 12px;
  flex-wrap: wrap;
  justify-content: center;
}

.hero-media-wrap {
  width: 100%;
  max-width: 1000px;
  border-radius: var(--radius-lg);
  overflow: hidden;
  border: 1px solid var(--theme-border);
  box-shadow: 0 32px 64px -16px rgba(0, 0, 0, 0.7);
}

/* Logo Strip */
.logo-strip-section {
  padding: 48px 0;
  border-top: 1px solid var(--theme-border);
  border-bottom: 1px solid var(--theme-border);
  text-align: center;
}

.logo-strip-title {
  font-size: 0.8125rem;
  text-transform: uppercase;
  font-family: monospace;
  color: var(--theme-muted);
  margin-bottom: 24px;
}

.logo-grid {
  display: flex;
  justify-content: center;
  gap: 48px;
  flex-wrap: wrap;
}

.logo-item {
  font-weight: 700;
  color: var(--theme-muted);
  font-size: 1.125rem;
  letter-spacing: -0.02em;
}

/* Stats */
.stat-card {
  background: var(--theme-surface);
  border: 1px solid var(--theme-border);
  border-radius: var(--radius-md);
  padding: 28px;
  text-align: center;
}

.stat-metric {
  font-family: var(--font-display);
  font-size: 2.75rem;
  font-weight: 800;
  color: var(--theme-accent);
  margin-bottom: 8px;
}

.stat-label {
  font-weight: 600;
  margin-bottom: 6px;
}

.stat-desc {
  font-size: 0.8125rem;
  color: var(--theme-muted);
}

/* Pricing */
.pricing-featured {
  border-color: var(--theme-accent);
  position: relative;
  box-shadow: 0 0 30px -10px var(--theme-accent);
}

.pricing-price {
  margin: 16px 0;
  display: flex;
  align-items: baseline;
  gap: 6px;
}

.price-val {
  font-size: 2.5rem;
  font-weight: 800;
}

.price-period {
  color: var(--theme-muted);
  font-size: 0.875rem;
}

.pricing-features {
  list-style: none;
  margin: 24px 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
  font-size: 0.9375rem;
}

/* FAQ Accordion */
.faq-container {
  max-width: 800px;
}

.faq-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.faq-accordion-item {
  border: 1px solid var(--theme-border);
  background: var(--theme-surface);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.faq-question {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  background: transparent;
  border: none;
  color: var(--theme-text);
  font-family: var(--font-heading);
  font-size: 1.0625rem;
  font-weight: 600;
  text-align: left;
  cursor: pointer;
}

.faq-icon {
  font-size: 1.5rem;
  color: var(--theme-accent);
  transition: transform 0.25s ease;
}

.faq-answer {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s cubic-bezier(0, 1, 0, 1);
  padding: 0 24px;
  color: var(--theme-muted);
}

.faq-accordion-item.active .faq-answer {
  max-height: 400px;
  padding-bottom: 20px;
  transition: max-height 0.35s ease-in;
}

.faq-accordion-item.active .faq-icon {
  transform: rotate(45deg);
}

/* Call to Action */
.cta-box {
  background: linear-gradient(180deg, var(--theme-surface) 0%, rgba(18, 21, 20, 0.4) 100%);
  border: 1px solid var(--theme-border);
  border-radius: var(--radius-lg);
  padding: 64px 32px;
  text-align: center;
  max-width: 900px;
  margin: 0 auto;
}

.cta-box h2 {
  font-size: clamp(2rem, 4vw, 3rem);
  margin-bottom: 16px;
}

.cta-sub {
  color: var(--theme-muted);
  font-size: 1.125rem;
  max-width: 540px;
  margin: 0 auto 32px;
}

.cta-note {
  margin-top: 16px;
  font-size: 0.8125rem;
  color: var(--theme-muted);
}

/* Customizable Bottom Form */
.form-container {
  max-width: 760px;
}

.lead-form {
  position: relative;
}

.form-fields-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-bottom: 24px;
}

.col-full {
  grid-column: span 2;
}

.col-half {
  grid-column: span 1;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-size: 0.8125rem;
  font-family: monospace;
  text-transform: uppercase;
  color: var(--theme-muted);
}

.req {
  color: var(--theme-accent);
}

.form-control {
  width: 100%;
  background-color: var(--theme-bg);
  border: 1px solid var(--theme-border);
  border-radius: var(--radius-sm);
  padding: 12px 16px;
  color: var(--theme-text);
  font-family: var(--font-main);
  font-size: 0.875rem;
  transition: border-color 0.2s ease;
}

.form-control:focus {
  outline: none;
  border-color: var(--theme-accent);
}

.radio-group, .checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 8px 0;
}

.radio-label, .checkbox-label {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.875rem;
  cursor: pointer;
}

.form-feedback {
  margin-top: 20px;
  padding: 16px;
  border-radius: var(--radius-sm);
  background-color: rgba(197, 255, 101, 0.1);
  border: 1px solid var(--theme-accent);
  color: var(--theme-text);
  text-align: center;
}

.form-feedback.hidden {
  display: none;
}

/* Footer */
.footer-section {
  border-top: 1px solid var(--theme-border);
  padding: 60px 0 32px;
  background-color: var(--theme-surface);
  margin-top: auto;
}

.footer-inner {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.footer-brand {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.footer-logo {
  font-family: var(--font-display);
  font-weight: 800;
  font-size: 1.25rem;
}

.footer-tagline {
  color: var(--theme-muted);
  font-size: 0.875rem;
}

.footer-links {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
  font-size: 0.875rem;
  color: var(--theme-muted);
}

.footer-links a:hover {
  color: var(--theme-text);
}

.footer-bottom {
  padding-top: 24px;
  border-top: 1px solid var(--theme-border);
  color: var(--theme-muted);
  font-size: 0.75rem;
}

/* Responsive Styles */
@media (max-width: 768px) {
  .section-padding {
    padding: 64px 0;
  }
  .nav-menu {
    display: none;
  }
  .col-half {
    grid-column: span 2;
  }
}
`;
}

function generateJs(pageConfig, motion) {
  const preset = motion?.preset || "cinematic";

  return `/**
 * Standalone Landing Page Script
 * Powers GSAP animations, FAQ accordions, and bottom form handling.
 */
document.addEventListener("DOMContentLoaded", () => {
  const isReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // 1. Initialize GSAP ScrollTrigger Animations
  if (typeof gsap !== "undefined" && !isReduced) {
    if (typeof ScrollTrigger !== "undefined") {
      gsap.registerPlugin(ScrollTrigger);
    }

    // Hero Timeline
    const heroTl = gsap.timeline({ defaults: { ease: "power3.out", duration: 0.8 } });
    const heroBadge = document.querySelector("[data-gsap='badge']");
    const heroHeadline = document.querySelector("[data-gsap='headline']");
    const heroSubheadline = document.querySelector("[data-gsap='subheadline']");
    const heroActions = document.querySelector("[data-gsap='actions']");
    const heroMedia = document.querySelector("[data-gsap='media']");

    if (heroBadge) heroTl.from(heroBadge, { opacity: 0, y: 15, duration: 0.5 });
    if (heroHeadline) heroTl.from(heroHeadline, { opacity: 0, y: 30 }, "-=0.3");
    if (heroSubheadline) heroTl.from(heroSubheadline, { opacity: 0, y: 20 }, "-=0.4");
    if (heroActions) heroTl.from(heroActions, { opacity: 0, y: 15 }, "-=0.3");
    if (heroMedia) heroTl.from(heroMedia, { opacity: 0, y: 40, scale: 0.96, duration: 1.1 }, "-=0.5");

    // Staggered cards reveal across sections
    document.querySelectorAll(".grid, .faq-list, .form-container").forEach((grid) => {
      const cards = grid.querySelectorAll("[data-gsap='card']");
      if (cards.length) {
        gsap.from(cards, {
          opacity: 0,
          y: 30,
          duration: 0.7,
          stagger: 0.1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: grid,
            start: "top 85%",
            once: true,
          },
        });
      }
    });
  }

  // 2. FAQ Accordion Interaction
  document.querySelectorAll("[data-faq-trigger]").forEach((button) => {
    button.addEventListener("click", () => {
      const parent = button.closest(".faq-accordion-item");
      const isActive = parent.classList.contains("active");

      // Close all other items in the same list
      parent.closest(".faq-list").querySelectorAll(".faq-accordion-item").forEach((item) => {
        item.classList.remove("active");
        item.querySelector("[data-faq-trigger]").setAttribute("aria-expanded", "false");
      });

      if (!isActive) {
        parent.classList.add("active");
        button.setAttribute("aria-expanded", "true");
      }
    });
  });

  // 3. Client Form Submission Handler
  const leadForm = document.querySelector("[data-form-handler]");
  if (leadForm) {
    leadForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      // Check Honeypot spam field
      const hp = leadForm.querySelector("input[name='_hp_company_field']");
      if (hp && hp.value) {
        console.warn("Spam submission blocked.");
        return;
      }

      const submitBtn = leadForm.querySelector(".form-submit-btn");
      const feedback = leadForm.querySelector("[data-form-feedback]");
      const originalText = submitBtn.textContent;

      submitBtn.disabled = true;
      submitBtn.textContent = "Sending...";

      // Gather form entries
      const formData = new FormData(leadForm);
      const data = Object.fromEntries(formData.entries());

      // Simulate submission network delay or integrate with your endpoint
      setTimeout(() => {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
        leadForm.reset();

        if (feedback) {
          feedback.classList.remove("hidden");
          feedback.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
      }, 700);
    });
  }
});
`;
}

function generateReadme(title) {
  return `# ${title} — Standalone Website Package

Crafted with **Forma — AI Landing Page Studio**.

This package contains 100% clean, standard HTML5, CSS3, and JavaScript with GSAP animations.
It does **NOT** require Node.js, Next.js, React, or any backend server to run.

---

## 📁 File Structure

\`\`\`
├── index.html       # Semantic HTML5 landing page structure
├── css/
│   └── styles.css   # Complete design system tokens, typography, and responsive grid
├── js/
│   └── main.js      # GSAP animations, FAQ accordion, and bottom form handling
└── README.md        # Deployment instructions
\`\`\`

---

## 🚀 How to Run Locally

### Option 1: Direct in Browser
Simply double-click \`index.html\` or drag it into any modern web browser.

### Option 2: Local HTTP Server (Recommended)
Using Python:
\`\`\`bash
python3 -m http.server 8000
\`\`\`

Using Node \`npx\`:
\`\`\`bash
npx serve .
\`\`\`

---

## 🌐 Deploying to Production

You can drag and drop this entire unzipped folder to:
- **Netlify Drop**: [netlify.com/drop](https://app.netlify.com/drop)
- **Vercel**: Import repository or run \`vercel\` in terminal
- **GitHub Pages**: Push files to a repository and enable Pages in settings
- **Cloudflare Pages**: Connect and deploy static folder directly

---

© ${new Date().getFullYear()} Generated via Forma AI Studio.
`;
}

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
