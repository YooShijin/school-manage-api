import express from "express";
import db from "./db.js";
import { z } from "zod";

const app = express();
app.use(express.json());

// SQL query to create the 'schools' table as per the requirement if it doesn't exist
const createTableQuery = `
  CREATE TABLE IF NOT EXISTS schools (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address VARCHAR(255) NOT NULL,
    latitude FLOAT NOT NULL,
    longitude FLOAT NOT NULL
  );
`;

// Function to create the table
const createSchoolsTable = () => {
  db.query(createTableQuery, (err) => {
    if (err) {
      console.error("Error creating schools table:", err);
    } else {
      console.log("Schools table created or already exists.");
    }
  });
};

// Call the function to create the table on app startup
// We only need to call the function once. If the table already exists, it won’t be created again.

createSchoolsTable();

// Zod schema for validating school data
const addSchoolSchema = z.object({
  name: z.string().min(1, "Name is required"),
  address: z.string().min(1, "Address is required"),
  latitude: z
    .number()
    .refine(
      (val) => val >= -90 && val <= 90,
      "Latitude must be between -90 and 90"
    ),
  longitude: z
    .number()
    .refine(
      (val) => val >= -180 && val <= 180,
      "Longitude must be between -180 and 180"
    ),
});

app.post("/addSchool", (req, res) => {
  const validation = addSchoolSchema.safeParse(req.body);

  if (!validation.success) {
    return res.status(400).json({ errors: validation.error.errors });
  }

  const { name, address, latitude, longitude } = validation.data;

  const query =
    "INSERT INTO schools (name, address, latitude, longitude) VALUES (?, ?, ?, ?)";
  db.query(query, [name, address, latitude, longitude], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Failed to add school" });
    }
    res.status(201).json({
      message: "School added successfully",
      schoolId: results.insertId,
    });
  });
});

// Schema for validating latitude and longitude
const listSchoolsSchema = z.object({
  latitude: z.coerce
    .number()
    .refine(
      (val) => val >= -90 && val <= 90,
      "Latitude must be between -90 and 90"
    ),
  longitude: z.coerce
    .number()
    .refine(
      (val) => val >= -180 && val <= 180,
      "Longitude must be between -180 and 180"
    ),
});

// Method 1 : This method includes the Haversine formula in the SQL query to calculate and sort distances between the user’s location and the schools. It uses the database’s power to handle large amounts of data efficiently, making it faster for bigger datasets.

// For more details on the Haversine formula and its application, visit: https://en.wikipedia.org/wiki/Haversine_formula

const R = 6371; // Radius of the Earth in kilometers
app.get("/listSchools", (req, res) => {
  const validation = listSchoolsSchema.safeParse(req.query);

  if (!validation.success) {
    return res.status(400).json({ errors: validation.error.errors });
  }

  const { latitude, longitude } = validation.data;

  // Calculate distances and order schools in the SQL query
  const query = `
    SELECT *,
      (${R} * ACOS(
        COS(RADIANS(${latitude})) * COS(RADIANS(schools.latitude)) *
        COS(RADIANS(schools.longitude) - RADIANS(${longitude})) +
        SIN(RADIANS(${latitude})) * SIN(RADIANS(schools.latitude))
      )) AS distance
    FROM schools
    ORDER BY distance;
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Failed to fetch schools" });
    }

    res.json(results);
  });
});

// Method 2: This approach fetches all school records from the database and calculates distances using JavaScript. Sorting is then performed in-memory based on these distances. It is suitable for smaller datasets but can become inefficient with larger amounts of data.

/*
app.get("/listSchools", (req, res) => {
  const validation = listSchoolsSchema.safeParse(req.query);

  if (!validation.success) {
    return res.status(400).json({ errors: validation.error.errors });
  }

  const { latitude, longitude } = validation.data;

  const query = "SELECT * FROM schools";
  db.query(query, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Failed to fetch schools" });
    }

    // Calculate distances and sort schools
    const schoolsWithDistance = results.map((school) => {
      const distance = calculateDistance(
        latitude,
        longitude,
        school.latitude,
        school.longitude
      );
      return { ...school, distance };
    });

    schoolsWithDistance.sort((a, b) => a.distance - b.distance);

    res.json(schoolsWithDistance);
  });
});

// Haversine formula to calculate distance between two points

function calculateDistance(lat1, lon1, lat2, lon2) {
  const dLat = degToRad(lat2 - lat1);
  const dLon = degToRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(degToRad(lat1)) *
      Math.cos(degToRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in kilometers
}

// Helper function to convert degrees to radians

function degToRad(deg) {
  return deg * (Math.PI / 180);
}
  */

// Route to fetch all schools without any  conditions
app.get("/listSchoolsById", (req, res) => {
  const query = "SELECT * FROM schools";

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching schools:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    res.status(200).json(results);
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
