import { useEffect, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

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
  let hour = 7;
  let group = '25A';


  async function getApiData() {
    const res = await fetch('/api/schedule');
    const data = await res.json();

    if (res.ok) {
      setApiData(data);
    }
  }

  useEffect(() => {
    getApiData();
    
  }, []);

  function buildDaySchedule() {

    return (
      {

      }
    );
  }

  return (
    <>
      <h1 className='mx-auto text-center'>Учебен разпис</h1>

      <table className='table-bordered border-separate'>
        <thead>
          <tr>
            <th>Ден</th>
            <th>гр.</th>
            <th>7:00 - 7:45</th>
            <th>8:00 - 8:45</th>
            <th>9:00 - 9:45</th>
            <th>10:00 - 10:45</th>
            <th>гр.</th>
            <th>гр.</th>
            <th>гр.</th>
            <th>гр.</th>
            <th>гр.</th>
            <th>гр.</th>
            <th>гр.</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              {days[day++]}
              {console.log(apiData)}
            </td>
            {}
          </tr>
        </tbody>
      </table>
    </>
  )
}
