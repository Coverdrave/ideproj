import './SchedulesTable.css';

export default function SchedulesTable({apiData}) {
  const days = {
    0: "Понеделник",
    1: "Вторник",
    2: "Сряда",
    3: "Четвъртък",
    4: "Петък",
  };

  const week = {
    0: "Нечетна",
    1: "Четна",
  };

  const minHour = 7;
  const maxHour = 18;

  let hourReached = 0;
  const skippedClasses = [];

  function getClassRowSpan(scheduleIndex, classId) {
    let rowSpan = 1;

    for (
      let i = scheduleIndex + 1;
      i < (Math.floor(scheduleIndex / 4) + 1) * 4;
      i++
    ) {
      if (i == apiData.schedules.length) {
        return rowSpan;
      }

      const classBelow = apiData.schedules[i].classes?.find(
        (c) => c.id === classId
      );
      if (classBelow) {
        skippedClasses.push(classBelow.id);
        rowSpan++;
      } else {
        break;
      }
    }

    return rowSpan;
  }

  return (
    <>
      <div>
          <p className="font-bold float-left">КУРС: {apiData.schedules[0].courseYear} &emsp; ГРУПА: {apiData.schedules[0].group}</p>
          <p className="font-bold float-right">{apiData.schedules[0].isWinterTerm == 1 ? "ЗИМЕН" : "ЛЕТЕН"} СЕМЕСТЪР &emsp; {apiData.schedules[0].year}/{apiData.schedules[0].year+1}г.</p>
      </div>
      
      <table>
        <thead>
            <tr>
            <th>Ден</th>
            <th>пгр.</th>
            <th>Седмица</th>
            {[...Array(maxHour - minHour + 1)].map((val, hour) => (
                <th key={hour} className="hours">
                {minHour + hour}:00 - {minHour + hour}:45
                </th>
            ))}
            </tr>
        </thead>
        <tbody>
          {apiData.schedules.map((schedule, scheduleIndex) => {
            hourReached = 0;

            return (
              <tr>
                {scheduleIndex % 4 === 0 && (
                <td className="days" rowSpan={4}>
                  {days[scheduleIndex / 4]}
                </td>
                )}
                {scheduleIndex % 2 === 0 && (
                <td className="subgroups" rowSpan={2}>
                  {schedule.subgroup}
                </td>
                )}
                <td className="weeks">{week[scheduleIndex % 2]}</td>

                {[...Array(maxHour - minHour + 1)].map((val, hour) => {
                  if (hourReached > hour) {
                    return null;
                  }

                  const uniClass = apiData.schedules[
                    scheduleIndex
                  ].classes?.find((c) => c.startHour === hour + minHour);

                  hourReached += uniClass ? uniClass.duration : 1;

                  if (uniClass && skippedClasses.includes(uniClass.id)) {
                    return null;
                  }

                  return (
                    <td
                      className={
                        uniClass ? "classes bg-cyan-200" : "classes"
                      }
                      colSpan={uniClass ? uniClass.duration : 1}
                      rowSpan={
                        uniClass
                        ? getClassRowSpan(scheduleIndex, uniClass.id)
                        : 1
                      }
                      >
                      {uniClass ? (
                        <>
                          {apiData.subjects[uniClass.subject_id].name}
                          <br/>
                          {uniClass.isExercise ? "пу, " : "л, "}
                          {uniClass.room}
                        </>
                        ) : (
                        ""
                      )}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </>
  )
}