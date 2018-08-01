const user = require('../controllers/user');
const group = require('../controllers/group');
const auth = require('../middlewares/auth');
const StatusMap = require('../constants/status');
const message =  require('../controllers/message');

function callbackError(cb, err){
    console.log(err);
    // 代码执行出错捕获
    cb(StatusMap['1000']);
}

function cathFunc(func) {
    return async (info, cb) => {
        try {
            await func(info, cb);
        }catch(err) {
            callbackError(cb, err);
        }
    }
}

module.exports = function (io) {
    io.on('connect',function (socket) {
        console.log('connect');

        // middlewares
        socket.use(auth());

        // 前端自动断开连接 wx: 忘记了，查一下
        socket.on('frontDisconnect',(info,cb)=>{
            console.log('info: ', info);
        });
        // 登录
        socket.on('login', cathFunc(async (info, cb) => {
            const ret = await user.verifyUser(info);
            cb(ret);
        }));
        // 注册
        socket.on('signUp', cathFunc(async (info, cb) => {
            const ret = await user.createUser(info);
            cb(ret);
        }));
        // 初始化用户个人信息
        socket.on('initUser', cathFunc(async (info, cb)=> {
            const ret = await user.initUser(info, socket);
            cb(ret);
        }))
        // 初始化用户房间信息
        socket.on('initGroup', cathFunc(async (info, cb)=> {
            const ret = await group.initGroup(info, socket);
            cb(ret);
        }))
        // 创建群组
        socket.on('createGroup', cathFunc(async (info, cb) => {
            const ret = await group.createGroup(info);
            cb(ret);
        }))
        // groupMessage 接收群组消息
        socket.on('groupMessage', cathFunc(async (info, cb) => {
            const ret = await message.saveMessage(info, socket);
            cb(ret);
        }))

    })
}