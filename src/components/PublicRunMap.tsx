import { MapPin } from "lucide-react";
import type { LngLatLike, Map } from "mapbox-gl";
import { useEffect, useRef, useState } from "react";
import "mapbox-gl/dist/mapbox-gl.css";

const mapboxToken = import.meta.env.VITE_MAPBOX_PUBLIC_TOKEN?.trim();
// This public area coordinate is intentionally rounded.
const greenLakeCenter: LngLatLike = [-122.328, 47.680];

export function PublicRunMap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !mapboxToken?.startsWith("pk.")) return;

    let cancelled = false;
    let map: Map | undefined;

    async function loadMap() {
      try {
        const { default: mapboxgl } = await import("mapbox-gl");
        if (cancelled || !container) return;

        map = new mapboxgl.Map({
          accessToken: mapboxToken,
          container,
          style: "mapbox://styles/mapbox/dark-v11",
          center: greenLakeCenter,
          zoom: 14,
          minZoom: 12,
          maxZoom: 17,
          scrollZoom: { around: "center" },
          touchZoomRotate: { around: "center" },
          dragPan: false,
          dragRotate: false,
          boxZoom: false,
          doubleClickZoom: false,
          touchPitch: false,
          keyboard: false,
        });
        map.touchZoomRotate.disableRotation();
        new mapboxgl.Marker({ color: "#e53935" }).setLngLat(greenLakeCenter).addTo(map);
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
  }, []);

  return (
    <div className="run-map-card__canvas">
      {!isReady && (
        <div className="run-map-card__fallback">
          <MapPin aria-hidden="true" />
          <span>Green Lake, Seattle</span>
        </div>
      )}
      <div
        ref={containerRef}
        className={`run-map-card__interactive${isReady ? " is-ready" : ""}`}
        role="region"
        aria-label="Map of the approximate Green Lake area in Seattle"
        aria-hidden={!isReady}
      />
    </div>
  );
}
