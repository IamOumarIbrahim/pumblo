import Image from "next/image";
import { initials } from "@/app/lib/format";

export function Avatar({
  name,
  color,
  src,
  size = "md",
}: {
  name: string;
  color: string;
  src?: string;
  size?: "sm" | "md" | "lg" | "xl";
}) {
  return (
    <span
      className={`avatar avatar-${size}`}
      style={{ backgroundColor: color }}
      aria-label={`${name}'s avatar`}
    >
      {src ? (
        <Image src={src} alt="" width={96} height={96} unoptimized />
      ) : (
        initials(name)
      )}
    </span>
  );
}
