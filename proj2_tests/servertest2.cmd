rem Usage servertest2 username
rem Note change -i to -v to get more info
rem ------------- reinit db
curl -d 0 http://localhost/cs637/%1%/pizza2_server/api/day
rem
rem ---------------get order 1: should fail with code 404
curl -i http://localhost/cs637/%1%/pizza2_server/api/orders/1
rem
rem ---------------get all orders: should return empty array
curl -i http://localhost/cs637/%1%/pizza2_server/api/orders
rem
rem -------------send order to server: should succeed with code 200
curl -i -d @order.json -H Content-Type:application/json  http://localhost/cs637/%1/pizza2_server/api/orders
rem
rem  -------------send bad-status order to server: should fail with HTTP 400
curl -i -d @order_badstatus.json -H Content-Type:application/json  http://localhost/cs637/%1/pizza2_server/api/orders
rem
rem  -------------send bad-json order to server: should fail with HTTP 400
curl -i -d @order_badjson.json -H Content-Type:application/json  http://localhost/cs637/%1/pizza2_server/api/orders
rem
rem ---------------get all orders: should have one just inserted
curl -i http://localhost/cs637/%1%/pizza2_server/api/orders
rem



