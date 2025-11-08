type ProgressBarProps = {
  value: number; // current value
  max?: number; // max value (default 100)
  height?: string; // tailwind height class (e.g. "h-2", "h-3", "h-4")
  showLabel?: boolean; // show percent text inside bar
  rounded?: string; // tailwind rounding (e.g. "rounded-full", "rounded-md")
  className?: string; // additional container classes
  ariaLabel?: string; // accessible label
};

const clamp = (v: number, min = 0, max = 100) =>
  Math.min(max, Math.max(min, v));

export default function ProgressBar({
  value,
  max = 100,
  height = "h-3",
  showLabel = true,
  rounded = "rounded-xl",
  className = "",
  ariaLabel = "Progress",
}: ProgressBarProps) {
  const pct = max > 0 ? (clamp(value, 0, max) / max) * 100 : 0;
  const style = { width: `${pct}%` };

  return (
    <div
      role="progressbar"
      aria-label={ariaLabel}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={Math.round(value)}
      className={`w-full bg-zinc-200/60 dark:bg-zinc-800/40 ${rounded} overflow-hidden ${className}`}
    >
      {/* track */}
      <div
        className={`${height} flex items-center transition-all duration-500 ease-out`}
        style={{ background: "transparent" }}
      >
        {/* fill */}
        <div
          style={style}
          className={`h-full ${rounded} transform-gpu transition-[width] duration-500 ease-out`}
        >
          {/* gradient + subtle shine */}
          <div
            className={`h-full ${rounded} bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-700 relative overflow-hidden`}
            style={{ boxShadow: "inset 0 -4px 6px rgba(0,0,0,0.06)" }}
          >
            {/* optional label centered */}
            {showLabel && (
              <div className="w-full h-full flex items-center justify-center text-xs font-medium text-white select-none">
                {Math.round(pct)}%
              </div>
            )}

            {/* tiny animated shimmer */}
            <div
              aria-hidden
              className="absolute inset-y-0 -left-40 w-40 bg-white/10 opacity-40 transform skew-x-[-20deg] animate-[shimmer_1.6s_infinite]"
              style={{ mixBlendMode: "overlay" }}
            />
          </div>
        </div>
      </div>

      {/* Tailwind doesn't include the shimmer animation by default — add this to your global css */}
      <style>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(300%);
          }
        }
        .animate-[shimmer_1.6s_infinite] {
          animation: shimmer 1.6s infinite;
        }
      `}</style>
    </div>
  );
}
