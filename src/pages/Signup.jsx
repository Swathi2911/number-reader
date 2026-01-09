import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");

  // Validation Logic
  const validateName = (name) => /^[A-Za-z\s]+$/.test(name);
  const validateEmail = (mail) => /^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(mail);
  const validatePassword = (pwd) => /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&]).{6,}$/.test(pwd);

  const handleSignup = (e) => {
    e.preventDefault();
    setError("");

    if (!validateName(formData.name)) {
      setError("Name must contain only alphabets.");
      return;
    }
    if (!validateEmail(formData.email)) {
      setError("Email must be a valid @gmail.com address.");
      return;
    }
    if (!validatePassword(formData.password)) {
      setError("Password needs: 1 Letter, 1 Number, & 1 Special Char.");
      return;
    }

    localStorage.setItem("user", JSON.stringify(formData));
    alert("Registration Successful! Now please login. ✅");
    navigate("/login");
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen p-6 overflow-hidden font-sans">
      {/* Background Blobs */}
      <div className="fixed inset-0 z-[-1] bg-[#f8fafc]">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-blue-200 rounded-full mix-blend-multiply filter blur-[100px] opacity-40 animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-indigo-200 rounded-full mix-blend-multiply filter blur-[100px] opacity-40 animate-pulse delay-700"></div>
      </div>

      <form onSubmit={handleSignup} className="w-full max-w-sm p-8 bg-white/70 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl border border-white">
        <h2 className="mb-6 text-3xl font-black tracking-tighter text-center uppercase text-slate-800">Register</h2>
        
        <div className="space-y-4">
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Full Name</label>
            <input type="text" placeholder="Alphabets only" required className="w-full px-5 py-3 border outline-none rounded-2xl bg-white/50 border-slate-200" 
              onChange={(e) => setFormData({...formData, name: e.target.value})} />
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Gmail</label>
            <input type="email" placeholder="example@gmail.com" required className="w-full px-5 py-3 border outline-none rounded-2xl bg-white/50 border-slate-200" 
              onChange={(e) => setFormData({...formData, email: e.target.value})} />
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Password</label>
            <input type="password" placeholder="Letter + Number + Special" required className="w-full px-5 py-3 border outline-none rounded-2xl bg-white/50 border-slate-200" 
              onChange={(e) => setFormData({...formData, password: e.target.value})} />
          </div>
        </div>

        {error && <p className="mt-3 text-[10px] font-bold text-red-500 text-center uppercase tracking-tight bg-red-50 p-2 rounded-lg">{error}</p>}

        <button type="submit" className="w-full py-4 mt-6 text-xs font-black tracking-widest text-white transition shadow-lg bg-slate-900 rounded-2xl active:scale-95 shadow-slate-200">
          CREATE ACCOUNT
        </button>

        <p className="mt-6 text-xs tracking-tighter text-center uppercase text-slate-500">
          Existing User? <span onClick={() => navigate("/login")} className="font-black text-blue-600 cursor-pointer hover:underline">Log In</span>
        </p>
      </form>
    </div>
  );
}