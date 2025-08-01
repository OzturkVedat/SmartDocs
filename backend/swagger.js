const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "SmartDocs API",
      version: "1.0.0",
      description: "SmartDocs API Doc",
    },
    servers: [{ url: process.env.SERVER_URL || "http://localhost:5000" }],
  },
  apis: ["./routes/*.js"],
};

const specs = swaggerJsdoc(options);

module.exports = { swaggerUi, specs };
