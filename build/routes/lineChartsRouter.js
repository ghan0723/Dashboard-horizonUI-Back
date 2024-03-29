"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const db_1 = __importDefault(require("../db/db"));
const lineChartsService_1 = __importDefault(require("../service/lineChartsService"));
const userService_1 = __importDefault(require("../service/userService"));
const ipCalcService_1 = __importDefault(require("../service/ipCalcService"));
const router = express_1.default.Router();
const lineChartsService = new lineChartsService_1.default(db_1.default);
const userService = new userService_1.default();
const ipCalcService = new ipCalcService_1.default();
router.get('/', (req, res) => {
    const select = req.query.select; // 일/주/월
    const username = req.query.username; // 로그인 된 사용자
    const outlookFlag = req.query.outlookFlag; // outlook 사용
    let ipRanges;
    userService.getPrivilegeAndIP(username)
        .then(result => {
        let results;
        if (result.length === 0) {
            return res.status(500).send();
        }
        ipRanges = ipCalcService_1.default.parseIPRange(result[0].ip_ranges);
        switch (select) {
            // 일
            case 'day':
                results = lineChartsService.getTablesDayData(ipRanges, outlookFlag);
                break;
            // 월
            case 'month':
                results = lineChartsService.getTablesMonthData(ipRanges, outlookFlag);
                break;
            // 주
            default:
                results = lineChartsService.getTablesWeekData(ipRanges, outlookFlag);
                break;
        }
        results
            .then((data) => {
            res.status(200).send(data);
        })
            .catch(() => {
            res.status(500).send("Data Send Error");
        });
    });
});
module.exports = router;
