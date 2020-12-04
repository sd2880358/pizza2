rem Usage (on Windows) servertest1 username
rem Assumes project is deployed at localhost/cs637/username/pizza2_server
rem add -i or -v for more info
rem -------------get categories
curl http://localhost/cs637/%1/ch05_gs_server/api/categories
rem
rem -------------get guitars
curl http://localhost/cs637/%1/ch05_gs_server/api/categories/guitars/products
rem
rem -------------get guitar 1
curl http://localhost/cs637/%1/ch05_gs_server/api/categories/guitars/products/1
rem
rem -------------add guitar
curl -d @guitar.json -H Content-Type:application/json http://localhost/cs637/%1/ch05_gs_server/api/categories/guitars/products
rem

