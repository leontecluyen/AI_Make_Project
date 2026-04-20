import { clsx } from "clsx";

type Color = "blue" | "green" | "yellow" | "red" | "purple" | "gray";

interface BadgeProps {
  children: React.ReactNode;
  color?: Color;
  className?: string;
}

const colorClasses: Record<Color, string> = {
  blue: "bg-blue-100 text-blue-800",
  green: "bg-green-100 text-green-800",
  yellow: "bg-yellow-100 text-yellow-800",
  red: "bg-red-100 text-red-800",
  purple: "bg-purple-100 text-purple-800",
  gray: "bg-gray-100 text-gray-800",
};

function getBarcodeColor(type: string): Color {
  if (type.includes("QR")) return "blue";
  if (type.includes("EAN") || type.includes("UPC")) return "green";
  if (type.includes("128") || type.includes("GS1")) return "purple";
  if (type.includes("DATA") || type.includes("MATRIX")) return "yellow";
  if (type.includes("PDF")) return "red";
  return "gray";
}

export function Badge({ children, color, className }: BadgeProps) {
  const resolvedColor = color ?? (typeof children === "string" ? getBarcodeColor(children) : "gray");
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        colorClasses[resolvedColor],
        className
      )}
    >
      {children}
    </span>
  );
}
