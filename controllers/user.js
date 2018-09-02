const User = require('../models/user');
const bcrypt = require('bcrypt-nodejs');
const JWT_KEY = require('../config/config').JWT_KEY;
const config = require('../config/config');
const bluebird = require('bluebird');
const jwt = require('jsonwebtoken');
const StatusMap = require('../constants/status');
const redisCli = require('../dbs/db_redis');
const Group = require('../models/group');
const util = require('../utils/util');

function createToken(_id) {
    let exp = Math.floor((new Date().getTime())/1000) + 60 * 60 * 24 * 30;
    let token = jwt.sign({user: _id, exp: exp }, JWT_KEY);
    return token;
}

module.exports = {
    async checkUser (info) {
        const { nickname } = info;
        const user = await User.findOne({
            where: { nickname },
        });
        if(user) {
            return StatusMap['1001'];
        } else {
            return StatusMap['1002'];
        }
    },
    async createUser (info) {
        const { password, nickname } = info;
        const user = await User.findOne({
            where: { nickname },
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

    /**
     * 更新用户信息
     *
     * @param {*} uid
     * @param {*} info
     * @returns
     */
    async _updateUserInfo (uid, info) {
        if (info.nickname) {
            const user = await User.findAll({
                where: {nickname: info.nickname}
            });
            if(user.length > 0) {
                return StatusMap['1001'];
            }
        }
        const user = await User.findOne({
            where: {_id: uid}
        });
        if(user) {
            console.log(info);
            Object.assign(user, info);
            await user.save();

            return StatusMap['0'];
        }
        return StatusMap['1002'];
        
    },

    /**
     * 更新用户信息
     *
     * @param {*} info
     * @returns
     */
    async updateUserInfo (info) {
        const { uid, nickname, avatar, status, blockAll } = info;
        let updateInfo = { nickname, avatar, status, blockAll };

        updateInfo = util.removeEmptyVal(updateInfo);

        return await this._updateUserInfo(uid, updateInfo);
    },

    /**
     * 更新用户密码
     *
     * @param {*} info
     * @returns
     */
    async updatePassword(info) {
        const { oPwd, password, uid } = info;
        // 不做校验~ 校验了功能就废了，改密码的一般是不记得密码的....
        const salt = await bluebird.promisify(bcrypt.genSalt)(10);
        const pwd = await bluebird.promisify(bcrypt.hash)(password, salt, null);
        console.log('password: ', pwd)
        return await this._updateUserInfo(uid, {password: pwd});
    }

}