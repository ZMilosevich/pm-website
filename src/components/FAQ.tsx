import { Minus, Plus } from "lucide-react";
import { type KeyboardEvent, useRef, useState } from "react";
import { Reveal } from "./Reveal";

const faqs = [
  {
    question: "Is PaceMatcher only for runners?",
    answer:
      "No. Walkers, joggers, and runners are welcome, whether training for a race or enjoying a casual walk.",
  },
  {
    question: "How does matching work?",
    answer:
      "Discover people based on pace, location, availability, and goals. Connect through chat and coordinate a run or walk.",
  },
  {
    question: "Is my exact location visible?",
    answer:
      "Location access can be approximate or precise depending on device permissions. PaceMatcher is designed to limit public exposure of precise location. Review permissions in device settings.",
  },
  {
    question: "Which platforms are available?",
    answer:
      "PaceMatcher is available for iPhone and Android through the App Store and Google Play.",
  },
  {
    question: "How do I join a local run event?",
    answer: "Explore clubs and events, review activity details, and tap RSVP.",
  },
  {
    question: "Do I need to be training for a race?",
    answer:
      "No. PaceMatcher is for different goals, from marathon training to casual walks.",
  },
  {
    question: "What if I don’t find anyone compatible nearby?",
    answer:
      "Matches depend on who is using PaceMatcher locally and how preferences align. Check again later or explore clubs and events.",
  },
  {
    question: "Who can use PaceMatcher?",
    answer: "PaceMatcher is intended for adults aged 18 and older.",
  },
] as const;

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const buttonRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let nextIndex: number | null = null;

    if (event.key === "ArrowDown") {
      nextIndex = (index + 1) % faqs.length;
    } else if (event.key === "ArrowUp") {
      nextIndex = (index - 1 + faqs.length) % faqs.length;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = faqs.length - 1;
    }

    if (nextIndex !== null) {
      event.preventDefault();
      buttonRefs.current[nextIndex]?.focus();
    }
  };

  return (
    <section className="faq section" id="faq" aria-labelledby="faq-title">
      <div className="page-shell faq__grid">
        <Reveal className="faq__heading">
          <h2 id="faq-title">
            A few things
            <br />
            to know.
          </h2>
          <p>Before you lace up.</p>
        </Reveal>

        <Reveal className="faq-list" delay={100}>
          {faqs.map((item, index) => {
            const isOpen = openIndex === index;
            const panelId = `faq-panel-${index}`;
            const buttonId = `faq-button-${index}`;

            return (
              <div className={`faq-item ${isOpen ? "is-open" : ""}`} key={item.question}>
                <h3>
                  <button
                    id={buttonId}
                    ref={(element) => {
                      buttonRefs.current[index] = element;
                    }}
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                    onKeyDown={(event) => handleKeyDown(event, index)}
                  >
                    <span>{item.question}</span>
                    {isOpen ? (
                      <Minus aria-hidden="true" size={22} />
                    ) : (
                      <Plus aria-hidden="true" size={22} />
                    )}
                  </button>
                </h3>
                <div
                  className="faq-answer"
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  aria-hidden={!isOpen}
                >
                  <div>
                    <p>{item.answer}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </Reveal>
      </div>
    </section>
  );
}
