<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PATCH, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Origin, Content-Type, X-Auth-Token');
ini_set('display_errors', 1);

function generateRandomString() {
    $characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    $charactersLength = strlen($characters);
    $randomString = '';
    for ($i = 0; $i < 25; $i++) {
        $randomString .= $characters[rand(0, $charactersLength - 1)];
    }
    return $randomString;
}

$target_dir = "photos/";
$imageFileType = strtolower(pathinfo(basename($_FILES["fileToUpload"]["name"]),PATHINFO_EXTENSION));
$new_name = generateRandomString() . "." . $imageFileType;
$target_file = $target_dir . "/" . $new_name;

$uploadOk = 1;
$failReason = "";

if(isset($_POST["submit"])) {
    $check = getimagesize($_FILES["fileToUpload"]["tmp_name"]);
    if($check !== false) {
        $uploadOk = 1;
    } else {
        $failReason .= "Error. File is not an image.\n";
        $uploadOk = 0;
    }
}
// Check if file already exists
if (file_exists($target_file)) {
    $failReason .= "Error. Sorry, file already exists.\n";
    $uploadOk = 0;
}
// Check file size
if ($_FILES["fileToUpload"]["size"] > 50000000) {
    $failReason .= "Error. Sorry, your file is too large.\n";
    $uploadOk = 0;
}
// Allow certain file formats
if($imageFileType != "jpg" && $imageFileType != "png" && $imageFileType != "jpeg"
&& $imageFileType != "gif" ) {
    $failReason .= "Error. Sorry, only JPG, JPEG, PNG & GIF files are allowed.\n";
    $uploadOk = 0;
}
// Check if $uploadOk is set to 0 by an error
if ($uploadOk == 0) {
    $failReason .= "Error. Image didn't upload correctly\n";
// if everything is ok, try to upload file
} else {
    if (!move_uploaded_file($_FILES["fileToUpload"]["tmp_name"], $target_file)) {
        $failReason .= "Error. Moved unsuccessfully.\n";
    }
}

if($uploadOk != 1) {
	echo $failReason;
} else {
	echo $new_name;
}
?>