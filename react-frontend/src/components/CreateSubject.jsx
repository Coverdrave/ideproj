import Popup from "reactjs-popup";

import "./CreateSubject.css";
import "reactjs-popup/dist/index.css";
import { useEffect, useState } from "react";

export default function App({ }) {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      const response = await fetch("/api/subject/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
        setName("")
      } else {
        setMessage(data.message || "Something went wrong");
      }
    } catch (error) {
      setMessage("Server not reachable");
      console.log(error);
    }
  }

  return (
    <Popup
      trigger={
        <button className="button rounded-md shadow-md bg-blue-500 text-white p-2">
          {" "}
          Създай предмет{" "}
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
          <div className="header"> Създаване на нов предмет </div>
          <div className="content">
            <form onSubmit={handleSubmit}>
              <input
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="Име на предмета"
                required
              />
              <br/>
              {message && <p>{message}</p>}

              <button className="submitButton" type="submit">Създай</button>
            </form>
            
          </div>
        </div>
      )}
    </Popup>
  );
}
