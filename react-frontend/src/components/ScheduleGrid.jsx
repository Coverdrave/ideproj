import { useState } from "react";

const HOURS = Array.from({ length: 12 }, (_, i) => i + 7); // 7–18
const DAYS = {
  1: "Понеделник",
  2: "Вторник",
  3: "Сряда",
  4: "Четвъртък",
  5: "Петък",
  6: "Събота",
  7: "Неделя"
};
const WEEKS = Object.entries({
  "нечетна": ['odd', 'every'],
  "четна": ['even']
});

export default function ScheduleGrid({ apiData }) {
  const [isSelecting, setIsSelecting] = useState(false);
  const [selection, setSelection] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);

  let daysCount = Object.keys(apiData.orderedClasses).length;
  let subgroupsCount = apiData.groupInfo.subgroups.length;
  let gridRows = 1 + (daysCount*subgroupsCount*2);


  function cellKey(day, subgroup, week, hour) {
    return `${day}-${subgroup}-${week}-${hour}`;
  }

  function startSelection(day, subgroup, week, hour) {
    setIsSelecting(true);
    setSelection([{ day, subgroup, week, hour }]);
  }

  function extendSelection(day, subgroup, week, hour) {
    if (!isSelecting) return;

    setSelection(prev => {
      const key = cellKey(day, subgroup, week, hour);
      if (prev.some(c => cellKey(c.day, c.subgroup, c.week, c.hour) === key)) {
        return prev;
      }
      return [...prev, { day, subgroup, week, hour }];
    });
  }

  function endSelection() {
    setIsSelecting(false);
    console.log("Selected cells:", selection);
  }

  function isCellSelected(day, subgroup, week, hour) {
    return selection.some(
      c => c.day === day && c.subgroup === subgroup && c.week === week && c.hour === hour
    );
  }

  function getUniClassRowSpan(uniClass, subgroups, reachedSubgroupKey) {
    if (uniClass.week == "odd")
      return 1;

    let rowSpan = (uniClass.week == "every") ? 2 : 1;
    let subgroupKeys = Object.keys(subgroups);
    let subgroupIndex = subgroupKeys.indexOf(reachedSubgroupKey);

    while (subgroupIndex < subgroupKeys.length && subgroupKeys[++subgroupIndex]) {
      let uniClassBelow = subgroups[subgroupKeys[subgroupIndex]]
        .find((c) => (
          c.id === uniClass.id && c.startHour === uniClass.startHour && c.isExercise === uniClass.isExercise
        ));

      if (!uniClassBelow || uniClassBelow.week == "even")
        break;
      else if (uniClassBelow.week == "odd") {
        rowSpan++;
        break;
      }
      else if (uniClassBelow.week == "every") {
        rowSpan+=2;
      }
    }

    return rowSpan;
  }

  function skipHourAdd(skipHourArr, startHour, uniClassDuration, rowSpan) {
    skipHourArr[startHour] = {
      uniClassDuration: uniClassDuration,
      rowsToSkip: rowSpan - 1
    };
  }

  function skipHourDecrement(skipHourArr, startHour) {
    
    let val = skipHourArr[startHour].rowsToSkip;
    if (val == 1)
      delete skipHourArr[startHour];
    else
      skipHourArr[startHour].rowsToSkip--;
  }

  function skipHourExists(skipHourArr, startHour) {
    return (startHour in skipHourArr);
  }

  function skipHourGetDuration(skipHourArr, startHour) {
    return skipHourArr[startHour].uniClassDuration;
  }

  function getNextUniClass(subgroupUniClasses, reachedUniClassIndex) {
    return (reachedUniClassIndex < subgroupUniClasses.length) 
        ? subgroupUniClasses.at(reachedUniClassIndex) 
        : undefined;
  }
  
  return (<>
    <div className="grid grid-flow-col font-bold">
      <p className="text-start">
        КУРС: {apiData.groupInfo.academicYear - apiData.groupInfo.startYear + 1} &emsp; 
        ГРУПА: {apiData.groupInfo.groupNumber}
      </p>
      <p className="text-end">
        {apiData.groupInfo.isWinterTerm == 1 ? "ЗИМЕН" : "ЛЕТЕН"} СЕМЕСТЪР
        &emsp; {apiData.groupInfo.academicYear}/{parseInt(apiData.groupInfo.academicYear) + 1}г.
      </p>
    </div>
    
    <div
      // className="grid relative user-select-none border border-black shadow-md text-center gap-[1px]"
      // className="grid relative text-center user-select-none shadow-md outline outline-2 gap-[1px]"
      className="grid relative text-center user-select-none shadow-md outline outline-2 outline-black select-none"
      style={{
        gridTemplateColumns: `repeat(3, auto) repeat(${HOURS.length}, 10ch)`,
        gridTemplateRows: `auto repeat(${gridRows-1}, 1fr)`,
      }}
      // onMouseLeave={endSelection}
      // onMouseUp={endSelection}
    >
      {/* <div className="text-center font-bold h-min border-2 border-black"> */}
      {/* <div className="font-bold h-min outline outline-2"> */}
      <div className="font-bold h-min border-l border-t">
        ден
      </div>
      {/* <div className="text-center font-bold h-min border-t-2 border-r-2 border-b-2 border-black px-1"> */}
      {/* <div className="font-bold h-min outline outline-2 px-1"> */}
      <div className="font-bold h-min border-l border-t px-1">
        пгр.
      </div>
      {/* <div className="text-center font-bold h-min border-t-2 border-r-2 border-b-2 border-black"> */}
      {/* <div className="font-bold h-min outline outline-2"> */}
      <div className="font-bold h-min border-l border-t">
        седмица
      </div>

      {HOURS.map(h => (
        // <div key={h} className="text-center font-bold h-min border-t-2 border-r-2 border-b-2 border-black">
        // <div key={h} className="font-bold h-min outline outline-2">
        <div key={h} className="font-bold h-min border-l border-t">
          {h}<sup>00</sup>-{h}<sup>45</sup>
        </div>
      ))}

      {/* <div
        className="
          pointer-events-none
          outline outline-2 outline-black
          outline-offset-[-1px]
        "
        style={{
          gridColumnStart: 1,
          gridColumnEnd: 16,
          gridRowStart: 1,
          gridRowEnd: 2,
          zIndex: 20
        }}
      /> */}


      {Object.entries(apiData.orderedClasses).map(([dayIndex, subgroupsObj]) => {
        const skipHours = {};
        let subgroups = Object.entries(subgroupsObj);
        let subgroupReachedStyle = 0;
        let dayRowStart = (parseInt(dayIndex)*4 - 3) + 1;
        let dayRowEnd = dayRowStart + (subgroupsCount*2)
        let weekRowStart = dayRowStart-1;

        return (<>
          {/* <div className="outline outline-2 pointer-events-none box-border" */}
          <div className="
              pointer-events-none
              outline outline-2 outline-black
              outline-offset-[-1px]
            "
            style={{
              gridColumnStart: 1,
              gridColumnEnd: 16,
              gridRowStart: dayRowStart,
              gridRowEnd: dayRowEnd,
              zIndex: 15
            }}
          />

          {/* <div className="border text-xl flex flex-col items-center justify-center text-center p-1" */}
          {/* <div className="outline outline-1 text-xl flex flex-col items-center justify-center p-1" */}
          <div className="border-l border-t text-xl flex flex-col items-center justify-center p-1"
            style={{
              gridColumnStart: 1,
              gridRowStart: dayRowStart,
              gridRowEnd: dayRowEnd
            }}
          >
            {DAYS[dayIndex]}
          </div>

          <div
            className="
              pointer-events-none
              outline outline-2 outline-black
              outline-offset-[-1px]
            "
            style={{
              gridColumnStart: 3,
              gridColumnEnd: 4,
              gridRowStart: dayRowStart,
              gridRowEnd: dayRowEnd,
              zIndex: 18
            }}
          />


          {subgroups.map(([subgroupKey, subgroupUniClasses]) => {
            let reachedUniClassIndex = 0;
            let uniClass = getNextUniClass(subgroupUniClasses, reachedUniClassIndex);
            subgroupReachedStyle++;
            let subgroupRowStart = dayRowStart + (subgroupReachedStyle * 2) - 2;
            let subgroupRowEnd = subgroupRowStart + 2;

            return (<>
              {/* <div className="border text-xl flex flex-col items-center justify-center text-center p-1" */}
              {/* <div className="outline outline-1 text-xl flex flex-col items-center justify-center p-1" */}
              <div className="border-t border-l text-xl flex flex-col items-center justify-center p-1"
                style={{
                  gridColumnStart: 2,
                  gridRowStart: subgroupRowStart,
                  gridRowEnd: subgroupRowEnd
                }}
              >
                {subgroupKey}
              </div>

              {WEEKS.map(([weekText, compatibleUniClassWeeks]) => {
                let hourReached = HOURS.at(0);
                weekRowStart++;
                
                return (<>
                  {/* <div className="border border-r-2 border-r-black text-xl flex flex-col items-center justify-center text-center p-1"  */}
                  {/* <div className="outline outline-1 outline-black text-xl flex flex-col items-center justify-center text-center p-1"  */}
                  <div className="border-t border-l text-xl flex flex-col items-center justify-center text-center p-1" 
                    style={{
                      gridColumnStart: 3,
                      gridColumnEnd: 3,
                      gridRowStart: weekRowStart,
                      gridRowEnd: weekRowStart + 1
                    }}
                  >
                    {weekText}
                  </div>

                  {HOURS.map(hour => {
                    if (hourReached > hour)
                      return;

                    let reachedNeededClass = uniClass && hour == uniClass.startHour && compatibleUniClassWeeks.includes(uniClass.week);

                    if (skipHourExists(skipHours, hour)) {
                      hourReached += skipHourGetDuration(skipHours, hour);
                      skipHourDecrement(skipHours, hour);
                      if (reachedNeededClass) {
                        uniClass = getNextUniClass(subgroupUniClasses, ++reachedUniClassIndex);
                      }
                      return;
                    }
                    
                    if (reachedNeededClass) {
                      hourReached += uniClass.duration;

                      let rowSpan = getUniClassRowSpan(uniClass, subgroupsObj, subgroupKey);
                      if (rowSpan > 1)
                        skipHourAdd(skipHours, uniClass.startHour, uniClass.duration, rowSpan);

                      let cls = uniClass;
                      uniClass = getNextUniClass(subgroupUniClasses, ++reachedUniClassIndex);

                      return (
                        <div key={cls.id}
                          // className={`
                          //   bg-[#cce5ff] outline outline-1 outline-[#007bff] rounded-xl cursor-pointer z-10
                          //   px-1 flex flex-col items-center justify-center text-center
                          //   ${selectedClass?.id === cls.id ? "outline-2 outline-[#004085]" : ""}
                          // `}
                          className={`
                            bg-[#cce5ff] border border-[#00b7ff] cursor-pointer z-10
                            px-1 flex flex-col items-center justify-center text-center
                            ${selectedClass?.id === cls.id ? "outline-2 outline-[#004085]" : ""}
                          `}
                          style={{
                              gridColumnStart: cls.startHour - 3,
                              gridColumnEnd: cls.startHour - 3 + cls.duration,
                              gridRowStart: weekRowStart,
                              gridRowEnd: weekRowStart + rowSpan
                          }}
                        // onClick={() => setSelectedClass(cls)}
                        >
                          <strong>{cls.subject}</strong>
                          {/* <br/> */}
                          <small>{cls.isExercise ? "упражнение" : "лекция"}, {cls.room}</small>
                        </div>
                      )
                    }
                    else {
                      hourReached++;

                      return (
                        // <div className="outline outline-1 outline-[#eee] bg-white"
                        <div 
                          className={`border-l border-t border-[#eee] cell 
                            ${isCellSelected(dayIndex, subgroupKey, weekText, hour) ? "bg-[#d1fad5]" : "bg-white"}
                            hover:bg-[#c2c2c2]`}
                          style={{
                            gridColumnStart: hourReached - 4,
                            gridRowStart: weekRowStart,
                          }}
                          key={cellKey(dayIndex, subgroupKey, weekText, hour)}
                          onMouseDown={() => startSelection(dayIndex, subgroupKey, weekText, hour)}
                          onMouseEnter={() => extendSelection(dayIndex, subgroupKey, weekText, hour)}
                          onMouseUp={() => endSelection()}
                        />
                      )
                    }
                  })}
                </>)
              })}
            </>)
          })}
        </>)
      })}
    </div>
  </>);
}
