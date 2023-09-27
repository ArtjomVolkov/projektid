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

  function kylasta(poodiNimi) {
    var pood = poed.find((p) => p.nimi === poodiNimi);
    if (pood !== undefined) {
      fetch(`https://localhost:7056/api/Poodidi/kylasta/${pood.nimi}`, {
        method: "POST",
      })
        .then((res) => res.json())
        .then((data) => {
          pood.kuulastusteArv = data; // Обновляем количество посетителей в состоянии
          setPoed([...poed]); // Обновляем состояние с новыми данными
        });
    }
  }

  function lisaPood() {
    const uusPood = {
      nimi: nimiRef.current.value,
      avamine: avamineRef.current.value,
      sulgemine: sulgemineRef.current.value,
      kuulastusteArv: 0,
    };

    fetch("https://localhost:7056/api/Poodidi/lisa", { method: "POST", headers: {"Content-Type": "application/json",},
      body: JSON.stringify(uusPood),
    })
      .then((res) => res.json())
      .then((json) => {
        setPoed(json);
        setFiltritudPoed(json);
      });
  }

  function kustutaPood(index) {
      fetch("https://localhost:7056/api/Poodidi/kustuta/" + index, { method: "DELETE",
      })
        .then((res) => res.json())
        .then((json) => {
          setPoed(json);
          setFiltritudPoed(json);
        });
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
        <input ref={filterRef} type="text" onChange={() => filtreeriPoed()} /> <br/>
      <table>
        <thead>
          <tr>
            <th>Nimi</th>
            <th>Avamine</th>
            <th>Sulgemine</th>
            <th>Kuulastuste</th>
            <th>Kustuta</th>
            <th>Lisa Kuulastuste</th>
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
              <td>
                <button onClick={() => kylasta(pood.nimi)}>+</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;
