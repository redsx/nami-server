const log4js = require('log4js');
const path = require('path');
const fs = require('fs');

const basePath = path.resolve(__dirname,'../logs');
const errorPath = `${basePath}/error/`;
const infoPath = `${basePath}/info/`;

function confirmPath(pathStr) {
    if(!fs.existsSync(pathStr)){
        fs.mkdirSync(pathStr);
        console.log('createPath: ' + pathStr);
    }
}

// 配置文件
log4js.configure({
    appenders: {
        default: { 
            type: 'console',
        }, 
        infoLog: {
            type: 'dateFile',
            filename: `${infoPath}/info`,
            alwaysIncludePattern: true,
            pattern: '-yyyy-MM-dd.log',
        },
        errorLog: {
            type: 'dateFile',
            filename: `${errorPath}/info`,
            alwaysIncludePattern: true,
            pattern: '-yyyy-MM-dd.log',
        },
    },
    categories: {
        default: { appenders: ['default'], level: 'debug' },
        infoLog: { appenders: ['infoLog'], level: 'info'},
        errorLog: { appenders: ['errorLog'], level: 'info' },
    },
    replaceConsole: true // 替换 console.log
})

//根据不同的logType创建不同的文件目录
if(basePath){
    confirmPath(basePath);
    confirmPath(errorPath);
    confirmPath(infoPath);
}

const logger = {};
const consoleLog = log4js.getLogger('default');
const errorLog = log4js.getLogger('errorLog');
const infoLog = log4js.getLogger('infoLog');

logger.console = consoleLog;

// 使用概率不高，用于打印出特殊信息
logger.info = function () {
    consoleLog.info(...arguments);
    infoLog.info(...arguments);
}

// 用于记录catch到的错误信息
logger.error = function () {
    consoleLog.error(...arguments);
    errorLog.error(...arguments);
}

// 用logger取代console, 不用使用logger.console.xxx的方案打印
console.log = consoleLog.info.bind(consoleLog);

module.exports = logger;