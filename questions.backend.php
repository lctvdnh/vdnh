<?
header('Content-Type: text/html; charset=utf-8');
$file_places=file('./data/places_tags.tsv');
$file_events=file('./data/events_tags.tsv');
$tags=[];
$tags_events=[];
$tags_places=[];
foreach($file_places as $row) {
	$e=explode('	',trim($row));
	if (count($e)!=9) {
		continue;
	}
	$id=trim($e[0]);
	$lon=trim($e[1]);
	$lat=trim($e[2]);
	if (empty($id) || empty($lat) || empty($lon)) {
		continue;
	}
	$title=trim($e[3]);
	$visitors=trim($e[4]);
	$free=(trim($e[5])==='free');
	$inside=trim($e[6])==='inside';
	$tag=trim($e[7]);
	$rating=intval($visitors)/991924;
	$places[$id]=compact('id','title','free','inside','tag','rating');
	if ($tag) {
		$tags[$tag]=1;
		$tags_places[$tag]=1;
	}
}
foreach($file_events as $row) {
	$e=explode('	',trim($row));
	if (count($e)!=7) {
		continue;
	}
	$id=trim($e[0]);
	$lon=trim($e[1]);
	$lat=trim($e[2]);
	if (empty($id) || empty($lat) || empty($lon)) {
		continue;
	}
	$title=trim($e[3]);
	$free=(trim($e[4])==='free');
	$tag=trim($e[5]);
	$rating=trim($e[6]);
	$inside=true;
	$events[$id]=compact('id','title','free','tag','rating','inside');
	if ($tag) {
		$tags[$tag]=1;
		$tags_events[$tag]=1;
	}
}

?>