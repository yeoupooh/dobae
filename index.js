/*global console */
/*global process */
/*jslint node: true, stupid: true */

(function () {

    'use strict';

    var fs = require('fs'),
        https = require('https'),
        url = require('url'),
        provider,
        providerUrl,
        group,
        config = JSON.parse(fs.readFileSync('dobae.config.json'));

    group = config.groups['default'];

    // print process.argv
    console.log(process);
    process.argv.forEach(function (val, index, array) {
        /*jslint unparam: true */
        console.log(index + ': ' + val);
        if (index === 2) {
            group = config.groups[val];
        }
    });

    console.log('group=', group);

    group.providers.forEach(function (source) {
        // console.log(source);
        console.log(url.parse(source.url));
    });

    provider = group.providers[0];
    providerUrl = url.parse(provider.url);

    function changeBackground(image) {
        var exec = require('child_process').exec;
        console.log('change image=', image);
        exec('gsettings set org.gnome.desktop.background picture-uri ' + image.url, function callback(error, stdout, stderr) {
            /*jslint unparam: true */
            if (error) {
                console.error(error);
            }
            // result
            // console.log('stdout=', stdout);
        });
    }

    function getImages(posts) {
        var images = [];

        posts.forEach(function (post) {
            post.photos.forEach(function (photo) {
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
            }, function (res) {
                // console.log('res.statusCode=', res.statusCode);
                // console.log('res.headers=', res.headers);
                res.on('data', function (d) {
                    // process.stdout.write(d);
                    str = str + d;
                });
                res.on('end', function () {
                    // console.log(JSON.parse(str));
                    getImages(JSON.parse(str).response.posts);
                });
            });

        req.end();

        req.on('error', function (e) {
            console.error(e);
        });
    }

    function startScheduledTask() {
        var cron = require('cron'),
            cronJob = cron.job("0 0/5 * * * *", function () {
                // perform operation e.g. GET request http.get() etc.
                scheduledTask();
                console.info('cron job completed');
            });
        cronJob.start();
    }

    scheduledTask();
    startScheduledTask();

}());