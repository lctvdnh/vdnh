<?
ini_set('display_errors', '1');
error_reporting(E_ALL);

$csv = fopen("./data/маршруты.csv", "r");
if ($csv===false) {
	exit('файл не найден');
}
$row = fgetcsv($csv, 10000, ",");
$row = fgetcsv($csv, 10000, ",");
$TAGS_ROUTES=[];
$ROUTES=[];
while ($row !== FALSE) {
	$row_tags=explode(',',$row[1]);
	$route=trim($row[0]);
	$time=trim($row[2]);
	$ROUTES[$route]=['time'=>$time];
	foreach($row_tags as $tag) {
		$tag=trim($tag);
		if ($tag==='') {
			continue;
		}
		$TAGS_ROUTES[$tag][]=$route;
	}
	$row = fgetcsv($csv, 10000, ",");
}
fclose($csv);
$TAGS=array_keys($TAGS_ROUTES);

?>