# instant-replay-button-clicker

## Usage

```js
# start server
node src/index.js --server --port 8000 --serverUrl http://localhost:8000

# start client
node src/index.js --client --websocketUrl ws://localhost:8000/ --sleepLengthMins 420 --sleepTime 00:00 --keyToPress a --antiIdleUrl http://localhost:8000/anti-idle

# send click from commandline
curl -X POST http://localhost:8000/click

# send click from browser
http://localhost:8000/
```
## License

MIT © [Jim Redfern]()


[npm-image]: https://badge.fury.io/js/button-clicker.svg
[npm-url]: https://npmjs.org/package/button-clicker
[travis-image]: https://travis-ci.com/jmredfern/button-clicker.svg?branch=master
[travis-url]: https://travis-ci.com/jmredfern/button-clicker
[daviddm-image]: https://david-dm.org/jmredfern/button-clicker.svg?theme=shields.io
[daviddm-url]: https://david-dm.org/jmredfern/button-clicker
[coveralls-image]: https://coveralls.io/repos/jmredfern/button-clicker/badge.svg
[coveralls-url]: https://coveralls.io/r/jmredfern/button-clicker
