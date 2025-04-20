const getLocationBtn = document.getElementById('getLocationBtn');
const searchBtn = document.getElementById('searchAddressBtn');
const manualInput = document.getElementById('manualAddress');
const mapFrame = document.getElementById('mapFrame');

// Use My Location
getLocationBtn.addEventListener('click', () => {
  if (!navigator.geolocation) {
    alert("Geolocation is not supported by your browser.");
    return;
  }

  getLocationBtn.disabled = true;
 
  const watchId = navigator.geolocation.watchPosition(
    (position) => {
      const lat = position.coords.latitude.toFixed(6);
      const lon = position.coords.longitude.toFixed(6);
      const accuracy = position.coords.accuracy.toFixed(1); // meters

      console.log(`Lat: ${lat}, Lon: ${lon}, Accuracy: ±${accuracy}m`);

      mapFrame.src = `https://www.google.com/maps?q=${lat},${lon}&z=15&output=embed`;

      if (accuracy <= 30) {
        navigator.geolocation.clearWatch(watchId);
        getLocationBtn.textContent = "📍 Use My Current Location";
        getLocationBtn.disabled = false;
      }
    },
    (error) => {
      console.error("Geolocation error:", error);
      alert("❌ Failed to retrieve accurate location. Please try again.");
      getLocationBtn.disabled = false;
      getLocationBtn.textContent = "📍 Use My Current Location";
    },
    {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0
    }
  );
});

// Search Manual Address
searchBtn.addEventListener('click', () => {
  const address = manualInput.value.trim();
  if (!address) {
    alert("Please enter an address.");
    return;
  }
  mapFrame.src = `https://www.google.com/maps?q=${encodeURIComponent(address)}&z=15&output=embed`;
});
