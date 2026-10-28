import { ArrowDown, ArrowUpRight } from '@phosphor-icons/react';
import { Button } from '@/components/ui/Button';
import { hero } from '../content/home';

/** Decorative rhythm lattice: rings, nodes and chords. Never interactive. */
function RhythmDiagram() {
  const nodes = Array.from({ length: 12 }, (_, index) => {
    const angle = (index / 12) * Math.PI * 2 - Math.PI / 2;
    return { x: 220 + Math.cos(angle) * 176, y: 220 + Math.sin(angle) * 176, angle, index };
  });
  const highlighted = new Set([0, 5, 10]);

  return (
    <svg
      viewBox="0 0 440 440"
      className="h-auto w-full max-w-[440px]"
      aria-hidden="true"
      focusable="false"
      role="presentation"
    >
      {[62, 112, 176].map((radius) => (
        <circle key={radius} cx="220" cy="220" r={radius} fill="none" stroke="#232B4F" strokeWidth="1" />
      ))}
      {nodes.map((node, index) => {
        const next = nodes[(index + 1) % nodes.length];
        return (
          <line
            key={`chord-${node.index}`}
            x1={node.x}
            y1={node.y}
            x2={next.x}
            y2={next.y}
            stroke="#232B4F"
            strokeWidth="1"
          />
        );
      })}
      {[0, 5, 10].map((index) => {
        const node = nodes[index];
        return (
          <line
            key={`spoke-${index}`}
            x1="220"
            y1="220"
            x2={node.x}
            y2={node.y}
            stroke="#3A4575"
            strokeWidth="1"
            strokeDasharray="3 5"
          />
        );
      })}
      <circle cx="220" cy="220" r="26" fill="#0F1428" stroke="#FFB224" strokeWidth="1.5" />
      <circle cx="220" cy="220" r="5" fill="#FFB224" />
      {nodes.map((node) => (
        <g key={node.index}>
          <circle
            cx={node.x}
            cy={node.y}
            r={highlighted.has(node.index) ? 9 : 5.5}
            fill={highlighted.has(node.index) ? '#FFB224' : '#161C38'}
            stroke={highlighted.has(node.index) ? '#FFB224' : '#5F6A9E'}
            strokeWidth="1.5"
          />
          {highlighted.has(node.index) && (
            <text
              x={node.x}
              y={node.y + 3.5}
              textAnchor="middle"
              fontSize="8"
              fontWeight="600"
              fill="#0A0D1A"
              fontFamily="JetBrains Mono, monospace"
            >
              {node.index === 0 ? '1' : node.index === 5 ? '6' : '11'}
            </text>
          )}
        </g>
      ))}
    </svg>
  );
}

export function Hero({ onLaunch }: { onLaunch: () => void }) {
  return (
    <section id="top" aria-labelledby="hero-title" className="border-b border-line">
      <div className="mx-auto grid max-w-[1200px] grid-cols-1 items-center gap-12 px-5 py-16 sm:px-8 lg:grid-cols-12 lg:gap-8 lg:py-24">
        <div className="lg:col-span-7">
          <p className="flex items-center gap-2 text-[12px] font-medium text-accent">
            <span aria-hidden="true" className="inline-block size-1.5 rounded-full bg-accent" />
            {hero.eyebrow}
          </p>

          <h1 id="hero-title" className="mt-4 max-w-[15ch] text-display font-semibold text-ink">
            Tune every access point to its <span className="text-accent">own beat.</span>
          </h1>

          <p className="mt-5 max-w-[54ch] text-[16px] leading-relaxed text-ink-2">{hero.body}</p>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Button
              variant="primary"
              size="lg"
              onClick={onLaunch}
              icon={<ArrowUpRight size={17} weight="bold" aria-hidden="true" />}
              className="h-11 px-4 text-[15px]"
            >
              {hero.primaryCta}
            </Button>
            <a
              href="#how-it-works"
              className="inline-flex h-11 items-center gap-2 rounded-md border border-line-strong px-4 text-[15px] font-medium text-ink-2 transition-colors hover:border-ink-3 hover:text-ink"
            >
              {hero.secondaryCta}
              <ArrowDown size={15} aria-hidden="true" />
            </a>
          </div>

          <div className="mt-9 max-w-[62ch] border-l-2 border-accent/60 pl-4">
            <p className="text-[13px] leading-relaxed text-ink-3">{hero.nameStory}</p>
          </div>
        </div>

        <div className="lg:col-span-5">
          <div className="relative mx-auto max-w-[440px]">
            <RhythmDiagram />
            <p className="mt-2 text-center font-mono text-[10px] uppercase tracking-[0.08em] text-ink-3">
              separation T = 5 · channels 1 / 6 / 11
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
