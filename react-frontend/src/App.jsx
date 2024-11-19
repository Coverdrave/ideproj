import { useEffect, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

export default function App() {
  const [apiData, setApiData] = useState([])
  
  let hour = 7;
  // let day = 0;


  async function getApiData() {
    const res = await fetch('/api/schedule');
    const data = await res.json();

    if (res.ok) {
      setApiData(data);
    }
  }

  useEffect(() => {
    getApiData();
    console.log(apiData);
  }, []);


  return (
    <>
      <h1 className='mx-auto text-center'>Учебен разпис</h1>

      <table>
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
            {
              
            }
            <td>
              {apiData

              }
            </td>
          </tr>
        </tbody>
      </table>
    </>
  )
}
