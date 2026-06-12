"use client";

interface VibeCardProps {
    title: string;
    description: string;
    icon: React.ReactNode;
    imageUrl: string;
    selected?: boolean;
    onClick?: () => void;
}

const VibeCard = ({
    title,
    description,
    icon,
    imageUrl,
    selected = false,
    onClick,
}: VibeCardProps) => {
    return (
        <div
            className={`
        relative w-[220px] h-[300px] rounded-xl overflow-hidden cursor-pointer font-[inherit]
        border-2 transition-all duration-250 ease-in-out
        ${selected ? "border-[#eb662b]" : "border-transparent"}
        group
      `}
            onClick={onClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && onClick?.()}
            aria-pressed={selected}
        >
            {/* Background image */}
            <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-400 ease-in-out group-hover:scale-105"
                style={{ backgroundImage: `url(${imageUrl})` }}
            />

            {/* Gradient overlay — switches on selected */}
            <div
                className={`
          absolute inset-0 transition-all duration-250
          ${
              selected
                  ? "bg-gradient-to-t from-[#eb662b]/85 via-[#eb662b]/30 to-transparent"
                  : "bg-gradient-to-t from-black/75 via-black/20 to-transparent"
          }
        `}
            />

            {/* Icon — top right */}
            <div className="absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center text-lg border border-white/25 bg-white/15 backdrop-blur-sm">
                {icon}
            </div>

            {/* Content — bottom */}
            <div className="absolute bottom-[15px] left-[15px] right-0 p-3.5">
                <h3 className="font-[inherit] text-base font-bold text-white leading-tight mb-1">
                    {title}
                </h3>
                <p className="text-[0.72rem] text-white/80 leading-relaxed">
                    {description}
                </p>
            </div>
        </div>
    );
};

export default VibeCard;
