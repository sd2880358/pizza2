rem Usage servertest3 username
rem Note change -i to -v to get more info
rem --------- reinit db
curl -d 0 http://localhost/cs637/%1%/pizza2_server/api/day
rem
rem ----------send 2 orders to server: should succeed with code 200
curl -i -d @order.json -H Content-Type:application/json  http://localhost/cs637/%1/pizza2_server/api/orders
curl -i -d @order.json -H Content-Type:application/json  http://localhost/cs637/%1/pizza2_server/api/orders
rem
rem ----------get all orders: should have two just inserted, with ids 1 and 2, Preparing
curl http://localhost/cs637/%1%/pizza2_server/api/orders
rem
rem ----------update order 1 to status=Baked
curl -X PUT -d @order1.json -H Content-Type:application/json  http://localhost/cs637/%1/pizza2_server/api/orders/1
rem
rem ----------get all orders: should have two just inserted, first one Baked
curl http://localhost/cs637/%1%/pizza2_server/api/orders
rem
rem ----------if you see orders numbers over 2 here, you need to
rem ---------- fix your pizza_user setup, in XAMPP case only
rem ----------get order 1: should see first one, Baked
curl http://localhost/cs637/%1/pizza2_server/api/orders/1
rem





