// Reusable progress bar with optional percentage label
export default function ProgressBar({ percent = 0, showLabel = false, color = 'amber' }) {
  const clampedPercent = Math.min(100, Math.max(0, percent));

  // Maps color prop to Tailwind bg class
  const colorMap = {
    amber:   'bg-amber-500',
    emerald: 'bg-emerald-500',
    rose:    'bg-rose-500',
    stone:   'bg-stone-600',
    indigo:  'bg-indigo-500',
  };
  const barColor = colorMap[color] || 'bg-amber-500';

  return (
    <div>
      {showLabel && (
        <div className="flex justify-between text-xs text-stone-500 mb-1">
          <span>Progress</span>
          <span className="font-medium text-stone-700">{clampedPercent}%</span>
        </div>
      )}
      <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden">
        <div
          className={`${barColor} h-2 rounded-full transition-all duration-500`}
          style={{ width: `${clampedPercent}%` }}
        />
      </div>
    </div>
  );
}
