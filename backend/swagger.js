const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const path = require("path");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "SmartDocs API",
      version: "1.0.0",
      description: "SmartDocs API Doc",
    },
    servers: [{ url: process.env.SERVER_URL || "http://localhost:5000" }],

    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  apis: [path.join(__dirname, "routes", "*.js")],
};

const specs = swaggerJsdoc(options);

module.exports = { swaggerUi, specs };
