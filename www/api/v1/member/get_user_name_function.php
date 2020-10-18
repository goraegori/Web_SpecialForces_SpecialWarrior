<?php
require_once __DIR__.'/../auth/settings.php';
require_once('../dbsettings.php');
require_once('../token_validator.php');

function get_user_name($dbconn,$user_id){
  $res=array("success"=>false,"result"=>array());
  try{
    
    $sql = "SELECT name FROM warrior WHERE user_id = '$user_id';";
    $result = mysqli_query($dbconn,$sql);
    $row = mysqli_fetch_assoc($result);
    array_push($res['result'], $row);
    $res['success']=true;
  }
  catch(Exception $e){
    http_response_code(400); //bad request
    $res['message'] = $e->getMessage();
  }
  return $res;
}
?>