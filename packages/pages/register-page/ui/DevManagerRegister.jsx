// DEV ONLY:
// Tillfälligt flöde för att skapa managerkonton under utveckling.
// Ska tas bort eller ersättas när ett riktigt onboarding-flöde finns på plats.

import { useState } from "react";
import "./index.css";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@zoplanner/button";
import { authService } from "@zoplanner/api";
import { FaLock, FaEnvelope, FaUser } from "react-icons/fa";

function DevManagerRegister() {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const addManager = async ({ userId }) => {
    try {
      if (!userId) {
        alert("Hittade inte användaren");
        return false;
      }

      const res = await fetch(`http://localhost:5027/api/Manager/${userId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();

      if (!res.ok) {
        alert("Kunde inte lägga till manager");
        return false;
      }

      if (data?.id) {
        localStorage.setItem("managerId", data.id);
      }

      return true;
    } catch (error) {
      alert("Något har gått fel när manager skulle skapas");
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // DEV ONLY:
      // Tillfälligt manager-registerflöde.
      // role sätts till MANAGER och city till PENDING automatiskt.
      await authService.register({
        name,
        username,
        email,
        password,
        confirmPassword: password,
        city: "PENDING",
        role: "MANAGER",
      });

      // TEMP:
      // Auth/register returnerar inte userId.
      // Vi hämtar därför användaren efteråt
      // för att kunna skapa manager-kopplingen.
      const userRes = await fetch(
        `http://localhost:5027/api/User/username/${username}`,
      );
      const userData = await userRes.json();

      if (!userRes.ok || !userData?.id) {
        alert("Kunde inte hämta användaren efter registrering");
        return;
      }

      const managerCreated = await addManager({ userId: userData.id });

      if (!managerCreated) {
        return;
      }

      localStorage.setItem("userId", userData.id);
      alert("Managerkonto skapat");
      navigate(`/home-page/${userData.id}`);
    } catch (error) {
      console.log(error);
      alert(error.message || "Något gick fel");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="container">
        <h1>ZoPlanner</h1>
        <form onSubmit={handleSubmit}>
          <h2>Skapa managerkonto</h2>

          <div className="field">
            <div className="label">
              <FaUser /> <span>För- och efternamn</span>
            </div>
            <input
              type="text"
              value={name}
              required
              placeholder="Ange För- och efternamn"
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="field">
            <div className="label">
              <FaEnvelope /> <span>E-post</span>
            </div>
            <input
              type="email"
              value={email}
              required
              placeholder="Ange din e-post"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="field">
            <div className="label">
              <FaUser /> <span>Användarnamn</span>
            </div>
            <input
              type="text"
              value={username}
              required
              placeholder="Välj ett användarnamn"
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className="field">
            <div className="label">
              <FaLock /> <span>Lösenord</span>
            </div>
            <input
              type="password"
              value={password}
              required
              placeholder="Skapa ett löseord"
              minLength={8}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="button">
            <Button
              text={loading ? "Loading..." : "Skapa managerkonto"}
              type="submit"
              style="submit"
            />
          </div>
        </form>
      </div>
    </>
  );
}

export { DevManagerRegister };
