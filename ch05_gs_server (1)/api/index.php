<?php

require __DIR__ . '/../vendor/autoload.php';

// provide aliases for long classname--
use \Psr\Http\Message\ServerRequestInterface as Request;
use \Psr\Http\Message\ResponseInterface as Response;

// Instantiate the app
$app = new \Slim\App();
// Add middleware that can add CORS headers to response (if uncommented)
// These CORS headers allow any client to use this service (the wildcard star)
// We don't need CORS for the ch05_gs client-server project, because
// its network requests don't come from the browser. Only requests that
// come from the browser need these headers in the response to satisfy
// the browser that all is well. Even in that case, the headers are not
// needed unless the server for the REST requests is different than
// the server for the HTML and JS. When we program in Javascript we do
// send requests from the browser, and then the server may need to
// generate these headers.
// Also specify JSON content-type, and overcome default Allow of GET, PUT
// Note these will be added on failing cases as well as sucessful ones
$app->add(function ($req, $res, $next) {
    $response = $next($req, $res);
    return $response
                 //   ->withHeader('Access-Control-Allow-Origin', '*')
                 //   ->withHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Accept, Origin, Authorization')
                 //   ->withHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS')
                    ->withHeader('Content-Type', 'application/json')
                    ->withHeader('Allow', 'GET, POST, PUT, DELETE');
});
// Turn PHP errors and warnings (div by 0 is a warning!) into exceptions--
// From https://stackoverflow.com/questions/1241728/can-i-try-catch-a-warning
set_error_handler(function($errno, $errstr, $errfile, $errline) {
    // error was suppressed with the @-operator--
    if (0 === error_reporting()) {
        return false;
    }
    throw new ErrorException($errstr, 0, $errno, $errfile, $errline);
});

// Slim has default error handling, but not super useful
// so we'll override those handlers so we can handle errors 
// in this code, and report file and line number.
// This also means we don't set $config['displayErrorDetails'] = true;
// because that just affects the default error handler.
// See https://akrabat.com/overriding-slim-3s-error-handling/
// To see this in action, put a parse error in your code
$container = $app->getContainer();
$container['errorHandler'] = function ($container) {
    return function (Request $request, Response $response, $exception) {
        // retrieve logger from $container here and log the error
        $response->getBody()->rewind();
        $errorJSON = '{"error":{"text":' . $exception->getMessage() .
                ', "line":' . $exception->getLine() .
                ', "file":' . $exception->getFile() . '}}';
        //     echo 'error JSON = '. $errorJSON;  
        error_log("server error: $errorJSON");
        return $response->withStatus(500)
                        //            ->withHeader('Content-Type', 'text/html')
                        ->write($errorJSON);
    };
};

// This function should not be called because errors are turned into exceptons
// but it still is, on error 'Call to undefined function' for example
$container['phpErrorHandler'] = function ($container) {
    return function (Request $request, Response $response, $error) {
        // retrieve logger from $container here and log the error
        $response->getBody()->rewind();
        echo 'PHP error:  ';
        print_r($error->getMessage());
        $errorJSON = '{"error":{"text":' . $error->getMessage() .
                ', "line":' . $error->getLine() .
                ', "file":' . $error->getFile() . '}}';
        error_log("server error: $errorJSON");
        return $response->withStatus(500)
                        //  ->withHeader('Content-Type', 'text/html)
                        ->write($errorJSON);
    };
};
// Create the "routes" (URL patterns) we are going to handle
// Msny of them have "named placeholders" {id} and {cat}
$app->get('/categories', 'getCategories');
$app->get('/categories/{cat}/products', 'getProductsByCategory');
$app->get('/categories/{cat}/products/{id}', 'getProduct');
$app->post('/categories/{cat}/products', 'postProduct');
$app->delete('/categories/{cat}/products/{id}', 'deleteProduct');

// Take over response to URLs that don't match above rules, to avoid sending
// HTML back in these cases
$app->map(['GET', 'POST', 'PUT', 'DELETE'], '/{routes:.+}', function($req, $res) {
    $uri = $req->getUri();
    $errorJSON = '{"error": "HTTP 404 (URL not found) for URL ' . $uri . '"}';
    return $res->withStatus(404)
                    ->write($errorJSON);
});

$app->run();

// functions without try-catch are depending on overall
// exception handlers set up above, which generate HTTP 500
// Functions that need to generate HTTP 400s (client errors)
// have try-catch
function getCategories() {
    error_log("server getCategories");
    $db = getConnection();
    $query = 'SELECT * FROM categories
              ORDER BY categoryID';
    $statement = $db->prepare($query);
    $statement->execute();
    $categories = $statement->fetchAll(PDO::FETCH_ASSOC);
    $statement->closeCursor();
    echo json_encode($categories);
}

function getProductsByCategory(Request $request, Response $response, $args) {
    error_log('server getProductsByCategory');
    $catname = $args['cat'];
    // error_log('server cat = ' . $catname);
    $db = getConnection();
    $query = 'SELECT p.* FROM products p, categories c
       WHERE p.categoryID = c.categoryID and c.categoryName = :categoryname
              ORDER BY productID';
    $statement = $db->prepare($query);
    $statement->bindValue(":categoryname", $catname);
    $statement->execute();
    $products = $statement->fetchAll(PDO::FETCH_ASSOC);
    $statement->closeCursor();
    echo json_encode($products);
}

// add args param to function to pick up id from {id} in URL pattern
function getProduct(Request $request, Response $response, $args) {
    error_log('server getProduct');
    $cat = $args['cat'];
    $id = $args['id'];
    // echo 'id = '. $id;
    $db = getConnection();
    // this checks that the provided category name is correct
    $query = 'SELECT p.* FROM products p, categories c
              WHERE c.categoryID = p.categoryID and 
              c.categoryName = :category_name and p.productID = :product_id';
    $statement = $db->prepare($query);
    $statement->bindValue(":category_name", $cat);
    $statement->bindValue(":product_id", $id);
    $statement->execute();
    $product = $statement->fetch(PDO::FETCH_ASSOC);
    if ($product === FALSE) {
        // can't find product, so return not-found
        $errorJSON = '{"error":{"text":product not found}}';
        error_log("server error $errorJSON");
        return $response->withStatus(404) // client error
                        ->write($errorJSON);     
    }
    $statement->closeCursor();
    $productJSON= json_encode($product);
    // TODO: other json_encode calls should have the following test too
    if ($productJSON === FALSE) {  // encode failed
        $errorJSON = '{"error":{"text":JSON encode error' . json_last_error_msg() . '}}';
        error_log("server error $errorJSON");
        return $response->withStatus(500) // server error
                        ->write($errorJSON);
    }
    return $response->withStatus(200) 
                    ->write($productJSON);
}

function postProduct(Request $request, Response $response) {
    error_log("server postProduct");
    error_log("server: body: " . $request->getBody());
    $product = $request->getParsedBody();  // Slim does JSON_decode here
    error_log('server: parsed product = ' . print_r($product, true));
    if ($product == NULL) { // parse failed (bad JSON)
        $errorJSON = '{"error":{"text":"bad JSON in request"}}';
        error_log("server error $errorJSON");
        return $response->withStatus(400)  //client error
                        ->write($errorJSON);
    }
    try {
        $db = getConnection();
        $productID = addProduct($db, $product['categoryID'], $product['productCode'], $product['productName'], $product['listPrice']);
    } catch (PDOException $e) {
        // if duplicate product, blame client--
        if (strstr($e->getMessage(), 'SQLSTATE[23000]')) {
            $errorJSON = '{"error":{"text":' . $e->getMessage() .
                    ', "line":' . $e->getLine() .
                    ', "file":' . $e->getFile() . '}}';
            error_log("server error $errorJSON");
            return $response->withStatus(400) // client error
                            ->write($errorJSON);
        } else {
            throw($e);  // generate HTTP 500 as usual         
        }
    }
    $product['productID'] = $productID;  // fix up id to current one
    $JSONcontent = json_encode($product);
    //echo $JSONcontent;  // wouldn't provide location header
    $location = $request->getUri() . '/' . $product["productID"];
    return $response->withHeader('Location', $location)
                    ->withStatus(200)
                    ->write($JSONcontent);
}

function addProduct($db, $category_id, $code, $name, $price) {
    error_log("server addProduct");
    $query = 'INSERT INTO products
                 (categoryID, productCode, productName, listPrice)
              VALUES
                 (:category_id, :code, :name, :price)';
    $statement = $db->prepare($query);
    $statement->bindValue(':category_id', $category_id);
    $statement->bindValue(':code', $code);
    $statement->bindValue(':name', $name);
    $statement->bindValue(':price', $price);
    $statement->execute();
    $statement->closeCursor();
    $id = $db->lastInsertId();
    return $id;
}

function deleteProduct(Request $request, Response $response, $args) {
    error_log("server deleteProduct");
    $id = $args['id'];
    // error_log('server id = ' . $id);
    $sql = "DELETE FROM products WHERE productID=:id";
    try {
        $db = getConnection();
        $stmt = $db->prepare($sql);
        $stmt->bindParam("id", $id);
        $stmt->execute();
        $rows = $stmt->rowcount();
        if ($rows === 0) {
            $errorJSON = '{"error":{"text":"No such product"}}';
            error_log("server error $errorJSON");
            return $response->withStatus(400)  //client error
                            ->write($errorJSON);
        }
    } catch (PDOException $e) {
        echo '{"error":{"text":' . $e->getMessage() .
        ', "line":' . $e->getLine() .
        ', "file":' . $e->getFile() . '}}';
    }
}

function getConnection() {
    if (gethostname() === 'pe07') {
        $dbuser = 'eoneil1';  // CHANGE THIS to your cs.umb.edu username
        $dbpass = 'eoneil1';  // CHANGE THIS to your mysql DB password on pe07 
        $dbname = $dbuser . 'db'; // our convention for mysql dbs on pe07   
    } else {  // dev machine, can create my_guitar_shop1 db
        $dbuser = "mgs_user";
        $dbpass = 'pa55word';  // or your choice
        $dbname = "my_guitar_shop1";
    }
    $dsn = 'mysql:host=localhost;dbname=' . $dbname;
    $dbh = new PDO($dsn, $dbuser, $dbpass);
    $dbh->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    return $dbh;
}
