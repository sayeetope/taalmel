import { ArrowUpRight } from '@phosphor-icons/react';
import { Logo } from '@/components/brand/Logo';
import { Button } from '@/components/ui/Button';

const LINKS = [
  { href: '#problem', label: 'Problem' },
  { href: '#how-it-works', label: 'How it works' },
  { href: '#features', label: 'Features' },
  { href: '#under-the-hood', label: 'Under the hood' },
  { href: '#faq', label: 'FAQ' },
];

export function Header({ onLaunch }: { onLaunch: () => void }) {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-base">
      <div className="mx-auto flex h-16 max-w-[1200px] items-center gap-6 px-5 sm:px-8">
        <a href="#top" className="rounded-sm">
          <Logo />
        </a>

        <nav aria-label="Primary" className="ml-auto hidden items-center gap-5 lg:flex">
          {LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-sm text-[13px] text-ink-2 transition-colors hover:text-ink"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-3 lg:ml-0">
          <Button
            variant="primary"
            size="md"
            onClick={onLaunch}
            icon={<ArrowUpRight size={15} weight="bold" aria-hidden="true" />}
            className="h-10 px-3.5"
          >
            Launch planner
          </Button>
        </div>
      </div>
    </header>
  );
}
