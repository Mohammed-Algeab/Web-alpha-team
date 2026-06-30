interface ProgressBarProps {
  progress: number;
  showLabel?: boolean;
}

export default function ProgressBar({ progress, showLabel = true }: ProgressBarProps) {
  const getColor = () => {
    if (progress >= 100) return 'var(--success)';
    if (progress >= 70) return 'var(--bronze-light)';
    if (progress >= 30) return 'var(--bronze)';
    return 'var(--bronze-dark)';
  };

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between items-center mb-1">
          <span
            className="text-sm font-bold"
            style={{ color: getColor(), fontFamily: 'Cairo' }}
          >
            {progress}%
          </span>
          <span
            className="text-xs"
            style={{ color: 'var(--text-secondary)' }}
          >
            {progress >= 100 ? 'مكتمل' : progress >= 70 ? 'متقدم' : progress >= 30 ? 'قيد التقدم' : 'بداية'}
          </span>
        </div>
      )}
      <div
        className="w-full rounded-full overflow-hidden"
        style={{ height: 8, backgroundColor: 'var(--bronze-dark)', opacity: 0.3 }}
      >
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{
            width: `${progress}%`,
            backgroundColor: getColor(),
          }}
        />
      </div>
    </div>
  );
}
