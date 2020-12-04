# Usage servertest3 username
# Note change -i to -v to get more info
echo --------- reinit db
curl -d 0 http://localhost/cs637/$1/pizza2_server/api/day
echo
echo ----------send 2 orders to server: should succeed with code 200
curl -d @order.json -H Content-Type:application/json  http://localhost/cs637/$1/pizza2_server/api/orders
curl -d @order.json -H Content-Type:application/json  http://localhost/cs637/$1/pizza2_server/api/orders
echo
echo ----------get all orders: should have two just inserted, with ids 1 and 2, Preparing
curl http://localhost/cs637/$1/pizza2_server/api/orders
echo 
echo ----------update order 1 to status=Baked
curl -X PUT -d @order1.json -H Content-Type:application/json  http://localhost/cs637/$1/pizza2_server/api/orders/1
echo
echo ----------get all orders: should have two just inserted, first one Baked
curl http://localhost/cs637/$1/pizza2_server/api/orders
echo
echo ----------if you see order numbers over 2 here, you need to 
echo ---------- fix your pizza_user setup, in XAMPP case only
echo ----------get order 1: should see first one, Baked
curl http://localhost/cs637/$1/pizza2_server/api/orders/1
echo



