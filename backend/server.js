const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public")); // serve dashboard.html from backend/public

// MySQL connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",     // set your password
  database: "hotel_booking"
});

db.connect((err) => {
  if (err) {
    console.error("❌ Database connection failed:", err.message);
  } else {
    console.log("✅ Connected to MySQL database");
  }
});

// GET /rooms - return fields including AC/Non-AC counts & prices
app.get("/rooms", (req, res) => {
  db.query(
    "SELECT id, room_type, total_count, ac_count, non_ac_count, ac_price, non_ac_price FROM rooms",
    (err, result) => {
      if (err) return res.status(500).json({ error: "Database error", details: err });
      res.json(result);
    }
  );
});

// POST /book - accept ac_rooms and non_ac_rooms
app.post("/book", (req, res) => {
  const {
    room_id,
    ac_rooms = 0,
    non_ac_rooms = 0,
    name,
    email,
    mobile,
    checkin,
    checkout
  } = req.body;

  // basic validation
  if (!room_id || (!name || !email || !mobile || !checkin || !checkout)) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const acRequested = parseInt(ac_rooms, 10) || 0;
  const nonAcRequested = parseInt(non_ac_rooms, 10) || 0;

  if (acRequested <= 0 && nonAcRequested <= 0) {
    return res.status(400).json({ message: "You must book at least one AC or Non-AC room" });
  }

  // compute nights (whole days)
  const checkinDate = new Date(checkin);
  const checkoutDate = new Date(checkout);
  const msPerDay = 1000 * 60 * 60 * 24;
  const rawNights = (checkoutDate - checkinDate) / msPerDay;
  const nights = Math.floor(rawNights);

  if (!(checkinDate instanceof Date) || isNaN(checkinDate) ||
      !(checkoutDate instanceof Date) || isNaN(checkoutDate) || nights <= 0) {
    return res.status(400).json({ message: "Invalid check-in / check-out dates" });
  }

  // fetch room details (counts & prices)
  db.query("SELECT * FROM rooms WHERE id = ?", [room_id], (err, results) => {
    if (err) return res.status(500).json({ error: "Database error", details: err });
    if (results.length === 0) return res.status(404).json({ message: "Room not found" });

    const room = results[0];
    const availableAC = parseInt(room.ac_count || 0, 10);
    const availableNonAC = parseInt(room.non_ac_count || 0, 10);
    const acPrice = parseFloat(room.ac_price || 0);
    const nonAcPrice = parseFloat(room.non_ac_price || 0);

    if (acRequested > availableAC) {
      return res.status(400).json({ message: `Not enough AC rooms available. Available: ${availableAC}` });
    }
    if (nonAcRequested > availableNonAC) {
      return res.status(400).json({ message: `Not enough Non-AC rooms available. Available: ${availableNonAC}` });
    }

    // calculate total price
    const total_price = (acRequested * acPrice + nonAcRequested * nonAcPrice) * nights;

    // insert booking
    const insertSql = `INSERT INTO bookings
      (room_id, name, email, mobile, checkin, checkout, ac_rooms, non_ac_rooms, nights, price_per_room_ac, price_per_room_non_ac, total_price)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const insertParams = [
      room_id,
      name,
      email,
      mobile,
      checkin,
      checkout,
      acRequested,
      nonAcRequested,
      nights,
      acPrice,
      nonAcPrice,
      total_price
    ];

    db.query(insertSql, insertParams, (err2, insertResult) => {
      if (err2) {
        console.error("Booking insert error:", err2);
        return res.status(500).json({ error: "Booking failed", details: err2 });
      }

      // update both counts in one query (subtract requested amounts)
      db.query(
        "UPDATE rooms SET ac_count = ac_count - ?, non_ac_count = non_ac_count - ? WHERE id = ?",
        [acRequested, nonAcRequested, room_id],
        (err3) => {
          if (err3) {
            console.error("Update rooms error:", err3);
            return res.status(500).json({ error: "Failed to update room availability", details: err3 });
          }

          // successful
          res.json({
            message: "Booking successful!",
            booking: {
              id: insertResult.insertId,
              room_id,
              name,
              email,
              mobile,
              checkin,
              checkout,
              ac_rooms: acRequested,
              non_ac_rooms: nonAcRequested,
              nights,
              price_per_room_ac: acPrice,
              price_per_room_non_ac: nonAcPrice,
              total_price
            }
          });
        }
      );
    });
  });
});

// GET /bookings - include ac/non-ac columns
app.get("/bookings", (req, res) => {
  db.query(
    `SELECT b.id, r.room_type, b.ac_rooms, b.non_ac_rooms, b.name, b.email, b.mobile,
            b.checkin, b.checkout, b.nights, b.price_per_room_ac, b.price_per_room_non_ac, b.total_price
     FROM bookings b
     JOIN rooms r ON b.room_id = r.id
     ORDER BY b.id DESC`,
    (err, result) => {
      if (err) return res.status(500).json({ error: "Database error", details: err });
      res.json(result);
    }
  );
});

const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
