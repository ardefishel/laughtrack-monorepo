import type { IconName } from "@/components/ui/ion-icon";

export type MaterialVariant = "premise" | "bit" | "set";

export const materialVariantConfig: Record<MaterialVariant, { icon: IconName; label: string; borderColor: string; iconColor: string; iconBg: string }> = {
    premise: { icon: "bulb-outline", label: "Premise", borderColor: "border-t-accent", iconColor: "text-accent", iconBg: "bg-accent-soft" },
    bit: { icon: "reader-outline", label: "Bit", borderColor: "border-t-blue-500", iconColor: "text-blue-500", iconBg: "bg-blue-500/10" },
    set: { icon: "layers-outline", label: "Set", borderColor: "border-t-success", iconColor: "text-success", iconBg: "bg-success-soft" },
};
