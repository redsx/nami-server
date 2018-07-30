
const jwt = require('jsonwebtoken');
const JWT_KEY = require('../config/config').JWT_KEY;
const logger = require('../utils/log');
const auth = require('../auth/index');
const StatusMap = require('../constants/status');

// 解析token -> userId
function parseToken(token, e){
    return async function() {
        // 事件必须经过auth注册
        if(!auth[e]) {
            console.log('事件未注册： ', e);
            return StatusMap['1004'];
        }
        if(auth[e].needAuth) {
            try {
                const parsedToken = jwt.verify(token,JWT_KEY);
                return {
                    status: 0,
                    parsedToken,
                    uid: parsedToken.user,
                };
            } catch(err) {
                if(token) {
                    logger.error('[socket/index.js 15 paresToken] pares token error, error token: ', token);
                } else {
                    return StatusMap['1005'];
                }
            }
        } else {
            return StatusMap['0'];
        }
    }
}

module.exports = function() {
    return async function(packet, next) {
        const e = packet[0];
        const param = packet[1] || {};
        const ret = await parseToken(param.token, e)();
        if(!ret.status) {
            param.parsedToken = ret.parsedToken;
            param.uid = ret.uid;
            console.log('event: ', e, ret);
            return next();
        } else {
            console.log('catch error: ', ret);
            // 解析错误是自动返回给客户端, 客户端通过error事件拿
            return next({message: ret});
        }
    }
}