import { useEffect, useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
import './App.css'
// import { build } from 'vite';

export default function App() {
  const [apiData, setApiData] = useState([])

  let days = {
    0: 'Понеделник',
    1: 'Вторник',
    2: 'Сряда',
    3: 'Четвъртък',
    4: 'Петък'
  };

  let day = 0;
  // let hour = 7;
  let minHour = 7;
  let maxHour = 18;
  // let group = '25A';
  // let reachedClass = 0;

  // let buildRan = false;


  async function getApiData() {
    const res = await fetch('/api/schedule');
    const data = await res.json();

    if (res.ok) {
      setApiData(data);
      console.log('ok');
    }
  }

  useEffect(() => {
    getApiData();
    
  }, []);

  function buildUniClasses() {
    let classes = apiData.schedule.classes;
    let table = [];
    let reachedClass = 0;

    // buildRan = true;

    for (let hour = minHour; hour < maxHour; hour++) {
      if (reachedClass < classes.length && classes[reachedClass].startHour == hour) {
        table.push(
          <td key={hour} className='border bg-green-300' colSpan={classes[reachedClass].duration}>{classes[reachedClass].subject.name}</td>
        );
        
        hour += classes[reachedClass].duration - 1;
        reachedClass++;
      }
      else {
        table.push(
          <td key={hour} className='border'></td>
        );
      }

      // console.log(classes);
      // console.log(reachedClass);
      
    }

    // console.log(table);
    return table;
  }

  return (
    <>
      <div className='mx-[10vw]'>
        <h1 className='mx-auto text-center mt-1 mb-5'>Учебен разпис</h1>

        <table className='table-fixed text-center border-2 mx-auto'>
          <thead>
            <tr className='border'>
              <th className='border'>Ден</th>
              {[...Array(maxHour - minHour + 1)].map((val, hour) => (
                <th key={hour} data-cellid={day+'/'+hour} className='w-1/12 border'>{minHour + hour}:00 - {minHour + hour}:45</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                {days[day]}
                {/* {console.log(apiData)} */}
              </td>
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
              {apiData.length != 0 && buildUniClasses()}
              
              {/* {apiData.length != 0 ? (apiData.schedule.classes.map((uniClass, index) => (
                <td key={index} className='border bg-green-300' colSpan={uniClass.duration}>{uniClass.subject.name}</td>
              ))) : (
                <td></td>
              )} */}
            </tr>
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
  )
}
