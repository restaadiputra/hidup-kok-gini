import type { CSSProperties, ReactNode } from "react";

const paths: Record<string, ReactNode> = {
  wallet: (
    <>
      <path d="M20 7H5a2 2 0 0 1 0-4h13v4M4 7v13h17V7M21 11h-6v5h6" />
      <path d="M17.5 13.5h.01" />
    </>
  ),
  brain: (
    <>
      <path d="M12 5c-1-4-7-2-6 2-4 0-5 6-2 8-1 5 5 7 8 3 3 4 9 2 8-3 3-2 2-8-2-8 1-4-5-6-6-2v13M6 7l2 2m-4 6 3-2m11-6-2 2m4 6-3-2" />
    </>
  ),
  heart: <path d="M12 21 3.5 12.5C-3 5 7-1 12 7 17-1 27 5 20.5 12.5Z" />,
  sparkles: (
    <>
      <path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5Z" />
      <path d="M21 2v4m-2-2h4M3 19v4m-2-2h4" />
    </>
  ),
  briefcase: (
    <>
      <rect x="3" y="7" width="18" height="14" rx="2" />
      <path d="M8 7V3h8v4M3 12l9 3 9-3M10 13v4h4v-4" />
    </>
  ),
  home: (
    <>
      <path d="m2 11 10-9 10 9M5 9v12h14V9M9 21v-8h6v8" />
      <path d="M16 3h3v5" />
    </>
  ),
  scooter: (
    <>
      <circle cx="5" cy="18" r="3" />
      <circle cx="19" cy="18" r="3" />
      <path d="M5 18h9l3-11h-4M15 12H6l-2 3M17 7l3 8M17 7V4h-4" />
    </>
  ),
  coffee: (
    <>
      <path d="M4 8h13v8a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5ZM17 9h2a3 3 0 0 1 0 6h-2M7 2v3m5-3v3M2 22h18" />
    </>
  ),
  bag: (
    <>
      <path d="M4 7h16l1 14H3ZM8 9V6a4 4 0 0 1 8 0v3" />
      <path d="m9 14 2 2 4-4" />
    </>
  ),
  receipt: (
    <>
      <path d="M5 2l3 2 4-2 4 2 3-2v20l-3-2-4 2-4-2-3 2ZM9 8h6m-6 4h6m-6 4h3" />
    </>
  ),
  gift: (
    <>
      <path d="M3 10h18v5H3ZM5 15v7h14v-7M12 10v12M12 10C1 10 5 0 9 4l3 6c11 0 7-10 3-6Z" />
    </>
  ),
  chat: (
    <>
      <path d="M21 11a9 9 0 0 1-9 9 10 10 0 0 1-4-1l-6 2 2-6a9 9 0 1 1 17-4Z" />
      <path d="M7 10h10M7 14h6" />
    </>
  ),
  helmet: (
    <>
      <path d="M3 16v-5a9 9 0 0 1 18 0v5H3ZM21 10h-8v6M5 16v4h9l4-4M9 4v3" />
    </>
  ),
  wifi: (
    <>
      <path d="M2 8a16 16 0 0 1 20 0M5 12a11 11 0 0 1 14 0M8 16a6 6 0 0 1 8 0" />
      <circle cx="12" cy="20" r="1" />
    </>
  ),
  bus: (
    <>
      <rect x="4" y="2" width="16" height="18" rx="3" />
      <path d="M4 6h16M4 13h16M8 20v2m8-2v2M8 16h1m6 0h1M12 6v7" />
    </>
  ),
  drama: (
    <>
      <path d="M3 4c6 3 12 3 18 0v7c0 5-4 9-9 11-5-2-9-6-9-11ZM7 10h2m6 0h2M8 15q4 4 8 0" />
    </>
  ),
  dice: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <path d="M8.5 8.5h.01M15.5 8.5h.01M12 12h.01M8.5 15.5h.01M15.5 15.5h.01" />
    </>
  ),
  pencil: (
    <>
      <path d="M4 20h4L20 8a2.8 2.8 0 0 0-4-4L4 16Zm11-13 4 4" />
    </>
  ),
  arrow: <path d="M4 12h16m-6-6 6 6-6 6" />,
  check: <path d="m5 12 4 4L19 6" />,
  close: <path d="m6 6 12 12M6 18 18 6" />,
  help: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="M9 8a3 3 0 1 1 4 3c-1 .5-1 1-1 3M12 17h.01" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="7" r="4" />
      <path d="M2 21v-3a7 7 0 0 1 14 0v3M17 3a4 4 0 0 1 0 8m2 3a6 6 0 0 1 3 5v2" />
    </>
  ),
  flag: <path d="M5 22V3c5-5 9 5 15 0v10c-6 5-10-5-15 0" />,
  reset: (
    <>
      <path d="M3 10a9 9 0 1 1 2 9M3 3v7h7" />
    </>
  ),
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 1v3m0 16v3M1 12h3m16 0h3M4 4l2 2m12 12 2 2M4 20l2-2M18 6l2-2" />
    </>
  ),
  moon: <path d="M20.7 13A9 9 0 0 1 11 3.3 9 9 0 1 0 20.7 13Z" />,
};

export function Icon({
  name,
  size = 22,
  className = "",
  style,
}: {
  name: string;
  size?: number;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <svg
      className={className}
      style={style}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name] ?? paths.sparkles}
    </svg>
  );
}
