import { NavLink, Link } from "react-router-dom";
import "../styles/Header.css";

export default function Header() {
  return (
    <header className='header'>
      <div className='header-inner'>
        <Link to='/' className='brand'>
          🎬 Video Browser
        </Link>
        <nav className='nav'>
          <NavLink
            to='/'
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            Home
          </NavLink>
          <NavLink
            to='/search'
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            Search
          </NavLink>
        </nav>
      </div>
    </header>
  );
}
