# Usage getserverday username
# Assumes project deployed at /cs637/username/pizza2_server on localhost
# Note: add -v to get more info
echo
echo -------------get server day
curl -i http://localhost/cs637/$1/pizza2_server/api/day
echo
