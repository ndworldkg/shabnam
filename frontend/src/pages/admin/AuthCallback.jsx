import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { api, errMsg } from "@/lib/api";

export default function AuthCallback() {
  const location = useLocation();
  const navigate = useNavigate();
  const done = useRef(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (done.current) return;
    done.current = true;
    const sid = new URLSearchParams(location.hash.slice(1)).get("session_id");
    api.post("/auth/session", {}, { headers: { "X-Session-ID": sid } })
      .then((r) => {
        window.history.replaceState(null, "", "/admin");
        navigate("/admin", { replace: true, state: { user: r.data } });
      })
      .catch((e) => {
        window.history.replaceState(null, "", "/admin");
        setError(errMsg(e, "Giriş yapılamadı."));
      });
  }, [location.hash, navigate]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[#0B0F17] px-6 text-center text-white" data-testid="auth-callback">
      {error ? (
        <>
          <p className="max-w-md text-lg" data-testid="auth-error">{error}</p>
          <Link to="/" className="text-[#FF8A65] underline" data-testid="auth-error-home-link">Siteye dön</Link>
        </>
      ) : <Loader2 className="h-8 w-8 animate-spin text-[#FF5722]" />}
    </main>
  );
}
