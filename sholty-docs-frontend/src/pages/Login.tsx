import { useState } from "react";
import { api } from "../lib/api";
import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    try {
      const data = await api("login", "POST", { name, password });
      localStorage.setItem("token", data.token);
      navigate("/documents");
    } catch (err: any) {
      setError(err.message || "Login failed");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white">
      <form onSubmit={handleSubmit} className="bg-gray-900 p-8 rounded-xl w-80 space-y-4 shadow-lg">
        <h1 className="text-xl font-bold text-emerald-400">Login</h1>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <input
          className="w-full p-2 bg-gray-800 rounded"
          placeholder="Username"
          value={name}
          onChange={e => setName(e.target.value)}
        />

        <input
          className="w-full p-2 bg-gray-800 rounded"
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />

        <button className="w-full bg-emerald-500 py-2 rounded font-semibold hover:bg-emerald-600">
          Login
        </button>
      </form>
    </div>
  );
}

export default Login;