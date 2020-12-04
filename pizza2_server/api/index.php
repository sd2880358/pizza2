<?php
require __DIR__ . '/../vendor/autoload.php';
require 'initial.php';
// provide aliases for long classname--
use \Psr\Http\Message\ServerRequestInterface as Request;
use \Psr\Http\Message\ResponseInterface as Response;

set_local_error_log(); // redirect error_log to ../php_server_errors.log
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
                    ->withHeader('Access-Control-Allow-Origin', '*')
                    ->withHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Accept, Origin, Authorization')
                    ->withHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS')
                    ->withHeader('Content-Type', 'application/json')
                    ->withHeader('Allow', 'GET, POST, PUT, DELETE');
});
// Turn PHP errors and warnings (div by 0 is a warning!) into exceptions--
// From https://stackoverflow.com/questions/1241728/can-i-try-catch-a-warning
set_error_handler(function($errno, $errstr, $errfile, $errline) {
    // error was suppressed with the @-operator--
    // echo 'in error handler...';
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
$app->get('/day', 'getDay');
// TODO add routes and functions for them,using ch05_gs_server code as a guide
$app->get('/toppings', 'getToppings');
$app->get('/sizes', 'getSizes');
$app->get('/users', 'getUsers');
$app->post('/day', 'postDay');
$app->get('/orders/{order}', 'get_order_by_id');
$app->get('/orders', 'get_all_orders');
$app->post('/orders', "postOrders");
$app->put('/orders/{id}', 'change_status');
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
// Function calls that don't throw return HTTP 200
function getDay(Request $request, Response $response) {
    error_log("server getDay");
    $sql = "select current_day FROM pizza_sys_tab";
    $db = getConnection();
    $stmt = $db->query($sql);
    // fetch just column 0 value--
    return $stmt->fetch(PDO::FETCH_COLUMN, 0);
}
function get_order_by_id(Request $request, Response $response, $args){
    $order_number = $args['order'];
    error_log("server get_order_by_id");
    $db = getConnection();
    $sql = "SELECT * FROM pizza_orders where id = :id";
    $statement = $db->prepare($sql);
    $statement->bindValue(":id", $order_number);
    $statement->execute();
    $order = $statement->fetch(PDO::FETCH_ASSOC);
    $statement->closeCursor();
    return json_encode($order);
}
function get_all_orders(Request $request, Response $response){
    error_log("server get_orders");
    $db = getConnection();
    $sql = "SELECT * FROM pizza_orders";
    $statement = $db->prepare($sql);
    $statement->execute();
    $orders = $statement->fetchAll(PDO::FETCH_ASSOC);
    $statement->closeCursor();
    return json_encode($orders);
}
function getToppings(Request $request, Response $response){
    error_log("server getToppings");
    $sql = "SELECT topping FROM menu_toppings";
    $db = getConnection();
    $stmt = $db->prepare($sql);
    $stmt->execute();
    $sizes = $stmt->fetchAll(PDO::FETCH_COLUMN);
    $stmt->closeCursor();
    echo json_encode($sizes);
}

function getSizes(Request $request, Response $response){
    error_log("server getSizes");
    $sql = "SELECT size FROM menu_sizes";
    $db = getConnection();
    $stmt = $db->prepare($sql);
    $stmt->execute();
    $sizes = $stmt->fetchAll(PDO::FETCH_COLUMN);
    $stmt->closeCursor();
    echo json_encode($sizes);
}

function getUsers(Request $request, Response $response){
    error_log("server getUsers");
    $sql = "SELECT username FROM shop_users";
    $db = getConnection();
    $stmt = $db->prepare($sql);
    $stmt->execute();
    $users = $stmt->fetchAll(PDO::FETCH_COLUMN);
    $stmt->closeCursor();
    echo json_encode($users);
}

function postDay(Request $request, Response $response) {
    error_log("server postDay");
    $db = getConnection();
    initial_db($db);
    return "1";  // new day value
}
function postOrders(Request $request, Response $response) {
    error_log("server postOrders");
    error_log("server: body: " . $request->getBody());
    $orders = $request->getParsedBody();  // Slim does JSON_decode here
    error_log('server: parsed order = ' . print_r($orders, true));
    if ($orders == NULL) { // parse failed (bad JSON)
        $errorJSON = '{"error":{"text":"bad JSON in request"}}';
        error_log("server error $errorJSON");
        return $response->withStatus(400)  //client error
        ->write($errorJSON);
    }
    try {
        $db = getConnection();
        $id = addOrders($db, $orders['user_id'], $orders['size'], $orders['day'], $orders['status']);
        add_toppings_to_orders($db, $id, $orders['toppings']);
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
    $JSONcontent = json_encode($orders);
    $location = $request->getUri() . '/' . $orders["id"];
    return $response->withHeader('Location', $location)
        ->withStatus(200)
        ->write($JSONcontent);
}
// set up to execute on XAMPP or at pe07.cs.umb.edu:
// --set up a mysql user named pizza_user on your own system
// --see database/dev_setup.sql and database/createdb.sql
// --load your mysql database on pe07 with the pizza db
// Then this code figures out which setup to use at runtime
function getConnection() {
    if (gethostname() === 'pe07') {
        $dbuser = 'donghao';  // CHANGE THIS to your cs.umb.edu username
        $dbpass = 'donghao';  // CHANGE THIS to your mysql DB password on pe07
        $dbname = $dbuser . 'db'; // our convention for mysql dbs on pe07
        $dsn = 'mysql:host=localhost;dbname=' . $dbname;
    } else {  // dev machine, can create pizzadb
        $dsn = 'mysql:host=localhost:3307;dbname=pizzadb';
        $dbuser = 'donghao';
        $dbpass = 'pa55word';
    }
    $dbh = new PDO($dsn, $dbuser, $dbpass);
    $dbh->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    return $dbh;
}

function addOrders($db, $user_id, $size, $day, $status){
    error_log("server addOrders");
    $query = 'INSERT INTO pizza_orders
                 (user_id, size, day, status)
              VALUES
                 (:user_id, :size, :day, :status)';
    $statement = $db->prepare($query);
    $statement->bindValue(':user_id', $user_id);
    $statement->bindValue(':size', $size);
    $statement->bindValue(':day', $day);
    $statement->bindValue(':status', $status);
    $statement->execute();
    $statement->closeCursor();
    $id = $db->lastInsertId();
    return $id;
}

function add_toppings_to_orders($db, $id, $toppings){
    foreach ($toppings as $topping){
        $query = 'INSERT INTO order_topping
                 (order_id, topping)
              VALUES
                 (:order_id, :topping)';
        $statement = $db->prepare($query);
        $statement->bindValue(':order_id', $id);
        $statement->bindValue(':topping', $topping);
        $statement->execute();
        $statement->closeCursor();
    }
}

function change_status(Request $request, Response $response, $args){
    $order_number = $args['id'];
    error_log("server change_status");
    $db = getConnection();
    $sql = 'UPDATE pizza_orders SET status=\'Baked\' WHERE status=\'Preparing\' and id=:id';
    $statement = $db->prepare($sql);
    $statement->bindValue(':id', $order_number);
    $statement->execute();
    $statement->closeCursor();
}