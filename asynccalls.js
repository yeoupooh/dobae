/*global console, module */
(function () {

    'use strict';

    var asynccalls = {},
        index = 0,
        tasks = [],
        last = {};

    function execute() {
        var task = tasks[index];
        if (task === undefined || task.execute === undefined) {
            console.error('task is not propertly defined. task=', task);
        }
        task.execute(task.options);
    }

    function start(ts, pLast) {
        tasks = ts;
        last = pLast;
        index = 0;
        execute();
    }

    function done() {
        index = index + 1;
        if (index > tasks.length - 1) {
            last.success();
        } else {
            setTimeout(function () {
                execute();
            }, 0);
        }
    }

    function reject(reason) {
        last.fail(reason);
    }

    asynccalls = {
        start: start,
        done: done,
        reject: reject
    };

    module.exports = asynccalls;

}());