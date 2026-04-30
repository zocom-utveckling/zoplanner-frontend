import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@zoplanner/button";
import { authService, consultantService, userService } from "@zoplanner/api";
import { FaEnvelope, FaLock, FaUser } from "react-icons/fa";
import { LoginPage } from "@zoplanner/login-page";
import "./index.css";

async function getErrorMessage(response, fallbackMessage) {
  try {
    const data = await response.json();
    return data?.message || data?.title || fallbackMessage;
  } catch {
    try {
      const text = await response.text();
      return text || fallbackMessage;
    } catch {
      return fallbackMessage;
    }
  }
}

export function ConsultantOnboarding() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const managerId = searchParams.get("managerId");
  const invitedEmail = searchParams.get("email") || "";

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: invitedEmail,
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!managerId) {
      console.warn("Missing managerId in onboarding flow");
      return;
    }

    if (!formData.email) {
      alert("Ingen e-postadress hittades i inbjudan");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      console.warn("Passwords do not match");
      return;
    }

    const fullName = `${formData.firstName} ${formData.lastName}`.trim();

    if (!fullName) {
      alert("Ange ditt namn");
      return;
    }

    try {
      const userPayload = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        name: fullName,
        city: "PENDING",
        role: "CONSULTANT",
      };

      await authService.register(userPayload);

      const createdUser = await userService.getByUsername(formData.username);

      if (!createdUser?.id) {
        alert("Kunde inte hämta skapad användare");
        return;
      }

      const consultantPayload = {
        userId: createdUser.id,
        managerId: Number(managerId),
        city: "PENDING",
      };

      await consultantService.create(consultantPayload);

      navigate(`/home-page/${createdUser.id}`);
    } catch (error) {
      console.error(error);
      alert(error.message || "Något gick fel");
    }
  };

  const handleClose = () => {
    navigate("/");
  };

  return (
    <>
      <div className="register-page__background" aria-hidden="true">
        <LoginPage />
      </div>

      <div
        className="register-page__overlay"
        role="dialog"
        aria-modal="true"
        aria-label="Skapa ditt konto"
      >
        <form className="register-page__modal" onSubmit={handleSubmit}>
          <button
            type="button"
            className="register-page__close-button"
            onClick={handleClose}
            aria-label="Stäng"
          >
            ×
          </button>
          <h2>Skapa ditt konto</h2>
          <div className="register-page__field">
            <div className="register-page__label">
              <FaUser /> <span>Förnamn</span>
            </div>
            <input
              name="firstName"
              type="text"
              value={formData.firstName}
              placeholder="Ange ditt förnamn"
              onChange={handleChange}
            />
          </div>

          <div className="register-page__field">
            <div className="register-page__label">
              <FaUser /> <span>Efternamn</span>
            </div>
            <input
              name="lastName"
              type="text"
              value={formData.lastName}
              placeholder="Ange ditt efternamn"
              onChange={handleChange}
            />
          </div>

          <div className="register-page__field">
            <div className="register-page__label">
              <FaUser /> <span>Användarnamn</span>
            </div>
            <input
              name="username"
              type="text"
              value={formData.username}
              placeholder="Välj ett användarnamn"
              onChange={handleChange}
            />
          </div>

          <div className="register-page__field">
            <div className="register-page__label">
              <FaEnvelope /> <span>E-post</span>
            </div>
            <input
              name="email"
              type="email"
              value={formData.email}
              disabled
              className="register-page__input--disabled"
            />
          </div>

          <div className="register-page__field">
            <div className="register-page__label">
              <FaLock /> <span>Lösenord</span>
            </div>
            <input
              name="password"
              type="password"
              value={formData.password}
              placeholder="Skapa ett lösenord"
              minLength={8}
              onChange={handleChange}
            />
          </div>

          <div className="register-page__field">
            <div className="register-page__label">
              <FaLock /> <span>Upprepa lösenord</span>
            </div>
            <input
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              placeholder="Upprepa lösenord"
              minLength={8}
              onChange={handleChange}
            />
          </div>

          <div className="register-page__button-group">
            <Button text="Skapa konto" type={"submit"} style={"submit"} />
          </div>
          <p className="customer-registry__modal-future-note">
            Detta formulär är tänkt att nås via konsultens inbjudningslänk. I
            demo skickas man hit direkt från dev-flödet.
          </p>
        </form>
      </div>
    </>
  );
}
