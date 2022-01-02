const express = require("express");

const app = express();

const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.status(200).send({
    Hello: "Namaste",
  });
});

app.listen(PORT, () => console.log(`Server up and running at ${PORT}`));
