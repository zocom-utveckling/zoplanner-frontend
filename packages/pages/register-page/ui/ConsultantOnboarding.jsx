import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@zoplanner/button";
import { FaEnvelope, FaLock, FaUser } from "react-icons/fa";
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
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        city: "PENDING",
        role: "CONSULTANT",
      };

      const registerRes = await fetch(
        "http://localhost:5027/api/Auth/register",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(userPayload),
        },
      );

      if (!registerRes.ok) {
        const message = await getErrorMessage(
          registerRes,
          "Kunde inte skapa användare",
        );
        console.error("Register failed:", message);
        alert(message);
        return;
      }

      const userRes = await fetch(
        `http://localhost:5027/api/User/username/${formData.username}`,
      );

      const createdUser = await userRes.json();

      if (!userRes.ok || !createdUser?.id) {
        alert("Kunde inte hämta skapad användare");
        return;
      }

      const consultantPayload = {
        userId: createdUser.id,
        managerId: Number(managerId),
        city: "PENDING",
      };

      const consultantRes = await fetch(
        "http://localhost:5027/api/Consultant",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(consultantPayload),
        },
      );

      if (!consultantRes.ok) {
        const message = await getErrorMessage(
          consultantRes,
          "Kunde inte skapa konsult",
        );
        console.error("Consultant creation failed:", {
          message,
          consultantPayload,
        });
        alert(message);
        return;
      }

      navigate(`/home-page/${createdUser.id}`);
    } catch (error) {
      console.error(error);
      alert("Något gick fel");
    }
  };

  return (
    <div className="container">
      <h1>ZoPlanner</h1>

      <form onSubmit={handleSubmit}>
        <h2>Skapa ditt konto</h2>
        <div className="field">
          <div className="label">
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

        <div className="field">
          <div className="label">
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

        <div className="field">
          <div className="label">
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

        <div className="field">
          <div className="label">
            <FaEnvelope /> <span>E-post</span>
          </div>
          <input
            name="email"
            type="email"
            value={formData.email}
            disabled
            className="input--disabled"
          />
        </div>

        <div className="field">
          <div className="label">
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

        <div className="field">
          <div className="label">
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

        <div className="button">
          <Button text="Skapa konto" type={"submit"} style={"submit"} />
        </div>
      </form>
    </div>
  );
}
