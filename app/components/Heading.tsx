export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

export interface HeadingProps {
  level?: HeadingLevel | `${HeadingLevel}`;
  children: React.ReactNode;
  className?: string;
}

function getHeadingClasses(level: HeadingLevel, className?: string) {
  let baseClasses: string;

  switch (level) {
    case 1:
      baseClasses = "text-2xl font-bold mb-6";
      break;
    case 2:
      baseClasses = "text-xl font-bold mb-4";
      break;
    case 3:
      baseClasses = "text-lg font-semibold mb-3";
      break;
    case 4:
      baseClasses = "text-base font-semibold mb-2";
      break;
    case 5:
      baseClasses = "text-sm font-semibold mb-2";
      break;
    case 6:
      baseClasses = "text-xs font-semibold mb-1";
      break;
  }

  const allClasses = `text-emerald-700 ${baseClasses} ${className || ""}`.trim();
  return allClasses;
}

export function Heading({ level = 1, children, className }: HeadingProps) {
  const numLevel = typeof level === "string" ? (parseInt(level, 10) as HeadingLevel) : level;
  const classes = getHeadingClasses(numLevel, className);

  switch (numLevel) {
    case 1:
      return <h1 className={classes}>{children}</h1>;
    case 2:
      return <h2 className={classes}>{children}</h2>;
    case 3:
      return <h3 className={classes}>{children}</h3>;
    case 4:
      return <h4 className={classes}>{children}</h4>;
    case 5:
      return <h5 className={classes}>{children}</h5>;
    case 6:
      return <h6 className={classes}>{children}</h6>;
  }
}
