import type { Map } from "mapbox-gl";
import type { FeatureCollection, LineString } from "geojson";
import { Crosshair } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { RunIcon, runIconHref } from "./RunIcon";
import "mapbox-gl/dist/mapbox-gl.css";

const mapboxToken = import.meta.env.VITE_MAPBOX_PUBLIC_TOKEN?.trim();
const minZoom = 12;
const maxZoom = 17;
const coursePadding = 24;

async function loadCourse(url: string, signal: AbortSignal): Promise<FeatureCollection<LineString>> {
  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error("Could not load the course");
  return response.json();
}

export function PublicRunMap({ latitude, longitude, zoom, label, courseUrl, courseLabel }: {
  latitude: number;
  longitude: number;
  zoom: number;
  label: string;
  courseUrl?: string;
  courseLabel?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const recenterRef = useRef<(() => void) | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !mapboxToken?.startsWith("pk.")) return;
    if (
      !Number.isFinite(latitude) || Math.abs(latitude) > 85 ||
      !Number.isFinite(longitude) || Math.abs(longitude) > 180 ||
      !Number.isFinite(zoom) || zoom < minZoom || zoom > maxZoom
    ) return;

    const controller = new AbortController();
    let map: Map | undefined;
    const center = { lng: longitude, lat: latitude };
    setIsReady(false);

    async function loadMap() {
      try {
        const [{ default: mapboxgl }, course] = await Promise.all([
          import("mapbox-gl"),
          courseUrl ? loadCourse(courseUrl, controller.signal) : null,
        ]);
        if (controller.signal.aborted || !container) return;

        const bounds = new mapboxgl.LngLatBounds();
        for (const feature of course?.features ?? []) {
          for (const [lng, lat] of feature.geometry.coordinates) {
            bounds.extend([lng, lat]);
          }
        }
        if (course && bounds.isEmpty()) throw new Error("The course has no coordinates");

        map = new mapboxgl.Map({
          accessToken: mapboxToken,
          container,
          style: "mapbox://styles/mapbox/dark-v11",
          center,
          zoom,
          ...(course && { bounds, fitBoundsOptions: { padding: coursePadding } }),
          minZoom: course ? 0 : minZoom,
          maxZoom,
          scrollZoom: { around: "center" },
          touchZoomRotate: { around: "center" },
          dragPan: true,
          dragRotate: false,
          boxZoom: false,
          doubleClickZoom: false,
          touchPitch: false,
          keyboard: false,
          attributionControl: false,
        });
        const eventMap = map;
        recenterRef.current = course
          ? () => eventMap.fitBounds(bounds, { padding: coursePadding, duration: 0 })
          : () => eventMap.jumpTo({ center, zoom });
        map.touchZoomRotate.disableRotation();
        if (!course) {
          const marker = document.createElement("div");
          marker.className = "run-map-card__pin";
          marker.setAttribute("aria-label", `Approximate location of ${label}`);
          const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
          svg.setAttribute("aria-hidden", "true");
          const use = document.createElementNS(svg.namespaceURI, "use");
          use.setAttribute("href", runIconHref("location-dot"));
          svg.append(use);
          marker.append(svg);
          new mapboxgl.Marker({ element: marker, anchor: "bottom" })
            .setLngLat(center)
            .addTo(map);
        }
        map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "top-right");
        if (course) {
          const courseMap = map;
          const endpoints = [
            { label: "Start", position: course.features[0]?.geometry.coordinates[0] },
            { label: "Finish", position: course.features.at(-1)?.geometry.coordinates.at(-1) },
          ];
          for (const { label, position } of endpoints) {
            if (!position) continue;

            const [lng, lat] = position;
            const marker = document.createElement("div");
            marker.className = `run-map-card__endpoint run-map-card__endpoint--${label.toLowerCase()}`;
            marker.setAttribute("aria-label", label);

            const badge = document.createElement("span");
            badge.textContent = label;
            marker.append(badge);
            new mapboxgl.Marker({ element: marker })
              .setLngLat([lng, lat])
              .addTo(courseMap);
          }
          courseMap.once("style.load", () => {
            courseMap.addSource("course", { type: "geojson", data: course });
            courseMap.addLayer({
              id: "course",
              type: "line",
              source: "course",
              layout: { "line-cap": "round", "line-join": "round" },
              paint: { "line-color": "#ff4081", "line-width": 4 },
            });
          });
        }
        map.once("load", () => setIsReady(true));
      } catch {
        map?.remove();
        map = undefined;
      }
    }

    void loadMap();
    return () => {
      controller.abort();
      recenterRef.current = null;
      map?.remove();
    };
  }, [latitude, longitude, zoom, label, courseUrl]);

  return (
    <div className="run-map-card__canvas">
      {!isReady && (
        <div className="run-map-card__fallback">
          {!courseUrl && <RunIcon name="location-dot" />}
          <span>{courseLabel ?? label}</span>
        </div>
      )}
      <div
        ref={containerRef}
        className={`run-map-card__interactive${isReady ? " is-ready" : ""}`}
        role="region"
        aria-label={courseLabel ? `Map of the ${courseLabel}` : `Map of the approximate area around ${label}`}
        aria-hidden={!isReady}
      />
      {isReady && (
        <button
          type="button"
          className="run-map-card__recenter"
          aria-label="Re-center map"
          title="Re-center map"
          onClick={() => recenterRef.current?.()}
        >
          <Crosshair size={18} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
