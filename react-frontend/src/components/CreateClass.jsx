import Popup from "reactjs-popup";

import "./CreateClass.css";
import "reactjs-popup/dist/index.css";
import { useEffect, useState } from "react";

export default function App({ }) {
  const [allSubjects, setAllSubjects] = useState([]);

  const [subjectName, setSubjectName] = useState();
  const [startHour, setStartHour] = useState();
  const [duration, setDuration] = useState();
  const [room, setRoom] = useState("");
  const [isExercise, setIsExercise] = useState(false);

  const [message, setMessage] = useState("");

  let minHour = 7;
  let maxHour = 18;

  async function GetAllSubjects() {
    const res = await fetch("/api/subject/all");

    const data = await res.json();

    if (res.ok) {
      setAllSubjects(data);
    }
  }

  useEffect(() => {
    GetAllSubjects();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      const response = await fetch("/api/uni_class/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          startHour: startHour,
          duration: duration,
          room: room,
          isExercise: isExercise,
          subjectName: subjectName
         }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
        // setName("")
      } else {
        setMessage(data.message || "Something went wrong");
      }
    } catch (error) {
      setMessage("Server not reachable");
      console.log(error);
    }
  }

  return (
    <Popup
      trigger={
        <button className="button rounded-md shadow-md bg-blue-500 text-white p-2">
          {" "}
          Създай час{" "}
        </button>
      }
      modal
      nested
    >
      {(close) => (
        <div className="modal">
          <button className="close" onClick={close}>
            &times;
          </button>
          <div className="header"> Създаване на нов час </div>
          <div className="content">
            <form onSubmit={handleSubmit}>
              <select
                value={subjectName}
                defaultValue={-1}
                onChange={(e) => setSubjectName(e.target.value)}
                required
              >
                <option disabled value={-1}>Предмет</option>
                {allSubjects.map((subject, index) => (
                  <option value={subject.name}>{subject.name}</option>
                ))}
              </select>
              <br/>

              <select
                value={startHour}
                defaultValue={-1}
                onChange={(e) => setStartHour(e.target.value)}
                required
              >
                <option disabled value={-1}>Начален час</option>
                {[...Array(maxHour - minHour + 1)].map((val, hour) => (
                  <option value={minHour + hour}>{minHour + hour}ч.</option>
                ))}
              </select>
              <br/>

              <label>
                Продължителност:
                {[...Array(4)].map((val, hour) => (
                  <button
                    type="button"
                    className={duration && duration == hour+1 ? 'multipleOptions selectedOption' : 'multipleOptions'}
                    onClick={() => setDuration(hour+1)}
                    value={hour+1}
                  >
                    {hour+1} час{hour+1 != 1 ? 'a' : ""}
                  </button>
                ))}
              </label>
              <br/>

              <input
                value={room} 
                onChange={(e) => setRoom(e.target.value)} 
                placeholder="Стая"
                required
                size={6}
              />
              <br/>

              <label>
                Упражнение:
                <input 
                  type="checkbox" 
                  value={isExercise}
                  onChange={e => setIsExercise(e.target.checked)}
                  defaultChecked={false}
                />
              </label>
              <br/>
              
              {message && <p>{message}</p>}

              <button className="submitButton" type="submit">Създай</button>
            </form>
            
          </div>
        </div>
      )}
    </Popup>
  );
}
