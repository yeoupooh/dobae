[![Build Status](https://travis-ci.org/yeoupooh/dobae.svg?branch=master)](https://travis-ci.org/yeoupooh/dobae)
[![Codacy Badge](https://api.codacy.com/project/badge/grade/3fb907015b5f4cd187ef09ef16894344)](https://www.codacy.com/app/thomas-min-v1/dobae)
[![Codeship Status for yeoupooh/dobae](https://codeship.com/projects/86bc7f40-9e42-0133-c0c5-36bf3814fed7/status?branch=master)](https://codeship.com/projects/127719)
[![Code Climate](https://codeclimate.com/github/yeoupooh/dobae/badges/gpa.svg)](https://codeclimate.com/github/yeoupooh/dobae)
[![license-GPLv2](https://img.shields.io/badge/license-GPLv2-blue.svg)](http://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html)
[![implementation-nodejs-brightgreen](https://img.shields.io/badge/server-nodejs-brightgreen.svg)](https://nodejs.org/en/)

# dobae
Dobae Wallpaper Changer for linux(Redhat, CentOS, Ubuntu) using Node JS

# Install
```
npm install
```

# Edit dobae.config.json
* You can copy it from dobae.config.sample.json.
```
{
    "groups": {
        "default": {
            "cron": "0 */10 * * * *",
            "cacheTimeMs": 86400000,
            "pictureOptions": "zoom",
            "providers": [{
                "provider": "tumblr",
                "url": "https://api.tumblr.com/v2/blog/peacecorps.tumblr.com/posts/text?api_key=fuiKNFp9vQFvjLNvx4sUwti4Yb5yGutBN4Xh10LXZhhRKjWlV4&notes_info=true"
            }]
        }
    }
}
```


# Run with default group
```
npm start
```

# Run with specific group
```
npm start <your group>
```


[![Bitdeli Badge](https://d2weczhvl823v0.cloudfront.net/yeoupooh/dobae/trend.png)](https://bitdeli.com/free "Bitdeli Badge")
