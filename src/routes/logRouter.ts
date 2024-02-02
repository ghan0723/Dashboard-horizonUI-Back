import express, { Request, Response, Router } from "express";
import UserService from "../service/userService";
import IpCalcService from "../service/ipCalcService";
import LogService from "../service/logService";
import { weasel } from "../interface/log";

const router: Router = express.Router();
const userService: UserService = new UserService();
const ipCalcService = new IpCalcService();
const logService: LogService = new LogService();

router.get("/dashboard", (req: Request, res: Response) => {
  const select = req.query.select;
  const username = req.query.username;

  if (typeof username !== "string" && typeof select !== "string") {
    weasel.error(
      username,
      req.socket.remoteAddress,
      "Failed to load Dashboard Page. [Dashboard]"
    );
    res.send("error");
  }
  weasel.log(
    username,
    req.socket.remoteAddress,
    `The current Dashboard Page displays data on a ${select}. [Dashboard]`
  );
  res.send("success");
});

router.get("/tables", (req: Request, res: Response) => {
  const username = req.query.username;
  const contents = req.query.contents;
  const category = req.query.category;
  const search = req.query.search;

  if (typeof username !== "string" && typeof contents !== "string") {
    weasel.error(
      username,
      req.socket.remoteAddress,
      "Failed to load Data-Tables Page. [Data-Tables]"
    );
    res.send("error");
  }
  weasel.log(
    username,
    req.socket.remoteAddress,
    `The current Data-Tables Page displays data on a ${
      contents + " cate : " + category + " sear : " + search
    }. [Data-Tables]`
  );
  res.send("success");
});

router.get("/logout", (req: Request, res: Response) => {
  const username = req.query.username;

  if (typeof username !== "string") {
    weasel.error(
      username,
      req.socket.remoteAddress,
      "Failed to load LogOut. [LogOut]"
    );
    res.send("error");
  }
  weasel.log(
    username,
    req.socket.remoteAddress,
    `Success to LogOut ${username}. [LogOut]`
  );
  res.send("success");
});

router.get("/all", (req, res) => {
  logService.getYears().then((years) => {
    res.send(years);
  });
});

export = router;
