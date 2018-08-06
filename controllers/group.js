const config = require('../config/config');
const Group = require('../models/group');
const User = require('../models/user');
const StatusMap = require('../constants/status');
const Message = require('../models/history');

module.exports = {
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
                attributes: ['_id', 'name', 'avatar', 'bulletin'],
                where: {_id: {$in: groups.map(item => item._id)}},
                include: [{
                    model: Message,
                    limit: 1,
                    attributes: ['_id', 'name', 'avatar', 'isPrivate'],
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
    }
}