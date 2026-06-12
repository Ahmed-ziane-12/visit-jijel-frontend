import Image from "next/image";
import React from "react";

type ImageCardProps = {
    image: string;
    className?: string;
};

const ImageCard = ({ image, className }: ImageCardProps) => {
    return (
        <div
            className={`w-60 h-60 border-4 border-(--border) rounded-xl overflow-hidden ${className}`}
        >
            <Image
                src={image}
                alt=""
                width={1000}
                height={1000}
                className="w-full h-full object-cover"
            />
        </div>
    );
};

export default ImageCard;
