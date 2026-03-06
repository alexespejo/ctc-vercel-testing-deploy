import { useState, useEffect } from "react";

function App() {
 const [message, setMessage] = useState("");
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState(null);

 useEffect(() => {
  const serverUrl = import.meta.env.VITE_API_URL || "http://localhost:3001";
  fetch(serverUrl)
   .then((res) => res.json())
   .then((data) => {
    setMessage(data.message || "No message");
    setLoading(false);
   })
   .catch((err) => {
    setError(err.message);
    setLoading(false);
   });
 }, []);

 if (loading) return <div className="container">Loading...</div>;
 if (error) return <div className="container">Error: {error}</div>;

 return (
  <div className="container">
    <h1>CTC Vercel Deployment Test Testing Comments Testing testing test</h1>
   <p data-testid="server-message">{message}</p>
  </div>
 );
}

export default App;
