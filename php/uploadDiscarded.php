<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PATCH, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Origin, Content-Type, X-Auth-Token');

if(isset($_POST["submit"])) {
	$server = "localhost";
	$username = "uoadozqj";
	$password = "d4umy7";
	$dbname = "uoadozqj_main";

	$conn = mysqli_connect($server, $username, $password, $dbname);
	$name = $_POST["name"];
	
	$target_dir = "./photos/";
	$target_file = $target_dir . $name;
	
	$toReturn = "hello";
	
	if(file_exists($target_file)){
		if(unlink($target_file)) {
			$toReturn += "good";
			echo "Success";
		} else {
			$toReturn += "bad";
			echo "Fail";
		}
	} else {
		echo "Fail";
	}
}
?>