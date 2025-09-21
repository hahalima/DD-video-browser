import { NavLink } from "react-router-dom";

export default function Header() {
  return (
    <header className="header">
      <div className="header-inner">
        <div className="brand">🎬 Video Browser</div>
        <nav className="nav">
          <NavLink to="/" className={({isActive}) => isActive ? "active" : ""}>Home</NavLink>
          <NavLink to="/search" className={({isActive}) => isActive ? "active" : ""}>Search</NavLink>
        </nav>
      </div>
    </header>
  );
}
