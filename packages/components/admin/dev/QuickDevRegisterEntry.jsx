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
    if (!selectedManagerId || !email) return;

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
        Open dev register
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
                <h2>Create first manager</h2>
                <div className="quick-dev-register__empty">
                  <p>No managers available yet.</p>
                  <p>
                    You need to create a manager account before registering
                    consultants.
                  </p>
                </div>

                <button
                  type="button"
                  className="quick-dev-register__continue"
                  onClick={handleCreateManager}
                >
                  Create manager account
                </button>
              </>
            ) : (
              <>
                <h2>Select manager</h2>

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
                        {user ? user.name : "Loading..."}
                      </button>
                    );
                  })}
                </div>

                <input
                  type="email"
                  placeholder="Enter consultant's email"
                  className="quick-dev-register__input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />

                <button
                  type="button"
                  className="quick-dev-register__continue"
                  onClick={handleContinue}
                  disabled={!selectedManagerId || !email}
                >
                  Continue
                </button>

                <button
                  type="button"
                  className="quick-dev-register__close"
                  onClick={handleCreateManager}
                >
                  Create manager account
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
