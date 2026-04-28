import { useState, useEffect } from "react";
import "./index.css";
function MessagesSidebar({ user, onConsultantClick }) {
  const [consultants, setConsultants] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function fetchUsers() {
      setIsLoading(true);
      try {
        const res = await fetch(`http://localhost:5027/api/User`);
        const data = await res.json();
        if (res.ok) {
          // Filter out the logged-in user
          const filteredUsers = data.filter((u) => u.id !== user?.id);
          setConsultants(filteredUsers);
        } else {
          console.log("Could not get users");
        }
      } catch (err) {
        console.error("Error fetching users:", err);
      } finally {
        setIsLoading(false);
      }
    }
    if (user?.id) {
      fetchUsers();
    }
  }, [user?.id]);
  return (
    <>
      <div className="messages-sidebar">
        <header className="messages-sidebar__header">Konsulter</header>
        <main className="messages-sidebar__main">
          {consultants ? (
            <div>
              {consultants.map((consultant, index) => (
                <div
                  className="messages-sidebar__user"
                  key={index}
                  onClick={() =>
                    onConsultantClick && onConsultantClick(consultant)
                  }
                >
                  <section className="messages-sidebar__avatar">
                    {consultant.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </section>
                  <section className="messages-sidebar__names">
                    <div className="messages-sidebar__name">
                      {consultant.name}
                    </div>
                  </section>
                </div>
              ))}
            </div>
          ) : (
            "Inga konsulter hittades"
          )}
        </main>
      </div>
    </>
  );
}
export { MessagesSidebar };
