export async function detectLocation(): Promise<string> {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject("Geolocation is not supported by your browser");
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                try {
                    // Using Nominatim (OpenStreetMap) for reverse geocoding
                    // Note: In production, consider a paid provider like Google Maps or Mapbox
                    const response = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
                        {
                            headers: {
                                'Accept-Language': 'en-US,en;q=0.9',
                            }
                        }
                    );
                    const data = await response.json();

                    if (data && data.display_name) {
                        // Return a cleaner version of the address if possible
                        const address = data.address;
                        const parts = [
                            address.road || address.suburb,
                            address.city || address.town || address.village,
                            address.state,
                            address.country
                        ].filter(Boolean);

                        resolve(parts.join(', ') || data.display_name);
                    } else {
                        resolve(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
                    }
                } catch (error) {
                    console.error('Reverse geocoding failed:', error);
                    resolve(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
                }
            },
            (error) => {
                console.error('Geolocation error:', error);
                reject(error.message);
            },
            {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0
            }
        );
    });
}
