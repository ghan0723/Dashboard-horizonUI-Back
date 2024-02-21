import ComplexService from "../service/complexService";
import Average from "../analysis/average";
import express, { Request, Response, Router } from "express";
import KeywordService from "../service/keywordService";
import Analysis from "../service/analysisService";

const router: Router = express.Router();
const average: Average = new Average();
const analysis: Analysis = new Analysis();
const complexService: ComplexService = new ComplexService();
const keywordService: KeywordService = new KeywordService();

router.get("/average", (req: Request, res: Response) => {
  complexService
    .getAllData()
    .then((result) => {
      average.analyzeLeaks(result);
      res.send("바위");
    })
    .catch((error) => {
      console.log("실패...");
    });
});

// keywordList
router.get("/keywordList", (req: Request, res: Response) => {
  keywordService
    .getKeywordList()
    .then((result) => {
      res.send(result);
    })
    .catch((error) => {
      console.log(error);
    });
});

router.post("/select", (req: Request, res: Response) => {
  const startDate = req.body.startDate;
  const endDate = req.body.endDate;

  analysis.settingDateAndRange(startDate, endDate).then((result) => {
    const averageResult = average.analyzeLeaks(result);
    res.send(averageResult);
  });
});



export = router;
