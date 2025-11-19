import { Link, useNavigate } from "react-router-dom";

export default function Layout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();

  function logout() {
    localStorage.removeItem("token");
    navigate("/login");
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <nav className="bg-gray-900 p-4 flex justify-between">
        <div className="space-x-4">
          <Link to="/documents" className="text-emerald-400">Documents</Link>
          <Link to="/documents/new" className="text-emerald-400">New</Link>
        </div>
        <button onClick={logout} className="text-red-400 hover:text-red-300">
          Logout
        </button>
      </nav>
      <main className="p-0 md:p-6">{children}</main>
    </div>
  );
}
