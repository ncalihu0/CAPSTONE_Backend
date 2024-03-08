Server Buddy Backend

# Description
Server Buddy is the backend server for the Server Buddy application. It serves as the backbone for handling various functionalities including database operations, API integrations, and email services.

# Installation
To install the necessary dependencies, run the following command:

npm install

# Starting the Server
To start the server, run:

npm start

# Environment Variables
Ensure you have a .env file in the root directory with the following variables:

- Your MySQL database information:
- DB_HOST
- DB_USER
- DB_PASSWORD
- DB_NAME
- SENDGRID_API_KEY: Your SendGrid API key.

Note: Ensure the .env file is added to the .gitignore to prevent sensitive information from being exposed.

# Backend Testing
To run backend tests, execute:

npm test

# Usage
1. Basic Operation: The server starts on the specified port and serves API endpoints for the Server Buddy application.

2. Backend Texting: To utilize backend texting, follow these steps:
    - Comment out the import statement and from the let data variable all the way to HTML content.
    - Uncomment the const variables and module.exports.



