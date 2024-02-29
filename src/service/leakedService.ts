import connection from "../db/db";
import { IpRange } from "../interface/interface";

class LeakedService {
  getApiData(page: any, pageSize: any, sorting: any, desc: any, category: any, search: any, ipRanges: IpRange[], excelCheck:boolean): Promise<any> {
    let queryPage: number = 0;
    let queryPageSize: number = 0;
    let querySorting: string = sorting === "" ? "time" : sorting;
    let queryDesc: string = desc === "false" ? "asc" : "desc";
    let whereClause = "";

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
    const ipConditions = ipRanges.map((range) => `(INET_ATON(latest_agent_ip) BETWEEN INET_ATON('${range.start}') AND INET_ATON('${range.end}'))`).join(" OR ");

    if (search !== "") {
      whereClause = `where ${category} like ? AND (${ipConditions})`;
    } else {
      whereClause = `where ${ipConditions}`;
    }

    return new Promise((resolve, reject) => {
      const query =
        "select time, pc_name, latest_agent_ip " +
        // "select * " +
        "from agentinfo " +
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

      const query2 = "select count(*) as count from agentinfo " + whereClause;
      const whereQuery = "%" + search + "%";

      Promise.all([
        new Promise<void>((innerResolve, innerReject) => {
          connection.query(query, whereQuery, (error, result) => {
            
            // 검색 결과가 없을 경우의 처리
            if (result.length === 0) {
              result[0] = { time: "", pc_name: "", latest_agent_ip: "" };
            }
            if (error) {
              innerReject(error);
            } else {
              if(excelCheck) {
                for(let i=0; i < result.length; i++) {
                  result[i]['업데이트 시각'] = result[i]['time'];
                  delete result[i].time;
                  result[i]['PC명'] = result[i]['pc_name'];
                  delete result[i].pc_name;
                  result[i]['AGENT IP'] = result[i]['latest_agent_ip'];
                  delete result[i].latest_agent_ip;
                }
              }
              innerResolve(result); // 빈 인수로 호출
            }
          });
        }),
        new Promise<void>((innerResolve, innerReject) => {
          connection.query(query2, whereQuery, (error, result) => {
            if (result[0].count === 0) {
              result[0].count = 1;
            }
            if (error) {
              innerReject(error);
            } else {
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

  // DummyData 생성
  async getDummyData(count: any) {
    const date = new Date();
    let queryDay: number;
    let queryMonth: number;
    let queryDayStr: string;
    let queryMonthStr: string;
    let queryYearStr: string;
    let agentIp;

    for (let i = 0; i < count; i++) {
      if (i % 3 === 0) {
        agentIp = "10.10.10.157";
      } else if (i % 3 === 1) {
        agentIp = "192.168.1.55";
      } else {
        agentIp = "10.10.10.127";
      }

      // 날짜 계산
      date.setDate(date.getDate() - 1);
      if (date.getDate() === 0) date.setDate(0);

      queryDay = date.getDate();
      queryMonth = date.getMonth() + 1;
      queryYearStr = date.getFullYear().toString();

      if (queryDay < 10) {
        queryDayStr = "0" + queryDay;
      } else {
        queryDayStr = queryDay.toString();
      }

      if (queryMonth < 10) {
        queryMonthStr = "0" + queryMonth;
      } else {
        queryMonthStr = queryMonth.toString();
      }

      const query = `insert into	agentinfo (
        pc_guid,
        time,
        pc_name,
        latest_agent_ip)
    values (
    'PCGUID${i + 1}',
    now(),
    'PCname${i + 1}',
    '${agentIp}');`;

      try {
        const result = await new Promise((resolve, reject) => {
          connection.query(query, (error, result) => {
            if (error) {
              console.log("getDummyData 에러 발생");
              reject(error);
            } else {
              console.log("데이터 삽입 성공");
              resolve(result);
              console.log('result : ', result);
            }
          });
        });

        console.log(`데이터 삽입 ${i + 1}번째 성공`);
      } catch (error) {
        console.log(`데이터 삽입 ${i + 1}번째 실패: ${error}`);
      }
    }
  }
}

export default LeakedService;
