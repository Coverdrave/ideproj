import { useEffect, useState } from "react";
import "./App.css";
import SchedulesTable from "./components/SchedulesTable";
import ChangeScheduleModal from "./components/ChangeScheduleModal";

export default function App() {
  const [apiData, setApiData] = useState([]);
  const [group, setGroup] = useState("25");
  const [year, setYear] = useState("2024");
  const [courseYear, setCourseYear] = useState("3");
  const [isWinterTerm, setIsWinterTerm] = useState(true);

  async function getApiData() {
    const res = await fetch(
      "/api/schedule?" +
        new URLSearchParams({
          group: group,
          year: year,
          courseYear: courseYear,
          isWinterTerm: isWinterTerm == true ? 1 : 0,
        }).toString()
    );
    const data = await res.json();

    if (res.ok) {
      setApiData(data);
    }
  }

  function updateData(group, year, courseYear, isWinterTerm) {
    setGroup(group);
    setYear(year);
    setCourseYear(courseYear);
    setIsWinterTerm(isWinterTerm == 1 ? true : false);
  }

  useEffect(() => {
    getApiData();
  }, []);

  useEffect(() => {
    getApiData();
  }, [group, year, courseYear, isWinterTerm]);

  console.log(apiData);

  return (
    <>
      <div className="mx-40">
        <div className="relative text-center mt-5 mb-5">
          <h1>Учебен разпис</h1>

          <div className="absolute top-0 right-0">
            <ChangeScheduleModal updateData={updateData} />
            {/* 
            Група:{" "}
            {
              <select
                name="group"
                id="group"
                onChange={(e) => setGroup(e.target.value)}
              >
                <option value="25">25</option>
              </select>
            }
            &emsp; Година:{" "}
            {
              <input
                className="w-14"
                type="number"
                name="year"
                id="year"
                defaultValue={year}
                onChange={(e) => setYear(e.target.value)}
              />
            }
            &emsp; Курс:{" "}
            {
              <input
                className="w-7"
                type="number"
                name="courseYear"
                id="courseYear"
                defaultValue={courseYear}
                min={1}
                max={5}
                onChange={(e) => setCourseYear(e.target.value)}
              />
            }
            &emsp; Семестър:{" "}
            {
              <select
                name="term"
                id="term"
                onChange={(e) => setIsWinterTerm(e.target.value)}
              >
                <option value={1}>Зимен</option>
                <option value={0}>Летен</option>
              </select>
            }
            &emsp;
            <button onClick={() => getApiData()}>???</button>
             */}
          </div>
        </div>
      </div>

      {apiData && apiData.schedules ? (
        <div className="max-w-max min-w-max mx-auto mb-40">
          <SchedulesTable apiData={apiData} />
        </div>
      ) : (
        apiData.error && (
          <p className="font-extrabold text-6xl text-center my-[30vh]">
            {apiData.error}
          </p>
        )
      )}
    </>
  );
}
