import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

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
            const res = await fetch(
              `http://localhost:5027/api/User/${manager.userId}`,
            );
            const data = await res.json();
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

    navigate(`/dev-register?${params.toString()}`);
    setIsOpen(false);
  };

  return (
    <>
      <button
        type="button"
        className="quick-dev-register__button"
        onClick={() => setIsOpen(true)}
      >
        Register consultant
      </button>

      {isOpen && (
        <div className="quick-dev-register__overlay">
          <div className="quick-dev-register__modal">
            <h2>Select manager</h2>

            {managers.length === 0 ? (
              <div className="quick-dev-register__empty">
                <p>No managers available yet</p>
              </div>
            ) : (
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
            )}
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
              onClick={() => setIsOpen(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
