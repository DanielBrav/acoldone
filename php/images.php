<?php
header('Content-type: text/html; charset=utf-8');
header('Access-Control-Allow-Origin: *');
ini_set('display_errors', 1);

$server = "localhost";
$username = "uoadozqj";
$password = "d4umy7";
$dbname = "uoadozqj_main";

$mysqli = new mysqli($server, $username, $password, $dbname);
if ($mysqli->connect_errno) {
    echo "Failed to connect to MySQL: (" . $mysqli->connect_errno . ") " . $mysqli->connect_error;
}


$image_id = isset($_GET["image_id"]) ? $_GET["image_id"] : 0;
$select = "";

if($image_id) {
	$select = "SELECT * FROM images WHERE id = '$image_id';";
	$select .= "SELECT p.name FROM tags t INNER JOIN people p ON p.id = t.person_id WHERE t.image_id = '$image_id';";
} else {
	$limit = $_GET["limit"];
	$offset = $_GET["offset"];
	$filterSelect = "";
	$byPeopleSelect = "";
	$select = "SELECT i.id, i.name FROM images i ";
	if(isset($_GET["filterOn"]) && $_GET["filterOn"]) {
		$byDesc = isset($_GET["byDesc"]) ? $_GET["byDesc"] : "";
		$byDescSelect = "";
		$byPeople = isset($_GET["byPeople"]) ? $_GET["byPeople"] : "";
		$byPeopleSelect = "";
		if($byDesc != "") {
			$byDescSelect = "WHERE i.description LIKE '%".$byDesc."%' ";
		}
		if($byPeople != "") {
			$byPeopleSelect = "INNER JOIN tags t ON t.image_id = i.id AND t.person_id IN (".rtrim($byPeople, ",").") ";
		}
		$select .= $byPeopleSelect;
		$select .= $byDescSelect;
	}
	$orderBy = "GROUP BY i.id ORDER BY i.id DESC LIMIT $limit OFFSET $offset";
	$select .= $orderBy;
	$select .= ";";
}

$res_array = array();

if (!$mysqli->multi_query($select)) {
    echo "Multi query failed: (" . $mysqli->errno . ") " . $mysqli->error;
}

$counter = 1;
$tagged_array = array();
do {
    if ($res = $mysqli->store_result()) {
        while($row = mysqli_fetch_assoc($res)) {
			if($counter > 1) {
				array_push($tagged_array, $row["name"]);
			} else {
				array_push($res_array, $row);
			}
		}
        $res->free();
		$counter++;
    }
} while ($mysqli->more_results() && $mysqli->next_result());

if(count($tagged_array) > 0) {
	array_push($res_array, $tagged_array);
}
echo json_encode($res_array);
?>