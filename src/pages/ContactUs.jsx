import { useState } from "react";
import contactImg from "../assets/contact-image.png";

export default function ContactUs() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!name || !email || !message) {
      alert("Please fill all fields");
      return;
    }

    alert("Message sent successfully ✅");

    setName("");
    setEmail("");
    setMessage("");
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4">
      <div className="grid w-full max-w-2xl overflow-hidden bg-white rounded-lg shadow-md md:grid-cols-2">
        
        {/* Left Form Section */}
        <div className="p-6">
          <h2 className="mb-4 text-2xl font-semibold">
            Contact Us
          </h2>

          <form onSubmit={handleSubmit}>
            {/* Name */}
            <div className="mb-4">
              <input
                type="text"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 bg-gray-100 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Email */}
            <div className="mb-4">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 bg-gray-100 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Message */}
            <div className="mb-4">
              <textarea
                placeholder="Message"
                rows="4"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-4 py-2 bg-gray-100 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <button
              type="submit"
              className="px-6 py-2 text-white bg-teal-500 rounded hover:bg-teal-600"
            >
              Send Message
            </button>
          </form>
        </div>

        {/* Right Illustration Section */}
        <div className="items-center justify-center hidden md:flex bg-gray-50">
          <img
            src={contactImg}
            alt="Contact illustration"
            className="w-4/5 max-w-sm"
          />
        </div>

      </div>
    </div>
  );
}
