import { useRef, useState } from "react";
import { Header } from "../components/Header";
import { PublicRunMap } from "../components/PublicRunMap";
import { RunCountdown } from "../components/RunCountdown";
import { RunIcon } from "../components/RunIcon";
import { siteConfig } from "../config";

const runStores = [
  { label: "App Store", href: siteConfig.appStoreUrl, icon: "/images/apple-mark-white.svg" },
  { label: "Google Play", href: siteConfig.googlePlayUrl, icon: "/images/google-play-mark-white.svg" },
];

type EventStatus = "open" | "full" | "past" | "cancelled";
type EventKind = "run" | "race";
type Units = "mi" | "km";

export type PublicRunEvent = {
  title: string;
  description: string;
  kind?: EventKind;
  status: EventStatus;
  city: string;
  startsAt: string;
  timezone: string;
  distanceMeters?: number;
  distances?: Array<{
    label: string;
    distanceMeters: number;
  }>;
  groupPaceSecondsPerKm?: number;
  allowsWalkers?: boolean;
  capacity?: number;
  attendeeCount: number;
  club?: {
    name: string;
  };
  organizer?: {
    name: string;
  };
  area: {
    name: string;
    label: string;
    detail: string;
    latitude: number;
    longitude: number;
    zoom: number;
    course?: {
      label: string;
      url: string;
    };
  };
  attendeesPreview: Array<{
    firstName: string;
    paceSecondsPerKm?: number;
    isWalker?: boolean;
  }>;
  attendeesHidden: number;
};

const personColors = ["#ff0055", "#3478d4", "#d9961a", "#1ea36e"];

function formatDistance(distanceMeters: number, units: Units) {
  if (units === "km") return `${(distanceMeters / 1000).toFixed(1)} km`;

  const miles = distanceMeters / 1609.344;
  return `${miles.toFixed(1).replace(".0", "")} mi`;
}

function formatPace(secondsPerKm: number, units: Units) {
  const factor = units === "km" ? 1 : 1.609344;
  const roundedSeconds = Math.round(secondsPerKm * factor);
  const minutes = Math.floor(roundedSeconds / 60);
  const seconds = String(roundedSeconds % 60).padStart(2, "0");
  return `${minutes}:${seconds} /${units}`;
}

function getEventContent(status: EventStatus, city: string, kind: EventKind) {
  if (kind === "run") {
    switch (status) {
      case "full":
        return {
          actionLabel: "Join the waitlist in the app",
          reassurance: "This run is full. Download PaceMatcher to join the waitlist.",
          joinTitle: "Join the waitlist in the app",
          tag: `Run club event · ${city}`,
        };
      case "past":
        return {
          actionLabel: "See this club's next runs",
          reassurance: "This run has ended. Explore other PaceMatcher run clubs.",
          joinTitle: "See this club's next runs",
          tag: `Past event · ${city}`,
        };
      case "cancelled":
        return {
          actionLabel: "Find another run",
          reassurance: "This event has been cancelled. Explore other PaceMatcher run clubs.",
          joinTitle: "Find another run",
          tag: `Cancelled event · ${city}`,
        };
      case "open":
        return {
          actionLabel: "Open in the PaceMatcher app",
          reassurance:
            "RSVP is completed in the PaceMatcher app. This public sample shows the event details and official download choices.",
          joinTitle: "RSVP to this run",
          tag: `Run club event · ${city}`,
        };
    }
  }

  switch (status) {
    case "full":
      return {
        actionLabel: "Join the race waitlist in the app",
        reassurance: "This race is full. Download PaceMatcher to join the waitlist.",
        joinTitle: "See this race in PaceMatcher",
        tag: `Full race · ${city}`,
      };
    case "past":
      return {
        actionLabel: "See more races",
        reassurance: "This race has ended. Explore other events in PaceMatcher.",
        joinTitle: "Past race",
        tag: `Past race · ${city}`,
      };
    case "cancelled":
      return {
        actionLabel: "Find another race",
        reassurance: "This event has been cancelled. Explore other events in PaceMatcher.",
        joinTitle: "Cancelled race",
        tag: `Cancelled race · ${city}`,
      };
    case "open":
      return {
        actionLabel: "Open in the PaceMatcher app",
        reassurance:
          "This public demo shows how the race appears in PaceMatcher. Use the official organizer for registration and race-day details.",
        joinTitle: "See this race in PaceMatcher",
        tag: `Race · ${city}`,
      };
  }
}

function fallbackCopy(text: string) {
  const input = document.createElement("textarea");
  input.value = text;
  input.setAttribute("readonly", "");
  input.style.position = "fixed";
  input.style.opacity = "0";
  document.body.appendChild(input);
  input.select();
  const copied = document.execCommand("copy");
  input.remove();
  return copied;
}

function EventStat({
  icon,
  label,
  children,
  className = "",
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`run-stat ${className}`.trim()}>
      <div className="run-stat__label">
        {icon}
        <span>{label}</span>
      </div>
      <p>{children}</p>
    </div>
  );
}

export function PublicRunPage({
  event,
  shareUrl,
}: {
  event: PublicRunEvent;
  shareUrl: string;
}) {
  const [units, setUnits] = useState<Units>("mi");
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "error">("idle");
  const shareInputRef = useRef<HTMLInputElement>(null);
  const dateFormatter = new Intl.DateTimeFormat("en-US", {
    timeZone: event.timezone,
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  const timeFormatter = new Intl.DateTimeFormat("en-US", {
    timeZone: event.timezone,
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  });
  const startsAt = new Date(event.startsAt);
  const kind = event.kind ?? "run";
  const organizerName = event.organizer?.name ?? event.club?.name ?? "";
  const content = getEventContent(event.status, event.city, kind);
  const distances =
    event.distances?.length
      ? event.distances
      : event.distanceMeters
        ? [{ label: "", distanceMeters: event.distanceMeters }]
        : [];
  const capacity =
    typeof event.capacity === "number" &&
    Number.isFinite(event.capacity) &&
    event.capacity > 0
      ? event.capacity
      : undefined;
  const visibleAttendeeCount =
    event.status === "full" && capacity !== undefined ? capacity : event.attendeeCount;
  const progress =
    capacity === undefined
      ? 0
      : Math.min((visibleAttendeeCount / capacity) * 100, 100);
  const hasAppAction = event.status === "open" || event.status === "full";
  const actionUrl = hasAppAction ? "#run-download" : "/#runclubs";
  const paceTolerance = units === "mi" ? "15 sec/mi" : "9 sec/km";
  const description = event.description.replace("15 sec/mi", paceTolerance);
  const displayShareUrl = shareUrl
    .replace(/^https?:\/\//, "")
    .replace(/\/$/, "");
  const eventName = kind === "race" ? "race" : "run";

  const copyShareUrl = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      } else if (!fallbackCopy(shareUrl)) {
        throw new Error("Copy command was unavailable");
      }
      setCopyStatus("copied");
    } catch {
      setCopyStatus("error");
    }
  };

  return (
    <>
      <a className="skip-link" href="#run-main">
        Skip to {eventName} details
      </a>
      <Header homeLinkBase="/" />

      <main
        className={`run-page ${event.status === "past" ? "run-page--past" : ""}`.trim()}
        id="run-main"
      >
        {event.status === "cancelled" && (
          <aside className="run-page__banner" role="status">
            This event has been cancelled by {organizerName}.
          </aside>
        )}

        <div className="run-page__shell">
          <div className="run-layout">
            <article className="run-details" aria-labelledby="run-title">
              <div className="run-kickers">
                <p className="run-kicker">{content.tag}</p>
                {hasAppAction && <RunCountdown startsAt={event.startsAt} />}
              </div>
              <div className="run-title-row">
                <h1 id="run-title">{event.title}</h1>
                <div className="run-units" role="group" aria-label="Pace and distance units">
                  <button
                    className={units === "mi" ? "is-active" : ""}
                    type="button"
                    aria-pressed={units === "mi"}
                    onClick={() => setUnits("mi")}
                  >
                    mi
                  </button>
                  <button
                    className={units === "km" ? "is-active" : ""}
                    type="button"
                    aria-pressed={units === "km"}
                    onClick={() => setUnits("km")}
                  >
                    km
                  </button>
                </div>
              </div>

              <p className="run-description">
                {description}
              </p>

              <section className="run-stats" aria-label={`${kind === "race" ? "Race" : "Run"} details`}>
                <EventStat icon={<RunIcon name="calendar-days" />} label="Date">
                  <time dateTime={event.startsAt}>{dateFormatter.format(startsAt)}</time>
                </EventStat>
                <EventStat icon={<RunIcon name="clock" />} label="Start">
                  {timeFormatter.format(startsAt)}
                </EventStat>
                <EventStat icon={<RunIcon name="route" />} label="Distance">
                  <span className="run-distance-list">
                    {distances.map((distance) => (
                      <span key={distance.label || distance.distanceMeters}>
                        {distance.label && <small>{distance.label}</small>}
                        {formatDistance(distance.distanceMeters, units)}
                      </span>
                    ))}
                  </span>
                </EventStat>
                {typeof event.groupPaceSecondsPerKm === "number" && (
                  <EventStat
                    className="run-stat--pace"
                    icon={<RunIcon name="gauge-high" />}
                    label="Group pace"
                  >
                    <strong>{formatPace(event.groupPaceSecondsPerKm, units)}</strong>
                  </EventStat>
                )}
              </section>

              <section className="run-map-card" aria-labelledby="run-area-title">
                <PublicRunMap
                  latitude={event.area.latitude}
                  longitude={event.area.longitude}
                  zoom={event.area.zoom}
                  label={`${event.area.name}, ${event.city}`}
                  courseUrl={event.area.course?.url}
                  courseLabel={event.area.course?.label}
                />
                <div className="run-map-card__meeting">
                  <span className="run-map-card__map-icon">
                    <RunIcon name="map-location-dot" />
                  </span>
                  <div>
                    <h2 id="run-area-title">
                      {event.area.course?.label ?? (
                        <>
                          {kind === "race" ? "Race area" : "Meeting point"}:{" "}
                          <span>{event.area.label}</span>
                        </>
                      )}
                    </h2>
                    <p>{event.area.detail}</p>
                  </div>
                </div>
              </section>

              <section className="run-attendees" aria-labelledby="run-attendees-title">
                <div className="run-attendees__heading">
                  <h2 id="run-attendees-title">Who's going</h2>
                  <p>
                    {kind === "race" ? (
                      <>
                        Organized by {organizerName}
                        <span className="run-attendees__privacy">
                          {" "}
                          · {visibleAttendeeCount}{" "}
                          {visibleAttendeeCount === 1 ? "runner" : "runners"} going · First names
                          only
                        </span>
                      </>
                    ) : (
                      <>
                        Hosted by {organizerName}
                        <span className="run-attendees__privacy"> · First names only</span>
                      </>
                    )}
                  </p>
                </div>
                <div className="run-attendees__list">
                  {event.attendeesPreview.map((attendee, index) => {
                    const attendeePace =
                      attendee.paceSecondsPerKm ?? event.groupPaceSecondsPerKm;

                    return (
                      <span className="run-person" key={attendee.firstName}>
                        <span
                          className="run-person__initial"
                          style={{ backgroundColor: personColors[index] }}
                          aria-hidden="true"
                        >
                          {attendee.firstName.charAt(0)}
                        </span>
                        <span>{attendee.firstName}</span>
                        {attendee.isWalker && (
                          <span className="run-person__detail">Walker</span>
                        )}
                        {!attendee.isWalker && attendeePace != null && (
                          <span className="run-person__detail">
                            {formatPace(attendeePace, units)}
                          </span>
                        )}
                      </span>
                    );
                  })}
                  {event.attendeesHidden > 0 && (
                    <span className="run-person run-person--more">
                      +{event.attendeesHidden} more
                    </span>
                  )}
                </div>
              </section>
            </article>

            <aside className="run-join" id="join" aria-labelledby="run-join-title">
              <h2 id="run-join-title">{content.joinTitle}</h2>
              <p className="run-join__reassurance">{content.reassurance}</p>

              {capacity !== undefined && (
                <div className="run-spots">
                  <div className="run-spots__label">
                    <span>Spots</span>
                    <strong>
                      {visibleAttendeeCount} of {capacity} taken
                    </strong>
                  </div>
                  <div
                    className="run-spots__track"
                    role="progressbar"
                    aria-label={`${visibleAttendeeCount} of ${capacity} event spots taken`}
                    aria-valuemin={0}
                    aria-valuemax={capacity}
                    aria-valuenow={visibleAttendeeCount}
                  >
                    <span style={{ width: `${progress}%` }} />
                  </div>
                </div>
              )}

              <a className="run-join__action" href={actionUrl}>
                {content.actionLabel}
              </a>

              {hasAppAction && (
                <div className="run-join__stores" id="run-download" tabIndex={-1}>
                  {runStores.map(({ label, href, icon }) => (
                    <a key={label} href={href} target="_blank" rel="noopener noreferrer">
                      <img src={icon} alt="" width={20} height={20} />
                      {label}
                    </a>
                  ))}
                </div>
              )}

              <div className="run-share">
                <label htmlFor="run-share-url">Share this {eventName}</label>
                <div className="run-share__row">
                  <input
                    ref={shareInputRef}
                    id="run-share-url"
                    value={displayShareUrl}
                    readOnly
                    aria-describedby="run-copy-status"
                    onFocus={(currentEvent) => currentEvent.currentTarget.select()}
                  />
                  <button type="button" onClick={copyShareUrl}>
                    {copyStatus === "copied" ? (
                      <RunIcon name="check" />
                    ) : (
                      <RunIcon name="copy" />
                    )}
                    <span>{copyStatus === "copied" ? "Copied" : "Copy"}</span>
                  </button>
                </div>
                <p id="run-copy-status" className="run-share__status" aria-live="polite">
                  {copyStatus === "copied" && "Canonical link copied to your clipboard."}
                  {copyStatus === "error" && "Copy failed. Select the link above to copy it."}
                </p>
              </div>
            </aside>
          </div>
        </div>

        {event.status !== "cancelled" && (
          <div className="run-mobile-cta">
            <a href={actionUrl}>
              {content.actionLabel}
            </a>
          </div>
        )}
      </main>
    </>
  );
}
