# School Management API

This project is hosted at [https://school-manage-api.vercel.app/listSchools?latitude=40.4&longitude=32](https://school-manage-api.vercel.app/listSchools?latitude=40.4&longitude=32).

## Overview

This project implements a set of APIs for managing school data using Node.js, Express.js, and MySQL. The API allows users to add new schools and retrieve a list of schools sorted by their proximity to a user-specified location.

## Features

- **Add School API**: Adds new schools to the database with name, address, latitude, and longitude.
- **List Schools API**: Retrieves a list of all schools, sorted by their proximity to a given latitude and longitude using the [Haversine formula](https://en.wikipedia.org/wiki/Haversine_formula).

## Technologies Used

- **Node.js**: JavaScript runtime for building the server.
- **Express.js**: Framework for handling HTTP requests and routing.
- **MySQL**: Relational database for storing school data.
- **Zod**: Library for schema validation and data parsing.
- **dotenv**: For managing environment variables.

## Setup and Installation

1. **Clone the Repository**

   ```bash
   git clone https://github.com/YooShijin/school-manage-api.git
   cd school-manage-api
   ```

2. **Install the Dependecies**

   ```bash
   npm install
   ```

3. **Create a .env File**

   ```bash
   DB_HOST=<your-database-host>
   DB_USER=<your-database-username>
   DB_PASSWORD=<your-database-password>
   DB_NAME=<your-database-name>
   DB_PORT=<your-database-port>
   ```

4. **Start server**

   ```bash
   node index.js
   ```

## API Endpoints

### Add School

- **Endpoint**: `/addSchool`
- **Method**: `POST`
- **Description**: Adds a new school to the database.
- **Request Body**:

  ```json
  {
    "name": "School Name",
    "address": "School Address",
    "latitude": 0.0,
    "longitude": 0.0
  }
  ```

### List Schools

- **Endpoint**: `/listSchools`
- **Method**: `GET`
- **Description**: Retrieves and sorts a list of schools based on their proximity to the provided latitude and longitude.
- **Query Parameters**:
  - `latitude` (number): User's latitude.
  - `longitude` (number): User's longitude.
- **Example Request**: `/listSchools?latitude=40.730610&longitude=-73.935242`
