import { useEffect, useState } from "react";
import "./index.css";
import { SendAssignmentNotification } from "../../../components/notis-knapp";
import { Navbar } from "@zoplanner/navbar";
import { useParams } from "react-router-dom";
import { useUserById } from "@zoplanner/app-hooks";

function CoursesPage() {
  const userId = useParams().id;
  const { user } = useUserById(userId);

  if (!user) {
    return <div>Laddar användare...</div>;
  }

  return (
    <>
      <Navbar activePage={"assignments"} user={user} />
      <div className="courses-page__container">
        <h2>Notis tester</h2>
        <div className="courses-page__content"></div>
      </div>

      <SendAssignmentNotification />
    </>
  );
}

export { CoursesPage };
