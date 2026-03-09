import { Link } from "react-router-dom";

function Header({ user, initials }) {
  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <header className="dash-header">
      <div>
        <h1 className="dash-greeting">{greeting}, {user.fullName?.split(" ")[0]}</h1>
        <p className="dash-date">
          {now.toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>
    </header>
  );
}

export default Header;
