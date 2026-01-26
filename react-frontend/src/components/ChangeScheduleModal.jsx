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
      <div className="grid"
        style={{
          gridTemplateColumns: `auto`,
          gridTemplateRows: `repeat(${allSchedules.length+1}, auto)`
        }}
      >
        <div className="grid mb-1"
          style={{
            gridTemplateColumns: `repeat(3, auto)`,
            gridTemplateRows: `auto`
          }}
        >
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
                // closeModal();
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
  )
}
