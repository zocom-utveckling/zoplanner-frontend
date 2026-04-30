import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { userService } from "@zoplanner/api";

export function QuickDevRegisterEntry({ managers = [] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [managerUsers, setManagerUsers] = useState({});
  const [selectedManagerId, setSelectedManagerId] = useState("");
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (managers.length === 0) return;

    async function fetchUsers() {
      const results = await Promise.all(
        managers.map(async (manager) => {
          try {
            const data = await userService.getById(manager.userId);
            return [manager.id, data];
          } catch {
            return [manager.id, null];
          }
        }),
      );

      setManagerUsers(Object.fromEntries(results));
    }

    fetchUsers();
  }, [managers]);

  const handleSelectManager = (managerId) => {
    setSelectedManagerId(String(managerId));
  };

  const handleContinue = () => {
    if (!selectedManagerId) {
      alert("Välj en manager för att fortsätta");
      return;
    }

    if (!email) {
      alert("Ange en e-postadress för konsulten");
      return;
    }

    const params = new URLSearchParams({
      managerId: selectedManagerId,
      email,
    });

    navigate(`/consultant-onboarding?${params.toString()}`);
    // TODO: replace managerId/email query params with backend-generated invite token
    // navigate(`/consultant-onboarding?token=${inviteToken}`);
    setIsOpen(false);
  };

  const handleCreateManager = () => {
    setIsOpen(false);
    navigate("/dev-manager-register");
  };

  return (
    <>
      <button
        type="button"
        className="quick-dev-register__button"
        onClick={() => setIsOpen(true)}
      >
        Öppna dev-registrering
      </button>

      {isOpen && (
        <div className="quick-dev-register__overlay">
          <div className="quick-dev-register__modal">
            <button
              type="button"
              className="quick-dev-register__x"
              onClick={() => setIsOpen(false)}
              aria-label="Stäng"
            >
              ×
            </button>
            {managers.length === 0 ? (
              <>
                <h2>Skapa första managern</h2>
                <div className="quick-dev-register__empty">
                  <p>Inga managers finns ännu.</p>
                  <p>
                    Du behöver skapa ett managerkonto innan du kan registrera
                    konsulter.
                  </p>
                </div>

                <button
                  type="button"
                  className="quick-dev-register__continue"
                  onClick={handleCreateManager}
                >
                  Skapa managerkonto
                </button>
              </>
            ) : (
              <>
                <h3>1. Välj manager</h3>

                <div className="quick-dev-register__list">
                  {managers.map((manager) => {
                    const user = managerUsers[manager.id];
                    const isSelected = selectedManagerId === String(manager.id);

                    return (
                      <button
                        key={manager.id}
                        type="button"
                        onClick={() => handleSelectManager(manager.id)}
                        className={isSelected ? "selected" : ""}
                      >
                        {user ? user.name : "Laddar..."}
                      </button>
                    );
                  })}
                </div>
                <h3>2. Ange konsultens e-postadress</h3>

                <input
                  type="email"
                  placeholder="Ange konsultens e-postadress"
                  className="quick-dev-register__input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />

                <button
                  type="button"
                  className="quick-dev-register__continue"
                  onClick={handleContinue}
                >
                  Fortsätt
                </button>

                <button
                  type="button"
                  className="quick-dev-register__close"
                  onClick={handleCreateManager}
                >
                  Skapa managerkonto
                </button>
              </>
            )}
            <p className="customer-registry__modal-future-note">
              Den här funktionen gör det möjligt att skapa ett konsultkonto i
              demo utan att först sätta upp data manuellt. Om ingen manager
              finns behöver ett managerkonto skapas först.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
