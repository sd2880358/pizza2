# Usage (on Linux/Mac) servertest1.sh username
# Assumes project is deployed at localhost/cs637/username/pizza2_server
# add -i or -v for more info
echo -------------get categories
curl http://localhost/cs637/$1/ch05_gs_server/api/categories
echo
echo -------------get guitars
curl http://localhost/cs637/$1/ch05_gs_server/api/categories/guitars/products
echo
echo -------------get guitar 1
curl http://localhost/cs637/$1/ch05_gs_server/api/categories/guitars/products/1
echo
echo -------------delete guitar 11
curl -X delete -H Content-Type:application/json http://localhost/cs637/$1/ch05_gs_server/api/categories/guitars/products/11
echo ------------try to get guitar 11
curl http://localhost/cs637/$1/ch05_gs_server/api/categories/guitars/products/11

echo

