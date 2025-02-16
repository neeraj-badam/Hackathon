import React, { useState, useEffect } from "react";
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";

// Set the dimensions for the Google Map container
const containerStyle = {
  width: "100%",
  height: "500px",
};

// Default center position (in case geolocation isn't available immediately)
const defaultCenter = {
  lat: 20.5937,
  lng: 78.9629,
};

const DeliveryGuyTracker = () => {
  const [deliveryGuyLocation, setDeliveryGuyLocation] = useState(defaultCenter);
  const [error, setError] = useState(null);

  // Load the Google Maps JavaScript API
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: "AIzaSyBt8t8xMW05ps5KQzLlQtbgmzSXyuvx5EE", // Replace with your actual API key
  });

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }

    // Continuously watch the device's position
    const watcher = navigator.geolocation.watchPosition(
      (position) => {
        console.log('update');
        setDeliveryGuyLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (err) => {
        setError(err.message);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    );

    // Cleanup the watcher when component unmounts
    return () => navigator.geolocation.clearWatch(watcher);
  }, []);

  return (
    <div style={{ padding: "1rem" }}>
      <h2>Delivery Guy Live Tracking</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {!isLoaded ? (
        <p>Loading map...</p>
      ) : (
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={deliveryGuyLocation}
          zoom={15}
        >
          <Marker position={deliveryGuyLocation} />
        </GoogleMap>
      )}
      <p>
        Current Location: Latitude {deliveryGuyLocation.lat.toFixed(6)}, Longitude{" "}
        {deliveryGuyLocation.lng.toFixed(6)}
      </p>
    </div>
  );
};

export default DeliveryGuyTracker;