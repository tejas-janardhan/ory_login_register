import "dotenv/config";
import express from "express";
import path from "path";
import { homeRouter, loginRouter, registerRouter } from "./routes";
const app = express();

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.json());
app.use("/static", express.static(path.join(__dirname, "assets")));
app.use(loginRouter);
app.use(registerRouter);
app.use(homeRouter);

app.listen(process.env.PORT, () => {
  console.info(`Server running at PORT - ${process.env.PORT}`);
});
