import Popup from "reactjs-popup";

import "./ChangeScheduleModal.css";
import "reactjs-popup/dist/index.css";
import { useEffect, useState } from "react";

export default function App({ updateData, close }) {
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
    <Popup open={true} closeOnDocumentClick onClose={close}>
      <div className="modal">
        <button className="close" onClick={close}>
          &times;
        </button>
        <div className="header"> Избери група </div>
        <div className="content">
          {allSchedules ? (
            
            <div className="grid"
            style={{
              gridTemplateColumns: `auto`,
              gridTemplateRows: `repeat(${allSchedules.length+1}, auto)`
            }}>
              <div className="grid mb-1"
              style={{
                gridTemplateColumns: `repeat(3, auto)`,
                gridTemplateRows: `auto`
              }}>
                <div className="px-1">
                  Група
                </div>
                <div className="px-1">
                  Курс
                </div>
                <div className="px-1">
                  Семестър
                </div>
              </div>
              {allSchedules.map((schedule, index) => (
                <div className="grid mt-2"
                  style={{
                    gridTemplateColumns: `auto`,
                    gridTemplateRows: `auto`
                  }}
                >
                  <div className="grid cursor-pointer transition duration-300 ease-in-out
                    bg-slate-50 shadow-md rounded hover:bg-slate-100 hover:shadow-inner"
                    style={{
                      gridTemplateColumns: `repeat(3, auto)`,
                      gridTemplateRows: `auto`
                    }}
                    onClick={() => {
                      updateData(
                        schedule.groupNumber,
                        schedule.startYear,
                        schedule.academicYear,
                        schedule.isWinterTerm
                      );
                      close();
                    }}
                  >
                    <div className="px-1 text-center">
                      {schedule.groupNumber}
                    </div>
                    <div className="px-1 text-center">
                      {schedule.academicYear - schedule.startYear + 1}
                    </div>
                    <div className="px-1 text-center">
                      {(schedule.isWinterTerm) ? 'Зимен' : 'Летен'}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            // <table className="schedules">
            //   <thead>
            //     <tr>
            //       <th>Група</th>
            //       <th>Курс</th>
            //       <th>Семестър</th>
            //     </tr>
            //   </thead>

            //   <tbody>
            //     {allSchedules.map((schedule, index) => (
            //       <tr
            //         onClick={() => {
            //           updateData(
            //             schedule.groupNumber,
            //             schedule.startYear,
            //             schedule.academicYear,
            //             schedule.isWinterTerm
            //           );
            //           close();
            //         }}
            //       >
            //         <td>{schedule.groupNumber}</td>
            //         <td>{schedule.academicYear - schedule.startYear + 1}</td>
            //         <td>{schedule.isWinterTerm ? "Зимен" : "Летен"}</td>
            //       </tr>
            //     ))}
            //   </tbody>
            // </table>
          ) : (
            "Не са намерени групи"
          )}
        </div>
      </div>
    </Popup>
  );
}
