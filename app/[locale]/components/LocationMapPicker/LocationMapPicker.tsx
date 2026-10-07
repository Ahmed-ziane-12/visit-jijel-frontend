"use client";

import { useEffect, useRef } from "react";
import type L from "leaflet";

interface LocationMapPickerProps {
    latitude: string;
    longitude: string;
    hint?: string;
    onSelect: (lat: number, lng: number) => void;
}

export default function LocationMapPicker({
    latitude,
    longitude,
    hint,
    onSelect,
}: LocationMapPickerProps) {
    const mapRef = useRef<HTMLDivElement>(null);
    const markerRef = useRef<L.Marker | null>(null);
    const mapInstanceRef = useRef<L.Map | null>(null);

    useEffect(() => {
        let cancelled = false;

        (async () => {
            const L = await import("leaflet");

            await import("leaflet/dist/leaflet.css");

            if (cancelled || !mapRef.current) return;

            const lat = parseFloat(latitude) || 36.82;
            const lng = parseFloat(longitude) || 5.766;

            const map = L.map(mapRef.current, {
                center: [lat, lng],
                zoom: 13,
                zoomControl: true,
            });

            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                attribution:
                    '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a>',
            }).addTo(map);

            const markerIcon = L.divIcon({
                html: `<div style="background:#eb662b;width:16px;height:16px;border-radius:50%;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,.3)"></div>`,
                iconSize: [16, 16],
                iconAnchor: [8, 8],
                className: "",
            });

            const marker = L.marker([lat, lng], {
                icon: markerIcon,
                draggable: true,
            }).addTo(map);

            marker.on("dragend", () => {
                const pos = marker.getLatLng();
                onSelect(
                    parseFloat(pos.lat.toFixed(6)),
                    parseFloat(pos.lng.toFixed(6)),
                );
            });

            map.on("click", (e: L.LeafletMouseEvent) => {
                marker.setLatLng(e.latlng);
                onSelect(
                    parseFloat(e.latlng.lat.toFixed(6)),
                    parseFloat(e.latlng.lng.toFixed(6)),
                );
            });

            markerRef.current = marker;
            mapInstanceRef.current = map;
        })();

        return () => {
            cancelled = true;
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (!markerRef.current || !mapInstanceRef.current) return;
        const lat = parseFloat(latitude);
        const lng = parseFloat(longitude);
        if (isNaN(lat) || isNaN(lng)) return;
        markerRef.current.setLatLng([lat, lng]);
        mapInstanceRef.current.setView(
            [lat, lng],
            mapInstanceRef.current.getZoom(),
        );
    }, [latitude, longitude]);

    return (
        <div className="space-y-2">
            {hint && <p className="text-xs text-(--light-fg)">{hint}</p>}
            <div
                ref={mapRef}
                className="h-56 rounded-xl overflow-hidden border border-(--border) bg-(--dim-bg)"
                style={{ zIndex: 0 }}
            />
        </div>
    );
}
