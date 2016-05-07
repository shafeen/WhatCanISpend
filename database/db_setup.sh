#!/bin/bash

db_name=budget

if [ -f budget.db ]
then
    echo 'sqlite database budget.db exists, removing file.'
    rm -f budget.db
else
    echo 'no existing databases.'
fi
if [ -f setup.sql ]
then
    echo 'creating budget.db using file setup.sql'
    cat db_setup.sql | sqlite3 ${db_name}.db
else
    echo please create a setup.sql file and then try again!
fi
