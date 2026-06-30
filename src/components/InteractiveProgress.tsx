import { useState } from 'react';
import { FileText, Languages, Gamepad2, Sparkles, CheckCircle2 } from 'lucide-react';

interface InteractiveProgressProps {
  progress: number;
}

interface Stage {
  key: string;
  label: string;
  icon: React.ReactNode;
  threshold: number;
}

const stages: Stage[] = [
  { key: 'translation', label: 'ترجمة النص', icon: <FileText size={18} />, threshold: 20 },
  { key: 'review', label: 'مراجعة اللغة', icon: <Languages size={18} />, threshold: 40 },
  { key: 'testing', label: 'اختبار في اللعبة', icon: <Gamepad2 size={18} />, threshold: 60 },
  { key: 'polishing', label: 'التلميع النهائي', icon: <Sparkles size={18} />, threshold: 80 },
  { key: 'completed', label: 'مكتمل', icon: <CheckCircle2 size={18} />, threshold: 100 },
];

export default function InteractiveProgress({ progress }: InteractiveProgressProps) {
  const [hoveredStage, setHoveredStage] = useState<string | null>(null);

  const getStageColor = (stage: Stage, index: number) => {
    if (progress >= stage.threshold) {
      return 'var(--bronze)';
    }
    const prevThreshold = index > 0 ? stages[index - 1].threshold : 0;
    if (progress > prevThreshold && progress < stage.threshold) {
      const ratio = (progress - prevThreshold) / (stage.threshold - prevThreshold);
      return ratio > 0.5 ? 'var(--bronze-light)' : 'var(--bronze-dark)';
    }
    return 'var(--bronze-dark)';
  };

  const getStageFillOpacity = (stage: Stage, index: number) => {
    if (progress >= stage.threshold) return 1;
    const prevThreshold = index > 0 ? stages[index - 1].threshold : 0;
    if (progress > prevThreshold && progress < stage.threshold) {
      return 0.5 + ((progress - prevThreshold) / (stage.threshold - prevThreshold)) * 0.5;
    }
    return 0.15;
  };

  const getStagePercent = (stage: Stage, index: number) => {
    const prevThreshold = index > 0 ? stages[index - 1].threshold : 0;
    if (progress >= stage.threshold) return 100;
    if (progress > prevThreshold) {
      return Math.round(((progress - prevThreshold) / (stage.threshold - prevThreshold)) * 100);
    }
    return 0;
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6 relative">
        {/* Connecting line */}
        <div
          className="absolute top-1/2 left-0 right-0 h-0.5 -translate-y-1/2"
          style={{ backgroundColor: 'var(--bronze-dark)', opacity: 0.3 }}
        />
        {/* Progress line */}
        <div
          className="absolute top-1/2 left-0 h-0.5 -translate-y-1/2 transition-all duration-700"
          style={{
            width: `${progress}%`,
            backgroundColor: 'var(--bronze)',
          }}
        />

        {stages.map((stage, index) => {
          const isActive = progress >= stage.threshold;
          const color = getStageColor(stage, index);
          const fillOpacity = getStageFillOpacity(stage, index);

          return (
            <div
              key={stage.key}
              className="relative z-10 flex flex-col items-center cursor-pointer"
              onMouseEnter={() => setHoveredStage(stage.key)}
              onMouseLeave={() => setHoveredStage(null)}
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300"
                style={{
                  borderColor: color,
                  backgroundColor: `rgba(var(--bronze-rgb), ${fillOpacity * 0.3})`,
                  color: color,
                }}
              >
                {stage.icon}
              </div>
              <span
                className="text-xs mt-2 text-center hidden sm:block"
                style={{
                  color: isActive ? 'var(--bronze)' : 'var(--text-secondary)',
                  fontFamily: 'Cairo',
                  fontWeight: isActive ? 700 : 400,
                }}
              >
                {stage.label}
              </span>

              {/* Tooltip */}
              {hoveredStage === stage.key && (
                <div
                  className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 rounded text-xs whitespace-nowrap"
                  style={{
                    backgroundColor: 'var(--bronze)',
                    color: 'var(--bg)',
                    fontFamily: 'Cairo',
                  }}
                >
                  {getStagePercent(stage, index)}%
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Overall progress */}
      <div className="mt-2">
        <div className="flex justify-between items-center mb-1">
          <span
            className="text-sm font-bold"
            style={{ color: 'var(--bronze)', fontFamily: 'Cairo' }}
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
        <div
          className="w-full rounded-full overflow-hidden"
          style={{ height: 8, backgroundColor: 'var(--bronze-dark)', opacity: 0.3 }}
        >
          <div
            className="h-full rounded-full transition-all duration-700 ease-out"
            style={{
              width: `${progress}%`,
              backgroundColor: progress >= 100 ? 'var(--success)' : 'var(--bronze)',
            }}
          />
        </div>
      </div>
    </div>
  );
}
