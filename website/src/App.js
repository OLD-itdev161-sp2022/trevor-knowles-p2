import logo from "./logo.svg";
import "./App.css";
import { useState, useEffect } from "react";

function App() {
  const URL = "http://localhost:3001/api/";
  const [id, setId] = useState(null);
  const [myClasses, setMyClasses] = useState(["test"]);
  const [name, setName] = useState("");
  const [instructor, setInstructor] = useState("");
  const [description, setDescription] = useState("");

  const fetchClasses = async () => {
    const res = await fetch(URL);
    const data = await res.json();
    setMyClasses(data);
  };

  const selectClass = (e) => {
    setId(e.target.value);
  };

  const displayClass = () => {
    const [myClass] = myClasses.filter(({_id}, _idx) => {
      return _id === id;
    });
    if (myClass) {
     setName(myClass.name);
      setDescription(myClass.description);
      setInstructor(myClass.instructor);
    }
  };

  const cleanUp = () => {
    fetchClasses();
    setName("");
    setDescription("");
    setInstructor("");
  };

  const deleteClass = async () => {
    if (id) {
      const res = await fetch(`${URL}${id}`, { method: "delete" });
      const data = await res.text();
      if (res.status === 200) {
        cleanUp();
        setId(null);
        alert(data);
      }
    } else {
      alert("Please select a class.");
    }
  };

  const saveUpdateClass = async () => {
    if (id) {
      const res = await fetch(`${URL}${id}`, {
        method: "put",
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },

        body: JSON.stringify({ name, description, instructor }),
      });
      const data = await res.text();
      if (res.status === 200) {
        alert(data);
      }
    } else {
      const res = await fetch(`${URL}`, {
        method: "post",
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },

        body: JSON.stringify({ name, description, instructor }),
      });
      const data = await res.text();

      if (res.status === 201) {
        setId(null);
        alert(data);
      }
    }
    cleanUp();
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    displayClass();
  }, [id]);

  return (
    <div className="App">
      <select onChange={selectClass}>
        {myClasses.map(({ name, _id }, id) => (
          <option key={id} value={_id}>
            {name}
          </option>
        ))}
      </select>
      <br />
      <input
        value={name}
        placeholder="name"
        type="text"
        onChange={(e) => setName(e.target.value)}
      />
      <br />
      <input
        value={description}
        placeholder="description"
        type="text"
        onChange={(e) => setDescription(e.target.value)}
      />
      <br />
      <input
        value={instructor}
        placeholder="instructor"
        type="text"
        onChange={(e) => setInstructor(e.target.value)}
      />
      <br />
      <button onClick={saveUpdateClass}>save/update</button>
      <button onClick={deleteClass}>delete</button>
    </div>
  );
}

export default App;
