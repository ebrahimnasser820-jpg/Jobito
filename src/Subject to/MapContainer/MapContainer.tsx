import React, { useCallback, useEffect, useState } from "react";
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";
import "./MapContainer.module.css";
interface MapProps {
  lat?: number;
  lng?: number;
}

const center = {
  lat: 30.0444,
  lng: 31.2357,
};

const MapComponent: React.FC<MapProps> = ({ lat, lng }) => {
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);

  const onLoad = useCallback((mapInstance: google.maps.Map) => {
    setMap(mapInstance);
  }, []);

  useEffect(() => {
    if (map) {
      console.log("Google map instance is ready:", map);
    }
  }, [map]);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  const location = {
    lat: lat ?? center.lat,
    lng: lng ?? center.lng,
  };

  if (!isLoaded) return <div>Loading...</div>;

  return (
    <div className="w-full max-w-[1000px] h-[400px] rounded-xl overflow-hidden">
      <GoogleMap
        mapContainerClassName="w-full h-full"
        center={location}
        zoom={14}
        onLoad={onLoad}
        onUnmount={onUnmount}
      >
        <Marker position={location} />
      </GoogleMap>
    </div>
  );
};

export default React.memo(MapComponent);
