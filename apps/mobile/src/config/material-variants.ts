import type { IconName } from "@/components/ui/ion-icon";

export type MaterialVariant = "premise" | "bit" | "set";

export const materialVariantConfig: Record<MaterialVariant, { icon: IconName; labelKey: string; borderColor: string; iconColor: string; iconBg: string }> = {
    premise: { icon: "bulb-outline", labelKey: "material.variants.premise", borderColor: "border-t-accent", iconColor: "text-accent", iconBg: "bg-accent-soft" },
    bit: { icon: "reader-outline", labelKey: "material.variants.bit", borderColor: "border-t-blue-500", iconColor: "text-blue-500", iconBg: "bg-blue-500/10" },
    set: { icon: "layers-outline", labelKey: "material.variants.setlist", borderColor: "border-t-success", iconColor: "text-success", iconBg: "bg-success-soft" },
};
