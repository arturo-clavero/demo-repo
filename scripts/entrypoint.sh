#!/bin/bash
# Container entrypoint for the web app: wait for MySQL, then start node.
set -e

/bin/bash /app/scripts/wait-for-it.sh "${MYSQL_HOST}:${MYSQL_PORT}" -t 300 -- node server.js
