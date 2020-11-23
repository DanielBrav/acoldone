<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PATCH, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Origin, Content-Type, X-Auth-Token');

$server = "localhost";
$username = "uoadozqj";
$password = "d4umy7";
$dbname = "uoadozqj_main";

$mysqli = new mysqli($server, $username, $password, $dbname);
if ($mysqli->connect_errno) {
    echo "Failed to connect to MySQL: (" . $mysqli->connect_errno . ") " . $mysqli->connect_error;
}

$input = $_GET["input"];
$select = "SELECT * FROM people WHERE name LIKE '%$input%';";

$res_array = array();

if (!$mysqli->multi_query($select)) {
    echo "Multi query failed: (" . $mysqli->errno . ") " . $mysqli->error;
}

do {
    if ($res = $mysqli->store_result()) {
        while($row = mysqli_fetch_assoc($res)) {
			array_push($res_array, $row);
		}
        $res->free();
	}
} while ($mysqli->more_results() && $mysqli->next_result());

echo json_encode($res_array);
?>