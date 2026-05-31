import { useEffect, useState } from "react";
import PopupModal from "./_PopupModal.jsx";

export default function ChangeScheduleModal({ closeModal, updateMainMenuData }) {
  const [allSchedules, setAllSchedules] = useState([]);

  async function getAllSchedules() {
    const res = await fetch("/api/schedule/change_schedule_modal");
    const data = await res.json();

    if (res.ok) {
      setAllSchedules(data);
    }
  }

  useEffect(() => {
    getAllSchedules();
  }, []);

  const body = (
      <div className="grid"
        style={{
          gridTemplateColumns: `auto`,
          gridTemplateRows: `repeat(${allSchedules.length+1}, auto)`
        }}
      >
        <div className="grid mb-1"
          style={{
            gridTemplateColumns: `repeat(4, auto)`,
            gridTemplateRows: `auto`
          }}
        >
          <div className="px-1">
            Група
          </div>
          <div className="px-1">
            Специалност
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
                gridTemplateColumns: `repeat(4, auto)`,
                gridTemplateRows: `auto`
              }}
              onClick={() => {
                updateMainMenuData(
                  schedule.groupNumber,
                  schedule.semester
                );
                closeModal();
              }}
            >
              <div className="px-1 text-center">
                {schedule.groupNumber}
              </div>
              <div className="px-1 text-center">
                {schedule.specialtyName}
              </div>
              <div className="px-1 text-center">
                {Math.round(schedule.semester / 2)}
              </div>
              <div className="px-1 text-center">
                {(schedule.semester % 2) ? 'Зимен' : 'Летен'}
              </div>
            </div>
          </div>
        ))}
      </div>
  )

  return <PopupModal close={closeModal} headerText={'Избери група'} body={body}/>;
}
