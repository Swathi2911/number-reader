import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Forgot password states
  const [showForgot, setShowForgot] = useState(false);
  const [fpEmail, setFpEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");

  // Password validation
  const validatePassword = (pwd) => {
    const regex =
      /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(pwd);
  };

  // 🔐 LOGIN
  const handleLogin = (e) => {
    e.preventDefault();

    const storedUser = JSON.parse(localStorage.getItem("user"));

    if (!storedUser) {
      alert("No user registered. Please signup ❌");
      navigate("/signup");
      return;
    }

    if (email !== storedUser.email) {
      alert("This email is not registered ❌");
      return;
    }

    if (password !== storedUser.password) {
      alert("Incorrect password ❌");
      return;
    }

    localStorage.setItem("token", "loggedin");
    alert("Login successful ✅");
    window.location.href = "/";
  };

  // 🔁 FORGOT PASSWORD
  const handleResetPassword = (e) => {
    e.preventDefault();

    const storedUser = JSON.parse(localStorage.getItem("user"));

    if (!storedUser || fpEmail !== storedUser.email) {
      setError("Email not registered ❌");
      return;
    }

    if (!validatePassword(newPassword)) {
      setError(
        "Password must be strong:\n• Minimum 8 characters\n• 1 capital letter\n• 1 number\n• 1 special character"
      );
      return;
    }

    // Update password
    const updatedUser = {
      ...storedUser,
      password: newPassword,
    };

    localStorage.setItem("user", JSON.stringify(updatedUser));

    alert("Password updated successfully ✅");
    setShowForgot(false);
    setError("");
    setFpEmail("");
    setNewPassword("");
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <form
        onSubmit={showForgot ? handleResetPassword : handleLogin}
        className="w-full max-w-sm p-6 bg-white rounded-lg shadow-md"
      >
        <h2 className="mb-6 text-2xl font-semibold text-center">
          {showForgot ? "Reset Password" : "Log In"}
        </h2>

        {!showForgot ? (
          <>
            {/* Email */}
            <div className="mb-4">
              <label className="block mb-1 text-gray-600">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter your email"
              />
            </div>

            {/* Password */}
            <div className="mb-2">
              <label className="block mb-1 text-gray-600">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter your password"
              />
            </div>

            {/* Forgot password */}
            <p
              className="mb-4 text-sm text-right text-indigo-600 cursor-pointer hover:underline"
              onClick={() => setShowForgot(true)}
            >
              Forgot password?
            </p>

            <button
              type="submit"
              className="w-full py-2 text-white bg-indigo-600 rounded hover:bg-indigo-700"
            >
              Log In
            </button>

            <p className="mt-4 text-sm text-center">
              Don’t have an account?{" "}
              <span
                onClick={() => navigate("/signup")}
                className="text-indigo-600 cursor-pointer hover:underline"
              >
                Sign up
              </span>
            </p>
          </>
        ) : (
          <>
            {/* Forgot Email */}
            <div className="mb-4">
              <label className="block mb-1 text-gray-600">
                Registered Email
              </label>
              <input
                type="email"
                required
                value={fpEmail}
                onChange={(e) => setFpEmail(e.target.value)}
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-indigo-500"
                placeholder="example@gmail.com"
              />
            </div>

            {/* New Password */}
            <div className="mb-3">
              <label className="block mb-1 text-gray-600">
                New Password
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-indigo-500"
                placeholder="Create new password"
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
              Update Password
            </button>

            <p
              className="mt-4 text-sm text-center text-gray-600 cursor-pointer hover:underline"
              onClick={() => {
                setShowForgot(false);
                setError("");
              }}
            >
              Back to login
            </p>
          </>
        )}
      </form>
    </div>
  );
}
