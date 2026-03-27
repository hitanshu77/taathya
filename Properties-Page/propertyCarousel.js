// Basic spotlight property carousel using data from:
// - window.propertyCardsData (from propertycards.js)
// - window.propertyCoordinates (from propertyCoordinates.js)

(function () {
  if (!window.propertyCardsData || !window.propertyCoordinates) {
    console.warn("propertyCarousel: missing propertyCardsData or propertyCoordinates");
    return;
  }

  const container = document.getElementById("property-carousel");
  if (!container) {
    console.warn('propertyCarousel: missing container with id "property-carousel"');
    return;
  }

  const filtersContainer = document.getElementById("property-filters");

  function normalizeName(name) {
    return (name || "").trim().replace(/^[@#\s\.\-_,;:]+/, "").trim();
  }

  function isDescriptiveName(name) {
    const lower = name.toLowerCase();
    const patterns = [
      "ready to move",
      "fully furnished",
      "luxurious",
      "luxury",
      "pre launch",
      "pre-launch",
      "prelaunch",
      "limited plots",
      "limited units",
      "corporate house",
      "showroom",
      "office",
      "pre-leased",
      "pre leased",
      "preleased",
      "investment property",
    ];
    return patterns.some((p) => lower.startsWith(p));
  }

  // Build a list of unique projects that have coordinates and valid names
  const coordsByName = window.propertyCoordinates;
  const projectsByName = {};

  function hasDistinctPrice(card) {
    const cats = Array.isArray(card.categories) ? card.categories : [];
    const price = (cats.length ? cats[0].price : card.priceText) || "";
    const p = price.toLowerCase().trim();
    if (!p) return false;
    if (/call|request/.test(p)) return false;     // "Price On Call / Request"
    if (p.includes(",")) return false;             // multiple/range "17 Cr , 15 Cr"
    if (/ to /.test(p) || / - /.test(p)) return false; // range "2 to 5 Cr"
    if (/each|per floor/i.test(p)) return false;  // "8.5 Cr Each Floor"
    return true;
  }

  for (const card of window.propertyCardsData) {
    const rawName = card.schemeName;
    const name = normalizeName(rawName);
    if (!name || isDescriptiveName(name)) continue;
    if (!coordsByName[name]) continue;
    if (!hasDistinctPrice(card)) continue;
    if (!projectsByName[name]) {
      projectsByName[name] = {
        name,
        coordinates: coordsByName[name],
        card,
      };
    }
  }

  const allProjects = Object.values(projectsByName);
  if (!allProjects.length) {
    console.warn("propertyCarousel: no projects with coordinates found");
    return;
  }

  const FEATURED_COUNT = 15;
  let visibleProjects = allProjects.slice(0); // filtered set
  let featuredProjects = visibleProjects.slice(0, FEATURED_COUNT);
  let activeIndex = 0;

  const filterState = {
    type: "all",
    bhk: "all",
    location: "all",
    price: "all",
  };

  function getPrimaryImage(card) {
    if (Array.isArray(card.images) && card.images.length > 0) {
      return card.images[0];
    }
    if (card.image) return card.image;
    return "images/placeholder.jpg";
  }

  function getBhk(card) {
    if (Array.isArray(card.categories) && card.categories.length > 0) {
      return card.categories[0].bhk || "";
    }
    return card.title || "";
  }

  function getPrice(card) {
    if (Array.isArray(card.categories) && card.categories.length > 0) {
      return card.categories[0].price || "";
    }
    return card.priceText || "";
  }

  function getSlogan(card) {
    if (Array.isArray(card.features) && card.features.length > 0) {
      return card.features[0];
    }
    return "";
  }

  function getBuilderLogo(name) {
    const lower = name.toLowerCase();
    if (lower.includes("adani")) {
      return "imagesss/adani_realty.svg";
    }
    if (lower.includes("shridhar") || lower.includes("shaligram")) {
      return "imagesss/A-Shridhar.svg";
    }
    if (lower.includes("emberlynn")) {
      return "imagesss/Emberlynn-logo.svg";
    }
    return null;
  }

  function getTypeBadge(card) {
    const type = (card.type || "").toLowerCase();
    const bhk  = getBhk(card).toLowerCase();
    const name = (card.schemeName || "").toLowerCase();
    if (type.includes("commercial") || bhk.includes("office") || bhk.includes("showroom")) {
      return { label: "Commercial", cls: "badge-commercial" };
    }
    if (type.includes("plot") || bhk.includes("plot")) {
      return { label: "Plot", cls: "badge-plot" };
    }
    if (bhk.includes("4 bhk") || bhk.includes("5 bhk") ||
        /luxuria|imperial|elite|grand|sky|heights|tower/i.test(name)) {
      return { label: "Luxury", cls: "badge-luxury" };
    }
    return { label: "Residential", cls: "badge-residential" };
  }

  function createCardElement(project) {
    const { card, name } = project;
    const image  = getPrimaryImage(card);
    const bhk    = getBhk(card);
    const price  = getPrice(card);
    const slogan = getSlogan(card);
    const logo   = getBuilderLogo(name);
    const badge  = getTypeBadge(card);
    const loc    = card.propertyLocation || card.latest || "";

    const cardDiv = document.createElement("div");
    cardDiv.dataset.projectName = name;

    cardDiv.innerHTML = `
      <div class="carousel-card-inner">
        <div class="carousel-card-image-wrap">
          <img class="carousel-card-image" src="${image}" alt="${name}"
               onerror="this.style.display='none';this.parentElement.style.background='linear-gradient(135deg,#0d1428,#1a2448)'">
          ${badge ? `<span class="carousel-card-type-badge ${badge.cls}">${badge.label}</span>` : ""}
          ${logo  ? `<img class="carousel-card-logo" src="${logo}" alt="${name} logo"
                         onerror="this.style.display='none'">` : ""}
        </div>
        <div class="carousel-card-body">
          <h3 class="carousel-card-title">${name}</h3>
          <div class="carousel-card-meta">
            <span class="carousel-card-location">${loc}</span>
            <span class="carousel-card-bhk">${bhk}</span>
          </div>
          <div class="carousel-card-price">${price || "Price on request"}</div>
          ${slogan ? `<div class="carousel-card-slogan">${slogan}</div>` : ""}
        </div>
      </div>
    `;

    cardDiv.addEventListener("click", () => {
      openPropertyPanel(project);
    });

    return cardDiv;
  }

  function openPropertyPanel(project) {
    let panel = document.getElementById("property-detail-panel");
    if (!panel) {
      panel = document.createElement("div");
      panel.id = "property-detail-panel";
      
      // Close when clicking outside the panel
      document.addEventListener("click", (e) => {
        if (panel.classList.contains("open") && !panel.contains(e.target) && !e.target.closest(".carousel-card")) {
          panel.classList.remove("open");
        }
      });
      document.body.appendChild(panel);
    }

    const { card, name } = project;
    const logo = getBuilderLogo(name);
    const bhk = getBhk(card);
    const price = getPrice(card);
    const location = card.propertyLocation || card.latest || "";
    
    // Images gallery
    const images = Array.isArray(card.images) ? card.images : (card.image ? [card.image] : []);
    const mainImg = images.length > 0 ? images[0] : "images/placeholder.jpg";
    const thumbsHTML = images.slice(1, 5).map(img => `<img class="panel-thumb" src="${img}">`).join("");

    const featuresHTML = Array.isArray(card.features) 
      ? card.features.slice(0, 8).map(f => `<li>${f}</li>`).join("") 
      : "";

    panel.innerHTML = `
      <div class="panel-close">&times;</div>
      <div class="panel-content">
        <div class="panel-gallery">
          <img class="panel-main-img" src="${mainImg}" alt="${name}">
          ${thumbsHTML ? `<div class="panel-thumbs">${thumbsHTML}</div>` : ""}
        </div>
        <div class="panel-info">
          ${logo ? `<img class="panel-builder-logo" src="${logo}" alt="Builder">` : `<div class="panel-builder-name">${name}</div>`}
          <h2>${name}</h2>
          <p class="panel-location">${location}</p>
          <div class="panel-meta">
            <span class="panel-price">${price}</span>
            <span class="panel-bhk">${bhk}</span>
          </div>
          ${featuresHTML ? `<ul class="panel-features">${featuresHTML}</ul>` : ""}
          <div class="panel-actions">
            <button class="primary-btn">Download Brochure</button>
            <button class="secondary-btn">Contact Developer</button>
            <button class="secondary-btn">Schedule Visit</button>
          </div>
        </div>
      </div>
    `;

    // Wait a brief moment to apply the slide-up class
    setTimeout(() => {
      panel.classList.add("open");
    }, 10);

    panel.querySelector(".panel-close").addEventListener("click", () => {
      panel.classList.remove("open");
    });
  }

  let isUIBuilt = false;
  let trackEl, leftBtn, rightBtn;
  let cardElements = [];

  function buildCarouselUI() {
    container.innerHTML = "";

    const wrapper = document.createElement("div");
    wrapper.className = "carousel-wrapper";

    leftBtn = document.createElement("button");
    leftBtn.className = "carousel-nav carousel-nav-left";
    leftBtn.innerHTML = "‹";

    rightBtn = document.createElement("button");
    rightBtn.className = "carousel-nav carousel-nav-right";
    rightBtn.innerHTML = "›";

    trackEl = document.createElement("div");
    trackEl.className = "carousel-track";

    wrapper.appendChild(leftBtn);
    wrapper.appendChild(trackEl);
    wrapper.appendChild(rightBtn);

    container.appendChild(wrapper);

    leftBtn.addEventListener("click", () => {
      activeIndex = (activeIndex - 1 + featuredProjects.length) % featuredProjects.length;
      updateCarousel();
      emitCarouselChange();
    });

    rightBtn.addEventListener("click", () => {
      activeIndex = (activeIndex + 1) % featuredProjects.length;
      updateCarousel();
      emitCarouselChange();
    });

    // Touch swipe capabilities
    let touchStartX = 0;
    let touchStartY = 0;
    let touchCurrentX = 0;
    let isSwiping = false;

    trackEl.addEventListener("touchstart", (e) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      touchCurrentX = touchStartX;
      isSwiping = true;
      trackEl.style.transition = "none";
    }, { passive: true });

    trackEl.addEventListener("touchmove", (e) => {
      if (!isSwiping) return;
      touchCurrentX = e.touches[0].clientX;
      const touchCurrentY = e.touches[0].clientY;
      const diffX = touchCurrentX - touchStartX;
      const diffY = touchCurrentY - touchStartY;

      if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 10) {
        if (e.cancelable) e.preventDefault();
        trackEl.style.transform = `translateX(${diffX * 0.4}px)`;
      } else if (Math.abs(diffY) > 10) {
        // Vertical dragging
        isSwiping = false;
        trackEl.style.transform = "";
      }
    }, { passive: false });

    trackEl.addEventListener("touchend", () => {
      if (!isSwiping) return;
      isSwiping = false;
      const diffX = touchCurrentX - touchStartX;
      
      trackEl.style.transition = "transform 0.4s ease";
      trackEl.style.transform = "";

      if (Math.abs(diffX) > 60) {
        if (diffX > 0) {
          activeIndex = (activeIndex - 1 + featuredProjects.length) % featuredProjects.length;
        } else {
          activeIndex = (activeIndex + 1) % featuredProjects.length;
        }
        updateCarousel();
        emitCarouselChange();
      }
    });

    isUIBuilt = true;
  }

  function render() {
    if (!isUIBuilt) buildCarouselUI();
    
    trackEl.innerHTML = "";
    cardElements = [];
    
    if (!featuredProjects.length) return;

    // Build all active elements once so CSS handles transitions
    featuredProjects.forEach((proj) => {
      const cardDiv = createCardElement(proj);
      cardDiv.className = "carousel-card carousel-card-hidden";
      trackEl.appendChild(cardDiv);
      cardElements.push(cardDiv);
    });

    updateCarousel();
  }

  function updateCarousel() {
    // --- CSS PHYSICS CACHE ---
    // Instead of completely rebuilding innerHTML (costly), this safely assigns the 'left', 'right', 'center',
    // or 'hidden' CSS classes to pre-rendered nodes. The browser inherently handles smooth GPU translations natively.
    if (!featuredProjects.length) return;
    
    const count = featuredProjects.length;
    let prevIndex = (activeIndex - 1 + count) % count;
    let nextIndex = (activeIndex + 1) % count;

    if (count === 1) {
      prevIndex = -1;
      nextIndex = -1;
    }

    cardElements.forEach((el, idx) => {
      if (idx === activeIndex) {
        el.className = "carousel-card carousel-card-center";
      } else if (idx === prevIndex) {
        el.className = "carousel-card carousel-card-left";
      } else if (idx === nextIndex) {
        el.className = "carousel-card carousel-card-right";
      } else {
        el.className = "carousel-card carousel-card-hidden";
      }
    });
  }

  function emitCarouselChange() {
    const project = featuredProjects[activeIndex];
    if (!project) return;
    const event = new CustomEvent("propertyCarouselChanged", {
      detail: { name: project.name },
    });
    const filterEvent = new CustomEvent("propertyFiltersChanged", {
      detail: { names: visibleProjects.map((p) => p.name) },
    });
    window.dispatchEvent(event);
    window.dispatchEvent(filterEvent);
  }

  // Respond to selection coming from the map
  window.addEventListener("propertySelected", (e) => {
    const name = e.detail && e.detail.name;
    if (!name) return;
    const idx = featuredProjects.findIndex((p) => p.name === name);
    if (idx === -1) return;
    activeIndex = idx;
    updateCarousel();
  });

  function parseBhk(card) {
    const bhkText =
      Array.isArray(card.categories) && card.categories.length
        ? String(card.categories[0].bhk || "")
        : String(card.title || "");
    const match = bhkText.match(/(\d+)\s*bhk/i);
    return match ? parseInt(match[1], 10) : null;
  }

  function parsePriceCr(card) {
    const priceText =
      Array.isArray(card.categories) && card.categories.length
        ? String(card.categories[0].price || "")
        : String(card.priceText || "");
    const crMatch = priceText.match(/([\d\.]+)\s*cr/i);
    if (crMatch) return parseFloat(crMatch[1]);
    const lMatch = priceText.match(/([\d\.]+)\s*l/i); // Lacs
    if (lMatch) return parseFloat(lMatch[1]) / 100;
    return null;
  }

  function applyFilters() {
    visibleProjects = allProjects.filter((p) => {
      const card = p.card;

      // Type filter
      if (filterState.type !== "all") {
        const type = (card.type || "").toLowerCase();
        if (filterState.type === "residential" && !type.includes("residential") && !type.includes("duplex")) {
          return false;
        }
        if (filterState.type === "commercial" && !type.includes("commercial")) {
          return false;
        }
        if (filterState.type === "plot" && !type.includes("plot")) {
          return false;
        }
      }

      // BHK filter
      const bhk = parseBhk(card);
      if (filterState.bhk === "2" && bhk !== 2) return false;
      if (filterState.bhk === "3" && bhk !== 3) return false;
      if (filterState.bhk === "4plus" && (!bhk || bhk < 4)) return false;

      // Location filter (locationTag)
      if (filterState.location !== "all") {
        const tag = (card.locationTag || "").toUpperCase();
        if (tag !== filterState.location) return false;
      }

      // Price filter
      const priceCr = parsePriceCr(card);
      if (priceCr != null) {
        if (filterState.price === "<1" && !(priceCr < 1)) return false;
        if (filterState.price === "1-2" && !(priceCr >= 1 && priceCr < 2)) return false;
        if (filterState.price === "2-5" && !(priceCr >= 2 && priceCr < 5)) return false;
        if (filterState.price === "5plus" && !(priceCr >= 5)) return false;
      }

      return true;
    });

    if (!visibleProjects.length) {
      visibleProjects = allProjects.slice(0);
    }

    featuredProjects = visibleProjects.slice(0, FEATURED_COUNT);
    activeIndex = 0;
    render();
    emitCarouselChange();
  }

  function buildFiltersUI() {
    if (!filtersContainer) return;

    filtersContainer.classList.add("property-filters");
    filtersContainer.innerHTML = "";

    const typeSelect = document.createElement("select");
    typeSelect.innerHTML = `
      <option value="all">All Types</option>
      <option value="residential">Residential</option>
      <option value="commercial">Commercial</option>
      <option value="plot">Plot</option>
    `;

    const bhkSelect = document.createElement("select");
    bhkSelect.innerHTML = `
      <option value="all">All BHK</option>
      <option value="2">2 BHK</option>
      <option value="3">3 BHK</option>
      <option value="4plus">4+ BHK</option>
    `;

    const locationSelect = document.createElement("select");
    const uniqueTags = Array.from(
      new Set(
        allProjects
          .map((p) => (p.card.locationTag || "").toUpperCase())
          .filter((t) => t)
      )
    ).sort();
    locationSelect.innerHTML =
      `<option value="all">All Locations</option>` +
      uniqueTags.map((t) => `<option value="${t}">${t}</option>`).join("");

    const priceSelect = document.createElement("select");
    priceSelect.innerHTML = `
      <option value="all">All Prices</option>
      <option value="<1">&lt; 1 Cr</option>
      <option value="1-2">1–2 Cr</option>
      <option value="2-5">2–5 Cr</option>
      <option value="5plus">&gt; 5 Cr</option>
    `;

    typeSelect.addEventListener("change", () => {
      filterState.type = typeSelect.value;
      applyFilters();
    });
    bhkSelect.addEventListener("change", () => {
      filterState.bhk = bhkSelect.value;
      applyFilters();
    });
    locationSelect.addEventListener("change", () => {
      filterState.location = locationSelect.value;
      applyFilters();
    });
    priceSelect.addEventListener("change", () => {
      filterState.price = priceSelect.value;
      applyFilters();
    });

    filtersContainer.appendChild(typeSelect);
    filtersContainer.appendChild(bhkSelect);
    filtersContainer.appendChild(locationSelect);
    filtersContainer.appendChild(priceSelect);
  }

  buildFiltersUI();
  applyFilters();
})();

// ─────────────────────────────────────────
// PROPERTY GRID — all properties (called lazily on scroll)
// ─────────────────────────────────────────
window.buildPropertyGrid = function () {
  const gridEl = document.getElementById("property-grid");
  if (!gridEl || !window.propertyCardsData) return;
  if (gridEl.dataset.built) return;
  gridEl.dataset.built = "1";

  // ── Deduplicate by schemeName ──────────────────────────────────
  const seen  = new Set();
  const items = [];
  for (const card of window.propertyCardsData) {
    const name = (card.schemeName || "").trim();
    if (!name || seen.has(name)) continue;
    seen.add(name);
    items.push(card);
  }

  // ── Helpers ────────────────────────────────────────────────────
  function gImg(c) { return (Array.isArray(c.images) && c.images.length) ? c.images[0] : (c.image || ""); }
  function gPrice(c) { return (Array.isArray(c.categories) && c.categories.length) ? (c.categories[0].price || c.priceText || "") : (c.priceText || ""); }
  function gBhk(c)  { return (Array.isArray(c.categories) && c.categories.length) ? (c.categories[0].bhk || "") : (c.title || ""); }
  function gBadge(c) {
    const t = (c.type || "").toLowerCase();
    const b = gBhk(c).toLowerCase();
    if (t.includes("commercial") || b.includes("office") || b.includes("showroom")) return { l: "Commercial", cls: "badge-commercial" };
    if (t.includes("plot") || b.includes("plot")) return { l: "Plot", cls: "badge-plot" };
    if (/duplex|penthouse/i.test(c.type)) return { l: "Penthouse", cls: "badge-luxury" };
    if (/4 bhk|5 bhk|6 bhk|luxur|imperial|elite|sky|tower/i.test(gBhk(c) + c.schemeName)) return { l: "Luxury", cls: "badge-luxury" };
    return { l: "Residential", cls: "badge-residential" };
  }

  // ── Group by area ───────────────────────────────────────────────
  const areaMap = new Map();
  for (const card of items) {
    const area = (card.propertyLocation || card.latest || "Other").trim().toUpperCase();
    if (!areaMap.has(area)) areaMap.set(area, []);
    areaMap.get(area).push(card);
  }
  // Sort areas: most properties first, then alpha
  const sortedAreas = [...areaMap.entries()].sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0]));

  // ── Build HTML ──────────────────────────────────────────────────
  const svgPin = `<svg class="grid-pin-icon" viewBox="0 0 16 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 0C4.69 0 2 2.69 2 6c0 4.5 6 14 6 14s6-9.5 6-14c0-3.31-2.69-6-6-6Zm0 9a3 3 0 1 1 0-6 3 3 0 0 1 0 6Z" fill="currentColor"/></svg>`;

  const html = sortedAreas.map(([area, cards]) => {
    const cardsHtml = cards.map((c) => {
      const img    = gImg(c);
      const price  = gPrice(c);
      const bhk    = gBhk(c);
      const badge  = gBadge(c);
      const loc    = c.propertyLocation || c.latest || "";
      const imgTag = img
        ? `<img class="grid-card-img" src="${img}" alt="${c.schemeName || ""}" loading="lazy" onerror="this.style.visibility='hidden'">`
        : `<div class="grid-card-no-img"></div>`;
      return `<div class="grid-card">
  <div class="grid-card-img-wrap">
    ${imgTag}
    <span class="grid-card-badge ${badge.cls}">${badge.l}</span>
    <div class="grid-card-img-overlay"></div>
  </div>
  <div class="grid-card-body">
    <h3 class="grid-card-name">${c.schemeName || ""}</h3>
    ${loc ? `<p class="grid-card-loc">${svgPin}${loc}</p>` : ""}
    <div class="grid-card-footer">
      <span class="grid-card-bhk">${bhk}</span>
      <span class="grid-card-price">${price || "—"}</span>
    </div>
  </div>
</div>`;
    }).join("");

    return `<div class="grid-area-group">
  <div class="grid-area-header">
    <h3 class="grid-area-title">${area.charAt(0) + area.slice(1).toLowerCase()}</h3>
    <span class="grid-area-count">${cards.length} ${cards.length === 1 ? "property" : "properties"}</span>
    <div class="grid-area-line"></div>
  </div>
  <div class="property-area-cards">${cardsHtml}</div>
</div>`;
  }).join("");

  gridEl.innerHTML = html;
};

