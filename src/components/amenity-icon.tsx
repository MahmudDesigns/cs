import {
  Wifi,
  Droplets,
  Zap,
  ShieldCheck,
  Sofa,
  UtensilsCrossed,
  ChefHat,
  WashingMachine,
  Car,
  LampDesk,
  Dumbbell,
  GlassWater,
  type LucideIcon,
} from "lucide-react";

const MAP: Record<string, LucideIcon> = {
  "Wi-Fi": Wifi,
  "Hot shower": Droplets,
  "Backup power": Zap,
  "Security & CCTV": ShieldCheck,
  Furnished: Sofa,
  "Shared kitchen": UtensilsCrossed,
  "Private kitchen": ChefHat,
  Laundry: WashingMachine,
  Parking: Car,
  "Study desk": LampDesk,
  "Gym access": Dumbbell,
  "Water 24/7": GlassWater,
};

export function AmenityIcon({ name, className = "h-3.5 w-3.5" }: { name: string; className?: string }) {
  const Icon = MAP[name] ?? ShieldCheck;
  return <Icon className={className} strokeWidth={2.2} aria-hidden />;
}
