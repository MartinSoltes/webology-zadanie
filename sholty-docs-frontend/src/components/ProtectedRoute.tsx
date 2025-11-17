import { Navigate } from "react-router-dom";
import { getToken } from "../lib/api";
import type { PropsWithChildren } from "react";

function ProtectedRoute({ children }: PropsWithChildren) {
  const token = getToken();

  if (!token) return <Navigate to="/login" replace />;

  return <>{children}</>;
}

export default ProtectedRoute;