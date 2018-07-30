const Group = require('../models/group');
const User = require('../models/user');
const Message = require('../models/history');
const StatusMap = require('../constants/status');

module.exports = {
    async saveMessage(info) {
        const {uid, group, content, type } = info;
        const timestamp = Date.now();
        const user = await User.findOne({
            where: { _id: uid }
        });
        const group = await Group.findOne({
            where: { _id: group }
        })
        
        if(!user) return StatusMap['1007'];
        if(!group) return StatusMap['1008'];
        // 存储信息，后续确认方案后引入redis
        const message = await Message.create({ type, content, timestamp });
        await message.setOwner(user);
        await group.addHistory(message);
        // 转发信息至房间


    }
}