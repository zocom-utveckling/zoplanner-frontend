import { Button } from "@zoplanner/button";


function NotificationButton() {
  const handleClick = async (e) => {
  e.preventDefault();

  try {
    const content = {
      eventType: "NEW_ASSIGNMENT",
      eventId: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      timestamp: new Date().toISOString(),
      teacherId: "1",
      teacherEmail: "amir230703@gmail.com",
      assignmentId: "1",
      assignmentDescription: "Test assignment",
      teacherName: "Amir",
      assignmentDueDate: "2026-02-16T17:11:16.833Z"
    };

    const res = await fetch("http://localhost:5027/api/Notification/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(content),
    });

    const data = await res.json();

    if (res.ok) {
      alert("Notification sent");
    } else {
      alert("Failed to send notification: " + data.message);
    }

  } catch (error) {
    console.error("Error sending notification:", error);
    alert("An error occurred while sending the notification.");
  }
};
    return (
       <Button type={"submit"} text={"Notification"} style={"notis"} onClick={(e)=>handleClick(e)} />
    );
}

export default NotificationButton;