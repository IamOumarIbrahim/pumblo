import { initials } from "@/app/lib/format";

export function Avatar({
  name,
  color,
  size = "md",
}: {
  name: string;
  color: string;
  size?: "sm" | "md" | "lg" | "xl";
}) {
  return (
    <span
      className={`avatar avatar-${size}`}
      style={{ backgroundColor: color }}
      aria-label={`${name}'s avatar`}
    >
      {initials(name)}
    </span>
  );
}
