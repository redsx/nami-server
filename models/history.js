const Sequelize = require('sequelize');
const sequelize = require('../dbs/db_mysql');

const Hist = sequelize.define('History', {
    _id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    content: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: '消息内容',
    },
    type:  {
        type: Sequelize.STRING,
        allowNull: true,
        comment: '消息类型',
    },
    isDel:  {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: true,
        comment: '是否撤回',
    },
    // 关联group表
    // room: { 
    //     type: Sequelize.INTEGER, 
    //     unique: true, 
    //     references: {
    //       model: 'Group',
    //       key: '_id'
    //     },
    //     comment:'关联group表Id',
    // },
    // // 关联user表
    // owner: { 
    //     type: Sequelize.INTEGER, 
    //     unique: true, 
    //     references: {
    //       model: 'User',
    //       key: '_id'
    //     },
    //     comment:'关联user表Id',
    // },
}, {
    timestamps: true,
    underscored: false,
    paranoid: true,
    freezeTableName: true,
    tableName: 'histories',
    charset: 'utf8',
    collate: 'utf8_general_ci'
});

module.exports = Hist;