// DEV ONLY:
// Tillfälligt flöde för att skapa managerkonton under utveckling.
// Ska tas bort eller ersättas när ett riktigt onboarding-flöde finns på plats.

import { useState } from "react";
import "./index.css";
import { useNavigate } from "react-router-dom";
import { Button } from "@zoplanner/button";
import { authService, managerService, userService } from "@zoplanner/api";
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

      const data = await managerService.create(userId);

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
      const userData = await userService.getByUsername(username);
      if (!userData?.id) {
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

  const handleClose = () => {
    navigate("/");
  };

  return (
    <>
      <div className="register-page__form-container">
        <h1>ZoPlanner</h1>
        <form onSubmit={handleSubmit}>
          <button
            type="button"
            className="register-page__close-button"
            onClick={handleClose}
            aria-label="Stäng"
          >
            ×
          </button>
          <h2>Skapa managerkonto</h2>

          <div className="register-page__field">
            <div className="register-page__label">
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

          <div className="register-page__field">
            <div className="register-page__label">
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

          <div className="register-page__field">
            <div className="register-page__label">
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

          <div className="register-page__field">
            <div className="register-page__label">
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

          <div className="register-page__button-group">
            <Button
              text={loading ? "Loading..." : "Skapa managerkonto"}
              type="submit"
              style="submit"
            />
          </div>
          <p className="customer-registry__modal-future-note">
            Gör det möjligt att skapa ett managerkonto i demo utan att sätta upp
            data manuellt. Kommer inte att stödjas i kommande versioner.
          </p>
        </form>
      </div>
    </>
  );
}

export { DevManagerRegister };
