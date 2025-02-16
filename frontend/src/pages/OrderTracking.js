import { useEffect, useState } from "react";
import { GoogleMap, Marker, DirectionsRenderer, useLoadScript } from "@react-google-maps/api";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";
import axios from "axios";

const socket = io("http://localhost:8000");
const mapContainerStyle = { width: "100%", height: "400px" };
const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

const DEFAULT_CENTER = { lat: 35.2271, lng: -80.8431 }; // Default location

function OrderTracking() {
  const { orderId } = useParams();
  const [orderStatus, setOrderStatus] = useState("Pending");
  const [driverLocation, setDriverLocation] = useState(null);
  const [deliveryLocation, setDeliveryLocation] = useState(null);
  const [directions, setDirections] = useState(null);
  const token = localStorage.getItem("driverToken");

  const { isLoaded } = useLoadScript({ googleMapsApiKey: GOOGLE_MAPS_API_KEY });

  useEffect(() => {
    fetchOrderDetails(); // Fetch order details initially

    // ✅ Set interval to update driver location every 5 seconds
    const intervalId = setInterval(updateDriverLocation, 5000);

    return () => clearInterval(intervalId); // Cleanup interval when component unmounts
  }, [orderId]);

  useEffect(() => {
    if (!deliveryLocation) return;

    // ✅ Listen for real-time driver location updates via WebSockets
    socket.on("locationGetting", (data) => {
      if (data.orderId === orderId && data.location?.lat && data.location?.lng) {
        console.log("📡 Live Driver Location Update:", data.location);
        setDriverLocation(data.location);
      }
    });

    return () => socket.off("locationGetting");
  }, [orderId, deliveryLocation]);

  // ✅ Trigger directions update when driver or delivery location updates
  useEffect(() => {
    if (driverLocation && deliveryLocation) {
      updateDirections(driverLocation, deliveryLocation);
    }
  }, [driverLocation, deliveryLocation]);

  // ✅ Fetch Order Details (Driver Location & Delivery Address)
  const fetchOrderDetails = async () => {
    try {
      const res = await axios.get(`http://localhost:8000/api/orders/${orderId}/get-location`);

      if (res.data.status) {
        setOrderStatus(res.data.status);
      }

      // ✅ Ensure driver location is valid
      if (res.data.location?.lat && res.data.location?.lng) {
        setDriverLocation(res.data.location);
      }

      // ✅ Convert delivery address to GPS coordinates
      if (res.data.deliveryAddress) {
        convertAddressToCoords(res.data.deliveryAddress);
      }
    } catch (error) {
      console.error("❌ Error fetching order details:", error);
    }
  };

  // ✅ Convert Address to Latitude & Longitude
  const convertAddressToCoords = async (address) => {
    try {
      const geoResponse = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json`, {
        params: { address, key: GOOGLE_MAPS_API_KEY },
      });

      if (geoResponse.data.results.length > 0) {
        const { lat, lng } = geoResponse.data.results[0].geometry.location;
        console.log("📍 Converted Delivery Address:", { lat, lng });
        setDeliveryLocation({ lat, lng });

        // ✅ Ensure directions update as soon as the delivery location is set
        if (driverLocation) {
          updateDirections(driverLocation, { lat, lng });
        }
      } else {
        console.error("❌ Geocoding failed: No results found.");
      }
    } catch (error) {
      console.error("❌ Error converting address:", error);
    }
  };

  // ✅ Update Driver Location Every 5 Seconds with High Accuracy
  const updateDriverLocation = async () => {
    if (!navigator.geolocation) {
      console.error("❌ Geolocation is not supported by this browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        console.log("🚗 Driver's Updated Location:", { latitude, longitude });

        // ✅ Update driver location in state
        setDriverLocation({ lat: latitude, lng: longitude });

        // ✅ Send updated location to the backend
        try {
          await axios.put(
            `http://localhost:8000/api/driver/orders/${orderId}/update-location`,
            { lat: latitude, lng: longitude },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          console.log("✅ Driver's location updated in the backend.");
        } catch (error) {
          console.error("❌ Failed to update driver location:", error);
        }
      },
      (error) => {
        console.error("❌ Error getting driver location:", error);
      },
      { enableHighAccuracy: true, timeout: 1000, maximumAge: 5000 } // ✅ High Accuracy
    );
  };

  // ✅ Update Directions when driver location or delivery location changes
  const updateDirections = (driverCoords, deliveryCoords) => {
    if (!driverCoords?.lat || !driverCoords?.lng || !deliveryCoords?.lat || !deliveryCoords?.lng) return;

    console.log("🔵 Fetching new route from driver to destination...");
    const directionsService = new window.google.maps.DirectionsService();
    directionsService.route(
      {
        origin: { lat: driverCoords.lat, lng: driverCoords.lng },
        destination: { lat: deliveryCoords.lat, lng: deliveryCoords.lng },
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === "OK") {
          console.log("✅ Directions updated");
          setDirections(result);
        } else {
          console.error("❌ Directions request failed due to: " + status);
        }
      }
    );
  };

  if (!isLoaded) return <div>Loading Map...</div>;

  return (
    <div>
      <h2>Order Tracking</h2>
      <p>Status: <strong>{orderStatus}</strong></p>

      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={driverLocation || deliveryLocation || DEFAULT_CENTER}
        zoom={14}
      >
        {/* ✅ Driver's Live Location */}
        {driverLocation && driverLocation.lat && driverLocation.lng && (
          <Marker position={driverLocation} label="🚗" />
        )}
        
        {/* ✅ Delivery Address Location */}
        {deliveryLocation && deliveryLocation.lat && deliveryLocation.lng && (
          <Marker position={deliveryLocation} label="📍" />
        )}
        
        {/* ✅ Route Directions */}
        {directions && <DirectionsRenderer directions={directions} />}
      </GoogleMap>
    </div>
  );
}

export default OrderTracking;
