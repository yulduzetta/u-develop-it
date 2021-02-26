const express = require("express");
const db = require('./db/database');

const PORT = process.env.PORT || 5006;
const app = express();

// Remember that you don't have to specify index.js in the path 
// (e.g., ./routes/apiRoutes/index.js). 
// If the directory has an index.js file in it,
// Node.js will automatically look for it when requiring the directory.
const apiRoutes = require('./routes/apiRoutes');

// Expess middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use('/api', apiRoutes);

// Default response for any other request (Not Found) Catch all
app.use((req, res) => {
  res.status(404).end();
});

// Ensure Express.js server does not start before the connnectio
db.on("open", () => {
  app.listen(PORT, () => {
    console.log(`Server running on port: ${PORT}`);
  });
});
