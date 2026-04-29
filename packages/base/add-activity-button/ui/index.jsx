import "./index.css";

function AddActivityButton({ onClick }) {
  return (
    <button className="add-activity-btn" onClick={onClick} type="button">
      <span className="add-activity-btn__icon">+</span> Lägg till aktivitet
    </button>
  );
}

export { AddActivityButton };
