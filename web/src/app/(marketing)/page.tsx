"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  BadgeCheck,
  GraduationCap,
  Layers,
  PersonStanding,
  Search,
  Sprout,
  Store,
  TrendingUp,
} from "lucide-react";

import TileMap from "@/components/renderer/TileMap";
import { BambooGrove } from "@/components/marketing/Bamboo";
import HeroScene from "@/components/marketing/HeroScene";
import RichText from "@/components/marketing/RichText";
import { useStart } from "@/components/marketing/useStart";
import { useDocumentTitle, useT } from "@/i18n";
import MboniPrompt from "@/components/chat/chat-prompt";

const PATH_ICON = {
  career: GraduationCap,
  business: Store,
  farming: Sprout,
  past: TrendingUp,
} as const;

const PATH_SPAN = [
  "lg:col-span-3",
  "lg:col-span-2",
  "lg:col-span-2",
  "lg:col-span-3",
];

const TRUST_ICON = [BadgeCheck, Layers, PersonStanding];

const CTA_PRIMARY =
  "btn !min-h-[52px] border-transparent bg-[#CFFFDC] px-6 !text-base text-[#253D2C] hover:bg-white hover:text-[#253D2C]";

const CTA_SECONDARY =
  "btn !min-h-[52px] border-[#CFFFDC]/60 bg-transparent px-6 !text-base text-[#CFFFDC] hover:bg-[#CFFFDC]/10 hover:text-white";

const container = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55 },
  },
};

export default function Landing() {
  const t = useT();
  const h = t.home;

  useDocumentTitle(h.metaTitle);

  const { href, go } = useStart();
  const reduce = useReducedMotion();

  return (
    <>
      {/* ------------- Hero ------------- */}
      <section className="relative isolate overflow-hidden bg-[#253D2C] text-white">
        <div className="absolute inset-0 -z-20">
          <HeroScene label={h.hero.sceneLabel} />
        </div>

        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-gradient-to-b from-[#253D2C]/80 via-[#253D2C]/30 to-transparent lg:bg-gradient-to-r lg:from-[#253D2C]/85 lg:via-[#253D2C]/40 lg:to-transparent"
        />

        <BambooGrove
          mirror
          className="pointer-events-none absolute bottom-0 right-0 -z-10 h-[62%] w-auto opacity-50 sm:h-[88%] sm:opacity-100"
        />

        <BambooGrove className="pointer-events-none absolute bottom-0 left-0 -z-10 hidden h-[36%] w-auto lg:block" />

        <div className="mx-auto flex min-h-[760px] max-w-[1400px] flex-col px-4 pb-28 pt-6 sm:px-6 lg:min-h-[850px] lg:pb-32">
          {/* Hero heading and CTA */}
          <motion.div
            variants={container}
            initial={reduce ? false : "hidden"}
            animate="show"
            className="my-auto max-w-[44rem] py-12"
          >
            <motion.h1
              variants={item}
              className="text-4xl font-semibold leading-[1.05] sm:text-5xl lg:text-6xl"
            >
              {h.hero.title}
            </motion.h1>

            <motion.p
              variants={item}
              className="mt-6 max-w-[54ch] text-lg text-white/90 sm:text-xl"
            >
              {h.hero.lead}
            </motion.p>

            <motion.div variants={item} className="mt-8 flex flex-wrap gap-3">
              <Link href={href()} className={CTA_PRIMARY}>
                {h.hero.primary}
              </Link>

              <a href="#data" className={CTA_SECONDARY}>
                {h.hero.secondary}
              </a>
            </motion.div>
          </motion.div>

          {/* Mboni prompt */}
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: reduce ? 0 : 0.5,
              delay: reduce ? 0 : 0.25,
            }}
            className="mx-auto mb-8 w-full max-w-[850px] sm:mb-10"
          >
            <MboniPrompt
              onSubmit={go}
              showExamples
              className={[
                "[&_h2]:text-white",
                "[&_textarea]:text-white",
                "[&_textarea]:placeholder:text-white/60",
                "[&_form>div]:border-white/20",
                "[&_form>div]:bg-[#12291D]/80",
                "[&_form>div]:shadow-xl",
                "[&_form>div]:backdrop-blur-md",
                "[&_button]:border-white/25",
                "[&_button:hover]:border-white/50",
                "[&_button:hover]:bg-white/10",
              ].join(" ")}
            />
          </motion.div>
        </div>

        {/* Bottom transition */}
        <svg
          viewBox="0 0 1440 120"
          preserveAspectRatio="none"
          aria-hidden
          className="pointer-events-none absolute bottom-0 h-14 w-full fill-bg sm:h-20"
        >
          <path d="M0 120V70C150 28 300 22 470 52C640 82 760 40 930 36C1100 32 1250 70 1440 48V120Z" />
        </svg>
      </section>

      {/* ------------- What you can use it for ------------- */}
      <section
        aria-labelledby="paths-h"
        className="mx-auto max-w-[1400px] px-4 py-16 sm:px-6"
      >
        <h2
          id="paths-h"
          className="max-w-[20ch] text-3xl font-semibold sm:text-4xl"
        >
          {h.paths.title}
        </h2>

        <p className="mt-3 max-w-[60ch] text-lg text-muted">{h.paths.lead}</p>

        <div className="mt-10 grid gap-4 lg:grid-cols-5">
          {h.paths.items.map((p, i) => {
            const Icon = PATH_ICON[p.key as keyof typeof PATH_ICON];
            const lead = i === 0;

            if (!Icon) return null;

            return (
              <article
                key={p.key}
                className={`flex flex-col rounded-card border p-6 ${
                  PATH_SPAN[i] ?? ""
                } ${
                  lead
                    ? "border-primary/40 bg-tint text-on-tint"
                    : "border-line bg-surface"
                }`}
              >
                <span
                  className={`flex h-11 w-11 items-center justify-center rounded-full ${
                    lead ? "bg-primary text-on-primary" : "bg-tint text-on-tint"
                  }`}
                >
                  <Icon className="h-5 w-5" aria-hidden />
                </span>

                <h3 className="mt-4 text-xl font-semibold">{p.title}</h3>

                <p className={`mt-2 max-w-[56ch] ${lead ? "" : "text-muted"}`}>
                  {p.body}
                </p>

                <p
                  className={`mt-2 max-w-[56ch] text-sm ${
                    lead ? "opacity-80" : "text-muted"
                  }`}
                >
                  {p.hint}
                </p>

                <ul className="mt-5 space-y-2">
                  {p.examples.map((ex) => (
                    <li key={ex.q}>
                      <button
                        type="button"
                        onClick={() => go(ex.q)}
                        className="flex w-full items-start gap-2 rounded-lg border border-line bg-surface px-3 py-2.5 text-left text-sm text-ink hover:bg-surface2"
                      >
                        <Search
                          className="mt-0.5 h-4 w-4 shrink-0 text-primary"
                          aria-hidden
                        />

                        <span>
                          <span className="sr-only">{h.paths.tryLabel}: </span>
                          {ex.label}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </article>
            );
          })}
        </div>
      </section>

      {/* ------------- How it works ------------- */}
      <section
        aria-labelledby="how-h"
        className="border-y border-line bg-surface2/60 py-16"
      >
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6">
          <h2 id="how-h" className="text-3xl font-semibold sm:text-4xl">
            {h.how.title}
          </h2>

          <p className="mt-3 max-w-[60ch] text-lg text-muted">{h.how.lead}</p>

          <ol className="mt-10 grid gap-8 md:grid-cols-4">
            {h.how.steps.map((s, i) => (
              <li key={s.t}>
                <span
                  aria-hidden
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-on-primary"
                >
                  {i + 1}
                </span>

                <h3 className="mt-3 text-lg font-semibold">{s.t}</h3>

                <p className="mt-1 max-w-[34ch] text-muted">{s.d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ------------- Explore data ------------- */}
      <section
        id="data"
        aria-labelledby="data-h"
        className="mx-auto grid max-w-[1400px] gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.15fr_1fr]"
      >
        <div>
          <h2
            id="data-h"
            className="max-w-[22ch] text-3xl font-semibold sm:text-4xl"
          >
            {h.data.title}
          </h2>

          <p className="mt-3 max-w-[60ch] text-lg text-muted">{h.data.lead}</p>

          <dl className="mt-8 grid gap-x-8 gap-y-5 sm:grid-cols-2">
            {h.data.topics.map((x) => (
              <div key={x.t} className="border-l-2 border-primary/50 pl-3">
                <dt className="font-semibold">{x.t}</dt>
                <dd className="mt-0.5 text-sm text-muted">{x.d}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="card self-start p-5 sm:p-6">
          <h3 className="mb-1 text-lg font-semibold">{h.data.mapTitle}</h3>

          <p className="mb-4 text-sm text-muted">{h.data.mapLead}</p>

          <TileMap mode="province" label={h.data.mapLabel} />
        </div>
      </section>

      {/* ------------- Trust ------------- */}
      <section
        aria-labelledby="trust-h"
        className="mx-auto max-w-[1400px] px-4 pb-24 pt-4 sm:px-6"
      >
        <h2 id="trust-h" className="text-3xl font-semibold sm:text-4xl">
          {h.trust.title}
        </h2>

        <div className="mt-8 grid gap-8 md:grid-cols-3">
          {h.trust.items.map((x, i) => {
            const Icon = TRUST_ICON[i];

            if (!Icon) return null;

            return (
              <div key={x.t}>
                <Icon className="h-7 w-7 text-primary" aria-hidden />

                <h3 className="mt-3 text-xl font-semibold">{x.t}</h3>

                <p className="mt-2 max-w-[44ch] text-muted">{x.d}</p>
              </div>
            );
          })}
        </div>

        <p className="mt-10 text-sm text-muted">
          <RichText text={h.trust.links} />
        </p>
      </section>

      {/* ------------- Closing call to action ------------- */}
      <section className="relative isolate overflow-hidden bg-[#253D2C] text-white">
        <svg
          viewBox="0 0 1440 60"
          preserveAspectRatio="none"
          aria-hidden
          className="absolute left-0 top-0 h-8 w-full fill-bg sm:h-12"
        >
          <path d="M0 0H1440V28C1260 58 1100 18 900 38C700 58 520 18 340 36C200 50 100 28 0 42Z" />
        </svg>

        <BambooGrove className="pointer-events-none absolute bottom-0 left-0 -z-10 hidden h-[125%] w-auto opacity-70 sm:block" />

        <BambooGrove
          mirror
          className="pointer-events-none absolute bottom-0 right-0 -z-10 hidden h-[125%] w-auto opacity-70 sm:block"
        />

        <div className="mx-auto max-w-2xl px-4 pb-20 pt-28 text-center sm:px-6">
          <h2 className="text-3xl font-semibold sm:text-4xl">{h.cta.title}</h2>

          <p className="mx-auto mt-3 max-w-[48ch] text-lg text-white/90">
            {h.cta.lead}
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href={href()} className={CTA_PRIMARY}>
              {t.common.startChatting}
            </Link>

            <Link href="/docs" className={CTA_SECONDARY}>
              {t.common.readDocs}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
