import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import BMWLanding from "@/pages/BMWLanding";
import { Toaster } from "@/components/ui/sonner";

function App() {
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
