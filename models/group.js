const Sequelize = require('sequelize');
const sequelize = require('../dbs/db_mysql');
const config = require('../config/config');

const Group = sequelize.define('Group', {
    _id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    name: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: '群组名',
    },
    avatar: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: config.DEFAULT_GROUP_AVATAR,
        comment: '群组头像',
    },
    inviteLink: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: '邀请链接',
    },
    lastMessage: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: '最后消息时间戳',
    },
    bulletin: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: '群组公告',
    },
    isPrivate: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: '是否为私聊群组'
    },
    // // 关联user表
    // creater: { 
    //     type: Sequelize.INTEGER, 
    //     unique: true, 
    //     references: {
    //       model: 'User',
    //       key: '_id'
    //     },
    //     comment:'关联user表Id',
    // }, 
    // users: Sequelize.STRING, // 关联users-group 表
    // histories: Sequelize.STRING, // 关联user-history表
}, {
    timestamps: true,
    underscored: false,
    paranoid: true,
    freezeTableName: true,
    tableName: 'groups',
    charset: 'utf8',
    collate: 'utf8_general_ci'
});

module.exports = Group;