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
        download = require('./download.js'),
        DOWNLOADED_WALLPAPER_FILENAME = 'downloaded-wallpaper.jpg',
        asyncTasks = [],
        selectedGroup = 'default',
        images = [],
        selectedImage,
        asyncParams = {},
        lastApiCallTime;

    // console.log(process);
    process.argv.forEach(function (val, index, array) {
        /*jslint unparam: true */
        // console.log(index + ': ' + val);
        if (index === 2) {
            selectedGroup = val;
        }
    });

    function getImages(posts) {
        // var images = [];

        if (posts === undefined) {
            console.error('posts not found.');
            return;
        }

        posts.forEach(function (post) {
            post.photos.forEach(function (photo) {
                // console.log('photo.original_size=', photo.original_size);
                images.push(photo.original_size);
            });
        });
    }

    function getImagesAsync(providerUrl) {
        console.log('getImagesAsync: providerUrl=', providerUrl);
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

        // group.providers.forEach(function (source) {
        //     // console.log(source);
        //     console.log(url.parse(source.url));
        // });

        params.config = config;
        params.group = group;

        console.info('config loaded.');
        console.info('selected group=', selectedGroup);
    }

    function clearImagesAsync(params) {
        /*jslint unparam: true */
        images = [];
        asyncCalls.done();
    }

    function configBackgroudAsync(params) {
        /*jslint unparam: true */
        exec(['gsettings ',
                'set org.gnome.desktop.background ',
                'picture-options ',
                params.group.pictureOptions
            ].join(''),
            function callback(error, stdout, stderr) {
                if (error) {
                    console.error(error);
                    asyncCalls.reject(error);
                } else {
                    asyncCalls.done(error);
                }
            });
    }

    // Returns a random integer between min (included) and max (excluded)
    // Using Math.round() will give you a non-uniform distribution!
    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min)) + min;
    }

    function selectImageAsync(params) {
        /*jslint unparam: true */
        var imgIndex = getRandomInt(0, images.length);

        console.info('selectImageAsync: total images=', images.length, 'selected index=', imgIndex);

        selectedImage = images[imgIndex];

        asyncCalls.done();
    }

    function downloadAsync(params) {
        /*jslint unparam: true */
        if (selectedImage) {
            download(selectedImage.url, __dirname + '/' + DOWNLOADED_WALLPAPER_FILENAME, function (error) {
                if (error !== undefined) {
                    asyncCalls.reject();
                } else {
                    asyncCalls.done();
                }
            });
        } else {
            console.error('selectedImage is null.');
        }
    }

    function changeBackgroundAsync(params) {
        /*jslint unparam: true */
        // var imgIndex = getRandomInt(0, images.length),
        //     image = images[imgIndex],
        //     cmd = [];
        var cmd = [],
            image = selectedImage;

        console.info('changeBackgroundAsync: image=', image);
        if (image === undefined) {
            console.error('image is undefined.');
            asyncCalls.reject('image is undefined.');
            return;
        }
        cmd = [
            'gsettings set org.gnome.desktop.background picture-uri ',
            'file://' + __dirname + '/' + DOWNLOADED_WALLPAPER_FILENAME
            // image.url
        ];
        console.info('changeBackgroundAsync: cmd=', cmd.join(''));
        exec(cmd.join(''), function callback(error, stdout, stderr) {
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
        var group,
            now = new Date(),
            useCached;

        loadConfig(asyncParams);

        useCached = (lastApiCallTime !== undefined && now.getTime() - lastApiCallTime.getTime() < asyncParams.group.cacheTimeMs) ? true : false;
        console.info('useCached=', useCached, 'lastApiCallTime=', lastApiCallTime);
        if (lastApiCallTime !== undefined) {
            console.info('diff=', (now.getTime() - lastApiCallTime.getTime()));
        }
        asyncTasks = [];
        if (useCached === false) {
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
            lastApiCallTime = new Date();
        }
        asyncTasks.push({
            execute: configBackgroudAsync,
            options: asyncParams
        });
        asyncTasks.push({
            execute: selectImageAsync,
            options: asyncParams
        });
        asyncTasks.push({
            execute: downloadAsync,
            options: asyncParams
        });
        asyncTasks.push({
            execute: changeBackgroundAsync,
            options: asyncParams
        });
        asyncCalls.start(asyncTasks, {
            success: function () {
                console.info('async calls are done.');
            },
            fail: function (reason) {
                console.error('async calls are fail. reason=', reason);
            }
        });
    }

    function startScheduledTask() {
        // console.log('asyncParams=', asyncParams);
        var cron = require('cron'),
            cronJob = cron.job(asyncParams.group.cron, function () {
                // perform operation e.g. GET request http.get() etc.
                scheduledTask();
                console.info('cron job completed');
            });
        cronJob.start();
    }

    scheduledTask();
    startScheduledTask();
}());
