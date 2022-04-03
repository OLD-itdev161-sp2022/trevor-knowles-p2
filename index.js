// It reads the .env file in the root directory.
// The .env file is used to store environment variables.
//This is prefer in order to prevent sharing sensitive information in the source code.
require("dotenv").config();
const qs = require("querystring");

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const { log } = require("console");
const uri = `mongodb+srv://knowlet1:${qs.escape(
  process.env.password
)}@cluster0.novld.mongodb.net/project1?retryWrites=true&w=majority`;
class Appointments {
  date;
  timeSlot;
  physician;
  patient;
  note;

  constructor(date, timeSlot, physician, patient) {
    this.date = date;
    this.timeSlot = timeSlot;
    this.physician = physician;
    this.patient = patient;
  }
}
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const port = 3001;
const server = express();
server.use(bodyParser.json());
server.use(cors());
server
  .get("/api/", async (req, res) => {
    try {
      const collection = client.db("Project-2").collection("Appointments");
      const { from, to } = req.query;
      if (from && to) {
        const cursor = collection.find({
          date: { $lt: new Date(to), $gte: new Date(from) },
        });
        const values = await cursor.toArray();
        res.status(200).send(values);
      } else {
        const cursor = collection.find({});
        const values = await cursor.toArray();
        const filtered = values.filter((itm, idx) => {
          console.log(
            itm.date.toLocaleString("default", { month: "short" }) ===
              new Date().toLocaleString("default", { month: "short" })
          );
          return (
            itm.date.toLocaleString("default", { month: "short" }) ===
            new Date().toLocaleString("default", { month: "short" })
          );
        });
        res.status(200).send(filtered);
      }
    } catch (error) {
      res.status(500).send(error.message);
    }
  })
  .post("/api/", async (req, res) => {
    try {
      const { date, timeSlot, physician, patient, note } = req.body;
      const collection = client.db("Project-2").collection("Appointment");
      if ((date, timeSlot, physician, patient)) {
        const timeSlotAvailable = await collection.findOne({
          date: new Date(date),
          //timeSlot: {
         //   $ne: timeSlot,
        //  },
        });
        console.log(timeSlotAvailable);
        if (timeSlotAvailable) {
          console.log(true);
        } else {
          console.log(false);
        }
        const myAppointment = new Appointments(
          date,
          timeSlot,
          physician,
          patient
        );
        // const result = await collection.insertOne(myAppointment);
        console.log(result);
        res.status(201).send(`${result} created`);
      } else {
        res.status(400).send("missing field");
      }
    } catch (error) {
      res.status(500).send(error.message);
    }
  })
  .put("/api/:id", (req, res) => {
    const collection = client.db("Project1").collection("Classes");
    const { id } = req.params;
    const { name, description, instructor } = req.body;
    collection
      .findOne({ _id: new ObjectId(id) })
      .then((result) => {
        if (result) {
          const update = {};
          if (name) {
            update.name = name;
          }
          if (description) {
            update.description = description;
          }
          if (instructor) {
            update.instructor = instructor;
          }
          collection
            .updateOne({ _id: new ObjectId(id) }, { $set: update })
            .then((result) => res.status(200).send(`${id} updated`));
        }
      })
      .catch((error) => {
        res.status(500).send(`${id} notFound`);
      });
  })
  .delete("/api/:id", (req, res) => {
    const collection = client.db("Project1").collection("Classes");
    const { id } = req.params;
    collection
      .deleteOne({ _id: new ObjectId(id) })
      .then((result) => {
        console.log(result);
        if (result.deletedCount > 0) {
          res.status(200).send(`${id} deleted`);
        } else {
          res.status(400).send(`${id} does not exist`);
        }
      })
      .catch((error) => {
        res.status(500).send(error.message);
      });
  });

//console.log("password",qs.escape(process.env.password));

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});
client.connect((err) => {
  // perform actions on the collection object

  if (!err) {
    console.log("data connected");
    server.listen(port, () => {
      console.log(`listen on: ${port}`);
    });
  } else {
    console.log(err.message);
  }
  //client.close();
  //   const collection = client.db("Project1").collection("Classes");
  //   collection.findOne().then((res) => console.log(res));
});
