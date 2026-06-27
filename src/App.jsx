// Replace this file entirely with your Lovable project's App.jsx (or root component)
// The API is live at /api/cars — see README.md for endpoint docs

export default function App() {
  return (
    <div style={{ fontFamily: 'monospace', padding: '2rem' }}>
      <h1>Xkor — API skeleton ready</h1>
      <p>Replace this file with your Lovable project frontend.</p>
      <h2>Endpoints</h2>
      <pre>{`GET /api/cars
  ?page=0          page index (0-based)
  ?count=500       results per page (max 500)
  ?manufacturer=   e.g. BMW, Hyundai
  ?model=          model name
  ?fuel=           diesel | gasoline | electric | hybrid | lpg
  ?yearFrom=       e.g. 2018
  ?yearTo=         e.g. 2024
  ?mileageFrom=    km
  ?mileageTo=      km
  ?priceFrom=      KRW units
  ?priceTo=        KRW units

GET /api/count     total listing count (fast)`}</pre>
    </div>
  );
}
