import "./index.css";

function Button({type,onClick,text,style}) {
  return <button className={`button button_${style}`}type={type} onClick={onClick}>{text}</button>;
}

export { Button };
