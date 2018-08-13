const config = require('../config/config');
const Group = require('../models/group');
const User = require('../models/user');
const StatusMap = require('../constants/status');
const Message = require('../models/history');
const util = require('../utils/util');

module.exports = {
    
    /**
     *初始化房间列表
     *
     * @param {*} info 
     * @param {*} socket
     * @returns {status, groups}
     */
    async initGroup(info, socket) {
        const { uid } = info;
        const user = await User.findOne({
            where: {_id: uid}
        });
        if(user) {
            let groups = await user.getGroups({
                attributes: ['_id'],
            });
            groups = await Group.findAll({
                attributes: ['_id', 'name', 'avatar', 'bulletin', 'isPrivate'],
                where: {_id: {$in: groups.map(item => item._id)}},
                include: [{
                    model: Message,
                    limit: 1,
                    attributes: ['_id', 'content', 'type'],
                    include: [{
                        model: User,
                        as: 'owner',
                        attributes: ['_id', 'nickname', 'avatar'],
                    }]
                }]
            })
            groups.map((group) => {
                socket.join(`group_${group._id}`);
            })
            return {
                status: 0,
                data: groups,
            };
        }
    },

    /**
     *创建群组
     *
     * @param {uid, name} info
     * @returns
     */
    async createGroup(info) {
        const { uid, name } = info;
        const user = await User.findOne({
            where: { _id: uid }
        });

        if(user) {
            const groups = await user.getRooms();
            if(groups.length < config.MAX_GROUP) {
                const inviteLink = util.getRandomStr();
                const group = await Group.create({
                    name: name,
                    inviteLink: inviteLink,
                });
                await user.addGroup(group);
                await user.addRoom(group);
                return StatusMap['0'];
            } else {
                return StatusMap['1006'];
            }
        } else {
            return StatusMap['1007'];
        }
    },
    
    /**
     *获取群组信息
     *
     * @param {groupId: String, creator: Boolean} info
     * @returns
     */
    async getGroupInfo(info) {
        const {groupId, creator} = info;
        const args = {
            attributes: ['_id', 'inviteLink', 'name', 'avatar', 'bulletin', 'isPrivate', 'createdAt'],
            where: {_id: groupId},
        }

        if (creator) {
            args.include = {
                model: User,
                as: 'creator',
                attributes: ['_id', 'nickname', 'avatar']
            }
        }

        const group = await Group.findOne(args);
        if(group) {
            return {
                status: 0,
                data: group,
            };
        } else {
            return StatusMap['1008'];
        }
    },

    /**
     * 更新群组信息
     *
     * @param {*} groupInfo
     * @param {*} updateInfo
     * @returns
     */
    async _updateGroupInfo (groupInfo, updateInfo) {
        const { groupId, uid } = groupInfo;
        const group = await Group.findOne({
            where: {
                _id: groupId,
                creatorId: uid,
            },
        });
        if(group) {
            Object.assign(group, updateInfo);
            await group.save();
            return StatusMap['0'];
        }

        return StatusMap['1008'];
    },

    /**
     *
     * 更新group邀请码
     * @param {*} info
     * @returns
     */
    async refreshInviteLink(info) {
        const inviteLink = util.getRandomStr();

        return await this._updateGroupInfo(info, {inviteLink});
    },
    

    /**
     *
     * 更新房间信息
     * @param {*} info
     * @returns
     */
    async updateGroupInfo(info) {
        const { groupId, uid, name, avatar, bulletin } = info;
        let updateInfo = { name, avatar, bulletin };

        // 去除对象中的空值
        for(let key in updateInfo) {
            if(
                updateInfo[key] == undefined
                || updateInfo[key] == null
            ) {
                delete updateInfo[key];
            }
        }
        return await this._updateGroupInfo({groupId, uid}, updateInfo);
    },

    /**
     * 加入群组
     *
     * @param {*} info
     * @param {*} socket
     * @returns
     */
    async joinGroup(info, socket) {
        const {groupId, uid} = info;

        const group = await Group.findOne({
            where: { _id: groupId },
        });
        const user = await User.findOne({
            where: {_id: uid}
        });

        if(group && user) {
            await user.addGroup(group);
            socket.join(`group_${groupId}`);
            return StatusMap['0'];
        } else if(!user) {
            return StatusMap['1007'];
        } else {
            return StatusMap['1008'];
        }
    },

    /**
     * 退出群组
     *
     * @param {*} info
     * @param {*} socket
     */
    async exitGroup(info, socket) {
        const {groupId, uid} = info;

        const group = await Group.findOne({
            where: { _id: groupId },
        });
        const user = await User.findOne({
            where: {_id: uid}
        });
        if(group && user) {
            await user.removeGroup(group);
            socket.leave(`group_${groupId}`);
            return StatusMap['0'];
        } else if(!user) {
            return StatusMap['1007'];
        } else {
            return StatusMap['1008'];
        }
    },
    /**
     * 加载历史记录
     *
     * @param {*} info
     * @returns
     */
    async loadGroupHistories(info) {
        let { groupId, limit, timestamp, uid } = info;
        timestamp = timestamp || Date.now();
        const group = await Group.findOne({
            where: {_id: groupId},
        })
        const messages = await group.getHistories({
            order: [['_id', 'DESC']],
            limit: limit,
            where: {
                createdAt: {$lt: timestamp}
            },
            attributes: ['_id', 'content', 'type', 'createdAt'],
            include: [{
                model: User,
                as: 'owner',
                attributes: ['_id', 'nickname', 'avatar'],
            }]
        });
        
        return {
            status: 0,
            data: messages
        }
    }
}