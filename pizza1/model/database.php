<?php
// set up to execute on XAMPP or at pe07.cs.umb.edu:
// --set up a mysql user named pizza_user on your own system
// --see database/dev_setup.sql and database/createdb.sql
// --load your mysql database on pe07 with the pizza db
// Then this code figures out which setup to use at runtime
if (gethostname() === 'pe07') {
    $username = 'donghao';  // CHANGE THIS to your cs.umb.edu username
    $password = 'donghao';  // CHANGE THIS to your mysql DB password on pe07
    $dsn = 'mysql:host=localhost;dbname='. $username . 'db';
} else {  // dev machine, can create pizzadb
    $dsn = 'mysql:host=localhost:3307;dbname=pizzadb';
    $username = 'donghao';
    $password = 'pa55word';  // or your choice
}

try {
    // specify that DB errors cause exceptions, so we can see
    // more about them
    $options = array(PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION);
    $db = new PDO($dsn, $username, $password, $options);
} catch (PDOException $e) {
    $error_message = $e->getMessage();
    include('../errors/database_error.php');
    exit();
}
