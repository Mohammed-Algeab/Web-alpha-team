interface GearProps {
  size?: number;
  className?: string;
  style?: React.CSSProperties;
  variant?: 'main' | 'small';
}

export default function GearDecoration({ size = 100, className = '', style = {}, variant = 'main' }: GearProps) {
  const strokeColor = variant === 'main' ? 'var(--bronze)' : 'var(--bronze-dark)';
  const opacity = variant === 'main' ? 0.12 : 0.08;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      style={{ ...style, opacity, pointerEvents: 'none' }}
    >
      <path
        d="M50 15 L53 5 L58 5 L61 15 L65 13 L70 6 L74 9 L70 17 L74 19 L82 14 L85 18 L78 24 L80 28 L90 26 L91 31 L82 34 L82 38 L92 40 L91 45 L82 45 L80 50 L88 55 L85 59 L76 55 L73 58 L79 66 L74 69 L68 62 L64 64 L67 74 L62 76 L57 67 L53 68 L53 78 L48 78 L47 68 L43 67 L38 76 L33 74 L36 64 L32 62 L26 69 L21 66 L27 58 L24 55 L15 59 L12 55 L20 50 L18 45 L9 45 L8 40 L18 38 L18 34 L9 31 L10 26 L20 28 L22 24 L15 18 L18 14 L26 19 L30 17 L26 9 L30 6 L35 13 L39 15 L42 5 L47 5 Z"
        fill="none"
        stroke={strokeColor}
        strokeWidth="1.5"
      />
      <circle
        cx="50"
        cy="50"
        r="12"
        fill="none"
        stroke={strokeColor}
        strokeWidth="1.5"
      />
    </svg>
  );
}
