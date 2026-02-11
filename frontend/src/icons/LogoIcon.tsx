import type { SVGProps } from "react";

export function LogoIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="currentColor">
      <circle cx="12" cy="12" r="3" />
      <circle cx="12" cy="5" r="1.75" opacity="0.9" />
      <circle cx="18.5" cy="12" r="1.75" opacity="0.9" />
      <circle cx="12" cy="19" r="1.75" opacity="0.9" />
      <circle cx="5.5" cy="12" r="1.75" opacity="0.9" />
    </svg>
  );
}
