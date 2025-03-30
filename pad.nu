###

#@ startup
let dir = "/Users/drew/programs/enterprises"
tmux new-window -c $dir
tmux split-window -v -c $dir
tmux send-keys -t .0 "docker compose up" enter
tmux send-keys -t .1 "cd pkg && bun dev" enter
exit
