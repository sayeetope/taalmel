import { lazy, Suspense } from 'react';
import { TooltipProvider } from '@/components/ui/Tooltip';
import { Home } from '@/features/marketing/Home';
import { usePlannerRoute } from '@/features/planner/hooks/usePlannerRoute';

// The planner is a separate surface; keep its workspace code out of the
// landing-page bundle so the home page stays light on a projector laptop.
const PlannerModal = lazy(() =>
  import('@/features/planner/PlannerModal').then((module) => ({ default: module.PlannerModal }))
);

export function App() {
  const { open, openPlanner, closePlanner } = usePlannerRoute();

  return (
    <TooltipProvider>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <Home onLaunch={openPlanner} />
      {open && (
        <Suspense
          fallback={
            <div
              role="status"
              className="fixed inset-0 z-50 grid place-items-center bg-overlay text-sm text-ink-2"
            >
              Loading the workspace…
            </div>
          }
        >
          <PlannerModal open={open} onClose={closePlanner} />
        </Suspense>
      )}
    </TooltipProvider>
  );
}
