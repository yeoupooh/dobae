(function() {

    'use strict';

    var fs = require('fs'),
        https = require('https'),
        url = require('url'),
        provider,
        providerUrl,
        config = JSON.parse(fs.readFileSync('config.json'));

    config.sources.forEach(function(source) {
        // console.log(source);
        console.log(url.parse(source.url));
    });

    provider = config.sources[0];
    providerUrl = url.parse(provider.url);

    function changeBackground(image) {
        var exec = require('child_process').exec;
        console.log('change image=', image);
        exec('gsettings set org.gnome.desktop.background picture-uri ' + image.url, function callback(error, stdout, stderr) {
            /*jslint unparam: true */
            // result
            // console.log('stdout=', stdout);
        });
    }

    function getImages(posts) {
        var images = [];

        posts.forEach(function(post) {
            post.photos.forEach(function(photo) {
                // console.log('photo.original_size=', photo.original_size);
                images.push(photo.original_size);
            });
        });

        changeBackground(images[Math.round(Math.random() * images.length)]);
    }

    function scheduledTask() {
        var str = '',
            req = https.request({
                hostname: providerUrl.hostname,
                port: 443,
                path: providerUrl.path,
                method: 'GET'
            }, function(res) {
                // console.log('res.statusCode=', res.statusCode);
                // console.log('res.headers=', res.headers);
                res.on('data', function(d) {
                    // process.stdout.write(d);
                    str = str + d;
                });
                res.on('end', function() {
                    // console.log(JSON.parse(str));
                    getImages(JSON.parse(str).response.posts);
                });
            });

        req.end();

        req.on('error', function(e) {
            console.error(e);
        });
    }

    scheduledTask();

    var cron = require('cron');
    var cronJob = cron.job("0 0/5 * * * *", function() {
        // perform operation e.g. GET request http.get() etc.
        scheduledTask();
        console.info('cron job completed');
    });
    cronJob.start();

}());