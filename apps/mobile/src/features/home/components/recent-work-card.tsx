import { Icon } from "@/components/ui/ion-icon";
import { MaterialVariant, materialVariantConfig } from "@/config/material-variants";
import { useI18n } from '@/i18n'
import { Card, PressableFeedback } from "heroui-native";

interface RecentWorkCardProps {
    variant?: MaterialVariant;
    title: string;
    onPress?: () => void;
}

export function RecentWorkCard({ variant = "premise", title, onPress }: RecentWorkCardProps) {
    const { t } = useI18n()
    const config = materialVariantConfig[variant];

    const card = (
        <Card className={`h-40 w-60 border-t-4 ${config.borderColor} mr-4`}>
            <Card.Header className="flex flex-row justify-between w-full mb-4">
                <Icon name={config.icon} size={28} className={`${config.iconColor} p-2 ${config.iconBg} rounded-xl`} />
                <Card.Title className="uppercase tracking-widest text-sm text-muted">{t(config.labelKey)}</Card.Title>
            </Card.Header>
            <Card.Body>
                <Card.Title className="text-base line-clamp-2">{title}</Card.Title>
            </Card.Body>
        </Card>
    )

    if (!onPress) return card

    return <PressableFeedback onPress={onPress}>{card}</PressableFeedback>
}
