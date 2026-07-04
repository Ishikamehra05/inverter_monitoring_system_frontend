"use client";

import { useEffect, useState } from "react";
import {
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

type Props = {
  latitude: number;
  longitude: number;
  onChange: (lat: number, lng: number) => void;
};

function MapClick({
  onChange,
}: {
  onChange: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      onChange(e.latlng.lat, e.latlng.lng);
    },
  });

  return null;
}

export default function LocationPicker({
  latitude,
  longitude,
  onChange,
}: Props) {
  const [position, setPosition] = useState<[number, number]>([
    latitude,
    longitude,
  ]);

  const handlePositionChange = (lat: number, lng: number) => {
    const nextPosition: [number, number] = [lat, lng];
    setPosition(nextPosition);
    onChange(lat, lng);
  };

  useEffect(() => {
    const newPosition: [number, number] = [latitude, longitude];
    setPosition((currentPosition) => {
      if (
        currentPosition[0] === newPosition[0] &&
        currentPosition[1] === newPosition[1]
      ) {
        return currentPosition;
      }

      return newPosition;
    });
  }, [latitude, longitude]);

  function ResizeMap() {
    const map = useMap();

    useEffect(() => {
      const timer = setTimeout(() => {
        map.invalidateSize();
      }, 300);

      return () => clearTimeout(timer);
    }, [map]);

    return null;
  }
  function ChangeView({ center }: { center: [number, number] }) {
    const map = useMap();

    useEffect(() => {
      map.setView(center);
    }, [center, map]);

    return null;
  }
  return (
    <div className="rounded-lg overflow-hidden border">
      <MapContainer
        center={position}
        zoom={15}
        style={{
          height: "200px",
          width: "100%",
        }}
      >
        <ResizeMap />
        <ChangeView center={position} />
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker
          position={position}
          draggable={true}
          eventHandlers={{
            drag: (e) => {
              const { lat, lng } = e.target.getLatLng();
              handlePositionChange(lat, lng);
            },
            dragend: (e) => {
              const { lat, lng } = e.target.getLatLng();
              handlePositionChange(lat, lng);
            },
          }}
        />

        <MapClick
          onChange={(lat, lng) => {
            handlePositionChange(lat, lng);
          }}
        />
      </MapContainer>
    </div>
  );
}
