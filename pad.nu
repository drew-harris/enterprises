###

#@ startup
let dir = "/Users/drew/programs/enterprises"
let pkg_dir = $dir | path join pkg
tmux new-window -c $dir
tmux split-window -v -c $pkg_dir
tmux send-keys -t .1 "cd \"$pkg_dir\"" Enter
tmux send-keys -t .0 "docker compose up --watch" Enter
tmux send-keys -t .1 "bun dev" Enter
exit

#@ Test
zsh -c "http https://admin.localhost"
