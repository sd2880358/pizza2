# Usage (on Linux/Mac) servertest1.sh username
# Assumes project is deployed at localhost/cs637/username/pizza2_server
# add -i or -v for more info
echo -------------get server day: should show 1 if DB in init. state
curl http://localhost/cs637/$1/pizza2_server/api/day
echo
echo -------------get toppings: returns toppings in JSON
curl http://localhost/cs637/$1/pizza2_server/api/toppings
echo
echo -------------get sizes
curl http://localhost/cs637/$1/pizza2_server/api/sizes
echo
echo -------------get users
curl http://localhost/cs637/$1/pizza2_server/api/users
echo

