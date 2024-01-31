"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
class NetworkService {
    constructor(connection) {
        this.columnAlias = {
            // alias    table명
            id: "id", // 0
            Accurancy: "accuracy", // 1
            Time: "time", // 2
            PcName: "pcname", // 3
            Agent_ip: "agent_ip", // 4
            SrcIp: "src_ip", // 5
            SrcPort: "src_port", // 6
            DstIp: "dst_ip", // 7
            DstPort: "dst_port", // 8
            Process: "process", // 9
            PIDs: "pid", // 10
            SrcFile: "src_file", // 11
            DownLoad: "saved_file", // 12
            ScreenShot: "saved_file", // 13
            FileSizes: "file_size", // 14
            Keywords: "keywords", // 15
            DestFiles: "dst_file", // 16
        };
        this.connection = connection;
    }
    // Dashboard 일/주/월 건수
    getCountAll(select, ipRanges) {
        let dayOption1;
        let dayOption2;
        if (select === "day") {
            dayOption1 = "CURDATE(), INTERVAL 0 DAY";
            dayOption2 = "CURDATE(), INTERVAL 1 DAY";
        }
        else if (select === "week") {
            dayOption1 = "CURDATE(), INTERVAL 1 WEEK";
            dayOption2 = "CURDATE(), INTERVAL 2 WEEK";
        }
        else {
            dayOption1 = "CURDATE(), INTERVAL 1 MONTH";
            dayOption2 = "CURDATE(), INTERVAL 2 MONTH";
        }
        // IP 범위 조건들을 생성
        const ipConditions = ipRanges
            .map((range) => `(INET_ATON(agent_ip) BETWEEN INET_ATON('${range.start}') AND INET_ATON('${range.end}'))`)
            .join(" OR ");
        return new Promise((resolve, reject) => {
            const query3 = `SELECT COUNT(*) as allfiles FROM detectfiles WHERE time >= DATE_SUB(${dayOption1}) AND (${ipConditions})`;
            const query4 = `SELECT COUNT(*) as beforefiles FROM detectfiles WHERE time >= DATE_SUB(${dayOption2}) AND time < DATE_SUB(${dayOption1}) AND (${ipConditions})`;
            Promise.all([
                new Promise((innerResolve, innerReject) => {
                    this.connection.query(query3, (error, result) => {
                        if (error) {
                            innerReject(error);
                        }
                        else {
                            this.query1 = result[0].allfiles;
                            innerResolve(); // 빈 인수로 호출
                        }
                    });
                }),
                new Promise((innerResolve, innerReject) => {
                    this.connection.query(query4, (error, result) => {
                        if (error) {
                            innerReject(error);
                        }
                        else {
                            this.query2 = result[0].beforefiles;
                            innerResolve(); // 빈 인수로 호출
                        }
                    });
                }),
            ])
                .then(() => {
                resolve({
                    allfiles: this.query1,
                    beforefiles: this.query2 !== 0
                        ? (((this.query1 - this.query2) / this.query2) * 100).toFixed(2)
                        : ((this.query1 / 1) * 100).toFixed(2),
                });
            })
                .catch((error) => {
                reject(error);
            });
        });
    }
    // 송신탐지내역 테이블
    getApiData(page, pageSize, sorting, desc, category, search, ipRanges, grade) {
        let queryPage = 0;
        let queryPageSize = 0;
        let querySorting = sorting === "" ? "time" : sorting;
        let queryDesc = desc === "false" ? "asc" : "desc";
        let whereClause = "";
        const aliasKey = Object.keys(this.columnAlias);
        const convertColumns = category !== "" && this.columnAlias[category];
        if (page !== undefined) {
            queryPage = Number(page);
        }
        if (pageSize !== undefined) {
            queryPageSize = Number(pageSize);
        }
        if (sorting === "" && desc === "") {
            sorting = "time";
            desc = "desc";
        }
        // IP 범위 조건들을 생성
        const ipConditions = ipRanges
            .map((range) => `(INET_ATON(agent_ip) BETWEEN INET_ATON('${range.start}') AND INET_ATON('${range.end}'))`)
            .join(" OR ");
        if (search !== "") {
            if (convertColumns === 'accuracy') {
                if (/(정|탐|정탐)/i.test(search)) {
                    whereClause = `where ${convertColumns} = '100' AND (${ipConditions})`;
                }
                else if (/(확|인|필|요|확인|인필|필요|확인필|인필요|확인필요)/i.test(search)) {
                    whereClause = `where ${convertColumns} != '100' AND (${ipConditions})`;
                }
                else {
                    whereClause = `where ${convertColumns} > '100' AND (${ipConditions})`;
                }
            }
            else {
                whereClause = `where ${convertColumns} like ? AND (${ipConditions})`;
            }
        }
        else {
            whereClause = `where ${ipConditions}`;
        }
        return new Promise((resolve, reject) => {
            const queryStr = grade !== 3 ?
                `select id, accuracy as ${aliasKey[1]}, time as ${aliasKey[2]}, pcname as ${aliasKey[3]}, agent_ip as ${aliasKey[4]}, src_ip as ${aliasKey[5]}, ` +
                    `src_port as ${aliasKey[6]}, dst_ip as ${aliasKey[7]}, dst_port as ${aliasKey[8]}, process as ${aliasKey[9]}, ` +
                    `pid as ${aliasKey[10]}, src_file as ${aliasKey[11]}, ` +
                    `saved_file as ${aliasKey[12]}, saved_file as ${aliasKey[13]}, ` +
                    `keywords as ${aliasKey[15]}, dst_file as ${aliasKey[16]} `
                :
                    `select id, accuracy as ${aliasKey[1]}, time as ${aliasKey[2]}, pcname as ${aliasKey[3]}, agent_ip as ${aliasKey[4]}, src_ip as ${aliasKey[5]}, ` +
                        `src_port as ${aliasKey[6]}, dst_ip as ${aliasKey[7]}, dst_port as ${aliasKey[8]}, process as ${aliasKey[9]}, ` +
                        `pid as ${aliasKey[10]}, src_file as ${aliasKey[11]}, ` +
                        `keywords as ${aliasKey[15]}, dst_file as ${aliasKey[16]} `;
            const query = queryStr +
                "from detectfiles " +
                whereClause +
                " order by " +
                querySorting +
                " " +
                queryDesc +
                " " +
                "LIMIT " +
                queryPageSize +
                " offset " +
                queryPage * queryPageSize;
            const query2 = "select count(*) as count from detectfiles " + whereClause;
            const whereQuery = "%" + search + "%";
            Promise.all([
                new Promise((innerResolve, innerReject) => {
                    this.connection.query(query, whereQuery, (error, result) => {
                        const excludedKeys = ['DownLoad', 'ScreenShot'];
                        const filteredKeys = grade !== 3 ? aliasKey : aliasKey.filter(key => !excludedKeys.includes(key));
                        // 검색 결과가 없을 경우의 처리
                        if (result.length === 0) {
                            result[0] = filteredKeys.reduce((obj, key) => {
                                obj[key] = "";
                                return obj;
                            }, {});
                        }
                        if (error) {
                            innerReject(error);
                        }
                        else {
                            innerResolve(result); // 빈 인수로 호출
                        }
                    });
                }),
                new Promise((innerResolve, innerReject) => {
                    this.connection.query(query2, whereQuery, (error, result) => {
                        if (result[0].count === 0) {
                            result[0].count = 1;
                        }
                        if (error) {
                            innerReject(error);
                        }
                        else {
                            innerResolve(result); // 빈 인수로 호출
                        }
                    });
                }),
            ])
                .then((values) => {
                resolve(values);
            })
                .catch((error) => {
                return reject(error);
            });
        });
    }
    // 송신탐지내역 테이블 데이터 삭제
    postRemoveData(body) {
        // 이 부분에서 배열을 문자열로 변환할 때 각 값에 작은따옴표를 추가하는 방식으로 수정
        const idString = body.map((id) => `'${id}'`).join(", ");
        const query = `DELETE FROM detectfiles WHERE id IN (${idString})`;
        return new Promise((resolve, reject) => {
            this.connection.query(query, (error, result) => {
                if (error) {
                    console.log("삭제하다가 사고남");
                    reject(error);
                }
                else {
                    console.log("삭제 성공");
                    resolve(result);
                }
            });
        });
    }
    // DummyData 생성
    getDummyData(count) {
        return __awaiter(this, void 0, void 0, function* () {
            const date = new Date();
            let queryDay;
            let queryMonth;
            let queryDayStr;
            let queryMonthStr;
            let queryYearStr;
            for (let i = 0; i < count; i++) {
                let accuracy = i % 3 === 0 ? 100 : 0;
                // 날짜 계산
                date.setDate(date.getDate() - 1);
                if (date.getDate() === 0)
                    date.setDate(0);
                queryDay = date.getDate();
                queryMonth = date.getMonth() + 1;
                queryYearStr = date.getFullYear().toString();
                if (queryDay < 10) {
                    queryDayStr = "0" + queryDay;
                }
                else {
                    queryDayStr = queryDay.toString();
                }
                if (queryMonth < 10) {
                    queryMonthStr = "0" + queryMonth;
                }
                else {
                    queryMonthStr = queryMonth.toString();
                }
                const query = `INSERT INTO detectfiles (
        time,
        pcname,
        process,
        pid,
        agent_ip,
        src_ip,
        src_port,
        dst_ip,
        dst_port,
        src_file,
        down_state,
        scrshot_downloaded,
        file_size,
        keywords,
        dst_file,
        saved_file,
        accuracy,
        evCO,
        evFA,
        evSA,
        isprinted,
        asked_file
      ) VALUES (
        '${queryYearStr}-${queryMonthStr}-${queryDayStr} 15:00:29',
        'PCName${count}',
        'Process${count}',
        '123456',
        '10.10.10.126',
        '192.168.1.1',
        '12345',
        '192.168.1.3',
        '54321',
        'path/to/source/file.txt',
        'YES',
        'YES',
        '123456789',
        'Keyword1, Keyword2, Keyword3',
        'path/to/destination/file.txt',
        'path/to/saved/file.txt',
        ${accuracy},
        'EventCO',
        'EventFA',
        'EventSA',
        1,
        1 
      );`;
                try {
                    const result = yield new Promise((resolve, reject) => {
                        this.connection.query(query, (error, result) => {
                            if (error) {
                                console.log("getDummyData 에러 발생");
                                reject(error);
                            }
                            else {
                                console.log("데이터 삽입 성공");
                                resolve(result);
                                // console.log('result : ', result);
                            }
                        });
                    });
                    console.log(`데이터 삽입 ${i + 1}번째 성공`);
                }
                catch (error) {
                    console.log(`데이터 삽입 ${i + 1}번째 실패: ${error}`);
                }
            }
        });
    }
}
exports.default = NetworkService;
