import { useEffect, useState } from "react";
import "./index.css";
import { dev } from "@zoplanner/admin";
import { Button } from "@zoplanner/button";
import {
  authService,
  managerService,
  consultantService,
  userService,
} from "@zoplanner/api";
import { useNavigate } from "react-router-dom";
import { FaLock, FaUser } from "react-icons/fa";

function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [managers, setManager] = useState([]);
  const [consultants, setConsultant] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    async function fetchManagers() {
      const data = await managerService.getAll();
      setManager(data);
    }

    fetchManagers();
  }, []);

  useEffect(() => {
    async function fetchConsultants() {
      const data = await consultantService.getAll();
      setConsultant(data);
    }

    fetchConsultants();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Backendens login kräver email.
      // UI:t använder username, så vi hämtar user via username och skickar sedan med email i login-anropet.
      const userData = await userService.getByUsername(username);

      if (!userData?.email) {
        alert("Incorrect username or password");
        setUsername("");
        setPassword("");
        return;
      }

      // Själva login-anropet går via authService.
      const loginData = await authService.login({
        username,
        email: userData.email,
        password,
      });

      // Token sparas så API-clienten kan skicka Authorization-header i kommande anrop.
      if (loginData?.token) {
        localStorage.setItem("token", loginData.token);
      }

      // Kopplar inloggad user till eventuell manager-/consultant-profil.
      const manager = managers.find((m) => m.userId === userData.id);
      const consultant = consultants.find((c) => c.userId === userData.id);

      if (manager) {
        localStorage.setItem("managerId", manager.id);
      }

      if (consultant) {
        localStorage.setItem("consultantId", consultant.id);
        localStorage.setItem("managerId", consultant.managerId);
      }

      if (!manager && !consultant) {
        alert("Användaren hittades inte");
        return;
      }

      localStorage.setItem("userId", userData.id);

      navigate(`/home-page/${userData.id}`);
      alert(loginData?.message || `Welcome ${userData.name}`);
    } catch (error) {
      console.log(error);
      alert(error.message || "Something went wrong");
      setUsername("");
      setPassword("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page__root">
      <dev.QuickDevRegisterEntry managers={managers} />

      <div className="login-page__form-wrapper">
        <img
          src="/zoplanner-logo-navbar.png"
          alt="ZoPlanner Logo"
          className="login-page__logo"
        />

        <form onSubmit={handleSubmit}>
          <h2>Logga in</h2>

          <div className="login-page__field">
            <div className="login-page__label">
              <FaUser /> <span>Användarnamn</span>
            </div>
            <input
              type="text"
              value={username}
              required
              placeholder="Ange ditt användarnamn"
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className="login-page__field">
            <div className="login-page__label">
              <FaLock /> <span>Lösenord</span>
            </div>
            <input
              type="password"
              value={password}
              required
              placeholder="Ange ditt lösenord"
              minLength={8}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="login-page__button-group">
            <Button
              text={loading ? "Loading..." : "Login"}
              type="submit"
              style="submit"
            />
            <p>Registrering sker via inbjudan. Använd länken i mejlet.</p>
          </div>
        </form>

        <p className="login-page__footer">ZoPlanner is a product of ZoCom</p>
      </div>
    </div>
  );
}

export { LoginPage };
