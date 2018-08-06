const Group = require('../models/group');
const User = require('../models/user');
const Message = require('../models/history');
const StatusMap = require('../constants/status');

module.exports = {
    async saveMessage(info, socket) {
        const {uid, group, content, type } = info;
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
        await message.setOwner(owner);
        await groupInfo.addHistory(message);
        // 转发信息至房间
        const {createdAt, _id} = message;
        socket.broadcast.to(`group_${group}`).emit('groupMessage', {
            createdAt, _id, owner, group, content, type
        });
        return {
            status: 0,
            data: {
                isPrivate: !!groupInfo.isPrivate,
                _id: message._id,
                createdAt: message.createdAt,
            }
        };
    },

    async revokeMessage (info,socket){
        const { _id } = info;
        const message = Message.findOne({
            where: {_id}
        });
        if(message){
            message.isDel = true;
            await message.save();
            socket.broadcast.emit('revokeMessage', info);
            return StatusMap['0'];
        } else{
            return StatusMap['1009'];
        }
    }
}