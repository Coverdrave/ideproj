import { useEffect, useState } from "react";
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
import "./App.css";
// import { build } from 'vite';

export default function App() {
  const [apiData, setApiData] = useState([]);

  let days = {
    0: "Понеделник",
    1: "Вторник",
    2: "Сряда",
    3: "Четвъртък",
    4: "Петък",
  };

  let day = 0;
  // let hour = 7;
  let minHour = 7;
  let maxHour = 18;
  // let group = '25A';
  // let reachedClass = 0;

  let hourReached = 0;
  const skippedClasses = [];

  let row = 0;

  // let buildRan = false;

  async function getApiData() {
    const res = await fetch("/api/schedule");
    const data = await res.json();

    if (res.ok) {
      setApiData(data);
      console.log("ok");
    }
  }

  useEffect(() => {
    getApiData();
  }, []);

  /*
  function buildUniClasses() {
    let table = [];
    let end = [];

    let scheduleReached = 0;

    const schedules = apiData.schedules;
    const rowSpanTable = [];

    for (let sch = 0; sch < schedules.length; sch++) {
      for (let hour = minHour; hour <= maxHour; hour++) {
        const found = schedules[sch]['classes'].find((el) => el.startHour == hour);
        if (sch == 0) {
          if (found) {
            rowSpanTable[sch][hour] = found.id;
          }
          
        }
        else {
          if (rowSpanTable[sch-1][hour] > 0 && found.id)
        }
        

      }
    }

    apiData.schedules.forEach(schedule => {
      let classes = schedule.classes;
      let reachedClass = 0;

      
      for (let hour = minHour; hour <= maxHour; hour++) {
        if (reachedClass < classes.length && classes[reachedClass].startHour == hour) {

          let objProps;
          if (end.length != 0 && scheduleReached > 0 ) {
            objProps = end[scheduleReached - 1].props?.children[hour - minHour]?.props;
            // console.log(objProps)
          }

          if (objProps && objProps['data-subjectid'] > 0 && objProps['data-subjectid'] == classes[reachedClass].subject_id) {
            // objProps['rowspan'] = (objProps['rowspan'] || 0) + 1;
            // objProps = {...objProps, 'rowSpan': 2};
            // end[scheduleReached - 1].props.children[hour - minHour].props = {...end[scheduleReached - 1].props.children[hour - minHour].props, 'rowSpan': 2}
            // objProps.rowSpan = 2;
            console.log(objProps);
          }
          else {
            table.push(
              <td 
              key={day+'/'+hour+'/'+schedule.group+schedule.subgroup+schedule.isOddWeek} 
              data-subjectid={classes[reachedClass].subject_id} 
              className='border bg-green-300' 
              rowSpan={1} 
              colSpan={classes[reachedClass].duration}
              >
              {apiData.subjects[classes[reachedClass].subject_id].name}
              </td>
            );
          }

          
          
          hour += classes[reachedClass].duration - 1;
          reachedClass++;
        }
        else {
          table.push(
            <td key={day+'/'+hour+'/'+schedule.group+schedule.subgroup+schedule.isOddWeek} data-subjectid='-1' data-cellid={row+'/'+hour} className='border'></td>
          );
        }

        // console.log(classes);
        // console.log(reachedClass);
        
      }

      scheduleReached++;

      end.push(
        <tr>{table}</tr>
      );

      table = [];
    });

    console.log(end);
    return end;
  }
    */
  console.log(apiData && apiData.schedules);
  return (
    <>
      <div className="mx-[10vw]">
        <h1 className="mx-auto text-center mt-1 mb-5">Учебен разпис</h1>

        <table className="table-fixed text-center border-2 mx-auto">
          <thead>
            <tr className="border">
              <th className="border">Ден</th>
              {[...Array(maxHour - minHour + 1)].map((val, hour) => (
                <th
                  key={hour}
                  data-cellid={day + "/" + (minHour + hour)}
                  className="w-1/12 border"
                >
                  {minHour + hour}:00 - {minHour + hour}:45
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {apiData &&
              apiData.schedules &&
              [...Array(20)].map((_, index) => {
                hourReached = 0;

                return (
                  <tr className="border">
                    {index % 4 === 0 && <td rowSpan={4}>{days[index / 4]}</td>}
                    {[...Array(maxHour - minHour + 1)].map((val, hour) => {
                      // if(apiData.schedules[index % 4].classes[0].duration)
                      const uniClass = apiData.schedules[
                        index % 6 //тодо реможе
                      ].classes?.find((c) => c.startHour === hour + minHour);
                      // const downClass = apiData.schedules[]
                      //index != 19 && index + 1... + 2 + 3(i)
                      //skippedClasses.push index
                      //rowSpan i

                      if (hourReached > hour) {
                        return;
                      }

                      hourReached += uniClass ? uniClass.duration : 1;

                      if (uniClass && skippedClasses.includes(uniClass.id)) {
                        return;
                      }

                      // console.log(uniClass);
                      return (
                        <td
                          className="border"
                          colSpan={uniClass ? uniClass.duration : 1}
                          rowSpan={
                            uniClass
                              ? () => {
                                  let span = 1;

                                  for (let i = index + 1; i < index + 4; i++) {
                                    const classBelow = apiData.schedules[
                                      i
                                    ].classes?.find(
                                      (c) => c.id === uniClass.id
                                    );
                                    if (classBelow) {
                                      skippedClasses.push(classBelow.id);
                                      span++;
                                    } else {
                                      // break;
                                    }
                                  }

                                  console.log(span);
                                  return span;
                                }
                              : 1
                          }
                        >
                          {/* {apiData.schedules[index % 4].id} */}
                          {uniClass
                            ? apiData.subjects[uniClass.subject_id].name
                            : ""}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            {/* {apiData.length != 0 && buildUniClasses()} */}

            {/* {[...Array(maxHour - minHour)].map((val, hour) => (
                apiData.length != 0 
                && reachedClass < apiData.schedule.classes.length 
                && apiData.schedule.classes[reachedClass].startHour == hour + minHour ? 
                (
                  <td key={hour} className='border bg-green-300' colSpan={apiData.schedule.classes[reachedClass].duration}>{apiData.schedule.classes[reachedClass].subject.name}</td>
                ) : (
                  <td key={hour} className='border'>{hour+minHour+'/'}</td>
                )
                ))} */}

            {/* {apiData.length != 0 ? (apiData.schedule.classes.map((uniClass, index) => (
                <td key={index} className='border bg-green-300' colSpan={uniClass.duration}>{uniClass.subject.name}</td>
              ))) : (
                <td></td>
              )} */}
          </tbody>
        </table>
        {console.log(apiData)}

        {/* <div className='grid grid-cols-12'>
          <div className='text-center mx-auto'>Ден</div>
          {[...Array(maxHour - minHour)].map((val, hour) => (
            <div key={hour} data-cellId={day+'/'+hour} className='text-center mx-auto'>{minHour + hour}:00 - {minHour + hour}:45</div>
          ))}

          <div>{days[day++]}</div>
          {apiData.length != 0 ? (apiData.schedule.classes.map((uniClass, index) => (
            <div key={index} className='col-span-2 text-center'>{uniClass.subject.name}</div>
          ))) : (
            <p></p>
          )}
        </div> */}
      </div>
    </>
  );
}
