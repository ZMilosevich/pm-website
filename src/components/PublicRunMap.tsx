import type { Map } from "mapbox-gl";
import { useEffect, useRef, useState } from "react";
import { RunIcon, runIconHref } from "./RunIcon";
import "mapbox-gl/dist/mapbox-gl.css";

const mapboxToken = import.meta.env.VITE_MAPBOX_PUBLIC_TOKEN?.trim();
const minZoom = 12;
const maxZoom = 17;

export function PublicRunMap({ latitude, longitude, zoom, label }: {
  latitude: number;
  longitude: number;
  zoom: number;
  label: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !mapboxToken?.startsWith("pk.")) return;
    if (
      !Number.isFinite(latitude) || Math.abs(latitude) > 85 ||
      !Number.isFinite(longitude) || Math.abs(longitude) > 180 ||
      !Number.isFinite(zoom) || zoom < minZoom || zoom > maxZoom
    ) return;

    let cancelled = false;
    let map: Map | undefined;
    const center = { lng: longitude, lat: latitude };
    setIsReady(false);

    async function loadMap() {
      try {
        const { default: mapboxgl } = await import("mapbox-gl");
        if (cancelled || !container) return;

        map = new mapboxgl.Map({
          accessToken: mapboxToken,
          container,
          style: "mapbox://styles/mapbox/dark-v11",
          center,
          zoom,
          minZoom,
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
        map.touchZoomRotate.disableRotation();
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
        map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "top-right");
        map.once("load", () => setIsReady(true));
      } catch {
        map?.remove();
        map = undefined;
      }
    }

    void loadMap();
    return () => {
      cancelled = true;
      map?.remove();
    };
  }, [latitude, longitude, zoom, label]);

  return (
    <div className="run-map-card__canvas">
      {!isReady && (
        <div className="run-map-card__fallback">
          <RunIcon name="location-dot" />
          <span>{label}</span>
        </div>
      )}
      <div
        ref={containerRef}
        className={`run-map-card__interactive${isReady ? " is-ready" : ""}`}
        role="region"
        aria-label={`Map of the approximate area around ${label}`}
        aria-hidden={!isReady}
      />
    </div>
  );
}
