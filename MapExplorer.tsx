import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import type { Property } from "@/data/properties";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || "";

interface MapExplorerProps {
  properties: Property[];
  activeProperty: Property | null;
  onPropertyClick: (propertyId: string) => void;
  isVisible: boolean;
}

const AHMEDABAD_CENTER: [number, number] = [72.54, 23.05];

// ─── Color palette ────────────────────────────────────────────────────────────
function getBuildingColors(property: Property) {
  const { featured, type, status } = property;

  if (featured) {
    return {
      podium: "hsl(43, 85%, 38%)",
      tower:  "hsl(45, 90%, 48%)",
      upper:  "hsl(48, 95%, 58%)",
      accent: "hsl(50, 100%, 68%)",
      crown:  "hsl(55, 100%, 78%)",
    };
  }
  if (type === "Penthouse") {
    return {
      podium: "hsl(220, 30%, 28%)",
      tower:  "hsl(215, 40%, 38%)",
      upper:  "hsl(210, 50%, 50%)",
      accent: "hsl(200, 60%, 62%)",
      crown:  "hsl(195, 70%, 72%)",
    };
  }
  if (type === "Commercial") {
    return {
      podium: "hsl(195, 25%, 24%)",
      tower:  "hsl(200, 35%, 34%)",
      upper:  "hsl(205, 45%, 44%)",
      accent: "hsl(210, 55%, 55%)",
      crown:  "hsl(215, 65%, 65%)",
    };
  }
  if (type === "Villa") {
    return {
      podium: "hsl(25, 40%, 28%)",
      tower:  "hsl(28, 45%, 36%)",
      upper:  "hsl(30, 50%, 44%)",
      accent: "hsl(32, 55%, 52%)",
      crown:  "hsl(35, 60%, 60%)",
    };
  }
  if (status === "New Launch") {
    return {
      podium: "hsl(280, 25%, 26%)",
      tower:  "hsl(275, 30%, 34%)",
      upper:  "hsl(270, 40%, 44%)",
      accent: "hsl(265, 50%, 55%)",
      crown:  "hsl(260, 60%, 65%)",
    };
  }
  return {
    podium: "hsl(216, 18%, 24%)",
    tower:  "hsl(218, 22%, 32%)",
    upper:  "hsl(220, 28%, 42%)",
    accent: "hsl(222, 35%, 52%)",
    crown:  "hsl(224, 45%, 62%)",
  };
}

// ─── Shape library ────────────────────────────────────────────────────────────

function shapeRect(cx: number, cy: number, hw: number, hh: number): number[][] {
  return [
    [cx - hw, cy - hh], [cx + hw, cy - hh],
    [cx + hw, cy + hh], [cx - hw, cy + hh],
    [cx - hw, cy - hh],
  ];
}

function shapeL(cx: number, cy: number, s: number): number[][] {
  const w = s * 1.8, h = s * 1.6, nw = s * 0.9, nh = s * 0.7;
  return [
    [cx - w, cy - h], [cx + w, cy - h],
    [cx + w, cy - h + nh], [cx + w - nw, cy - h + nh],
    [cx + w - nw, cy + h], [cx - w, cy + h],
    [cx - w, cy - h],
  ];
}

function shapeT(cx: number, cy: number, s: number): number[][] {
  const bw = s * 2.0, bh = s * 0.6, sw = s * 0.8, sh = s * 1.4;
  return [
    [cx - bw, cy - bh - sh], [cx + bw, cy - bh - sh],
    [cx + bw, cy - sh], [cx + sw, cy - sh],
    [cx + sw, cy + sh], [cx - sw, cy + sh],
    [cx - sw, cy - sh], [cx - bw, cy - sh],
    [cx - bw, cy - bh - sh],
  ];
}

function shapeCross(cx: number, cy: number, s: number): number[][] {
  const a = s * 0.65, b = s * 1.5;
  return [
    [cx - a, cy - b], [cx + a, cy - b],
    [cx + a, cy - a], [cx + b, cy - a],
    [cx + b, cy + a], [cx + a, cy + a],
    [cx + a, cy + b], [cx - a, cy + b],
    [cx - a, cy + a], [cx - b, cy + a],
    [cx - b, cy - a], [cx - a, cy - a],
    [cx - a, cy - b],
  ];
}

function shapeOctagon(cx: number, cy: number, s: number): number[][] {
  const r = s * 1.4, c = r * 0.414;
  return [
    [cx - c, cy - r], [cx + c, cy - r],
    [cx + r, cy - c], [cx + r, cy + c],
    [cx + c, cy + r], [cx - c, cy + r],
    [cx - r, cy + c], [cx - r, cy - c],
    [cx - c, cy - r],
  ];
}

function shapeU(cx: number, cy: number, s: number): number[][] {
  const ow = s * 1.8, oh = s * 1.6, iw = s * 0.9, id = s * 1.0;
  return [
    [cx - ow, cy - oh], [cx + ow, cy - oh],
    [cx + ow, cy + oh], [cx + iw, cy + oh],
    [cx + iw, cy - oh + id], [cx - iw, cy - oh + id],
    [cx - iw, cy + oh], [cx - ow, cy + oh],
    [cx - ow, cy - oh],
  ];
}

function shapeDiamond(cx: number, cy: number, s: number): number[][] {
  return [
    [cx, cy - s], [cx + s, cy],
    [cx, cy + s], [cx - s, cy],
    [cx, cy - s],
  ];
}

function shapeSlab(cx: number, cy: number, s: number): number[][] {
  return shapeRect(cx, cy, s * 2.4, s * 0.7);
}

function scalePolygon(ring: number[][], cx: number, cy: number, scale: number): number[][] {
  return ring.map(([x, y]) => [cx + (x - cx) * scale, cy + (y - cy) * scale]);
}

// ─── Building part generator ──────────────────────────────────────────────────

type BuildingPart = {
  polygon: number[][];
  height: number;
  base: number;
  part: string;
  color: string;
};

function getShapeIndex(property: Property): number {
  const n = parseInt(property.id.replace(/\D/g, ""), 10) || 0;
  return n % 6;
}

function generateBuildingParts(
  lng: number,
  lat: number,
  property: Property,
  scaleFactor: number
): BuildingPart[] {
  const s  = scaleFactor * 0.0001;
  const h  = property.height;
  const colors = getBuildingColors(property);
  const parts: BuildingPart[] = [];
  const si = getShapeIndex(property);

  const isVilla      = property.type === "Villa" || property.type === "Plot";
  const isTall       = h > 90;
  const isMedium     = h > 45 && h <= 90;
  const isCommercial = property.type === "Commercial";

  if (isVilla) {
    parts.push({ polygon: shapeL(lng, lat, s * 1.1),  height: h * 0.55, base: 0,       part: "base",  color: colors.podium });
    parts.push({ polygon: shapeRect(lng - s * 0.3, lat, s * 0.7, s * 0.6), height: h,  base: h * 0.55, part: "upper", color: colors.tower });
    parts.push({ polygon: shapeSlab(lng, lat + s * 0.8, s * 0.6), height: h * 0.3, base: 0, part: "annex", color: colors.podium });
    return parts;
  }

  if (isCommercial) {
    parts.push({ polygon: shapeSlab(lng, lat, s * 1.4), height: h * 0.18, base: 0, part: "podium", color: colors.podium });
    parts.push({ polygon: shapeRect(lng, lat, s * 0.9, s * 1.3), height: h * 0.85, base: h * 0.18, part: "tower", color: colors.tower });
    parts.push({ polygon: shapeRect(lng, lat, s * 0.85, s * 1.2), height: h, base: h * 0.85, part: "cap", color: colors.upper });
    parts.push({ polygon: shapeRect(lng - s * 0.9, lat, s * 0.05, s * 1.25), height: h * 0.85, base: h * 0.18, part: "fin-l", color: colors.accent });
    parts.push({ polygon: shapeRect(lng + s * 0.9, lat, s * 0.05, s * 1.25), height: h * 0.85, base: h * 0.18, part: "fin-r", color: colors.accent });
    return parts;
  }

  if (isTall) {
    const footprints: Record<number, number[][]> = {
      0: shapeCross(lng, lat, s * 0.9),
      1: shapeOctagon(lng, lat, s * 1.0),
      2: shapeT(lng, lat, s * 0.7),
      3: shapeL(lng, lat, s * 0.9),
      4: shapeCross(lng, lat, s * 0.75),
      5: shapeOctagon(lng, lat, s * 0.85),
    };
    const fp = footprints[si] ?? shapeRect(lng, lat, s * 0.9, s * 0.9);

    parts.push({ polygon: shapeSlab(lng, lat, s * 1.2), height: h * 0.12, base: 0, part: "podium", color: colors.podium });
    parts.push({ polygon: shapeRect(lng, lat, s * 1.1, s * 1.0), height: h * 0.22, base: h * 0.12, part: "podium2", color: colors.podium });
    parts.push({ polygon: fp, height: h * 0.75, base: h * 0.22, part: "tower", color: colors.tower });
    parts.push({ polygon: scalePolygon(fp, lng, lat, 0.8), height: h * 0.88, base: h * 0.75, part: "upper", color: colors.upper });
    parts.push({ polygon: scalePolygon(fp, lng, lat, 0.55), height: h * 0.96, base: h * 0.88, part: "crown-base", color: colors.accent });
    parts.push({ polygon: shapeDiamond(lng, lat, s * 0.22), height: h, base: h * 0.96, part: "crown", color: colors.crown });

    if (si % 2 === 0) {
      parts.push({ polygon: shapeRect(lng + s * 1.15, lat - s * 0.3, s * 0.55, s * 0.7), height: h * 0.38, base: 0, part: "wing", color: colors.podium });
    } else {
      parts.push({ polygon: shapeRect(lng - s * 1.15, lat + s * 0.2, s * 0.5, s * 0.6), height: h * 0.3, base: 0, part: "wing2", color: colors.podium });
    }
    return parts;
  }

  if (isMedium) {
    const footprints: Record<number, number[][]> = {
      0: shapeU(lng, lat, s * 0.85),
      1: shapeL(lng, lat, s * 0.85),
      2: shapeRect(lng, lat, s * 0.9, s * 0.75),
      3: shapeT(lng, lat, s * 0.6),
      4: shapeU(lng, lat, s * 0.8),
      5: shapeL(lng, lat, s * 0.8),
    };
    const fp = footprints[si] ?? shapeRect(lng, lat, s, s * 0.9);

    parts.push({ polygon: shapeSlab(lng, lat, s), height: h * 0.15, base: 0, part: "podium", color: colors.podium });
    parts.push({ polygon: fp, height: h * 0.72, base: h * 0.15, part: "tower", color: colors.tower });
    parts.push({ polygon: scalePolygon(fp, lng, lat, 0.7), height: h * 0.9, base: h * 0.72, part: "upper", color: colors.upper });
    parts.push({ polygon: scalePolygon(fp, lng, lat, 0.4), height: h, base: h * 0.9, part: "crown", color: colors.accent });

    const ledgeLevels = Math.min(Math.floor(h / 28), 3);
    for (let i = 1; i <= ledgeLevels; i++) {
      const lh = h * 0.15 + (h * 0.57) * (i / (ledgeLevels + 1));
      parts.push({ polygon: scalePolygon(fp, lng, lat, 1.04), height: lh + 1.5, base: lh, part: "ledge", color: colors.accent });
    }
    return parts;
  }

  // Low-rise
  const footprints: Record<number, number[][]> = {
    0: shapeRect(lng, lat, s * 1.0, s * 0.9),
    1: shapeL(lng, lat, s * 0.7),
    2: shapeRect(lng, lat, s * 1.2, s * 0.6),
    3: shapeU(lng, lat, s * 0.65),
    4: shapeRect(lng, lat, s * 0.85, s * 0.85),
    5: shapeL(lng, lat, s * 0.6),
  };
  const fp = footprints[si] ?? shapeRect(lng, lat, s, s * 0.8);
  parts.push({ polygon: fp, height: h * 0.8, base: 0, part: "body", color: colors.tower });
  parts.push({ polygon: scalePolygon(fp, lng, lat, 0.75), height: h, base: h * 0.8, part: "top", color: colors.upper });
  return parts;
}

// ─── Component ────────────────────────────────────────────────────────────────

const MapExplorer = ({
  properties,
  activeProperty,
  onPropertyClick,
  isVisible,
}: MapExplorerProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef       = useRef<mapboxgl.Map | null>(null);
  const popupRef     = useRef<mapboxgl.Popup | null>(null);
  const rotateRef    = useRef<number | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  function startIdleRotation(map: mapboxgl.Map) {
    stopIdleRotation();
    let bearing = map.getBearing();
    const step = () => {
      bearing = (bearing + 0.018) % 360;
      map.setBearing(bearing);
      rotateRef.current = requestAnimationFrame(step);
    };
    rotateRef.current = requestAnimationFrame(step);
  }

  function stopIdleRotation() {
    if (rotateRef.current !== null) {
      cancelAnimationFrame(rotateRef.current);
      rotateRef.current = null;
    }
  }

  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: AHMEDABAD_CENTER,
      zoom: 11.5,
      pitch: 62,
      bearing: -20,
      antialias: true,
    });

    map.addControl(new mapboxgl.NavigationControl({ showCompass: true }), "top-right");

    map.on("load", () => {
      (map as any).setFog({
        color:            "hsl(230, 15%, 6%)",
        "high-color":     "hsl(225, 20%, 14%)",
        "horizon-blend":  0.12,
        "space-color":    "hsl(230, 15%, 3%)",
        "star-intensity": 0.25,
      });

      // Real Ahmedabad OSM building footprints as dark base
      map.addLayer(
        {
          id:     "osm-buildings-base",
          type:   "fill-extrusion",
          source: "composite",
          "source-layer": "building",
          filter: ["==", "extrude", "true"],
          paint: {
            "fill-extrusion-color": [
              "interpolate", ["linear"], ["get", "height"],
              0,   "hsl(225, 14%, 10%)",
              20,  "hsl(225, 16%, 14%)",
              60,  "hsl(225, 18%, 18%)",
              120, "hsl(225, 20%, 22%)",
            ],
            "fill-extrusion-height":  ["get", "height"],
            "fill-extrusion-base":    ["get", "min_height"],
            "fill-extrusion-opacity": [
              "interpolate", ["linear"], ["zoom"],
              10, 0.5,
              13, 0.75,
              16, 0.85,
            ],
            "fill-extrusion-vertical-gradient": true,
          },
        },
        "road-label-simple"
      );

      map.addSource("property-buildings", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      });

      map.addLayer({
        id:     "property-buildings-3d",
        type:   "fill-extrusion",
        source: "property-buildings",
        paint: {
          "fill-extrusion-color":   ["get", "color"],
          "fill-extrusion-height":  ["get", "height"],
          "fill-extrusion-base":    ["get", "base"],
          "fill-extrusion-opacity": [
            "interpolate", ["linear"], ["zoom"],
            10, 0.95,
            15, 0.92,
          ],
          "fill-extrusion-vertical-gradient": true,
        },
      });

      // Gold highlight rim for active property
      map.addLayer({
        id:     "property-buildings-highlight",
        type:   "fill-extrusion",
        source: "property-buildings",
        paint: {
          "fill-extrusion-color":   "hsl(50, 100%, 72%)",
          "fill-extrusion-height":  ["get", "height"],
          "fill-extrusion-base":    ["get", "base"],
          "fill-extrusion-opacity": 0,
        },
        filter: ["==", ["get", "propertyId"], ""],
      });

      setMapLoaded(true);
      startIdleRotation(map);
    });

    map.on("mousedown",  () => stopIdleRotation());
    map.on("touchstart", () => stopIdleRotation());
    map.on("moveend", () => {
      if (!mapRef.current) return;
      if (mapRef.current.getZoom() < 13.5) startIdleRotation(mapRef.current);
    });

    map.on("click", "property-buildings-3d", (e) => {
      if (e.features?.[0]) {
        const id = e.features[0].properties?.propertyId;
        if (id) onPropertyClick(id);
      }
    });

    map.on("mouseenter", "property-buildings-3d", () => { map.getCanvas().style.cursor = "pointer"; });
    map.on("mouseleave", "property-buildings-3d", () => { map.getCanvas().style.cursor = ""; });

    map.on("mousemove", "property-buildings-3d", (e) => {
      if (e.features?.[0]) {
        const p = e.features[0].properties!;
        popupRef.current?.remove();
        popupRef.current = new mapboxgl.Popup({
          closeButton: false,
          closeOnClick: false,
          offset: 15,
        })
          .setLngLat(e.lngLat)
          .setHTML(`
            <div style="font-family:'Outfit',sans-serif;min-width:180px;">
              <div style="font-size:13px;font-weight:600;color:#fef3c7;">${p.name}</div>
              <div style="font-size:11px;color:#9ca3af;margin-top:3px;">${p.location} · ${p.bhk}</div>
              <div style="font-size:12px;color:#fbbf24;margin-top:4px;font-weight:600;">${p.priceRange}</div>
              <div style="font-size:10px;color:#6b7280;margin-top:2px;text-transform:uppercase;letter-spacing:.05em;">${p.status}</div>
            </div>`)
          .addTo(map);
      }
    });
    map.on("mouseleave", "property-buildings-3d", () => {
      popupRef.current?.remove();
      popupRef.current = null;
    });

    mapRef.current = map;
    return () => {
      stopIdleRotation();
      map.remove();
      mapRef.current = null;
    };
  }, [onPropertyClick]);

  // Update buildings
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;
    const map = mapRef.current;

    const updateBuildings = () => {
      const zoom = map.getZoom();
      const visible = properties.filter((p) => p.featured || zoom > 12.5);

      const zoomScale =
        zoom <= 11 ? 3.2 :
        zoom <= 12 ? 2.4 :
        zoom <= 13 ? 1.6 : 1.0;

      const features: GeoJSON.Feature[] = [];

      visible.forEach((p) => {
        const typeScale = (p.type === "Villa" || p.type === "Plot") ? 1.6 : p.featured ? 2.2 : 1.3;
        const parts = generateBuildingParts(p.lng, p.lat, p, typeScale * zoomScale);

        parts.forEach((part) => {
          features.push({
            type: "Feature",
            properties: {
              propertyId: p.id, name: p.name, location: p.location,
              priceRange: p.priceRange, bhk: p.bhk.join(" · "),
              featured: p.featured, status: p.status,
              height: part.height, base: part.base,
              color: part.color, partType: part.part,
            },
            geometry: { type: "Polygon", coordinates: [part.polygon] },
          });
        });
      });

      (map.getSource("property-buildings") as mapboxgl.GeoJSONSource)
        ?.setData({ type: "FeatureCollection", features });
    };

    updateBuildings();
    map.on("zoomend", updateBuildings);
    map.on("moveend", updateBuildings);
    return () => {
      map.off("zoomend", updateBuildings);
      map.off("moveend", updateBuildings);
    };
  }, [properties, mapLoaded]);

  // Cinematic fly-to active property
  useEffect(() => {
    if (!mapRef.current || !activeProperty || !mapLoaded) return;
    const map = mapRef.current;

    stopIdleRotation();

    const targetBearing = -15 + Math.sin(activeProperty.lat * 100) * 25;

    map.flyTo({
      center:    [activeProperty.lng, activeProperty.lat],
      zoom:      15.2,
      pitch:     68,
      bearing:   targetBearing,
      duration:  3200,
      essential: true,
      curve:     1.6,
      speed:     0.62,
      easing:    (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
    });

    map.setFilter("property-buildings-highlight", ["==", ["get", "propertyId"], activeProperty.id]);

    // Pulse glow animation
    let opacity = 0, dir = 1, pulses = 0;
    const pulse = () => {
      opacity += dir * 0.04;
      if (opacity >= 0.85) dir = -1;
      if (opacity <= 0 && dir === -1) {
        pulses++;
        if (pulses >= 2) {
          map.setPaintProperty("property-buildings-highlight", "fill-extrusion-opacity", 0.45);
          return;
        }
        dir = 1;
      }
      map.setPaintProperty("property-buildings-highlight", "fill-extrusion-opacity", Math.max(0, opacity));
      requestAnimationFrame(pulse);
    };
    requestAnimationFrame(pulse);
  }, [activeProperty, mapLoaded]);

  return (
    <>
      <style>{`
        .mapboxgl-popup-content {
          background: rgba(10, 12, 20, 0.92) !important;
          border: 1px solid rgba(250,204,21,0.25) !important;
          border-radius: 8px !important;
          padding: 10px 14px !important;
          box-shadow: 0 4px 24px rgba(0,0,0,0.6), 0 0 0 1px rgba(250,204,21,0.08) !important;
        }
        .mapboxgl-popup-tip { border-top-color: rgba(10, 12, 20, 0.92) !important; }
        .mapboxgl-ctrl-group {
          background: rgba(10,12,20,0.85) !important;
          border: 1px solid rgba(255,255,255,0.1) !important;
        }
        .mapboxgl-ctrl-group button { background-color: transparent !important; }
        .mapboxgl-ctrl-group button:hover { background-color: rgba(255,255,255,0.08) !important; }
      `}</style>
      <div
        ref={mapContainer}
        className="w-full h-full"
        style={{ opacity: isVisible ? 1 : 0, transition: "opacity 1.2s ease-in-out" }}
      />
    </>
  );
};

export default MapExplorer;
