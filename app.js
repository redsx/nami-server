const Koa = require('koa');
const Router = require('koa-router');
const views = require('koa-views');
const json = require('koa-json');
const bodyparser = require('koa-bodyparser');
const logger = require('koa-logger');
const cors = require('koa2-cors');

const index = require('./routes/index');

const app = new Koa();
const router = new Router();
const tables = require('./models/tables_relation');

// middlewares
app.use(async function(ctx, next) {
	console.log('ctx.url => ', ctx.url);
	return next();
})
app.use(cors({
	origin: function(ctx) {
		if (ctx.url === '/test') {
			return false;
		}
		return '*';
	},
	maxAge: 5,
	credentials: true,
}));
  
app.use(bodyparser({
	enableTypes:['json', 'form', 'text']
  }))
app.use(json())
app.use(logger())
app.use(require('koa-static')(__dirname + '/public'))
app.use(views(__dirname + '/views', {
	extension: 'pug'
}))

// routes

app.use(index.routes(), index.allowedMethods());

// app.use(router.routes());
// error-handling
app.on('error', (err, ctx) => {
  	console.error('server error', err, ctx)
});

module.exports = app;