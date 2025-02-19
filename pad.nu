###

#@ startup
tmux rename-window -t 0 "docker"
docker compose up --watch --build --no-attach adminer
exit
