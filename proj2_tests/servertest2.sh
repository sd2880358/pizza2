# Usage servertest2 username
# Note add -i or change -i to -v to get more info
echo ------------- reinit db
curl -d 0 http://localhost/cs637/$1/pizza2_server/api/day
echo
echo ---------------get order 1: should fail with code 404
curl -i http://localhost/cs637/$1/pizza2_server/api/orders/1
echo
echo ---------------get all orders: should return empty array
curl http://localhost/cs637/$1/pizza2_server/api/orders
echo
echo  -------------send order to server: should succeed with code 200
curl -d @order.json -H Content-Type:application/json  http://localhost/cs637/$1/pizza2_server/api/orders
echo
echo ---------------get all orders: should have one just inserted
curl http://localhost/cs637/$1/pizza2_server/api/orders
echo
echo  -------------send bad-status order to server: should fail with HTTP 400
curl -i -d @order_badstatus.json -H Content-Type:application/json  http://localhost/cs637/$1/pizza2_server/api/orders
echo
echo  -------------send bad-json order to server: should fail with HTTP 400
curl -i -d @order_badjson.json -H Content-Type:application/json  http://localhost/cs637/$1/pizza2_server/api/orders
echo
echo ---------------get all orders: should have one previously inserted
curl http://localhost/cs637/$1/pizza2_server/api/orders
echo


