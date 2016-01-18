/*global console */
/*global require */
/*global process */
/*global describe, beforeEach, afterEach, it */

(function () {

    'use strict';

    const assert = require('assert'),
        fs = require('fs'),
        download = require('../download.js'),
        DOWNLOADED_FILE = '_test_downloaded_file';

    describe('download', function () {

        afterEach(function () {
            fs.unlink(DOWNLOADED_FILE);
        });

        it('should download a file', function (done) {
            var url = 'https://secure.static.tumblr.com/6854759f25b5d620789087b01823b335/zenuxxa/V5Xnt6ttx/tumblr_static_cjngsab3yxsgw4ow40k8g4k40.jpg';

            download(url, DOWNLOADED_FILE, function (error) {
                assert(error === undefined, "Failed to download.");
                assert(fs.existsSync(DOWNLOADED_FILE), "Downloaded file does not exist.");
                const readChunk = require('read-chunk');
                const fileType = require('file-type');
                const buffer = readChunk.sync(DOWNLOADED_FILE, 0, 262);
                const ft = fileType(buffer);
                assert(ft.ext === 'jpg' && ft.mime === 'image/jpeg', "Not image file.");
                done();
            });
        })

        // it end

    });

    // describe end

}());
