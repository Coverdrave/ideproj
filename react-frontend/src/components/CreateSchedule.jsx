import Popup from "reactjs-popup";

import "./CreateSchedule.css";
import "reactjs-popup/dist/index.css";
import { useEffect, useState } from "react";

export default function App({close}) {
  const [group, setGroup] = useState();
  const [year, setYear] = useState();
  const [courseYear, setCourseYear] = useState();

  const [message, setMessage] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      const response = await fetch("/api/schedule/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          group: group,
          year: year,
          courseYear: courseYear,
         }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
      } else {
        setMessage(data.message || "Something went wrong");
      }
    } catch (error) {
      setMessage("Server not reachable");
      console.log(error);
    }
  }

  return (
    <Popup open={true} closeOnDocumentClick onClose={close}>
      <div className="modal">
        <a className="close" onClick={close}>
          &times;
        </a>
        <div className="header"> Създаване на нов график </div>
        <div className="content">
          <form onSubmit={handleSubmit}>
            <input
              value={group} 
              onChange={(e) => setGroup(e.target.value)} 
              placeholder="Група"
              required
              size={4}
            />
            <br/>

            <input
              value={year} 
              onChange={(e) => setYear(e.target.value)} 
              placeholder="Година"
              required
              size={4}
            />
            <br/>

            <input
              value={courseYear} 
              onChange={(e) => setCourseYear(e.target.value)} 
              placeholder="Курс"
              required
              size={4}
            />
            <br/>
            
            {message && <p>{message}</p>}

            <button className="submitButton" type="submit">Създай</button>
          </form>
        </div>
      </div>
    </Popup>
  );
}
