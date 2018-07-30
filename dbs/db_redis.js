const redis = require('redis');
const bluebird = require('bluebird');

bluebird.promisifyAll(redis);

const redisClient = redis.createClient();

// 监听错误
redisClient.on("error", function (err) {
    console.log("Error " + err);
});

module.exports = redisClient;