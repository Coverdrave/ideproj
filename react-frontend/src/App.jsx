import { useEffect, useState } from "react";
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
import "./App.css";
// import { build } from 'vite';

export default function App() {
  const [apiData, setApiData] = useState([]);

  let days = {
    0: "Понеделник",
    1: "Вторник",
    2: "Сряда",
    3: "Четвъртък",
    4: "Петък",
  }

  let week = {
    0: "Нечетна",
    1: "Четна",
  }

  let minHour = 7;
  let maxHour = 18;

  let hourReached = 0;
  const skippedClasses = [];

  function getClassRowSpan(scheduleIndex, classId) {
    let span = 1;

    for (let i = scheduleIndex + 1; i < (Math.floor(scheduleIndex / 4) + 1) * 4; i++) {
      if (i == apiData.schedules.length) {
        return span;
      }

      const classBelow = apiData.schedules[
        i
      ].classes?.find(
        (c) => c.id === classId
      );
      if (classBelow) {
        skippedClasses.push(classBelow.id);
        span++;
      } else {
        break;
      }
    }

    return span;
  }


  async function getApiData() {
    const res = await fetch("/api/schedule");
    const data = await res.json();

    if (res.ok) {
      setApiData(data);
    }
  }

  useEffect(() => {
    getApiData();
  }, []);

  console.log(apiData && apiData.schedules);

  return (
    <>
      <div className="mx-[10vw]">
        <h1 className="mx-auto text-center mt-5 mb-5">Учебен разпис</h1>

        <table className="table-fixed text-center border-2 border-black mx-auto">
          <thead>
            <tr className="border">
              <th className="border">Ден</th>
              <th className="border">пгр.</th>
              <th className="border">Седмица</th>
              {[...Array(maxHour - minHour + 1)].map((val, hour) => (
                <th
                  key={hour}
                  className="w-1/12 border"
                >
                  {minHour + hour}:00 - {minHour + hour}:45
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {apiData &&
              apiData.schedules &&
              apiData.schedules.map((schedule, scheduleIndex) => {
                hourReached = 0;

                return (
                  <tr className="border border-black">
                    {scheduleIndex % 4 === 0 && <td className="border" rowSpan={4}>{days[scheduleIndex / 4]}</td>}
                    {scheduleIndex % 2 === 0 && <td className="border" rowSpan={2}>{schedule.subgroup}</td>}
                    <td className="border">{week[scheduleIndex % 2]}</td>
                    
                    {[...Array(maxHour - minHour + 1)].map((val, hour) => {
                      const uniClass = apiData.schedules[
                        scheduleIndex
                      ].classes?.find((c) => c.startHour === hour + minHour);

                      if (hourReached > hour) {
                        return null;
                      }

                      hourReached += uniClass ? uniClass.duration : 1;

                      if (uniClass && skippedClasses.includes(uniClass.id)) {
                        return null;
                      }

                      return (
                        <td
                          className={uniClass ? "border bg-cyan-200" : "border"}
                          colSpan={uniClass ? uniClass.duration : 1}
                          rowSpan={
                            uniClass ? getClassRowSpan(scheduleIndex, uniClass.id) : 1
                          }
                        >
                          {uniClass
                            ? <>{apiData.subjects[uniClass.subject_id].name}<br></br>
                                {uniClass.isExercise ? 'пу, ' : 'л, '}
                                {uniClass.room}
                              </>
                            : ""}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </>
  );
}
