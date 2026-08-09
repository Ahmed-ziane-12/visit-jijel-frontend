import type { Destination } from "@/types/map";

export function localizeDestination(
    destination: Destination,
    locale: string,
): Destination {
    if (locale !== "ar") return destination;

    return {
        ...destination,
        name: destination.arabic_name || destination.name,
        description: destination.arabic_description || destination.description,
        address: destination.arabic_address || destination.address,
        category: destination.arabic_category || destination.category,
    };
}
