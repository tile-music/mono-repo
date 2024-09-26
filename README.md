# Music-Visualization-MQP-Code

## docker usage

usage is as follows, under the main repo after running git pull, git submodule update --init run the env.ps1 script

then under the main repo run:

* `docker compose build` to build the project

* `docker compose build --no-cache` works like make clean, make
* `docker compose up -d`   to run the project detached, you can see log output in docker desktop
* `docker compose up` to run the project with log output enabled
* `docker compose down` to stop the app

you can also start and stop individual containers for example:
`docker compose down data-acquisition` (but spell it right)

Then you can rebuild just that one
`docker compose build data-acquisition`

next restart it
`docker compose up data-acquisition`
handily tab completion works because the folder is in the current path and docker is smart enough to just drop the /

You may also run docker compose with the watch argument, which will restart after the code changes. This only works for data acquistion and frontend for now

`docker compose up --watch`

its also possible to do it on an individual container like so

`docker compose up frontend --watch`

this is actually probably a better way to deal with it because then it gives some options at the bottom. like, view in docker desktop and disable watch, very nice

please note that using watch seems to increase cpu usage noticeably on my machine i saw (including my whole system with the containers running, about 12-17% cpu usage up to as high as 50%