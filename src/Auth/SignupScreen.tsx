import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signupWithEmail } from "../service/auth";

export default function Signup() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const validate = () => {
    if (!name.trim()) return "Full name is required.";
    if (!email.trim()) return "Email is required.";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return "Please enter a valid email.";
    if (!password) return "Password is required.";
    if (password.length < 6)
      return "Password must be at least 6 characters long.";
    return null;
  };

  const onSignup = async () => {
    setErr(null);
    const errorMsg = validate();
    if (errorMsg) {
      setErr(errorMsg);
      return;
    }

    setLoading(true);
    try {
      await signupWithEmail(email, password, name);
      navigate("/dashboard/db");
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center px-4 pt-20">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 border border-slate-200">
        {/* Logo */}
        <img
          src="https://res.cloudinary.com/doytvgisa/image/upload/v1758623200/logo_evymhe.svg"
          className="mx-auto w-20 h-20 mb-4"
        />

        {/* Title */}
        <h1 className="text-3xl font-bold text-slate-800 text-center mb-2">
          Create Account
        </h1>
        <p className="text-slate-500 text-center text-sm mb-6">
          Join us and start your journey 🚀
        </p>

        {/* Error */}
        {err && (
          <p className="text-red-600 text-sm mb-4 bg-red-50 border border-red-200 p-2 rounded-md">
            {err}
          </p>
        )}

        {/* Form */}
        <form
          className="space-y-5"
          onSubmit={(e) => {
            e.preventDefault();
            onSignup();
          }}
        >
          {/* Name */}
          <div>
            <label className="block text-slate-600 text-sm mb-1">
              Full Name
            </label>
            <input
              className={`w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-[#00ADB5] transition ${
                err?.includes("name") ? "border-red-500" : "border-slate-300"
              }`}
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-slate-600 text-sm mb-1">Email</label>
            <input
              type="email"
              className={`w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-[#00ADB5] transition ${
                err?.includes("email") ? "border-red-500" : "border-slate-300"
              }`}
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-slate-600 text-sm mb-1">
              Password
            </label>
            <input
              type="password"
              className={`w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-[#00ADB5] transition ${
                err?.includes("Password") ? "border-red-500" : "border-slate-300"
              }`}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* Button */}
          {loading ? (
            <div className="flex items-center justify-center">
              <div className="w-10 h-10 border-4 border-[#00ADB5] border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <button
              type="submit"
              className="w-full bg-[#00ADB5] hover:bg-[#059ca7] text-white font-semibold py-3 rounded-xl transition shadow-md hover:shadow-lg"
            >
              Sign Up
            </button>
          )}
        </form>

        {/* Footer */}
        <p className="text-center text-sm mt-6 text-slate-600">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-[#00ADB5] font-medium hover:underline"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
