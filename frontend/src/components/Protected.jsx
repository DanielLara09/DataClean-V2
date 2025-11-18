import { Navigate, useLocation } from "react-router-dom";

export default function Protected({ children }) {
  const raw = localStorage.getItem("token");
  // filtra valores vacíos y cadenas "null"/"undefined"
  const token = raw && raw !== "null" && raw !== "undefined" ? raw : null;

  const location = useLocation();
  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return children;
}
