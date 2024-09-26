#!bin/bash
echo "hello world" 

# Usage: source startup.sh
# then just type any of the function names to run them
# do not run this script for the first time without first stopping whatever..
# dev processes are running, this will cause the script to not function correctly
# the reason being is once either data_acquisition or frontend is started it...
# will store the pid of the process so that it can be stopped later

# this file has several functions
# create log if not exists checks if the current directory has a log file..
# the log file is used to store the output of the processes that are started...
# a log file is created for each directory

# start_supabase starts the supabase backend and logs the output to a log file
# stop_supabase stops the supabase backend

# start_dataacq starts the data acquisition process and logs the output to a log file
# stop_dataacq stops the data acquisition process

# start_frontend starts the angular frontend and logs the output to a log file
# stop_frontend stops the angular frontend 
supabase_dir=supabase-backend/
dataacq_dir=data-acquisition/
frontend_dir=frontend/



create_log_if_not_exists() {
  # Define the log file name
  log_file=".log"
  
  # Check if the log file exists
  if [ ! -f "$log_file" ]; then
    # Create the log file if it does not exist
    touch "$log_file"
    echo "Log file created: $log_file"
  else
    echo "Log file already exists: $log_file"
  fi
}

function start_supabase {
    cd $supabase_dir
    create_log_if_not_exists
    npx supabase start
    nohup npx supabase functions serve --env-file .env 1>&1 >> .log &
    cd ../
}
function stop_supabase {
    cd $supabase_dir
    npx supabase stop
    cd ../
}

function start_dataacq {
    cd $dataacq_dir
    create_log_if_not_exists
    npx ts-node src/app.ts 1>&1 >> .log &
    dataacq_pid=$!
     
    cd ../
}

function stop_dataacq {
    if [[ -n "$dataacq_pid" ]]; then
        echo "Stopping data acquisition process with PID: $dataacq_pid"
        kill -9 $dataacq_pid
    else
        echo "could not stop data acquisition process, its possible you may need to stop it manually netstat -tulnp | grep :4200 may help"
    fi
}

function start_frontend {
    create_log_if_not_exists
    cd $frontend_dir
    nohup npm run start 1>&1 >> .log &
    frontend_pid=$!
    cd ../
}

function stop_frontend {
    if [[ -n "$frontend_pid" ]]; then
        echo "Stopping Angular process with PID: $frontend_pid"
        kill -9 $frontend_pid
    else
        echo "could not stop angular process, its possible you may need to stop it manually \n netstat -tulnp | grep :4200 may help"
    fi
}

function start_all {
    start_supabase
    start_dataacq
    start_frontend
}
function stop_all {
    stop_supabase
    stop_dataacq
    stop_frontend
}