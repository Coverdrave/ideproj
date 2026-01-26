import { useEffect, useState, lazy, Suspense } from "react";
import "./App.css";
import ScheduleGrid from "./components/ScheduleGrid.jsx";
import PopupModal from "./components/_PopupModal.jsx";

const CreateSchedule = lazy(() => import('./components/CreateSchedule'));
const CreateSubject = lazy(() => import('./components/CreateSubject'));
const CreateClass = lazy(() => import('./components/CreateClass.jsx'));
const AssignClass = lazy(() => import('./components/AssignClass.jsx'));
const ChangeScheduleModal = lazy(() => import('./components/ChangeScheduleModal.jsx'));
const GenerateSchedule = lazy(() => import('./components/GenerateSchedule.jsx'));

export default function App() {
  const [apiData, setApiData] = useState([]);

  const [groupNumber, setGroupNumber] = useState("27");
  const [startYear, setStartYear] = useState("2022");
  const [academicYear, setAcademicYear] = useState("2025");
  const [isWinterTerm, setIsWinterTerm] = useState(true);

  const [openModal, setOpenModal] = useState(null);
  const open = (modalName) => setOpenModal(modalName);
  const closeModal = () => setOpenModal(null);

  async function getApiData() {
    const res = await fetch(
      "/api/schedule?" +
        new URLSearchParams({
          group_number: groupNumber,
          start_year: startYear,
          academic_year: academicYear,
          is_winter_term: isWinterTerm ? 1 : 0,
        }).toString()
    );
    
    const data = await res.json();

    if (res.ok) {
      setApiData(data);
    }
  }

  function updateData(groupNumber, startYear, academicYear, isWinterTerm) {
    setGroupNumber(groupNumber);
    setStartYear(startYear);
    setAcademicYear(academicYear);
    setIsWinterTerm(isWinterTerm == 1 ? true : false);
  }

  useEffect(() => {
    getApiData();
  }, []);

  useEffect(() => {
    getApiData();
  }, [groupNumber, startYear, academicYear, isWinterTerm]);

  return (
    <>
      <div className="mx-5 mb-40">
        <div className="mt-5 mb-5 grid grid-flow-col justify-around gap-64">
          <div className="flex gap-3">
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
            <button type="button" onClick={() => open("generateSchedule")} className="button rounded-md shadow-md bg-blue-500 text-white p-2">
              Генериране
            </button>

            <Suspense>
              {openModal === "createSchedule" && <CreateSchedule close={closeModal} />}
              {openModal === "createClass" && <CreateClass close={closeModal} />}
              {openModal === "createSubject" && <CreateSubject close={closeModal} />}
              {openModal === "assignClass" && <AssignClass close={closeModal} />}
              {openModal === "changeScheduleModal" && <PopupModal close={closeModal} headerText={'Избери група'} body={<ChangeScheduleModal updateData={updateData}/>}/>}
              {openModal === "generateSchedule" && <PopupModal close={closeModal} headerText={'Генериране'} body={<GenerateSchedule/>}/>}
            </Suspense>
          </div>
          <div>
            <button type="button" onClick={() => open("changeScheduleModal")} className="button rounded-md shadow-md bg-blue-500 text-white p-2">
              Програма
            </button>
          </div>
        </div>

        {apiData && apiData.groupInfo ? (
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
