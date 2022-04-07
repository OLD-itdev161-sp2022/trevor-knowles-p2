import logo from "./logo.svg";
import "./App.css";
import { useState, useEffect } from "react";

const CalendarGrid = ({ date, isBlank, handleDate }) => {
  return (
    <>
      {isBlank ? (
        <div>{isBlank ? "" : date}</div>
      ) : (
        <div onClick={handleDate}>{isBlank ? "" : date}</div>
      )}
    </>
  );
};
const TimeSlotList = ({ timeSlot, patient, physician, handleTimeSlot }) => {
  return (
    <div onClick={handleTimeSlot}>
      <div>{timeSlot}</div>
      <div>{patient}</div>
      <div>{physician}</div>
    </div>
  );
};

function App() {
  const test = {
    id: 1234,
    date: "04-02-2022",
    physician: "test",
    patient: "test",
    timeSlots: "2",
    note: "test",
  };
  const URL = "http://localhost:3001/api/";
  const [id, setId] = useState(null);
  const [appointments, setAppointments] = useState([test]);
  const [appointmentsByDay, setAppointmentsByDay] = useState(null);
  const [date, setDate] = useState(null);
  const [date2, setDate2] = useState(new Date().getUTCDate());
  const [newApp, setNewApp] = useState({});
  const [timeSlotSelected, setTimeSlot] = useState(null);
  const [physician, setPhysician] = useState("");
  const [patient, setPatient] = useState("");
  const [note, setNote] = useState("");

  const generateAppointmentsByDay = (appointments) => {
    const filter = {};
    for (const item of appointments) {
      if (
        filter.hasOwnProperty(
          new Date(
            item.date.includes("t") ? item.date.split("t")[0] : item.date
          ).getDate()
        )
      ) {
        filter[new Date(item.date).getDate()].push(item);
      } else {
        filter[new Date(item.date).getDate()] = [item];
      }
    }
    return filter;
  };

  const generateCalenderGridView = (days) => {
    return new Array(days).fill(null).map((itm, idx) => {
      const isBlank = !appointmentsByDay.hasOwnProperty(`${idx + 1}`);
      return (
        <CalendarGrid
          key={`${idx}-calendergrid`}
          date={!isBlank ? appointmentsByDay[idx + 1][0].date : ""}
          isBlank={isBlank}
          handleDate={handleSelectDate(idx + 1)}
        />
      );
    });
  };

  const handleSelectDate = (date) => () => {
    setDate(date);
  };

  const handleSelectTimeSlot = (date, timeslot) => () => {
    if (timeslot === -1) {
      setId(-1);
    } else {
      setId(appointmentsByDay[date][timeslot]._id);
    }
  };

  const generateTimeSlotList = () => {
    if (!appointmentsByDay || !date) {
      return "";
    }

    const listedtimeSlots = appointmentsByDay[date].map(({ timeSlot }) => {
      return timeSlot;
    });

    console.log(appointmentsByDay[date], listedtimeSlots);
    return new Array(8).fill(null).map((itm, idx) => {
      if (listedtimeSlots.includes(`${idx + 1}`)) {
        //const { physician, patient } = appointmentsByDay[date][idx + 1];
        return (
          <TimeSlotList
            key={`${idx}-calendergrid`}
            timeSlot={idx + 1}
            physician={"physician"}
            patient={"patient"}
            handleTimeSlot={handleSelectTimeSlot(date, idx)}
          />
        );
      } else {
        return (
          <TimeSlotList
            key={`${idx}-calendergrid`}
            timeSlot={idx + 1}
            physician={""}
            patient={""}
            handleTimeSlot={handleSelectTimeSlot(date, -1)}
          />
        );
      }
    });
  };

  const handleTimeSlotSave = () => {
    saveUpdateAppointments();
  };

  const handleTimeSlotDelete = () => {
    deleteAppointments();
  };

  const timeSlot = () => {
    console.log(id);
    if (id === -1) {
      return (
        <div>
          <input
            placeholder="Physician"
            onChange={(e) => setPhysician(e.target.value)}
          />
          <input
            placeholder="Patient"
            onChange={(e) => setPatient(e.target.value)}
          />
          <input
            placeholder="Date"
            type={"date"}
            onChange={(e) => setDate2(e.target.value)}
          />
          <select onChange={(e) => setTimeSlot(e.target.value)}>
            {new Array(8)
              .fill(null)
              .map((itm, idx) => `${idx + 1}`)
              .filter(
                (itm, idx) =>
                  !appointmentsByDay[date]
                    .map((itm) => {
                      return itm.timeSlot;
                    })
                    .includes(`${itm}`)
              )
              .map((itm, idx) => (
                <option key={`${idx}-options`}>{itm}</option>
              ))}
            <option>{timeSlot}</option>
          </select>
          <textarea onChange={(e) => setNote(e.target.value)}></textarea>

          <button onClick={handleTimeSlotSave}>save</button>
        </div>
      );
    } else {
      const [filteredApp] = appointmentsByDay[date].filter((itm, idx) => {
        return itm._id === id;
      });
      const {
        date: dateFromServer,
        timeSlot,
        physician,
        patient,
        note,
      } = filteredApp;
      return (
        <div>
          <input
            placeholder="Physician"
            defaultValue={physician}
            onChange={(e) => setPhysician(e.target.value)}
          />
          <input
            placeholder="Patient"
            defaultValue={patient}
            onChange={(e) => setPatient(e.target.value)}
          />
          <input
            placeholder="Date"
            defaultValue={dateFromServer}
            onChange={(e) => setDate2(e.target.value)}
          />
          <select>
            <option>{timeSlot}</option>
          </select>
          <textarea
            defaultValue={note}
            onChange={(e) => setNote(e.target.value)}
          ></textarea>

          <button onClick={handleTimeSlotSave}>save</button>
          <button onClick={handleTimeSlotDelete}>delete</button>
        </div>
      );
    }
  };

  const cleanUp = () => {
    setId(null);
  };

  const fetchAppointments = async () => {
    const res = await fetch(URL);
    const data = await res.json();
    // setAppointments(data);
    setAppointmentsByDay(generateAppointmentsByDay(data));
  };

  const deleteAppointments = async () => {
    if (id) {
      const res = await fetch(`${URL}${id}`, { method: "delete" });
      const data = await res.text();
      if (res.status === 200) {
        alert(data);
        cleanUp();
      } else {
        alert(data);
      }
    } else {
      alert("Please select a class.");
    }
  };

  const saveUpdateAppointments = async () => {
    if (id && id !== -1) {
      const res = await fetch(`${URL}${id}`, {
        method: "put",
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },

        body: JSON.stringify({ patient, physician, note }),
      });
      const data = await res.text();
      if (res.status === 200) {
        alert(data);
      }
    } else if (id === -1) {
      const res = await fetch(`${URL}`, {
        method: "post",
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          patient,
          physician,
          note,
          date: date2,
          timeSlot: timeSlotSelected,
        }),
      });
      const data = await res.text();

      switch (res.status) {
        case 201:
          alert(data);
          break;
        case 500:
          console.log(data);
          break;
        default:
          console.log(res.status, "?");
      }
      if (res.status === 201) {
        alert(data);
      }
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  // useEffect(() => {
  //   displayClass();
  // }, [id]);

  return (
    <div className="App">
      <div>
        <h1>Schedule Appointments</h1>
      </div>
      <div className="container">
        <div className="calender">
          {appointmentsByDay && generateCalenderGridView(31)}
        </div>
        <div className="timeslots">{generateTimeSlotList()}</div>
        <div className="detail">{id && timeSlot()}</div>
      </div>
    </div>
  );
}

export default App;
