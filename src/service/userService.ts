import { IpRange } from "../interface/interface";
import connection from "../db/db";

class UserService {
  getLogin(username: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const query =
        "SELECT username, passwd, grade, mng_ip_ranges FROM userlist WHERE username = ?";
      connection.query(query, [username], (error, results) => {
        if (error) {
          reject(error);
        } else {
          resolve(results);
        }
      });
    });
  }

  getUserList(grade: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const query = `select username, grade, enabled, mng_ip_ranges from userlist where grade > ${grade}`;
      connection.query(query, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });
  }
  addUser(user: {
    username: string;
    passwd: any;
    grade: string;
    mng_ip_ranges: string;
  }): Promise<any> {
    let mngip = user.mng_ip_ranges.replace(/(\r\n|\n|\r)/gm, ", ");
    let grade: number = parseInt(user.grade, 10);
    return new Promise(async (resolve, reject) => {
      const query = `insert into userlist (\`username\`, \`passwd\`, \`grade\`, \`enabled\`, \`mng_ip_ranges\`) values ('${user.username}', '${user.passwd}', ${grade}, 1, '${mngip}')`;
      connection.query(query, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve({ success: true, message: "회원 가입 성공" });
        }
      });
    });
  }

  removeUser(users: string[]): Promise<any> {
    // 이 부분에서 배열을 문자열로 변환할 때 각 값에 작은따옴표를 추가하는 방식으로 수정
    const usernameString = users.map((username) => `'${username}'`).join(", ");

    // IN 절을 괄호로 감싸고 수정
    const query = `DELETE FROM userlist WHERE username IN (${usernameString})`;

    return new Promise((resolve, reject) => {
      connection.query(query, (error, result) => {
        if (error) {
          console.log("삭제하다가 사고남");
          reject(error);
        } else {
          console.log("삭제 성공");
          resolve(result);
        }
      });
    });
  }

  getUser(username: string): Promise<any> {
    const query = `select username, passwd, grade, mng_ip_ranges from userlist where username = ? `;

    return new Promise((resolve, reject) => {
      connection.query(query, username, (error, result) => {
        if (error) {
          console.log("업데이트 가져오다가 사고남");
          reject(error);
        } else {
          resolve(result);
        }
      });
    });
  }

  modUser(
    user: {
      username: string;
      passwd: string;
      grade: string;
      mng_ip_ranges: string;
    },
    oldname: string
  ): Promise<any> {
    let mngip = user.mng_ip_ranges.replace(/(\r\n|\n|\r)/gm, ", ");
    let grade: number = parseInt(user.grade, 10);
    const query = `UPDATE userlist SET username = '${user.username}', passwd = '${user.passwd}', grade = ${grade}, mng_ip_ranges = '${mngip}' WHERE username = '${oldname}'`;

    return new Promise((resolve, reject) => {
      connection.query(query, (error, result) => {
        if (error) {
          console.log("데이터 업데이트 중 오류 발생");
          reject(error);
        } else {
          console.log("데이터가 성공적으로 업데이트되었습니다.");
          resolve(result);
        }
      });
    });
  }

  getGrade(username: string): Promise<any> {
    const query = `select grade from userlist where username = ? `;

    return new Promise((resolve, reject) => {
      connection.query(query, username, (error, result) => {
        if (error) {
          console.log("grade 가져오다가 사고남");
          reject(error);
        } else {
          resolve(result);
        }
      });
    });
  }

  getGradeAndMngip(username: any): Promise<any> {
    const query = `select grade, mng_ip_ranges from userlist where username = ? `;

    return new Promise((resolve, reject) => {
      connection.query(query, username, (error, result) => {
        if (error) {
          console.log("grade 가져오다가 사고남");
          reject(error);
        } else {
          resolve(result);
        }
      });
    });
  }

  getUserListByGradeAndMngip(
    grade: any,
    ipRanges: IpRange[],
    category: any,
    searchWord: any
  ): Promise<any> {
    let searchCondition = "";
    console.log("grade : ", grade);
    if (searchWord !== "" && category !== "") {
      // 여기에서 category에 따라 적절한 검색 조건을 추가합니다.
      switch (category) {
        case "username":
          searchCondition = `where username LIKE '%${searchWord}%'`;
          break;
        // 다른 카테고리에 대한 추가적인 case문을 필요에 따라 추가한다.
        case "grade":
          if (
            /(영역별\s*관리자|영역|영|역|별|관|리|자|관리|관리자|리자|자|리|다)/i.test(
              searchWord
            )
          ) {
            searchCondition = "where grade = 2";
          } else if (/(모니터|모|모니|니|니터|터|모터)/i.test(searchWord)) {
            searchCondition = `where grade = 3`;
          } else {
            searchCondition = `where grade = '${searchWord}'`;
          }
          break;
        case "enabled":
          if (/(켜짐|켜)/i.test(searchWord)) {
            searchCondition = `where enabled = 1`;
          } else if (/(꺼짐|꺼)/i.test(searchWord)) {
            searchCondition = `where enabled = 0`;
          } else {
            searchCondition = `where enabled = '${searchWord}'`;
          }
          break;
        case "mng_ip_ranges":
          searchCondition = `where mng_ip_ranges LIKE '%${searchWord}%'`;
        default:
          break;
      }
    }
    // IP 범위 조건들을 생성
    const ipConditions = ipRanges
      .map(
        (range) =>
          `(INET_ATON(mng_ip_ranges) BETWEEN INET_ATON('${range.start}') AND INET_ATON('${range.end}'))`
      )
      .join(" OR ");

    // SQL 쿼리 생성
    const query = `
        SELECT username, grade, enabled, mng_ip_ranges FROM userlist WHERE grade > ${grade} AND (${ipConditions}) 
      `;
    return new Promise((resolve, reject) => {
      const query2 = `select username, grade, enabled, mng_ip_ranges from (${query}) AS userTable ${searchCondition}`;
      // 쿼리 실행
      connection.query(query2, (error, result) => {
        if (error) {
          reject(error);
        } else {
          if (grade !== 3) {
            resolve(result);
          } else {
            reject("error");
          }
        }
      });
    });
  }

  getUserListAll(category: any, searchWord: any): Promise<any> {
    let searchCondition = "grade > 1";

    if (searchWord !== "" && category !== "") {
      // 여기에서 category에 따라 적절한 검색 조건을 추가합니다.
      switch (category) {
        case "username":
          searchCondition += ` AND username LIKE '%${searchWord}%'`;
          break;
        // 다른 카테고리에 대한 추가적인 case문을 필요에 따라 추가한다.
        case "grade":
          if (
            /(영역별\s*관리자|영역|영|역|별|관|리|자|관리|관리자|리자|자|리|다)/i.test(
              searchWord
            )
          ) {
            searchCondition += " AND grade = 2";
          } else if (/(모니터|모|모니|니|니터|터|모터)/i.test(searchWord)) {
            searchCondition += ` AND grade = 3`;
          } else {
            searchCondition += ` AND grade = '${searchWord}'`;
          }
          break;
        case "enabled":
          if (/(켜짐|켜)/i.test(searchWord)) {
            searchCondition += ` AND enabled = 1`;
          } else if (/(꺼짐|꺼)/i.test(searchWord)) {
            searchCondition += ` AND enabled = 0`;
          } else {
            searchCondition += ` AND enabled = '${searchWord}'`;
          }
          break;
        case "mng_ip_ranges":
          searchCondition += ` AND mng_ip_ranges LIKE '%${searchWord}%'`;
        default:
          break;
      }
    }

    return new Promise((resolve, reject) => {
      const query = `select username, grade, enabled, mng_ip_ranges from userlist where ${searchCondition}`;
      connection.query(query, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });
  }

  checkUsername(username: any, oldname?: any): Promise<any> {
    return new Promise((resolve, reject) => {
      if (username !== oldname) {
        const query =
          "SELECT COUNT(*) as count FROM userlist WHERE username = ?";
        connection.query(query, [username], (error, result) => {
          if (error) {
            reject(error);
          } else {
            const isDuplicate = result[0].count > 0;
            if (isDuplicate) {
              resolve({
                exists: true,
                message: "이미 사용 중인 계정명입니다.",
              });
            } else {
              resolve({ exists: false, message: "사용 가능한 계정명입니다." });
            }
          }
        });
      } else {
        resolve({ exists: false, message: "현재 계정명과 동일합니다." });
      }
    });
  }

  checkIpRange(mng_ip: string, ipRanges: IpRange[]): Promise<any> {
    return new Promise((resolve, reject) => {
      const ipToCheck = this.ipToNumber(mng_ip);

      const isInRange = ipRanges.some(
        (range) =>
          ipToCheck >= this.ipToNumber(range.start) &&
          ipToCheck <= this.ipToNumber(range.end)
      );

      if (isInRange) {
        resolve({
          inRange: true,
          message: "IP 주소가 허용된 범위 내에 있습니다.",
        });
      } else {
        resolve({
          inRange: false,
          message: "IP 주소가 허용된 범위에 속하지 않습니다.",
        });
      }
    });
  }

  ipToNumber(ip: string): number {
    if (typeof ip === "string" && /^\d+\.\d+\.\d+\.\d+$/.test(ip)) {
      const ipParts: number[] = ip.split(".").map(Number);

      if (
        ipParts.length === 4 &&
        ipParts.every((part) => part >= 0 && part <= 255)
      ) {
        return (
          (ipParts[0] << 24) |
          (ipParts[1] << 16) |
          (ipParts[2] << 8) |
          ipParts[3]
        );
      } else {
        throw new Error("올바르지 않은 IP 주소 형식입니다.");
      }
    } else {
      throw new Error("올바르지 않은 IP 형식입니다.");
    }
  }

  checkPwdFreq(username: any): Promise<boolean> {
    const query = `SELECT last_pwd_date, pwd_change_freq FROM userlist WHERE username = ?`;

    return new Promise((resolve, reject) => {
      connection.query(query, [username], (error, result) => {
        if (error) {
          reject(error.fatal);
        } else {
          if (result.length > 0) {
            const lastPwdDate = new Date(result[0].last_pwd_date);
            const pwdChangeFreq = result[0].pwd_change_freq;

            // 비밀번호 변경 주기를 날짜로 계산
            const nextChangeDate = new Date(lastPwdDate);
            nextChangeDate.setMonth(nextChangeDate.getMonth() + pwdChangeFreq);

            // 현재 날짜와 다음 변경 날짜를 비교
            const currentDate = new Date();

            if (currentDate > nextChangeDate) {
              // 현재 날짜가 다음 변경 날짜를 넘었으면 true 반환
              resolve(true);
            } else {
              // 현재 날짜가 다음 변경 날짜를 넘지 않았으면 false 반환
              resolve(false);
            }
          } else {
            // 해당 username의 레코드가 없는 경우도 처리할 수 있습니다.
            reject("User not found");
          }
        }
      });
    });
  }

  getPwdByUsername(username:any):Promise<any>{
    return new Promise((reject, resolve) => {
      const query = "select passwd from userlist where username = ?";
      connection.query(query, [username], (error, result) => {
        if(error) {
          reject(error);
        } else {
          console.log("result[0].passwd : ", result[0].passwd);
          resolve(result[0].passwd);
        }
      })
    })
  }

  modifyPwdByFreq(username:any, encPwd:any):Promise<any>{
    return new Promise((reject, resolve) => {
      const query = "update userlist set passwd = ? , last_pwd_date = now() where username = ?";
      connection.query(query, [encPwd, username], (error, result) => {
        if(error){
          reject(error);
        } else {
          resolve(result);
        }
      })
    })
  }
}

export default UserService;
