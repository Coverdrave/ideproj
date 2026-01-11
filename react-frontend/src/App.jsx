import { useEffect, useState, useRef, lazy, Suspense } from "react";
import "./App.css";
import "reactjs-popup/dist/index.css";
import SchedulesTable from "./components/SchedulesTable";

const CreateSchedule = lazy(() => import('./components/CreateSchedule'));
const CreateSubject = lazy(() => import('./components/CreateSubject'));
const CreateClass = lazy(() => import('./components/CreateClass.jsx'));
const AssignClass = lazy(() => import('./components/AssignClass.jsx'));
const ChangeScheduleModal = lazy(() => import('./components/ChangeScheduleModal.jsx'));

export default function App() {
  const [apiData, setApiData] = useState([]);
  const [group, setGroup] = useState("25");
  const [year, setYear] = useState("2024");
  const [courseYear, setCourseYear] = useState("3");
  const [isWinterTerm, setIsWinterTerm] = useState(true);

  const [openModal, setOpenModal] = useState(null);
  const open = (modalName) => setOpenModal(modalName);
  const close = () => setOpenModal(null);

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

  // useEffect(() => {
  //   getApiData();
  // }, []);

  useEffect(() => {
    getApiData();
  }, [group, year, courseYear, isWinterTerm]);

  return (
    <>
      <div className="max-w-max min-w-max mx-auto mb-40">
        <div className="relative text-center mt-5 mb-5">
          <h1 className="max-w-fit mx-auto">Учебен разпис</h1>

          <div className="absolute top-0 left-0 flex gap-3">
            {apiData && apiData.schedules ? (
            <>
              <button type="button" onClick={() => open("createSchedule")} className="button rounded-md shadow-md bg-blue-500 text-white p-2">
                Създай график
              </button>
              <button type="button" onClick={() => open("createClass")} className="button rounded-md shadow-md bg-blue-500 text-white p-2">
                Създай час
              </button>
              <button type="button" onClick={() => open("createSubject")} className="button rounded-md shadow-md bg-blue-500 text-white p-2">
                Създай предмет
              </button>
              <button type="button" onClick={() => open("assignClass")} className="button rounded-md shadow-md bg-blue-500 text-white p-2">
                Добави час
              </button>

              <Suspense>
                {openModal === "createSchedule" && <CreateSchedule close={close} />}
                {openModal === "createClass" && <CreateClass close={close} />}
                {openModal === "createSubject" && <CreateSubject close={close} />}
                {openModal === "assignClass" && <AssignClass close={close} />}
              </Suspense>
            </>
            ) : <></>
            }
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
