const config = require('../config/config');
const Group = require('../models/group');
const User = require('../models/user');
const StatusMap = require('../constants/status');

module.exports = {
    async initGroup(info) {
        const { uid } = info;
        const user = await User.findOne({
            where: {_id: uid}
        });
        if(user) {
            const groups = await user.getGroups({
                attributes: ['_id'],
            });
            console.log(groups);
            return StatusMap['0'];
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