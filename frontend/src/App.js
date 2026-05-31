import "@/App.css";
import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import BMWLanding from "@/pages/BMWLanding";
import { Toaster } from "@/components/ui/sonner";
import { captureUtm } from "@/lib/utm";

function App() {
  // Capture utm_* parameters on first visit. Persists in localStorage
  // so every form submit can attach the original ad source.
  useEffect(() => { captureUtm(); }, []);

  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<BMWLanding />} />
          <Route path="/bmw" element={<BMWLanding />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="bottom-right" theme="dark" />
    </div>
  );
}

export default App;
