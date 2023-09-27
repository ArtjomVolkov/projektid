import { useEffect, useRef, useState } from 'react';
import './App.css';

function App() {
  const [poed, setPoed] = useState([]);
  const [filtritudPoed, setFiltritudPoed] = useState([]);
  const nimiRef = useRef(); //pood.nimi
  const avamineRef = useRef(); //pood.avamine
  const sulgemineRef = useRef(); //pood.sulgemine
  const filterRef = useRef();

  const [valitudAeg, setValitudAeg] = useState("");
  const [avatudPoed, setAvatudPoed] = useState([]);

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
      nimiRef.current.value = "";
      avamineRef.current.value = "";
      sulgemineRef.current.value = "";
  }

  function kustutaPood(id) {
    fetch("https://localhost:7056/api/Poodidi/kustuta/" + id, { method: "DELETE" })
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

  function naitaAvatudPoed() {
    const valitudAegStr = prompt("Sisesta aeg (HH:MM):");

    if (!valitudAegStr) {
      alert("Aeg ei ole sisestatud.");
      return;
    }

    const [tundStr, minutStr] = valitudAegStr.split(":");
    const tund = parseInt(tundStr, 10);
    const minut = parseInt(minutStr, 10);

    if (isNaN(tund) || isNaN(minut)) {
      alert("Vale aja formaat. Sisesta aeg kujul HH:MM.");
      return;
    }

    fetch(`https://localhost:7056/api/Poodidi/lahtipood/${tund}/${minut}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Network response was not ok (Status: ${res.status})`);
        }
        return res.json();
      })
      .then((data) => {
        if (data.length > 0) {
          setAvatudPoed(data);
        } else {
          alert("Ühtegi poodi pole sel ajal lahti.");
        }
      })
      .catch((error) => {
        console.error('Error:', error);
        alert("Error.");
      });
  }

  function renderAvatudPoed() {
    if (avatudPoed.length > 0) {
      return (
        <div className="avatud-poed">
          <h2>Avatud poed:</h2>
          <ul className="avatud-poed-list">
            {avatudPoed.map((pood, index) => (
              <li key={index} className="avatud-pood-item">
                {pood}
              </li>
            ))}
          </ul>
        </div>
      );
    } else if (valitudAeg && avatudPoed.length === 0) {
      return <p className="avatud-poed-empty">Ühtegi poodi pole sel ajal lahti.</p>;
    } else {
      return null;
    }
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
        <button onClick={naitaAvatudPoed}>Vaadake avatud kauplusi</button>
        {renderAvatudPoed()}
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
              <button onClick={() => kustutaPood(pood.id)}>Kustuta</button>
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
