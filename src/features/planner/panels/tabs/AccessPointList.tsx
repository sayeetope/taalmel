import { memo } from 'react';
import { usePlanner, selectChannelAssignment } from '../../store/plannerStore';
import { Stack } from '@phosphor-icons/react';

/**
 * Keyboard-operable AP list. The canvas itself is aria-hidden, so this is the
 * accessible surface for selecting, nudging and deleting access points.
 */
export const AccessPointList = memo(function AccessPointList() {
  const aps = usePlanner((state) => state.aps);
  const coloring = usePlanner((state) => state.coloring);
  const defaultRadius = usePlanner((state) => state.defaultRadius);
  const selectedId = usePlanner((state) => state.selectedId);
  const assignment = usePlanner(selectChannelAssignment);
  const selectAp = usePlanner((state) => state.selectAp);
  const nudgeAp = usePlanner((state) => state.nudgeAp);
  const deleteAp = usePlanner((state) => state.deleteAp);

  if (aps.length === 0) {
    return <p className="py-2 text-[12px] text-ink-3">No access points yet.</p>;
  }

  return (
    <div>
      <p className="mb-1.5 flex items-center gap-1.5 text-[11px] text-ink-3">
        <Stack size={12} aria-hidden="true" />
        Arrow keys nudge 1 m (Shift 10 m) · Enter selects · Delete removes
      </p>
      <ul className="space-y-0.5" aria-label="Access points">
        {aps.map((ap, index) => {
          const channel = assignment ? assignment[index] : null;
          const detail = channel ? `Ch ${channel}` : `Group ${coloring[index] ?? 0}`;
          return (
            <li key={ap.id}>
              <button
                type="button"
                aria-pressed={ap.id === selectedId}
                onClick={() => selectAp(ap.id)}
                onKeyDown={(event) => {
                  const step = event.shiftKey ? 10 : 1;
                  if (event.key === 'ArrowUp') {
                    event.preventDefault();
                    nudgeAp(ap.id, 0, -step);
                  } else if (event.key === 'ArrowDown') {
                    event.preventDefault();
                    nudgeAp(ap.id, 0, step);
                  } else if (event.key === 'ArrowLeft') {
                    event.preventDefault();
                    nudgeAp(ap.id, -step, 0);
                  } else if (event.key === 'ArrowRight') {
                    event.preventDefault();
                    nudgeAp(ap.id, step, 0);
                  } else if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    selectAp(ap.id);
                  } else if (event.key === 'Delete' || event.key === 'Backspace') {
                    event.preventDefault();
                    deleteAp(ap.id);
                  }
                }}
                className="flex w-full items-center justify-between gap-2 rounded-sm px-1.5 py-1 text-left text-[12px] text-ink-2 hover:bg-raised hover:text-ink aria-pressed:bg-accent-soft aria-pressed:text-ink"
              >
                <span className="truncate">{ap.label}</span>
                <span className="tnum shrink-0 text-[11px] text-ink-3">
                  {detail} · {Math.round(ap.radius ?? defaultRadius)} m
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
});
