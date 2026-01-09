import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    const storedUser = JSON.parse(localStorage.getItem("user"));

    // Check if account exists
    if (!storedUser || storedUser.email !== email) {
      alert("No account found with this Gmail. Please Register. ➡️");
      navigate("/signup");
      return;
    }

    // Check password
    if (password !== storedUser.password) {
      alert("Incorrect password! ❌");
      return;
    }

    // Success
    localStorage.setItem("token", "loggedin");
    alert("Welcome back! ✅");
    window.location.href = "/";
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen p-6 overflow-hidden font-sans">
      <div className="fixed inset-0 z-[-1] bg-[#f8fafc]">
        <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-green-100 rounded-full mix-blend-multiply filter blur-[100px] opacity-40 animate-pulse"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] bg-blue-100 rounded-full mix-blend-multiply filter blur-[100px] opacity-40 animate-pulse delay-700"></div>
      </div>

      <form onSubmit={handleLogin} className="w-full max-w-sm p-10 bg-white/60 backdrop-blur-3xl rounded-[3rem] shadow-2xl border border-white">
        <div className="mb-10 text-center">
          <h2 className="text-4xl font-black tracking-tighter uppercase text-slate-800">Sign In</h2>
          <p className="text-[10px] font-bold text-slate-400 tracking-[0.3em] mt-2 italic">AUTHENTICATION REQUIRED</p>
        </div>

        <div className="space-y-5">
          <input type="email" placeholder="Gmail Address" required value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            className="w-full px-5 py-4 border shadow-inner outline-none rounded-2xl bg-white/50 border-slate-200" />
          
          <input type="password" placeholder="Password" required value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            className="w-full px-5 py-4 border shadow-inner outline-none rounded-2xl bg-white/50 border-slate-200" />
          
          <button type="submit" className="w-full py-5 text-xs font-black tracking-widest text-white transition shadow-2xl bg-slate-900 rounded-2xl active:scale-95 shadow-slate-300">
            PROCEED
          </button>
        </div>

        <p className="mt-8 text-[11px] text-center text-slate-400 font-medium uppercase tracking-tighter">
          Don't have an account? <span onClick={() => navigate("/signup")} className="font-black text-blue-600 cursor-pointer hover:underline">Sign Up</span>
        </p>
      </form>
    </div>
  );
}