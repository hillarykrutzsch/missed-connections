<?php 
$searchText = $_POST['Search']; 
$location = $_POST['Location']; 

$gender = '';
for ($i=0; $i<count($_POST['Gender']); $i++){
	if($i != count($_POST['Gender']) - 1){	
		$gender .=  $_POST['Gender'][$i] . '+OR+';
	}
	else{
		$gender .=  $_POST['Gender'][$i];
	}
}

echo '{ "searchText": "' . $searchText . '", "location": "' . $location . '", "gender": "' . $gender . '" }'; 
?>