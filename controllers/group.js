const config = require('../config/config');
const Group = require('../models/group');
const User = require('../models/user');
const StatusMap = require('../constants/status');
const Message = require('../models/history');

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
                const inviteLink = Date.now().toString(36) + parseInt(Math.random()* 1000000).toString(36)
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
    async getGroupInfo(info) {
        const {groupId} = info;
        const group = await Group.findOne({
            attributes: ['_id', 'name', 'avatar', 'bulletin', 'isPrivate', 'createdAt'],
            where: {_id: groupId},
            include: {
                model: User,
                as: 'creator',
                attributes: ['_id', 'nickname', 'avatar']
            }
        });
        if(group) {
            return {
                status: 0,
                data: group,
            };
        } else {
            return StatusMap['1008'];
        }
    }
}