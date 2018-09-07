const router = require('koa-router')()
const axios = require('axios');
const config = require('../config/config');
const userCtrl = require('../controllers/user');

router.get('/', async (ctx, next) => {
  await ctx.render('index', {})
})

router.get('/auth/callback', async (ctx) => {
  const code  = ctx.request.query.code;
  if(code) {
    const resp = await axios.post('https://github.com/login/oauth/access_token', {
      code,
      client_id: config.CLIENT_ID,
      client_secret: config.CLIENT_SEC,
    })
    if(resp.status === 200 && resp.data.indexOf('access_token') > -1) {
      const dataArr = resp.data.split('=');
      const token = dataArr[1];
      const infoResp = await axios.get(`https://api.github.com/user?access_token=${token}`);
      if(infoResp.status === 200) {
        const userInfo = infoResp.data;
        const userResp = await userCtrl.findOrCreateGithubUser(userInfo);
        if(userResp.status === 0) {
          const token = userCtrl.createToken(userResp.data._id);
          return ctx.redirect(`/lt/${token}`);
        }
      }
    }
  }
  return ctx.redirect(encodeURI(`/login?error=${'登录失败'}`));
})

module.exports = router
