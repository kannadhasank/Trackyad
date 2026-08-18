import { useState } from "react";
import { Package, User, Lock } from "lucide-react";
import xsysLogo from "../../../assets/XSYS network logo.avif";

export function LoginScreen({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

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

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onLogin();
          }}
        >
          <label className="field">
            <span className="field-label">
              <User size={13} /> User name
            </span>
            <input
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </label>

          <button type="submit" className="btn-primary login-btn">
            Sign in
          </button>
        </form>

        <div className="login-foot">Demo mode — any credentials work</div>
      </div>
    </div>
  );
}
