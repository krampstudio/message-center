#Message Center Engine

## Install

### Dependencies
 - node.js (>= 0.8 required, 0.10.x advised) from this [PPA](https://launchpad.net/~chris-lea/+archive/node.js/)
 - redis-server

### Set up 

```shell
npm install -g grunt-cli
npm install -g pm2

npm install
npm run install
```

Update the conf file at `conf/config.json`. The address of the messages endpoints must be set (where messages are polled from).

## Developpment

### Run the app

Start the stub:

```shell
node ext/server.js
```

Start the app :

```shell
node app.js
```
A test console is available on port 3000

## Production

Use [pm2](https://github.com/Unitech/pm2) to manage node processes.

To run the maximum processes (regarding the number of proc,vproc or cores  available):

```shell
pm2 start app.js -i max
```

Once the processes are started, run the following command (*as root/sudo*) to create an _init_ script and enable restart with the server :

```shell
sudo m2 dump
sudo pm2 startup
```

Then you can run the usual `service` `/etc/init.d` start/stop:

```shell
sudo service pm2-init.sh start/stop/restart/status
```


To list the running processes :

```shell
pm2 list
```


