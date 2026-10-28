import { ArrowUpRight, Plus } from '@phosphor-icons/react';
import { Logo } from '@/components/brand/Logo';
import { Button } from '@/components/ui/Button';
import { audience, demoFacts, faq, finalCta, underTheHood } from '../content/home';
import { site } from '@/config/site';

function Eyebrow({ children }: { children: string }) {
  return <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-accent">{children}</p>;
}

export function UnderTheHoodSection() {
  return (
    <section id="under-the-hood" aria-labelledby="hood-title" className="border-b border-line bg-surface/30">
      <div className="mx-auto max-w-[1200px] px-5 py-16 sm:px-8 lg:py-20">
        <div className="max-w-[48ch]">
          <Eyebrow>{underTheHood.eyebrow}</Eyebrow>
          <h2 id="hood-title" className="mt-3 text-display-sm font-semibold text-ink">
            {underTheHood.title}
          </h2>
        </div>

        <div className="mt-9 grid gap-3 lg:grid-cols-2">
          {underTheHood.blocks.map((block) => (
            <article key={block.label} className="rounded-lg border border-line bg-base p-5">
              <h3 className="font-display text-[21px] text-ink">{block.label}</h3>
              <p className="mt-2 text-[13px] leading-relaxed text-ink-2">{block.body}</p>
              <p className="tnum mt-4 rounded-md border border-line bg-surface px-3 py-2 font-mono text-[12px] text-accent">
                {block.formula}
              </p>
            </article>
          ))}
        </div>

        <div className="mt-6 rounded-lg border border-warning/30 bg-warning-soft/40 p-5">
          <h3 className="text-[12px] font-semibold uppercase tracking-[0.08em] text-warning">Known limits</h3>
          <ul className="mt-2 grid gap-2 sm:grid-cols-2">
            {underTheHood.limits.map((limit) => (
              <li key={limit} className="flex gap-2 text-[12px] leading-relaxed text-ink-2">
                <span aria-hidden="true" className="mt-2 size-1 shrink-0 rounded-full bg-warning" />
                {limit}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

export function StatsSection() {
  const cells = [
    { label: 'Access points', value: demoFacts.aps, tone: 'text-ink' },
    { label: 'Interfering pairs', value: demoFacts.pairs, tone: 'text-ink' },
    { label: 'Channel groups', value: demoFacts.groups, tone: 'text-accent' },
    { label: 'Conflicts before', value: demoFacts.conflictsBefore, tone: 'text-danger' },
    { label: 'Conflicts after', value: demoFacts.conflictsAfter, tone: 'text-success' },
  ];

  return (
    <section aria-labelledby="proof-title" className="border-b border-line bg-base">
      <div className="mx-auto max-w-[1200px] px-5 py-12 sm:px-8 lg:py-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <Eyebrow>See it work</Eyebrow>
            <h2 id="proof-title" className="mt-3 text-display-sm font-semibold text-ink">
              The campus demo, measured.
            </h2>
          </div>
          <p className="max-w-[40ch] text-[12px] leading-relaxed text-ink-3">
            Computed by the same engine at page load: twelve APs at an 80 m inherited radius, DSatur with a three-channel
            cap.
          </p>
        </div>

        <dl className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-5">
          {cells.map((cell) => (
            <div key={cell.label} className="bg-surface px-4 py-5">
              <dt className="text-[11px] text-ink-3">{cell.label}</dt>
              <dd className={`tnum mt-1 text-[30px] leading-none ${cell.tone}`}>{cell.value}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-3 text-[11px] leading-relaxed text-ink-3">
          Before any coloring, every AP shares one group, so all interfering pairs collide. After coloring, adjacent APs
          never share a group.
        </p>
      </div>
    </section>
  );
}

export function AudienceSection() {
  return (
    <section aria-labelledby="audience-title" className="border-b border-line">
      <div className="mx-auto grid max-w-[1200px] grid-cols-1 gap-10 px-5 py-16 sm:px-8 lg:grid-cols-12 lg:py-20">
        <div className="lg:col-span-5">
          <Eyebrow>{audience.eyebrow}</Eyebrow>
          <h2 id="audience-title" className="mt-3 text-display-sm font-semibold text-ink">
            {audience.title}
          </h2>
          <p className="mt-4 max-w-[46ch] text-[13px] leading-relaxed text-ink-3">{audience.honesty}</p>
        </div>
        <dl className="lg:col-span-7">
          {audience.people.map((person) => (
            <div key={person.title} className="grid gap-1 border-b border-line py-4 sm:grid-cols-[200px_1fr] sm:gap-6">
              <dt className="text-[14px] font-semibold text-ink">{person.title}</dt>
              <dd className="text-[13px] leading-relaxed text-ink-2">{person.body}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

export function FaqSection() {
  return (
    <section id="faq" aria-labelledby="faq-title" className="border-b border-line bg-surface/30">
      <div className="mx-auto grid max-w-[1200px] grid-cols-1 gap-10 px-5 py-16 sm:px-8 lg:grid-cols-12 lg:py-20">
        <div className="lg:col-span-4">
          <Eyebrow>{faq.eyebrow}</Eyebrow>
          <h2 id="faq-title" className="mt-3 text-display-sm font-semibold text-ink">
            {faq.title}
          </h2>
        </div>
        <div className="lg:col-span-8">
          {faq.items.map((item) => (
            <details key={item.q} className="group border-b border-line py-1">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-3 text-[15px] font-medium text-ink [&::-webkit-details-marker]:hidden">
                {item.q}
                <Plus
                  size={16}
                  aria-hidden="true"
                  className="shrink-0 text-ink-3 transition-transform duration-[120ms] group-open:rotate-45"
                />
              </summary>
              <p className="max-w-[64ch] pb-4 pr-8 text-[13px] leading-relaxed text-ink-2">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FinalCta({ onLaunch }: { onLaunch: () => void }) {
  return (
    <section aria-labelledby="cta-title" className="border-b border-line">
      <div className="mx-auto max-w-[1200px] px-5 py-16 sm:px-8 lg:py-20">
        <div className="rounded-xl border border-line bg-surface p-6 sm:p-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-[52ch]">
              <h2 id="cta-title" className="font-display text-[30px] leading-tight text-ink">
                {finalCta.title}
              </h2>
              <p className="mt-2 text-[14px] leading-relaxed text-ink-2">{finalCta.body}</p>
            </div>
            <Button
              variant="primary"
              size="lg"
              onClick={onLaunch}
              icon={<ArrowUpRight size={17} weight="bold" aria-hidden="true" />}
              className="h-11 shrink-0 px-4 text-[15px]"
            >
              {finalCta.cta}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  const credits = [site.author, site.college].filter(Boolean);

  return (
    <footer className="mx-auto max-w-[1200px] px-5 py-10 sm:px-8">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Logo />
          <p className="mt-3 max-w-[44ch] text-[12px] leading-relaxed text-ink-3">
            Campus Wi-Fi channel planning, graph coloring and T-coloring. Runs entirely in your browser; no account and
            no network calls.
          </p>
        </div>
        <nav aria-label="Footer" className="flex flex-wrap gap-x-5 gap-y-2 text-[12px] text-ink-3">
          <a href="#problem" className="hover:text-ink">Problem</a>
          <a href="#how-it-works" className="hover:text-ink">How it works</a>
          <a href="#features" className="hover:text-ink">Features</a>
          <a href="#under-the-hood" className="hover:text-ink">Under the hood</a>
          <a href="#faq" className="hover:text-ink">FAQ</a>
        </nav>
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-2 border-t border-line pt-4 text-[11px] text-ink-3">
        <p>© {new Date().getFullYear()} Taalमेल · a college project</p>
        {credits.length > 0 && <p>{credits.join(' · ')}</p>}
      </div>
    </footer>
  );
}
