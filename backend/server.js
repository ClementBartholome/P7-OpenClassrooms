/* eslint-disable */

const http = require("http");
const app = require("./app");

// Normalize and validate the port number
const normalizePort = (val) => {
  const port = parseInt(val, 10); // Parse the port value as an integer

  if (isNaN(port)) {
    return val; // Return the original value if not a number
  }
  if (port >= 0) {
    return port; // Return the port if it's a valid number
  }
  return false; // Return false for invalid port values
};

const port = normalizePort(process.env.PORT || "4000"); // Get the port from environment variables or use 4000 as default
app.set("port", port); // Set the port in the express app

// Error handler for server startup errors
const errorHandler = (error) => {
  if (error.syscall !== "listen") {
    throw error; // Throw an error if the error is not related to listening
  }
  const address = server.address();
  const bind =
    typeof address === "string" ? `pipe ${address}` : `port: ${port}`;

  switch (error.code) {
    case "EACCES":
      console.error(`${bind} requires elevated privileges.`);
      process.exit(1);
      break;
    case "EADDRINUSE":
      console.error(`${bind} is already in use.`);
      process.exit(1);
      break;
    default:
      throw error;
  }
};

const server = http.createServer(app); // Create an HTTP server using the express app

server.on("error", errorHandler); // Handle errors during server startup
server.on("listening", () => {
  const address = server.address();
  const bind = typeof address === "string" ? `pipe ${address}` : `port ${port}`;
  console.log(`Listening on ${bind}`); // Log a message when the server is listening
});

server.listen(port); // Start the server and listen on the specified port
