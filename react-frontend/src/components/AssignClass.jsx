import Popup from "reactjs-popup";

import "./AssignClass.css";
import "reactjs-popup/dist/index.css";
import { useEffect, useState } from "react";

export default function App({  }) {
  const [allSchedules, setAllSchedules] = useState([]);
  const [selectedSchedule, setSelectedSchedule] = useState();

  const [subjects, setSubjects] = useState([]);
  const [compatibleClasses, setCompatibleClasses] = useState([]);
  const [schedulesIds, setSchedulesIds] = useState([]);

  const [group, setGroup] = useState("25");
  const [year, setYear] = useState("2024");
  const [courseYear, setCourseYear] = useState("3");
  const [isWinterTerm, setIsWinterTerm] = useState(true);

  const [subgroup, setSubgroup] = useState();
  const [day, setDay] = useState();
  const [isOddWeek, setIsOddWeek] = useState();

  const [classId, setClassId] = useState();

  const [showLoading, setShowLoading] = useState();

  // const [startHour, setStartHour] = useState();
  // const [duration, setDuration] = useState();
  // const [room, setRoom] = useState();
  // const [isExercise, setIsExercise] = useState(false);

  const [message, setMessage] = useState("");

  const subgroupOptions = [
    {key:'А', val:'A'},
    {key:'Б', val:'B'},
    {key:'И двете', val:'both'}
  ];

  const dayOptions = [
    {key:'Понеделник', val:'0'},
    {key:'Вторник', val:'1'},
    {key:'Сряда', val:'2'},
    {key:'Четвъртък', val:'3'},
    {key:'Петък', val:'4'},
    {key:'Събота', val:'5'},
    {key:'Неделя', val:'6'}
  ];

  const weekOptions = [
    {key:'Четна', val:'0'},
    {key:'Нечетна', val:'1'},
    {key:'И двете', val:'2'}
  ];

  async function getAllSchedules() {
    const res = await fetch("/api/schedule/all");
    const data = await res.json();

    if (res.ok) {
      setAllSchedules(data);
    }
  }

  async function getSubjects() {
    const res = await fetch("/api/subject/all");
    const data = await res.json();

    if (res.ok) {
      setSubjects(data);
    }
  }

  async function getCompatibleClasses() {
    const res = await fetch("/api/uni_class/get_compatible_classes?" +
      new URLSearchParams({
        group: group,
        year: year,
        courseYear: courseYear,
        isWinterTerm: isWinterTerm == true ? 1 : 0,
        subgroup: subgroup,
        day: day, 
        isOddWeek: isOddWeek,
      }).toString()
    );

    const data = await res.json();

    if (res.ok) {
      setCompatibleClasses(data.compatible_classes);
      setSchedulesIds(data.schedules_ids);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      const response = await fetch("/api/uni_class/assign_to_schedules", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          class_id: classId,
          schedules_ids: schedulesIds
         })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
      } else {
        setMessage(data.message || "Something went wrong");
      }
    } catch (error) {
      setMessage("Server not reachable");
      console.log(error);
    }
  }

  useEffect(() => {
    getAllSchedules();
    getSubjects();
  }, []);

  useEffect(() => {
    const run = async () => {
      setCompatibleClasses(undefined);
      setSchedulesIds(undefined);

      if ((selectedSchedule != undefined) && 
          (subgroup != undefined) && 
          (isOddWeek != undefined) && 
          (day != undefined)) {
        setShowLoading(true);
        await getCompatibleClasses();
      }
    };
    run();
  }, [selectedSchedule, subgroup, day, isOddWeek]);

  return (
    <Popup
      trigger={
        <button className="button rounded-md shadow-md bg-blue-500 text-white p-2">
          {" "}
          Добави час{" "}
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
          <div className="header"> Добавяне на час към програма </div>
          <div className="content">
            {allSchedules ? (
              <>
                <table className="schedules">
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
                          setGroup(schedule.group);
                          setCourseYear(schedule.courseYear);
                          setYear(schedule.year);
                          setIsWinterTerm(schedule.isWinterTerm);

                          setSelectedSchedule(index);
                        }}
                        className={selectedSchedule == index ? 'selected' : ''}
                      >
                        <td>{schedule.group}</td>
                        <td>{schedule.year}</td>
                        <td>{schedule.courseYear}</td>
                        <td>{schedule.isWinterTerm ? "Зимен" : "Летен"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <form onSubmit={handleSubmit}>
                  <div className="selectable">
                    Подгрупа:
                    {subgroupOptions.map((opt, _) => (
                      <button 
                        type="button"
                        className={subgroup && subgroup == opt.val ? 'multipleOptions selectedOption' : 'multipleOptions'}
                        onClick={() => setSubgroup(opt.val)}
                        value={opt.val}
                      >
                        {opt.key}
                      </button>
                    ))}
                  </div>

                  <div className="selectable">
                    Седмица:
                    {weekOptions.map((opt, _) => (
                      <button 
                        type="button"
                        className={isOddWeek && isOddWeek == opt.val ? 'multipleOptions selectedOption' : 'multipleOptions'}
                        onClick={() => setIsOddWeek(opt.val)}
                        value={opt.val}
                      >
                        {opt.key}
                      </button>
                    ))}
                  </div>

                  <div className="selectable">
                    Ден:
                    {dayOptions.map((opt, _) => (
                      <button 
                        type="button"
                        className={day && day == opt.val ? 'multipleOptions selectedOption' : 'multipleOptions'}
                        onClick={() => setDay(opt.val)}
                        value={opt.val}
                      >
                        {opt.key}
                      </button>
                    ))}
                  </div>

                  {compatibleClasses ? (
                    <>
                      <table className="schedules mt-2">
                        <thead>
                          <tr>
                            <th>Предмет</th>
                            <th>Продължителност</th>
                            <th>Стая</th>
                            <th>Вид</th>
                          </tr>
                        </thead>

                        <tbody className="text-left">
                          {compatibleClasses.map((uniClass, index) => (
                            <tr
                              onClick={() => {
                                setClassId(uniClass.id);
                              }}
                              className={classId == uniClass.id ? 'selected' : ''}
                            >
                              <td>{subjects[uniClass.subject_id-1].name}</td>
                              <td>{uniClass.startHour}:00 - {uniClass.startHour+uniClass.duration-1}:45</td>
                              <td>{uniClass.room}</td>
                              <td>{(uniClass.isExercise == 0) ? "Лекция" : "Упражнение"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </>
                  ) : (compatibleClasses == [] ? 
                      <p className="text-center text-3xl mt-2">Няма съвместими часове</p> 
                    : showLoading ? 
                      <div className="loader mx-auto mt-4"></div> 
                    : "")}

                  

                  {message && <p className="text-center text-3xl mt-2">{message}</p>}

                  {classId ? (
                    <button className="submitButton" type="submit">Добави</button>
                  ) : ""}
                </form>
            </>
            ) : (
              "Не са намерени групи"
            )}
          </div>
        </div>
      )}
    </Popup>
  );
}
