import "./App.css";
import { useState, useEffect } from "react";

const CalendarGrid = ({ date, handleDate }) => {
  return (
    <>
      <div onClick={handleDate} style={{ fontSize: ".25em" }}>
        {date}
      </div>
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
  const URL = "http://localhost:3001/api/";
  const [id, setId] = useState(null);
  const [appointmentsByDay, setAppointmentsByDay] = useState(null);
  const [date, setDate] = useState(null);
  const [date2, setDate2] = useState(new Date().getUTCDate());
  const [timeSlotSelected, setTimeSlot] = useState("1");
  const [physician, setPhysician] = useState("");
  const [patient, setPatient] = useState("");
  const [note, setNote] = useState("");

  const generateAppointmentsByDay = (appointments) => {
    console.log(appointments);
    const filter = {};
    for (const item of appointments) {
      const day = Number(item.date.split("-")[2]);
      if (filter.hasOwnProperty(day)) {
        filter[day].push(item);
      } else {
        filter[day] = [item];
      }
    }
    console.log(filter);
    return filter;
  };

  const generateCalenderGridView = (days) => {
    return new Array(days).fill(null).map((_, idx) => {
      let date = idx + 1;
      if (appointmentsByDay.hasOwnProperty(`${idx + 1}`)) {
        date = appointmentsByDay[idx + 1][0].date;
      }

      return (
        <CalendarGrid
          key={`${idx}-calendergrid`}
          date={date}
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
      setId(
        appointmentsByDay[date].filter((itm) => {
          return itm.timeSlot === `${timeslot}`;
        })[0]._id
      );
      setTimeSlot(timeslot);
    }
  };

  const generateTimeSlotList = () => {
    if (!appointmentsByDay || !date) {
      return "";
    }

    let listedtimeSlots = null;

    if (appointmentsByDay.hasOwnProperty(date)) {
      listedtimeSlots = appointmentsByDay[date]
        .map(({ timeSlot }) => {
          return timeSlot;
        })
        .sort();
    }

    return new Array(8).fill(null).map((itm, idx) => {
      if (listedtimeSlots && listedtimeSlots.includes(`${idx + 1}`)) {
        const [{ physician, patient }] = appointmentsByDay[date].filter(
          (itm, idxInner) => {
            return itm.timeSlot === `${idx + 1}`;
          }
        );

        return (
          <TimeSlotList
            key={`${idx}-calendergrid`}
            timeSlot={idx + 1}
            physician={physician}
            patient={patient}
            handleTimeSlot={handleSelectTimeSlot(date, idx + 1)}
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

  const generateSelectOptions = () => {
    return new Array(8)
      .fill(null)
      .map((itm, idx) => `${idx + 1}`)
      .filter((itm, idx) => {
        if (appointmentsByDay.hasOwnProperty(date)) {
          return !appointmentsByDay[date]
            .map((itm) => {
              return itm.timeSlot;
            })
            .includes(`${itm}`);
        } else {
          return true;
        }
      })
      .map((itm, idx) => <option key={`${idx}-options`}>{itm}</option>);
  };

  const timeSlot = () => {
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
            {generateSelectOptions()}
          </select>
          <textarea onChange={(e) => setNote(e.target.value)}></textarea>

          <button onClick={handleTimeSlotSave}>save</button>
        </div>
      );
    } else {
      const filteredApp = {
        physician: "",
        patient: "",
        note: "",
        timeSlot: "",
        date: "",
      };

      let filtered = null;
      if (appointmentsByDay[date]) {
        filtered = appointmentsByDay[date].filter((itm, idx) => {
          return itm._id === id;
        });
      }

      if (filtered) {
        Object.assign(filteredApp, filtered[0]);
      }

      return (
        <div>
          <input
            placeholder="Physician"
            defaultValue={filteredApp.physician}
            onChange={(e) => setPhysician(e.target.value)}
          />
          <input
            placeholder="Patient"
            defaultValue={filteredApp.patient}
            onChange={(e) => setPatient(e.target.value)}
          />
          <input
            placeholder="Date"
            defaultValue={filteredApp.date}
            onChange={(e) => setDate2(e.target.value)}
          />
          <select>
            <option>{filteredApp.timeSlot}</option>
          </select>
          <textarea
            defaultValue={filteredApp.note}
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
    setTimeSlot("1");
  };

  const fetchAppointments = async () => {
    const res = await fetch(URL);
    const data = await res.json();
    console.log(data);
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
          console.log(data);
          fetchAppointments()
          break;
        case 500:
          console.log(data);
          break;
        default:
          console.log(res.status, "?");
      }
    }
    cleanUp();
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

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
