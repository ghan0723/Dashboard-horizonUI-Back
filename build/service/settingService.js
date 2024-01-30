"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = __importDefault(require("../db/db"));
class SettingService {
    addAgentSetting() {
        return new Promise((resolve, reject) => {
            db_1.default;
        });
    }
    modAgentSetting(agent) {
        var _a, _b;
        let excip = (_a = agent.exceptionList) === null || _a === void 0 ? void 0 : _a.replace(/(\r\n|\n|\r)/gm, ", ");
        let kewordRef = (_b = agent.keywordList) === null || _b === void 0 ? void 0 : _b.replace(/(\r\n|\n|\r)/gm, "&&");
        const query = `update usersettings set uid=${agent.uid}, clnt_server_ip="${agent.serverIP}", clnt_server_port=${agent.serverPort}, clnt_svr_att_interval=${agent.serverInterval}, 
    clnt_license_dist="${agent.licenseDist}", clnt_exception_list="${excip}", clnt_keyword_list="${kewordRef}", flag_checkbox=${agent.flag}`;
        return new Promise((resolve, reject) => {
            db_1.default.query(query, (error, result) => {
                if (error) {
                    reject(error);
                }
                else {
                    resolve(result);
                }
            });
        });
    }
    getAgentSetting() {
        const query = "select uid, flag_checkbox, clnt_server_ip, clnt_server_port, clnt_svr_att_interval, clnt_license_dist, clnt_exception_list, clnt_keyword_list, svr_server_port, svr_retention_period, svr_autodownload from usersettings";
        return new Promise((resolve, reject) => {
            db_1.default.query(query, (error, result) => {
                var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
                if (error) {
                    reject(error);
                }
                else {
                    const clntKeywordList = (_a = result[0]) === null || _a === void 0 ? void 0 : _a.clnt_keyword_list;
                    if (clntKeywordList && clntKeywordList.includes("&&")) {
                        const modifiedKeywordList = clntKeywordList.replace(/&&/g, "\n");
                        resolve([{
                                uid: (_b = result[0]) === null || _b === void 0 ? void 0 : _b.uid,
                                flag_checkbox: (_c = result[0]) === null || _c === void 0 ? void 0 : _c.flag_checkbox,
                                clnt_server_ip: (_d = result[0]) === null || _d === void 0 ? void 0 : _d.clnt_server_ip,
                                clnt_server_port: (_e = result[0]) === null || _e === void 0 ? void 0 : _e.clnt_server_port,
                                clnt_svr_att_interval: (_f = result[0]) === null || _f === void 0 ? void 0 : _f.clnt_svr_att_interval,
                                clnt_license_dist: (_g = result[0]) === null || _g === void 0 ? void 0 : _g.clnt_license_dist,
                                clnt_exception_list: (_h = result[0]) === null || _h === void 0 ? void 0 : _h.clnt_exception_list,
                                clnt_keyword_list: modifiedKeywordList,
                                svr_server_port: (_j = result[0]) === null || _j === void 0 ? void 0 : _j.svr_server_port,
                                svr_retention_period: (_k = result[0]) === null || _k === void 0 ? void 0 : _k.svr_retention_period,
                                svr_autodownload: (_l = result[0]) === null || _l === void 0 ? void 0 : _l.svr_autodownload,
                            }]);
                    }
                    else {
                        resolve(result);
                    }
                }
            });
        });
    }
    addServerSetting() {
        return new Promise((resolve, reject) => {
            db_1.default;
        });
    }
    modServerSetting(server) {
        const autoDwn = server.auto ? 1 : 0;
        const query = `update usersettings set svr_server_port=${server.serverPort}, svr_retention_period=${server.ret}, svr_autodownload=${autoDwn}, svr_update_interval=${server.interval}`;
        return new Promise((resolve, reject) => {
            db_1.default.query(query, (error, result) => {
                if (error) {
                    reject(error);
                }
                else {
                    resolve(result);
                }
            });
        });
    }
    getServerSetting() {
        const query = `select svr_server_port, svr_retention_period, svr_autodownload, svr_update_interval from usersettings`;
        return new Promise((resolve, reject) => {
            db_1.default.query(query, (error, result) => {
                if (error) {
                    reject(error);
                }
                else {
                    resolve(result);
                }
            });
        });
    }
    getGUITime() {
        return new Promise((resolve, reject) => {
            const query = `select svr_gui_timeout from usersettings`;
            db_1.default.query(query, (error, result) => {
                if (error) {
                    console.error("Error in query:", error);
                    reject(error);
                }
                else {
                    // 여기서 result 값이 어떤 형태인지 확인하고 적절한 값을 반환하도록 수정
                    const guiTimeout = result && result.length > 0 ? result[0].svr_gui_timeout : 3600;
                    resolve(guiTimeout);
                }
            });
        });
    }
    getIntervalTime() {
        const query = "select svr_update_interval from usersettings;";
        return new Promise((resolve, reject) => {
            db_1.default.query(query, (error, result) => {
                if (error) {
                    reject(error);
                }
                else {
                    resolve(result);
                }
            });
        });
    }
}
exports.default = SettingService;
