const Sequelize = require('sequelize');
const sequelize = require('../dbs/db_mysql');
const config = require('../config/config');

const User = sequelize.define('User', {
    _id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    nickname: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
        comment: '用户名',
    },
    avatar: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: config.DEFAULT_AVATAR,
        comment: '头像',
    },
    password: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: '密码',
    },
    email: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: '邮箱',
    },
    status: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: '状态',
    },
    onlineState: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: '在线状态',
    },
    onlineDevice: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: '在线设备数',
    },
    blockAll: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
        comment: '是否屏蔽所以私聊'
    },
    lastOnlineTime: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: '最后上线时间'
    },
    device: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: '在线状态',
    },
    // online: Sequelize.STRING, // 考虑去除，redis维护在线表，用set
    // expressions: Sequelize.STRING, //表情库 取消
    // blocks: Sequelize.STRING, // 屏蔽库 考虑做
    // rooms: Sequelize.STRING, // 房间库
}, {
    timestamps: true,
    underscored: false,
    paranoid: true,
    freezeTableName: true,
    tableName: 'users',
    charset: 'utf8',
    collate: 'utf8_general_ci'
})

module.exports = User;