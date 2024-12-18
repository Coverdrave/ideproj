import Popup from "reactjs-popup";
import "reactjs-popup/dist/index.css";
import "./ChangeScheduleModal.css";
import { useEffect, useState } from "react";

export default function App({ updateData }) {
  const [allSchedules, setAllSchedules] = useState([]);

  async function getAllSchedules() {
    const res = await fetch("/api/schedule/all");
    const data = await res.json();

    if (res.ok) {
      setAllSchedules(data);
    }
  }

  useEffect(() => {
    getAllSchedules();
  }, []);

  return (
    <Popup
      trigger={
        <button className="button rounded-md shadow-md bg-blue-500 text-white p-2">
          {" "}
          Програма{" "}
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
          <div className="header"> Избери група </div>
          <div className="content">
            {allSchedules ? (
              <table className="modal">
                <thead>
                  <tr>
                    <th>Група</th>
                    <th>Година</th>
                    <th>Курс</th>
                    <th>Семестър</th>
                  </tr>
                </thead>

                <tbody>
                  {allSchedules.map((schedule, index) => (
                    <tr
                      onClick={() => {
                        updateData(
                          schedule.group,
                          schedule.year,
                          schedule.courseYear,
                          schedule.isWinterTerm
                        );
                        close();
                      }}
                    >
                      <td>{schedule.group}</td>
                      <td>{schedule.year}</td>
                      <td>{schedule.courseYear}</td>
                      <td>{schedule.isWinterTerm ? "Зимен" : "Летен"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              "Не са намерени групи"
            )}
          </div>
          {/* <div className="actions">
            <Popup
              trigger={<button className="button"> Trigger </button>}
              position="top center"
              nested
            >
              <span>
                Lorem ipsum dolor sit amet, consectetur adipisicing elit. Beatae
                magni omnis delectus nemo, maxime molestiae dolorem numquam
                mollitia, voluptate ea, accusamus excepturi deleniti ratione
                sapiente! Laudantium, aperiam doloribus. Odit, aut.
              </span>
            </Popup>
            <button
              className="button"
              onClick={() => {
                console.log("modal closed ");
                close();
              }}
            >
              close modal
            </button>
          </div> */}
        </div>
      )}
    </Popup>
  );
}
