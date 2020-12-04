rem Usage (on Windows) servertest0 username
rem Example: servertest1 username 
rem Assumes project is deployed at localhost/cs637/username/pizza2_server
rem add -i or -v for more info
rem -------------get server day: should show 1 if DB in init. state
curl http://localhost/cs637/%1/pizza2_server/api/day
rem
rem -------------get toppings: returns toppings in JSON
curl http://localhost/cs637/%1/pizza2_server/api/toppings
rem
rem -------------get sizes
curl http://localhost/cs637/%1/pizza2_server/api/sizes
rem
rem -------------get users
curl http://localhost/cs637/%1/pizza2_server/api/users
rem

