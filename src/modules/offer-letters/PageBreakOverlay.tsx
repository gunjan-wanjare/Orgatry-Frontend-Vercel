export const A4_WIDTH_PX = 794;
export const A4_HEIGHT_PX = 1122;

export function PageBreakOverlay({ pageCount = 5 }: { pageCount?: number }) {
  return (
    <>
      {Array.from({ length: pageCount - 1 }, (_, i) => (
        <div
          key={i}
          aria-hidden="true"
          style={{ top: (i + 1) * A4_HEIGHT_PX }}
          className="pointer-events-none absolute inset-x-0 z-10 flex items-center gap-2"
        >
          <div className="h-px flex-1 border-t-2 border-dashed border-rose-400/60" />
          <span className="shrink-0 rounded bg-rose-500/80 px-1.5 py-0.5 text-[9px] font-medium text-white">
            Page {i + 1} → {i + 2}
          </span>
          <div className="h-px flex-1 border-t-2 border-dashed border-rose-400/60" />
        </div>
      ))}
    </>
  );
}
