import type { ReactNode } from 'react';
import {
  Broadcast,
  Export,
  Flask,
  Graph,
  GridFour,
  Intersect,
  MathOperations,
  Presentation,
  Sliders,
  Stack,
  WaveSine,
} from '@phosphor-icons/react';
import { features, howItWorks, problem, twoFixes } from '../content/home';

const ICONS: Record<string, ReactNode> = {
  graph: <Graph size={19} aria-hidden="true" />,
  radius: <Broadcast size={19} aria-hidden="true" />,
  layers: <Stack size={19} aria-hidden="true" />,
  wave: <WaveSine size={19} aria-hidden="true" />,
  sliders: <Sliders size={19} aria-hidden="true" />,
  proof: <MathOperations size={19} aria-hidden="true" />,
  matching: <Intersect size={19} aria-hidden="true" />,
  flask: <Flask size={19} aria-hidden="true" />,
  grid: <GridFour size={19} aria-hidden="true" />,
  presentation: <Presentation size={19} aria-hidden="true" />,
  export: <Export size={19} aria-hidden="true" />,
};

function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-accent">{children}</p>;
}

export function ProblemSection() {
  return (
    <section id="problem" aria-labelledby="problem-title" className="border-b border-line">
      <div className="mx-auto grid max-w-[1200px] grid-cols-1 gap-10 px-5 py-16 sm:px-8 lg:grid-cols-12 lg:gap-12 lg:py-20">
        <div className="lg:col-span-5">
          <Eyebrow>{problem.eyebrow}</Eyebrow>
          <h2 id="problem-title" className="mt-3 max-w-[20ch] text-display-sm font-semibold text-ink">
            {problem.title}
          </h2>
          <p className="mt-4 max-w-[46ch] text-[15px] leading-relaxed text-ink-2">{problem.intro}</p>
        </div>

        <ol className="lg:col-span-7">
          {problem.points.map((point, index) => (
            <li key={point.title} className="flex gap-5 border-b border-line py-5 first:pt-0 last:border-b-0">
              <span className="tnum shrink-0 pt-1 text-[12px] text-ink-3">{String(index + 1).padStart(2, '0')}</span>
              <div>
                <h3 className="text-[17px] font-semibold text-ink">{point.title}</h3>
                <p className="mt-1.5 max-w-[58ch] text-[14px] leading-relaxed text-ink-2">{point.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function HowItWorksSection() {
  return (
    <section id="how-it-works" aria-labelledby="how-title" className="border-b border-line bg-surface/30">
      <div className="mx-auto max-w-[1200px] px-5 py-16 sm:px-8 lg:py-20">
        <div className="max-w-[52ch]">
          <Eyebrow>{howItWorks.eyebrow}</Eyebrow>
          <h2 id="how-title" className="mt-3 text-display-sm font-semibold text-ink">
            {howItWorks.title}
          </h2>
        </div>

        <ol className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
          {howItWorks.steps.map((step, index) => (
            <li key={step.title} className="border-t border-line-strong pt-4">
              <span className="tnum text-[12px] text-accent">{String(index + 1).padStart(2, '0')}</span>
              <h3 className="mt-2 text-[17px] font-semibold leading-snug text-ink">{step.title}</h3>
              <p className="mt-2 text-[13px] leading-relaxed text-ink-2">{step.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function TwoFixesSection() {
  return (
    <section aria-labelledby="fixes-title" className="border-b border-line">
      <div className="mx-auto max-w-[1200px] px-5 py-16 sm:px-8 lg:py-20">
        <div className="max-w-[46ch]">
          <Eyebrow>{twoFixes.eyebrow}</Eyebrow>
          <h2 id="fixes-title" className="mt-3 text-display-sm font-semibold text-ink">
            {twoFixes.title}
          </h2>
        </div>

        <div className="mt-9 grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-line bg-line lg:grid-cols-12">
          {twoFixes.options.map((option, index) => (
            <div
              key={option.label}
              className={`bg-base p-6 lg:p-8 ${index === 0 ? 'lg:col-span-7' : 'lg:col-span-5'}`}
            >
              <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-ink-3">{option.tag}</span>
              <h3 className="mt-2 font-display text-[24px] leading-tight text-ink">{option.label}</h3>
              <p className="mt-2 max-w-[52ch] text-[14px] leading-relaxed text-ink-2">{option.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FeaturesSection() {
  return (
    <section id="features" aria-labelledby="features-title" className="border-b border-line">
      <div className="mx-auto max-w-[1200px] px-5 py-16 sm:px-8 lg:py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-[44ch]">
            <Eyebrow>Features</Eyebrow>
            <h2 id="features-title" className="mt-3 text-display-sm font-semibold text-ink">
              Everything the graph can tell you.
            </h2>
          </div>
          <p className="max-w-[36ch] text-[13px] leading-relaxed text-ink-3">
            Each tile is a working part of the planner, not a marketing promise. Presets, formulas and limits match the
            engine exactly.
          </p>
        </div>

        <ul className="mt-9 grid grid-cols-1 gap-3 md:grid-cols-12">
          {features.map((feature, index) => (
            <li
              key={feature.title}
              className={`group rounded-lg border border-line bg-surface/40 p-4 transition-colors hover:border-line-strong ${feature.span} ${
                index === 0 ? 'md:p-5' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-md border border-line bg-base text-accent">
                  {ICONS[feature.icon]}
                </span>
                <div>
                  <h3 className={`font-semibold text-ink ${index === 0 ? 'text-[19px]' : 'text-[15px]'}`}>
                    {feature.title}
                  </h3>
                  <p className="mt-1 text-[13px] leading-relaxed text-ink-2">{feature.body}</p>
                </div>
              </div>
              {index === 3 && (
                <p className="tnum mt-3 rounded-sm border border-line bg-base px-2 py-1 font-mono text-[11px] text-ink-2">
                  |c₁ − c₂| ≥ T
                </p>
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
