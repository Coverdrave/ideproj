import { useEffect, useState, lazy, Suspense } from "react";
import "./App.css";
import ScheduleGrid from "./components/ScheduleGrid.jsx";
import StudentGroups from "./components/StudentGroups.jsx";
import Schedules from "./components/Schedules.jsx";

const Faculties = lazy(() => import('./components/Faculties.jsx'));
const Specialties = lazy(() => import('./components/Specialties.jsx'));
const Subjects = lazy(() => import('./components/Subjects.jsx'));
const Lecturers = lazy(() => import('./components/Lecturers.jsx'));
const GenerateSchedule = lazy(() => import('./components/GenerateSchedule.jsx'));
const ChangeScheduleModal = lazy(() => import('./components/ChangeScheduleModal.jsx'));

export default function App() {
  const [apiData, setApiData] = useState([]);

  const [groupNumber, setGroupNumber] = useState("27");
  const [semester, setSemester] = useState(7);

  const [openModal, setOpenModal] = useState(null);
  const open = (modalName) => setOpenModal(modalName);
  const closeModal = () => setOpenModal(null);

  async function getApiData() {
    const res = await fetch(
      "/api/schedule?" +
        new URLSearchParams({
          group_number: groupNumber,
          semester: semester
        }).toString()
    );
    
    const data = await res.json();

    if (res.ok) {
      setApiData(data);
    }
  }

  function updateData(groupNumber, semester) {
    setGroupNumber(groupNumber);
    setSemester(semester);
  }

  useEffect(() => {
    getApiData();
  }, []);

  useEffect(() => {
    getApiData();
  }, [groupNumber, semester]);

  return (
    <>
      <div className="mx-5 mb-40 ">
        <div className="m-5 flex gap-3 justify-center">
          <div className="flex gap-3">
            <button type="button" onClick={() => open("faculties")} className="button rounded-md shadow-md bg-blue-500 text-white p-2">
              Факултети
            </button>
            <button type="button" onClick={() => open("specialties")} className="button rounded-md shadow-md bg-blue-500 text-white p-2">
              Специалности
            </button>
            <button type="button" onClick={() => open("subjects")} className="button rounded-md shadow-md bg-blue-500 text-white p-2">
              Предмети
            </button>
            <button type="button" onClick={() => open("lecturers")} className="button rounded-md shadow-md bg-blue-500 text-white p-2">
              Преподаватели
            </button>
            <button type="button" onClick={() => open("studentGroups")} className="button rounded-md shadow-md bg-blue-500 text-white p-2">
              Групи
            </button>
            <button type="button" onClick={() => open("schedules")} className="button rounded-md shadow-md bg-blue-500 text-white p-2">
              Разписания
            </button>
            <button type="button" onClick={() => open("generateSchedule")} className="button rounded-md shadow-md bg-blue-500 text-white p-2">
              Генериране
            </button>

            <Suspense>
              {openModal === "faculties" && <Faculties closeModal={closeModal}/>}
              {openModal === "specialties" && <Specialties closeModal={closeModal}/>}
              {openModal === "subjects" && <Subjects closeModal={closeModal}/>}
              {openModal === "lecturers" && <Lecturers closeModal={closeModal}/>}
              {openModal === "studentGroups" && <StudentGroups closeModal={closeModal}/>}
              {openModal === "schedules" && <Schedules closeModal={closeModal}/>}
              {openModal === "generateSchedule" && <GenerateSchedule closeModal={closeModal} updateMainMenuData={updateData}/>}
              {openModal === "changeScheduleModal" && <ChangeScheduleModal closeModal={closeModal} updateMainMenuData={updateData}/>}
            </Suspense>
          </div>
          <div>
            <button type="button" onClick={() => open("changeScheduleModal")} className="button rounded-md shadow-md bg-blue-500 text-white p-2">
              Програма
            </button>
          </div>
        </div>

        {apiData && apiData.info ? (
          <div className="max-w-min min-w-max mx-auto">
            <ScheduleGrid apiData={apiData} />
          </div>
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
