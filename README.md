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

## License

This project is licensed under the [GNU General Public License v3.0 (GPL-3.0)](https://www.gnu.org/licenses/gpl-3.0.en.html).
