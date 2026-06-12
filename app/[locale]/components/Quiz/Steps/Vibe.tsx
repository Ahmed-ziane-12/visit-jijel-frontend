import { Landmark, MountainSnow, Utensils, Volleyball } from 'lucide-react';
import { useTranslations } from 'next-intl';
import VibeCard from '../../VibeCard/VibeCard';
import type { VibeId } from '@/types/quiz';

interface VibeProps {
    value: VibeId[];
    onChange: (vibes: VibeId[]) => void;
}

const Vibe = ({ value, onChange }: VibeProps) => {
    const t = useTranslations("quiz.vibe");
    const VIBES: { id: VibeId; title: string; description: string; icon: React.ReactNode; imageUrl: string }[] = [
        {
            id: 'beach',
            title: t("beach_title"),
            description: t("beach_desc"),
            icon: <Volleyball className="text-white" />,
            imageUrl: '/p4.jpg',
        },
        {
            id: 'mountain',
            title: t("mountain_title"),
            description: t("mountain_desc"),
            icon: <MountainSnow className="text-white" />,
            imageUrl: '/p2.jpg',
        },
        {
            id: 'food',
            title: t("food_title"),
            description: t("food_desc"),
            icon: <Utensils className="text-white" />,
            imageUrl: '/p6.heic',
        },
        {
            id: 'history',
            title: t("history_title"),
            description: t("history_desc"),
            icon: <Landmark className="text-white" />,
            imageUrl: '/p4.jpg',
        },
    ];

    const toggle = (id: VibeId) => {
        onChange(
            value.includes(id)
                ? value.filter((v) => v !== id)
                : [...value, id],
        );
    };
    return (
        <div className="flex flex-wrap gap-4">
            {VIBES.map((vibe) => (
                <VibeCard
                    key={vibe.id}
                    {...vibe}
                    selected={value.includes(vibe.id)}
                    onClick={() => toggle(vibe.id)}
                />
            ))}
        </div>
    );
};

export default Vibe;
