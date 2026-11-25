type RunIconName =
  | "calendar-days"
  | "check"
  | "clock"
  | "copy"
  | "gauge-high"
  | "location-dot"
  | "map-location-dot"
  | "route";

export function runIconHref(name: RunIconName) {
  return `/images/fontawesome/run-icons.svg#${name}`;
}

export function RunIcon({ name }: { name: RunIconName }) {
  return (
    <svg aria-hidden="true" focusable="false" fill="currentColor">
      <use href={runIconHref(name)} />
    </svg>
  );
}
