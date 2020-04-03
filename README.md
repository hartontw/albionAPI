# REST API for X3 TC/AP
---
## Installation
Get last versions of [Node.js](https://nodejs.org/es/) and [GIT](https://git-scm.com/)

```bash
git clone https://github.com/hartontw/albionAPI.git
cd albionAPI
npm install
```

**config.json**
```json
{
    "ip": "127.0.0.1",
    "port": 8080,
    "timeout": 5000,
    "tick": 1000,
    "gamePath": "C:/Program Files (x86)/Steam/steamapps/common/x3 terran conflict",
    "dataPath":"C:/Users/Default/Documents/Egosoft/X3AP",
    "language": 34,
    "addon": true
}
```
Add your config.json in the same folder where server.js is
- **ip**: IP where API is listening
- **port**: Port where API is listening
- **timeout**: Maximum response wait
- **tick**: Update time for refresh files
- **gamePath**: X³ TC/AB game folder
- **dataPath**: X³ TC/AB User data
- **language**: Language code (phone) of your country, if undefined uses english
- **addon**: If is defined search in addon folder instead game folder
---
## Usage
#### REST Server
```bash
node server
```
Arguments:
- **scripts**: copy all scripts into scripts game folder
- **file**: resets language file
- **clear**: both operations

Example:
```bash
node server scripts
```

#### X³ Game
Open X³ TC/AP Game and execute the script:
- **api.albion.run**: To start serving
- **api.albion.stop**: To stop serving

#### Request
Open web browser or Postman and enter url:
```bash
http://127.0.0.1:8080/player
```
---
## Notes
- If Game or Game Listener is not running, all requests will result in timeout
- If Game has not desktop focus, all requests will result in timeout
- If REST server is off, Game Listener will be stopped and can not will be run again until server turn on
- Running Game Listener after clearing language file can be problematic, load game solves it
- Running state can be cancelled any time clearing or setting to false the **global variable**, default: **albionAPI_9999**
- By default files used are, [GAME_PATH]/t/9999-Lxxx.xml file and [DATA_PATH]/log9nnnn.txt range
- **api.albion** can be called directly passing needed params (not recommended)

**Environment variables**
```js
process.env.IP
process.env.PORT
process.env.TIME_OUT
process.env.TICK
process.env.GAME_PATH
process.env.DATA_PATH
process.env.LANGUAGE
process.env.ADDON
```
---
##### Thanks To:
- [Mr Bear](https://forum.egosoft.com/memberlist.php?mode=viewprofile&u=392909&sid=9c1548efc5c34d3dd65140b72e384ba4) for the amazing [X-Studio](https://forum.egosoft.com/viewtopic.php?t=301433)
- [Egosoft forums](https://forum.egosoft.com/index.php) community
---