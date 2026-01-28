

// Read credentials from environment variables. In Create React App, env vars
// must be prefixed with REACT_APP_. Create a local `.env` (not checked in)
// with REACT_APP_ADAFRUIT_USERNAME and REACT_APP_AIO_KEY.
export const USERNAME = process.env.REACT_APP_ADAFRUIT_USERNAME || null;
export const AIO_KEY = process.env.REACT_APP_AIO_KEY || null;

export const getFeedData = async (feedName) => {
  // Return random values for development/testing
  const randomValues = {
    temperature: Math.floor(Math.random() * 20) + 15, // 15-35°C
    humidity: Math.floor(Math.random() * 50) + 30,     // 30-80%
    gas: Math.floor(Math.random() * 100),              // 0-100
    motion: Math.random() > 0.7 ? 1 : 0,               // 30% chance of motion
  };

  return randomValues[feedName] ?? Math.random() * 100;
};
