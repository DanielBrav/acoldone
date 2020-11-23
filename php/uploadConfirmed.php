<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PATCH, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Origin, Content-Type, X-Auth-Token');
ini_set('display_errors', 1);

define("API_KEY", "AIzaSyD0hnFyzNRJ2Xp1HqPrdjDjYHCy8nqzCLE");

function gps2Num($coordPart){
    $parts = explode('/', $coordPart);
    if(count($parts) <= 0)
    return 0;
    if(count($parts) == 1)
    return $parts[0];
    return floatval($parts[0]) / floatval($parts[1]);
}

if(isset($_POST["submit"])) {
	$server = "localhost";
	$username = "uoadozqj";
	$password = "d4umy7";
	$dbname = "uoadozqj_main";

	$mysqli = new mysqli($server, $username, $password, $dbname);
	if ($mysqli->connect_errno) {
		echo "Failed to connect to MySQL: (" . $mysqli->connect_errno . ") " . $mysqli->connect_error;
		return;
	}

	$name = isset($_POST["name"]) ? $_POST["name"] : "";
	$taggedPeople = isset($_POST["taggedPeople"]) ? $_POST["taggedPeople"] : "";
	$description = isset($_POST["description"]) ? addslashes($_POST["description"]) : "";
	
	if($name == "") { return "No name"; }
	
	$imageSrc = './photos/' . $name;
	
	$exifData  = exif_read_data($imageSrc, 'IFD0');
	$allExifData = exif_read_data($imageSrc, 'EXIF');
	
	$takenDate = "";
	
	$locationCardentials = "";
	
	print_r($allExifData);
	
	
	if(array_key_exists('GPSLatitude', $allExifData) && array_key_exists('GPSLongitude', $allExifData)
		&& array_key_exists('GPSLatitudeRef', $allExifData) && array_key_exists('GPSLongitudeRef', $allExifData)) {
        $GPSLatitudeRef = $allExifData['GPSLatitudeRef'];
        $GPSLatitude    = $allExifData['GPSLatitude'];
        $GPSLongitudeRef= $allExifData['GPSLongitudeRef'];
        $GPSLongitude   = $allExifData['GPSLongitude'];
        
        $lat_degrees = count($GPSLatitude) > 0 ? gps2Num($GPSLatitude[0]) : 0;
        $lat_minutes = count($GPSLatitude) > 1 ? gps2Num($GPSLatitude[1]) : 0;
        $lat_seconds = count($GPSLatitude) > 2 ? gps2Num($GPSLatitude[2]) : 0;
        
        $lon_degrees = count($GPSLongitude) > 0 ? gps2Num($GPSLongitude[0]) : 0;
        $lon_minutes = count($GPSLongitude) > 1 ? gps2Num($GPSLongitude[1]) : 0;
        $lon_seconds = count($GPSLongitude) > 2 ? gps2Num($GPSLongitude[2]) : 0;
        
        $lat_direction = ($GPSLatitudeRef == 'W' or $GPSLatitudeRef == 'S') ? -1 : 1;
        $lon_direction = ($GPSLongitudeRef == 'W' or $GPSLongitudeRef == 'S') ? -1 : 1;
        
        $latitude = $lat_direction * ($lat_degrees + ($lat_minutes / 60) + ($lat_seconds / (60*60)));
        $longitude = $lon_direction * ($lon_degrees + ($lon_minutes / 60) + ($lon_seconds / (60*60)));

        //print_r(array('latitude'=>$latitude, 'longitude'=>$longitude));
		$locationCardentials = $latitude.",".$longitude;
		
		$google_api_addr = "https://maps.googleapis.com/maps/api/geocode/json?latlng=".$locationCardentials."&sensor=false&language=English&key=".API_KEY;
		$google_api_res = file_get_contents($google_api_addr);
		$res_json = json_decode($google_api_res, true);
		
		echo $google_api_addr;
		echo "<br>";
		print_r($res_json);
		
		$locationName = "";
		if(array_key_exists("results", $res_json) && count($res_json["results"]) > 0) {
			if(array_key_exists('formatted_address', $res_json["results"][0])) {
				$locationName = $res_json["results"][0]["formatted_address"];
			}
		}
		
	}
	
	$make = "";
	$model = "";
	if(array_key_exists("Make", $allExifData)) {
		$make = $allExifData["Make"];
	}
	if(array_key_exists("Model", $allExifData)) {
		$model = $allExifData["Model"];
	}
	
	if($exifData !== FALSE) {
	  if(array_key_exists('DateTime', $exifData ) ) {
		$takenDate = new DateTime( $exifData['DateTime']);
		$takenDate = date_timestamp_get($takenDate);
	  } else {
		  echo "No DateTime.\n";
	  }
	} else {
		echo "Exif data is false.\n";
	}
	
	$peopleIds = explode(",", rtrim($taggedPeople, ","));
	
	$makeAndModel = '';
	if($make == '') {
		if($model != '') {
			$makeAndModel = $model;
		}
	} else {
		if($model != '') {
			$makeAndModel = $make.", ".$model;
		} else {
			$makeAndModel = $make;
		}
	}
	
	$insert = "INSERT INTO `images` (`id`, `name`, `description`, `taken_date`, `location`, `location_name`, `model`) VALUES (NULL, '$name', '$description', '$takenDate', '$locationCardentials', '$locationName', '$makeAndModel');";
	$insert .= "SELECT id FROM images WHERE name = '$name';";
	
	if (!$mysqli->multi_query($insert)) {
		echo "Multi query failed: (" . $mysqli->errno . ") " . $mysqli->error;
	}

	$res_array = array();
	$image_id = "";
	$mysqli->more_results();
	$mysqli->next_result();
	
	if ($query_1 = $mysqli->store_result()) {
		while($row = mysqli_fetch_assoc($query_1)) {
			$imageId = $row["id"];
		}
		$query_1->free();
	}
	
	$mysqli->more_results();
	$mysqli->next_result();
	
	if($imageId == "") {
		return "Error, Didn't found image id.";
	}
	
	$peopleIds_string = "";
	foreach($peopleIds as $id) {
		$peopleIds_string .= "(NULL, '$imageId', '$id'),";
	}
	if($peopleIds_string != "") {
		$peopleIds_string = rtrim($peopleIds_string, ",");
	}
	
	$insert = "INSERT INTO `tags` (`id`, `image_id`, `person_id`) VALUES ".$peopleIds_string.";";
	$mysqli->query($insert);
	
	return "OK";
}
?>