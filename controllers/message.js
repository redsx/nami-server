const Group = require('../models/group');
const User = require('../models/user');
const Message = require('../models/history');
const StatusMap = require('../constants/status');

module.exports = {
    async saveMessage(info, socket) {
        const {uid, group, content, type, isPrivate } = info;
        const owner = await User.findOne({
            attributes: ['_id', 'avatar', 'nickname'],
            where: { _id: uid }
        });
        const groupInfo = await Group.findOne({
            where: { _id: group }
        })
        
        if(!owner) return StatusMap['1007'];
        if(!groupInfo) return StatusMap['1008'];
        // 存储信息，后续确认方案后引入redis
        const message = await Message.create({ type, content });
        await owner.addMessage(message);
        await groupInfo.addHistory(message);
        // 转发信息至房间
        socket.broadcast.to(`group_${group}`).emit('groupMessage', Object.assign(message, {owner, group}));
        return {
            status: 0,
            data: {
                _id: message._id,
                createdAt: message.createdAt,
            }
        };
    }
}