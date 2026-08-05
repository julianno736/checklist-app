import logo from "../assets/LOGO-transparent.png";

const CIRCUMFERENCE = 138.2;

export default function Header({ percent }) {
  const offset = CIRCUMFERENCE - (CIRCUMFERENCE * percent) / 100;

  return (
    <div className="topbar">
      <div className="topbar-inner">
        <div className="brand">
          <div className="brand-mark">
            <img src={logo} alt="Logo Compagnie Masoandro" />
          </div>
          <div className="brand-text">
            <div className="name">Compagnie Masoandro</div>
            <div className="tag">« Transportez en toute sécurité. »</div>
            <span className="arc" />
          </div>
        </div>
        <div className="gauge-wrap">
          <div className="gauge-label">
            Complété
            <b>{percent}%</b>
          </div>
          <div className="gauge">
            <svg width="52" height="52" viewBox="0 0 52 52">
              <circle cx="26" cy="26" r="22" fill="none" stroke="rgba(255,255,255,.15)" strokeWidth="5" />
              <circle
                cx="26"
                cy="26"
                r="22"
                fill="none"
                stroke="#F0A63A"
                strokeWidth="5"
                strokeDasharray={CIRCUMFERENCE}
                strokeDashoffset={offset}
                strokeLinecap="round"
                transform="rotate(-90 26 26)"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
