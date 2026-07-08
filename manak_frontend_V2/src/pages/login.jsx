import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../context/auth";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const { user, login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [data, setData] = useState({
    email: "",
    password: ""
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ Auto redirect if already logged in
  useEffect(() => {
    if (user) {
      if (user.role === "admin") {
        navigate("/admin", { replace: true });
      } else {
        navigate("/home", { replace: true });
      }
    }
  }, [user, navigate]);

  const handleLogin = async () => {
    setError("");
    setLoading(true);

    try {
      await login(data);
      // redirect handled by useEffect
    } catch (err) {
      setError(
        err.response?.data?.message || "Invalid email or password"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded shadow w-full max-w-sm">
        <h1 className="text-xl font-bold mb-4 text-center">Login</h1>

        {error && (
          <p className="bg-red-100 text-red-700 p-2 mb-3 rounded text-sm">
            {error}
          </p>
        )}

        <input
          placeholder="Email"
          type="email"
          className="border p-2 w-full mb-3 rounded"
          onChange={e =>
            setData({ ...data, email: e.target.value })
          }
        />

        <input
          placeholder="Password"
          type="password"
          className="border p-2 w-full mb-4 rounded"
          onChange={e =>
            setData({ ...data, password: e.target.value })
          }
        />

        <button
          onClick={handleLogin}
          disabled={loading}
          className="bg-blue-600 text-white w-full p-2 rounded disabled:opacity-60"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        {/* ✅ REGISTER LINK (RESTORED) */}
        <p className="mt-4 text-center text-sm">
          New shopkeeper?{" "}
          <Link
            to="/register"
            className="text-blue-600 underline"
          >
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}
