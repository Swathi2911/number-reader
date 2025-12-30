import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const navigate = useNavigate();

  const [preview, setPreview] = useState(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  /* 🔐 CHECK LOGIN (TOKEN ONLY) */
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    // 🔹 Load user data ONLY if it exists
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setName(user.name || "");
      setEmail(user.email || "");
      setPhone(user.phone || "");
      setPreview(user.profileImage || null);
    }
  }, [navigate]);

  /* 📷 Image change */
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const imageURL = URL.createObjectURL(file);
    setPreview(imageURL);
  };

  /* 💾 Save profile (LOCAL ONLY) */
  const handleSave = (e) => {
    e.preventDefault();

    const updatedUser = {
      name,
      email,
      phone,
      profileImage: preview,
    };

    localStorage.setItem("user", JSON.stringify(updatedUser));
    alert("Profile updated successfully ✅");
  };

  return (
    <div className="flex justify-center min-h-screen px-4 pt-10">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
        <h2 className="mb-6 text-2xl font-semibold text-center">
          Profile
        </h2>

        {/* Profile Image */}
        <div className="flex flex-col items-center mb-6">
          <div className="flex items-center justify-center overflow-hidden bg-gray-100 border rounded-full w-28 h-28">
            {preview ? (
              <img
                src={preview}
                alt="Profile"
                className="object-cover w-full h-full"
              />
            ) : (
              <span className="text-sm text-gray-400">
                No Image
              </span>
            )}
          </div>

          <label className="mt-3 text-sm text-indigo-600 cursor-pointer hover:underline">
            Upload Profile Image
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </label>
        </div>

        {/* Profile Form */}
        <form onSubmit={handleSave}>
          {/* Name */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) =>
                setName(e.target.value.replace(/[^a-zA-Z\s]/g, ""))
              }
              className="w-full px-4 py-2 bg-gray-100 rounded"
              required
            />
          </div>

          {/* Email */}
          <div className="mb-4">
            <input
              type="email"
              value={email}
              disabled
              className="w-full px-4 py-2 bg-gray-200 rounded"
            />
          </div>

          {/* Phone */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="Phone number"
              value={phone}
              onChange={(e) => {
                const v = e.target.value.replace(/\D/g, "");
                if (v.length <= 10) setPhone(v);
              }}
              className="w-full px-4 py-2 bg-gray-100 rounded"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 text-white bg-indigo-600 rounded hover:bg-indigo-700"
          >
            Save Profile
          </button>
        </form>
      </div>
    </div>
  );
}
