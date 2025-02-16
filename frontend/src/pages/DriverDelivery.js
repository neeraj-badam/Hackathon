import { useEffect, useState } from "react";
import { GoogleMap, Marker, DirectionsRenderer, useLoadScript } from "@react-google-maps/api";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useSelector } from "react-redux";

const mapContainerStyle = { width: "100%", height: "400px" };
const GOOGLE_MAPS_API_KEY = "AIzaSyBt8t8xMW05ps5KQzLlQtbgmzSXyuvx5EE"; // Replace with your actual API key

const DEFAULT_CENTER = { lat: 35.2271, lng: -80.8431 }; // Charlotte, NC (Default)

function DriverDelivery() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [location, setLocation] = useState(DEFAULT_CENTER); // ✅ Default value
  const [destination, setDestination] = useState(null);
  const [directions, setDirections] = useState(null);
  const { driver, token } = useSelector((state) => state.driver); // ✅ Get driver info from Redux Persist
  const { isLoaded } = useLoadScript({ googleMapsApiKey: GOOGLE_MAPS_API_KEY });

  useEffect(() => {
    getDeliveryAddress();
  }, [orderId]);

  useEffect(() => {
    if (!destination) return;

    const intervalId = setInterval(updateDriverLocation, 5000); // Updates every 5 sec

    return () => clearInterval(intervalId);
  }, [destination]);

  // ✅ Fetch Delivery Address and Convert to Lat/Lng
  const getDeliveryAddress = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/api/order/${orderId}`);
      const address = response.data.deliveryAddress;

      if (!address) {
        console.error("❌ Error: Delivery address is missing!");
        return;
      }

      console.log("📍 Customer Address:", address);

      const geoResponse = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json`, {
        params: { address, key: GOOGLE_MAPS_API_KEY },
      });

      if (geoResponse.data.results.length > 0) {
        const { lat, lng } = geoResponse.data.results[0].geometry.location;
        console.log("📍 Converted Customer Address:", { lat, lng });
        setDestination({ lat, lng });
      }
    } catch (error) {
      console.error("❌ Error converting address:", error);
    }
  };

  // ✅ Update Driver Location Every 5 Seconds
  const updateDriverLocation = async () => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        console.log("🚗 Driver Location:", { latitude, longitude });

        // ✅ Update driver location in UI
        setLocation({ lat: latitude, lng: longitude });

        // ✅ Send to Backend
        try {
          if( latitude && longitude ){
            await axios.put(
              `http://localhost:8000/api/driver/orders/${orderId}/update-location`,
              { lat: latitude, lng: longitude },
              { headers: { Authorization: `Bearer ${token}` } }
            );
          }
          console.log("✅ Location Sent to Backend");
        } catch (error) {
          console.error("❌ Failed to update driver location:", error);
        }

        // ✅ Auto-mark order as delivered if close to destination
        if (destination && isNearDestination(latitude, longitude, destination.lat, destination.lng)) {
          handleDelivery();
        }

        // ✅ Get Directions to Destination
        const directionsService = new window.google.maps.DirectionsService();
        directionsService.route(
          {
            origin: { lat: latitude, lng: longitude },
            destination,
            travelMode: window.google.maps.TravelMode.DRIVING,
          },
          (result, status) => {
            if (status === "OK") {
              setDirections(result);
            }
          }
        );
      },
      (error) => console.error("❌ Error getting location:", error),
      { enableHighAccuracy: true, timeout: 1000, maximumAge: 5000 } // ✅ Improve accuracy
    );
  };

  // ✅ Check if Driver is Near Destination (Threshold: 50 meters)
  const isNearDestination = (lat1, lng1, lat2, lng2) => {
    const toRad = (value) => (value * Math.PI) / 180;
    const R = 6371e3; // Earth's radius in meters
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    console.log("📏 Distance to Destination:", distance, "meters");
    return distance < 50; // ✅ Within 50 meters
  };

  // ✅ Mark Order as Delivered
  const handleDelivery = async () => {
    try {
      await axios.put(
        `http://localhost:8000/api/driver/orders/${orderId}/delivered`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

        // ✅ Remove from "Current Orders"
      const currentOrders = JSON.parse(localStorage.getItem("currentOrders")) || [];
      localStorage.setItem("currentOrders", JSON.stringify(currentOrders.filter(id => id !== orderId)));
      alert("✅ Order Delivered!");
      navigate("/driver-dashboard");  // ✅ Redirect back to Dashboard
    } catch (error) {
      console.log( error );
      alert("❌ Failed to mark order as delivered");
    }
  };

  if (!isLoaded) return <div>Loading Map...</div>;

  return (
    <div>
      <h2>Delivering Order: {orderId}</h2>
      <GoogleMap mapContainerStyle={mapContainerStyle} center={destination || location} zoom={14}>
        {location && <Marker position={location} label="🚗" />}
        {destination && <Marker position={destination} label="📍" />}
        {directions && <DirectionsRenderer directions={directions} />}
      </GoogleMap>

      <button onClick={handleDelivery} className="deliver-btn">Mark as Delivered</button>
    </div>
  );
}

export default DriverDelivery;
