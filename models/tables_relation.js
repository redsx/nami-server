const sequelize = require('../dbs/db_mysql');
const Group = require('./group');
const User = require('./user');
const Hist = require('./history');

Group.hasMany(Hist, {foreignKey: 'room', targetKey:'_id'});
Group.belongsToMany(User, {through: 'UserGroup'});
Group.belongsTo(User, {as: 'creator'});

Hist.belongsTo(User, {as: 'owner'});

// User.hasMany(Hist, {as: 'messages', foreignKey: 'owner'});
User.hasMany(Group, {as: 'rooms', foreignKey: 'creatorId'})

User.belongsToMany(Group, {through: 'UserGroup'});
User.belongsToMany(User, {through: 'UserBlock', as: 'user', foreignKey: 'block_id',});
User.belongsToMany(User, {through: 'UserBlock', as: 'block', foreignKey:'user_id'});

sequelize.sync({ force: false});


module.exports = sequelize;