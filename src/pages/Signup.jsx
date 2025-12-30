import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Signup() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // Password validation
  const validatePassword = (pwd) => {
    const regex =
      /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(pwd);
  };

  // Gmail validation
  const validateEmail = (mail) => {
    return /^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(mail);
  };

  // Phone validation
  const validatePhone = (num) => {
    return /^\d{10}$/.test(num);
  };

  const handleSignup = (e) => {
    e.preventDefault();

    const existingUser = JSON.parse(localStorage.getItem("user"));

    //  Already registered
    if (existingUser && existingUser.email === email) {
      alert("This email is already registered. Please login ❗");
      navigate("/login");
      return;
    }

    if (!validateEmail(email)) {
      setError("Email must be a valid @gmail.com address");
      return;
    }

    if (!validatePhone(phone)) {
      setError("Phone number must contain exactly 10 digits");
      return;
    }

    if (!validatePassword(password)) {
      setError(
        "Password must be strong:\n• Minimum 8 characters\n• 1 capital letter\n• 1 number\n• 1 special character"
      );
      return;
    }

    //  Save new user
    const userData = {
      name,
      email,
      phone,
      password,
    };

    localStorage.setItem("user", JSON.stringify(userData));

    setError("");
    alert("User registered successfully ✅");
    navigate("/login");
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <form
        onSubmit={handleSignup}
        className="w-full max-w-sm p-6 bg-white rounded-lg shadow-md"
      >
        <h2 className="mb-6 text-2xl font-semibold text-center">
          Sign Up
        </h2>

        {/* Name */}
        <div className="mb-4">
          <label className="block mb-1 text-gray-600">Name</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Email */}
        <div className="mb-4">
          <label className="block mb-1 text-gray-600">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Phone */}
        <div className="mb-4">
          <label className="block mb-1 text-gray-600">
            Phone Number
          </label>
          <input
            type="text"
            required
            maxLength={10}
            value={phone}
            onChange={(e) =>
              setPhone(e.target.value.replace(/\D/g, ""))
            }
            className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Password */}
        <div className="mb-4">
          <label className="block mb-1 text-gray-600">
            Password
          </label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {error && (
          <p className="mb-3 text-sm text-red-600 whitespace-pre-line">
            {error}
          </p>
        )}

        <button
          type="submit"
          className="w-full py-2 text-white bg-indigo-600 rounded hover:bg-indigo-700"
        >
          Sign Up
        </button>

        <p className="mt-4 text-sm text-center">
          Already have an account?{" "}
          <span
            onClick={() => navigate("/login")}
            className="text-indigo-600 cursor-pointer hover:underline"
          >
            Log in
          </span>
        </p>
      </form>
    </div>
  );
}
