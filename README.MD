# Event Management API

This project is an **Event Management API** built with **Express.js** and **Node.js**. It provides a robust backend framework for managing events and their participants. The API supports various features commonly required for event management applications, such as:

- Creating, updating, and deleting events
- Managing participant lists for events
- Validating participant information, including unique email addresses
- Supporting RSVP status updates for participants

With these features, the API enables seamless integration for applications that need to manage event data, handle participant lists, and enforce data consistency with real-time validation.

---

# Project Setup Guide

This guide provides detailed steps to set up and run this Express.js application in development mode. Follow each step carefully to ensure proper configuration and execution of the application.

---

### Prerequisites

Before running this codebase, ensure you have the following prerequisites:

1. **MySQL Database Server**

   - Make sure a MySQL server is installed and running on your system.
   - A MySQL database should be created for this project.

2. **Database Credentials**
   - You need to provide valid MySQL credentials in the `.env` file located in the project’s root directory. See `.env.backup` as a reference for setting up the required environment variables.

---

### Steps to Set Up and Run the Application

1. **Clone the Repository**  
   Begin by cloning this repository to your local system:

   ```bash
   git clone <repository-url>

   ```

2. **Create Environment Configuration (.env)**  
   In the project’s root directory, create a new file named .env.

   Copy the environment variables from .env.backup into your .env file and modify the database credentials as needed.

   Note: The .env.backup file provides a sample structure for the required environment variables, including placeholders for database credentials.

   Following is the sample example of content to be present in .env file:
   (NOTE: Please replace the values as per your database credentials)

   DB_USERNAME=root
   DB_PASSWORD=password
   DB_DATABASE=event_scheduler
   DB_HOST=127.0.0.1
   DB_DIALECT=mysql

3. **Install Dependencies**  
   Install all necessary packages by running the following command:

   ```bash
   npm install

   ```

4. **Run the Application in Development Mode**  
   Start the application in development mode with:

   ```bash
   npm run dev

   This command uses nodemon to automatically reload the server when changes are made.
   ```

5. **POSTMAN COLLECTION**
   For more details about api endpoints, the postman collection is located at following path from the root folder of this codebase/repo:

   ./postman/EventManagementSystemAPI.postman_collection.json

   - download this json file and import this collection in your POSTMAN , then you will be able to see the api list and try them hitting after starting the project/server in the development mode.

### Additional Notes

    Environment Variables: The .env file should include keys and values for all required settings, particularly the database connection details (DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, etc.).

    Database Connection: Ensure that your MySQL server is running, and the database credentials in .env match the configuration in your MySQL setup.

By following these steps, you should be able to run the application in a local development environment. For additional troubleshooting or advanced configuration, refer to the project documentation or reach out to the project maintainers.

**POSTMAN COLLECTION**
For more details about api endpoints, the postman collection is located at following path from the root folder of this codebase/repo:

    ./postman/EventManagementSystemAPI.postman_collection.json

    - download this json file and import this collection in your POSTMAN , then you will be able to see the api list and try them hitting after starting the project/server in the development mode.

    Just for highlevel, the sample API lists are:

    1. http://localhost:3000/events/create
       POST

    2. http://localhost:3000/events/events-by-user-email
      POST

    3. http://localhost:3000/events/1
      GET

    4. http://localhost:3000/events
       GET

    5. http://localhost:3000/events/1/rsvp
       POST

    6. http://localhost:3000/events/1
       PUT

    7. http://localhost:3000/events/1/delete
       PUT

    8. http://localhost:3000/
      GET
