import { useEffect, useState } from "react";
import "./index.css";
import { dev } from "@zoplanner/admin";

import { Button } from "@zoplanner/button";
import { authService } from "@zoplanner/api";
import { useNavigate, Link } from "react-router-dom";
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
      const res = await fetch("http://localhost:5027/api/Manager");
      const data = await res.json();
      if (res.ok) {
        setManager(data);
      }
    }

    fetchManagers();
  }, []);

  useEffect(() => {
    async function fetchConsultant() {
      const res = await fetch("http://localhost:5027/api/Consultant");
      const data = await res.json();
      if (res.ok) {
        setConsultant(data);
      }
    }

    fetchConsultant();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // TEMP: Backendens LoginViewModel kräver email just nu.
      // För att slippa ändra UI:t hämtar vi användaren via username,
      // plockar ut email och skickar med det i login-anropet.
      // Detta ska tas bort när backend-login endast kräver username + password.
      const userRes = await fetch(
        `http://localhost:5027/api/User/username/${username}`,
      );
      const userData = await userRes.json();

      if (!userRes.ok || !userData?.email) {
        alert("Incorrect username or password");
        setUsername("");
        setPassword("");
        return;
      }

      const loginData = await authService.login({
        username,
        email: userData.email,
        password,
      });

      if (loginData?.token) {
        localStorage.setItem("token", loginData.token);
      }

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

      /*
      OLD LOGIN FLOW (kept for reference)

      const res = await fetch(
        `http://localhost:5027/api/User/username/${username}`,
      );
      const data = await res.json();
      if (res.ok) {
        if (data.password === password) {
          const manager = managers.find(
            (manager) => manager.userId === data.id,
          );
          const consultant = consultants.find(
            (consultant) => consultant.userId === data.id,
          );
          if (manager) {
            localStorage.setItem("managerId", manager.id);
          }
          if (consultant) {
            localStorage.setItem("consultantId", consultant.id);
            localStorage.setItem("managerId", consultant.managerId);
          }
          if (!manager && !consultant) {
            alert("användaren hittades inte");
            return;
          }
          navigate(`/home-page/${data.id}`);
          alert(data.message || `Welcome ${data.name}`);
        } else {
          alert("Incorrect username or password");
          setUsername("");
          setPassword("");
          setLoading(false);
          return;
        }
      } else {
        alert("System error");
        setLoading(false);
        return;
      }
      */
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
    <>
      <div className="login-root">
        <dev.QuickDevRegisterEntry managers={managers} />
        <div className="login-page">
          <img
            src="/zoplanner-logo-navbar.png"
            alt="ZoPlanner Logo"
            className="login-logo"
          />
          <form onSubmit={handleSubmit}>
            <h2>Logga in</h2>
            <div className="field">
              <div className="label">
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
            <div className="field">
              <div className="label">
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
            <div className="button">
              <Button
                text={loading ? "Loading..." : "Login"}
                type="submit"
                style="submit"
              />
              <p>Registrering sker via inbjudan. Använd länken i mejlet.</p>
            </div>
          </form>
          <p className="login-footer">ZoPlanner is a product of ZoCom</p>
        </div>
      </div>
    </>
  );
}

export { LoginPage };
