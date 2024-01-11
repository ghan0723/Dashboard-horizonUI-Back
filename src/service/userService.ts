import { Connection, OkPacket } from "mysql";

class UserService {
  private connection: Connection;

  constructor(connection: Connection) {
    this.connection = connection;
  }

  getLogin(username: string, passwd: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const query =
        "SELECT username, grade, mng_ip_ranges FROM userlist WHERE username = ? AND passwd = ?";
      this.connection.query(query, [username, passwd], (error, results) => {
        if (error) {
          reject(error);
        } else {
          
          

          resolve(results);
        }
      });
    });
  }

  getUserList(grade: number): Promise<any> {
    return new Promise((resolve, reject) => {
      const query = `select username, grade, enabled, mng_ip_ranges from userlist where grade > ${grade}`;
      this.connection.query(query, (error, result) => {
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
    passwd: string;
    grade: string;
    mng_ip_ranges: string;
  }): Promise<any> {
    let mngip = user.mng_ip_ranges.replace(/(\r\n|\n|\r)/gm, ", ");
    let grade: number = parseInt(user.grade, 10);
    const query = `insert into userlist (\`username\`, \`passwd\`, \`grade\`, \`enabled\`, \`mng_ip_ranges\`) values ('${user.username}', '${user.passwd}', ${grade}, 1, '${mngip}')`;

    return new Promise((resolve, reject) => {
      this.connection.query(query, (error, result) => {
        if (error) {
          console.log("데이터 넣다가 사고남");
          reject(error);
        } else {
          console.log("데이터 잘 들어감");
          resolve(result);
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
      this.connection.query(query, (error, result) => {
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
      this.connection.query(query, username, (error, result) => {
        if (error) {
          console.log("업데이트 가져오다가 사고남");
          reject(error);
        } else {
          console.log("업데이트 가져오기 성공");
          resolve(result);
        }
      });
    });
  }

  modUser(user: {
    username: string;
    passwd: string;
    grade: string;
    mng_ip_ranges: string;
  }, oldname:string) : Promise<any> {
    let mngip = user.mng_ip_ranges.replace(/(\r\n|\n|\r)/gm, ", ");
    let grade: number = parseInt(user.grade, 10);
    const query = `UPDATE userlist SET username = '${user.username}', passwd = '${user.passwd}', grade = ${grade}, mng_ip_ranges = '${mngip}' WHERE username = '${oldname}'`;

    return new Promise((resolve, reject) => {
      this.connection.query(query, (error, result) => {
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
  
}

export default UserService;
