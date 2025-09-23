import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginWithEmail } from "../service/auth";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onLogin = async () => {
    setLoading(true);
    setErr(null);
    try {
      await loginWithEmail(email, password);
      navigate("/commingsoon");
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
          Welcome Back
        </h1>
        <p className="text-slate-500 text-center text-sm mb-6">
          Please login to your account
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
            onLogin();
          }}
        >
          {/* Email */}
          <div>
            <label className="block text-slate-600 text-sm mb-1">Email</label>
            <input
              type="email"
              className="w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-[#00ADB5] transition"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-slate-600 text-sm mb-1">Password</label>
            <input
              type="password"
              className="w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-[#00ADB5] transition"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
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
              Login
            </button>
          )}
        </form>

        {/* Footer */}
        <p className="text-center text-sm mt-6 text-slate-600">
          Don’t have an account?{" "}
          <Link
            to="/signup"
            className="text-[#00ADB5] font-medium hover:underline"
          >
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
