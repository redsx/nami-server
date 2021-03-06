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

        // 前端自动断开连接 zz: 忘记了，查一下
        socket.on('frontDisconnect',(info,cb)=>{
            console.log('info: ', info);
        });
        // 检查用户是否存在
        socket.on('checkUser', cathFunc(async (info, cb) => {
            const ret = await user.checkUser(info);
            cb(ret);
        }));
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
        // updateUserInfo 修改用户信息
        socket.on('updateUserInfo', cathFunc(async (info, cb) => {
            const ret = await user.updateUserInfo(info);
            cb(ret);
        }))
        // updatePassword 修改用户密码
        socket.on('updatePassword', cathFunc(async (info, cb) => {
            const ret = await user.updatePassword(info);
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
        socket.on('message', cathFunc(async (info, cb) => {
            const ret = await message.saveMessage(info, socket);
            cb(ret);
        }))
        // getGroupInfo 获取群组信息
        socket.on('getGroupInfo', cathFunc(async (info, cb) => {
            const ret = await group.getGroupInfo(info);
            cb(ret);
        }))
        // refreshInviteLink 更新群组邀请码
        socket.on('refreshInviteLink', cathFunc(async (info, cb) => {
            const ret = await group.refreshInviteLink(info);
            cb(ret);
        }))
        // updateGroupInfo 更新群组信息
        socket.on('updateGroupInfo', cathFunc(async (info, cb) => {
            const ret = await group.updateGroupInfo(info);
            cb(ret);
        }))
        // joinGroup 加入群组
        socket.on('joinGroup', cathFunc(async (info, cb) => {
            const ret = await group.joinGroup(info, socket);
            cb(ret);
        }))
        // exitGroup 退出群组
        socket.on('exitGroup', cathFunc(async (info, cb) => {
            const ret = await group.exitGroup(info, socket);
            cb(ret);
        }))
        // loadGroupHistories 获取群组历史消息
        socket.on('loadGroupHistories', cathFunc(async (info, cb) => {
            const ret = await group.loadGroupHistories(info);
            cb(ret);
        }))
        // searchGroupUser 搜索群组中的用户
        socket.on('searchGroupUser', cathFunc(async (info, cb) => {
            const ret = await group.searchGroupUser(info);
            cb(ret);
        }))
    })
}