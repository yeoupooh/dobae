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

