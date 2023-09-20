import { useEffect, useRef, useState } from 'react';
import './App.css';

function App() {
  const [poed, setPoed] = useState([]);
  const [filtritudPoed, setFiltritudPoed] = useState([]);
  const nimiRef = useRef(); //pood.nimi
  const avamineRef = useRef(); //pood.avamine
  const sulgemineRef = useRef(); //pood.sulgemine
  const filterRef = useRef();

  useEffect(() => {
    fetch("https://localhost:7056/api/Poodidi")
      .then((res) => res.json())
      .then((json) => {
        setPoed(json);
        setFiltritudPoed(json);
      });
  }, []);

  function lisaPood() {
    const uusPood = {
      nimi: nimiRef.current.value,
      avamine: avamineRef.current.value,
      sulgemine: sulgemineRef.current.value,
      kuulastusteArv: 0,
    };

    fetch("https://localhost:7056/api/Poodidi/lisa", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(uusPood),
    })
      .then((res) => res.json())
      .then((json) => {
        setPoed(json);
        setFiltritudPoed(json);
      });
  }

  function kustutaPood(index) {
    setTimeout(() => {
      fetch("https://localhost:7056/api/Poodidi/kustuta/" + index, { method: "DELETE",
      })
        .then((res) => res.json())
        .then((json) => {
          setPoed(json);
          setFiltritudPoed(json);
        });
    }, 1000);
  }

  function filtreeriPoed() {
    const filterTekst = filterRef.current.value.toLowerCase();
    const filtreeritud = poed.filter((pood) =>
      pood.nimi.toLowerCase().includes(filterTekst)
    );
    setFiltritudPoed(filtreeritud);
  }

  return (
    <div className="App">
      <div className="input">
        <label>Nimi:</label> <br />
        <input ref={nimiRef} type="text" /> <br />
        <label>Avamine (HH:MM:SS):</label> <br />
        <input ref={avamineRef} type="text" /> <br />
        <label>Sulgemine (HH:MM:SS):</label> <br />
        <input ref={sulgemineRef} type="text" /> <br />
        <button onClick={() => lisaPood()}>Lisa Pood</button>
        <br />
      </div>
      <label>Filtri:</label> <br />
        <input ref={filterRef} type="text" onChange={() => filtreeriPoed()} />
      <table>
        <thead>
          <tr>
            <th>Nimi</th>
            <th>Avamine</th>
            <th>Sulgemine</th>
            <th>Kuulastuste</th>
            <th>Kustuta</th>
            <th>Lisa kuulastuste</th>
          </tr>
        </thead>
        <tbody>
          {filtritudPoed.map((pood, index) => (
            <tr key={index}>
              <td>{pood.nimi}</td>
              <td>{pood.avamine}</td>
              <td>{pood.sulgemine}</td>
              <td>{pood.kuulastusteArv}</td>
              <td>
                <button onClick={() => kustutaPood(index)}>Kustuta</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;
