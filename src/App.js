import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import BackgroundVideo from "./components/BackgroundVideo";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ContactUs from "./pages/ContactUs";
import Profile from "./pages/Profile";


export default function App() {
  return (
    <BrowserRouter>
      {/* Background Video */}
      <BackgroundVideo />

      {/* Overlay for readability */}
      <div className="min-h-screen bg-black/50">
        <Navbar />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/contact" element={<ContactUs />} />
          <Route path="/profile" element={<Profile />} />
         

        </Routes>
      </div>
    </BrowserRouter>
  );
}
