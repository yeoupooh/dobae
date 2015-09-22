/*global console */
/*global process */
/*jslint node: true, stupid: true */

(function () {

    'use strict';

    var fs = require('fs'),
        https = require('https'),
        url = require('url'),
        exec = require('child_process').exec,
        asyncCalls = require('./asynccalls.js'),
        asyncTasks = [],
        selectedGroup = 'default',
        images = [],
        asyncParams = {};

    // print process.argv
    console.log(process);
    process.argv.forEach(function (val, index, array) {
        /*jslint unparam: true */
        console.log(index + ': ' + val);
        if (index === 2) {
            selectedGroup = val;
        }
    });

    console.log('group=', selectedGroup);

    function getImages(posts) {
        // var images = [];

        posts.forEach(function (post) {
            post.photos.forEach(function (photo) {
                // console.log('photo.original_size=', photo.original_size);
                images.push(photo.original_size);
            });
        });
    }

    function getImagesAsync(providerUrl) {
        console.log('providerUrl=', providerUrl);
        var parsedUrl = url.parse(providerUrl),
            str = '',
            req = https.request({
                hostname: parsedUrl.hostname,
                port: 443,
                path: parsedUrl.path,
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
                    asyncCalls.done();
                });
            });

        req.end();

        req.on('error', function (e) {
            console.error(e);
            asyncCalls.reject(e);
        });
    }

    function loadConfig(params) {
        var config = JSON.parse(fs.readFileSync('dobae.config.json')),
            group;

        group = config.groups[selectedGroup];

        group.providers.forEach(function (source) {
            // console.log(source);
            console.log(url.parse(source.url));
        });

        params.config = config;
        params.group = group;
    }

    function clearImagesAsync(params) {
        /*jslint unparam: true */
        images = [];
        asyncCalls.done();
    }

    function configBackgroudAsync(params) {
        /*jslint unparam: true */
        exec('gsettings set org.gnome.desktop.background picture-options scaled', function callback(error, stdout, stderr) {
            if (error) {
                console.error(error);
                asyncCalls.reject(error);
            } else {
                asyncCalls.done(error);
            }
        });
    }

    function changeBackgroundAsync(params) {
        /*jslint unparam: true */
        var imgIndex = Math.round(Math.random() * images.length),
            image = images[imgIndex];

        console.log('images=', images.length, 'index=', imgIndex);
        console.log('change image=', image);
        if (image === undefined) {
            console.error('image is undefined.');
            asyncCalls.reject('image is undefined.');
            return;
        }
        exec('gsettings set org.gnome.desktop.background picture-uri ' + image.url, function callback(error, stdout, stderr) {
            /*jslint unparam: true */
            if (error) {
                console.error(error);
                asyncCalls.reject(error);
            } else {
                asyncCalls.done(error);
            }
        });
    }

    function scheduledTask() {
        var group;

        loadConfig(asyncParams);
        asyncTasks = [];
        asyncTasks.push({
            execute: clearImagesAsync,
            options: asyncParams
        });
        group = asyncParams.group;
        group.providers.forEach(function (provider) {
            asyncTasks.push({
                execute: getImagesAsync,
                options: provider.url
            });
        });
        asyncTasks.push({
            execute: configBackgroudAsync,
            options: asyncParams
        });
        asyncTasks.push({
            execute: changeBackgroundAsync,
            options: asyncParams
        });
        asyncCalls.start(asyncTasks, {
            success: function () {
                console.log('async calls are done.');
            },
            fail: function (reason) {
                console.log('async calls are fail. reason=', reason);
            }
        });
    }

    function startScheduledTask() {
        console.log('asyncParams=', asyncParams);
        var cron = require('cron'),
            cronJob = cron.job(asyncParams.config.cron, function () {
                // perform operation e.g. GET request http.get() etc.
                scheduledTask();
                console.info('cron job completed');
            });
        cronJob.start();
    }

    scheduledTask();
    startScheduledTask();
}());