import { useState } from "react";
import { Package, User, Lock } from "lucide-react";
import xsysLogo from "../../../assets/XSYS network logo.avif";
import { login } from "../../api/auth.js";

export function LoginScreen({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const user = await login(username, password);
      onLogin(user);
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  return (
    <div className="login-screen">
      <div className="login-grid" />
      <div className="login-card">
        <div className="login-mark">
          <Package size={22} strokeWidth={2} />
        </div>
        <div className="login-eyebrow">Asset Tracking Console</div>
        <h1 className="login-title">Sign in to Trackyard</h1>
        <p className="login-sub">Track rentals, partners &amp; customers in one register.</p>

        <form onSubmit={handleSubmit}>
          <label className="field">
            <span className="field-label">
              <User size={13} /> User name
            </span>
            <input
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="j.tan"
              autoFocus
            />
          </label>

          <label className="field">
            <span className="field-label">
              <Lock size={13} /> Password
            </span>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </label>

          {error && <div className="form-error">{error}</div>}

          <button type="submit" className="btn-primary login-btn" disabled={busy}>
            {busy ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
