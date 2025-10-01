import { useEffect, useState, useRef } from "react";
import "./App.css";
import SchedulesTable from "./components/SchedulesTable";
import CreateSubject from "./components/CreateSubject";
import CreateClass from "./components/CreateClass";
import CreateSchedule from "./components/CreateSchedule";
import ChangeScheduleModal from "./components/ChangeScheduleModal";
import AssignClass from "./components/AssignClass";
// import { jsPDF } from "jspdf";
// import html2canvas from "html2canvas";

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

  return (
    <>
      <div className="max-w-max min-w-max mx-auto mb-40">
        <div className="relative text-center mt-5 mb-5">
          <h1 className="max-w-fit mx-auto">Учебен разпис</h1>

          <div className="absolute top-0 left-0 flex gap-3">
            <CreateSchedule/>
            <CreateClass/>
            <CreateSubject/>
            <AssignClass/>
          </div>
          <div className="absolute top-0 right-0">
            <ChangeScheduleModal updateData={updateData} />
          </div>
        </div>

        {apiData && apiData.schedules ? (
          <SchedulesTable apiData={apiData} />
        ) : (
          apiData.error && (
            <p className="font-extrabold text-6xl text-center my-[30vh]">
              {apiData.error}
            </p>
          )
        )}
      </div>
    </>
  );
}
