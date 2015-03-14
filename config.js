var config = {
    dev: {
        mongo: {
            url: 'mongodb://104.155.213.128:80/dawn'
        }
    },
    production: {
        mongo: {
            url: 'mongodb://104.155.213.128:80/dawn'
        }
    }
};

/*
 依据当前环境选取配置, 默认为'dev', 通过下面的方法更改启动环境
 NODE_ENV=production node ./bin/www
 */
module.exports = config[process.env.NODE_ENV] || config['dev'];