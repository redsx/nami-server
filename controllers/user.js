const User = require('../models/user');
const bcrypt = require('bcrypt-nodejs');
const JWT_KEY = require('../config/config').JWT_KEY;
const config = require('../config/config');
const bluebird = require('bluebird');
const jwt = require('jsonwebtoken');
const StatusMap = require('../constants/status');
const redisCli = require('../dbs/db_redis');
const Group = require('../models/group');

function createToken(_id) {
    let exp = Math.floor((new Date().getTime())/1000) + 60 * 60 * 24 * 30;
    let token = jwt.sign({user: _id, exp: exp }, JWT_KEY);
    return token;
}

module.exports = {
    async createUser (info) {
        const { password, nickname, email } = info;
        const user = await User.findOne({
            where: { $or: [{ nickname }, { email }] }
        });
        
        if(user) {
            return StatusMap['1001'];
        }
        //  加密密码
        const salt = await bluebird.promisify(bcrypt.genSalt)(10);
        const pwd = await bluebird.promisify(bcrypt.hash)(password, salt, null); 

        const newUser = await User.create({
            nickname,
            password: pwd,
            email: email,
        })

        // 初始房间查询
        const group = await Group.findOne({
            where: {_id: config.INIT_ROOM._ID}
        });

        // 创建用户默认加入初始化房间
        // ...
        if(group) {
            await group.addUser(user);
        }


        if(newUser) {
            return {
                token: createToken(newUser._id),
                status: 0,
            }
        }
    },

    async verifyUser(info) {
        const { nickname, email, password } = info;
        const user = await User.findOne({
            where: { $or: [{ nickname }, { email }] }
        });

        if(!user) return StatusMap['1002'];

        const resault = await bluebird.promisify(bcrypt.compare)(password,user.password);
        if(resault) {
            return {
                status: 0,
                token: createToken(user._id),
            }
        } else {
            return StatusMap['1003'];
        }
    },

    async initUser(info, socket) {
        const {uid} = info;

        const user = await User.findOne({
            attributes: ['_id', 'nickname', 'avatar', 'device', 'status', 'blockAll', 'onlineState'],
            where: { _id: uid }
        });

        console.log('uid: ', uid);
        console.log('socket: ', socket.id);

        if(user) {
            user.onlineState = 'online';

            await redisCli.sadd(uid, socket.id);
            await user.save();

            const { nickname, avatar, status, blockAll } = user;
            const blocks = user.blocks || [];

            socket.join(user._id);

            return {
                status: 0,
                data: {
                    userInfo: { nickname, avatar, status, blocks, blockAll }
                }
            }
        } else {
            return StatusMap['1007'];
        }
    },


}