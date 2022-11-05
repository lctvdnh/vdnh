<?
header('Content-Type: text/html; charset=utf-8');
$file_places=file('./data/places_tags.tsv');
$file_events=file('./data/events_tags.tsv');
$tags=[];
$tags_events=[];
$tags_places=[];
foreach($file_places as $row) {
	$e=explode('	',trim($row));
	if (count($e)!=6) {
		continue;
	}
	$id=trim($e[0]);
	$title=trim($e[1]);
	$free=(trim($e[2])==='free');
	$inside=trim($e[3])==='inside';
	$tag=trim($e[4]);
	$rating=trim($e[5]);
	$places[$id]=compact('id','title','free','inside','tag','rating');
	if ($tag) {
		$tags[$tag]=1;
		$tags_places[$tag]=1;
	}
}
foreach($file_events as $row) {
	$e=explode('	',trim($row));
	if (count($e)!=5) {
		continue;
	}
	$id=trim($e[0]);
	$title=trim($e[1]);
	$free=(trim($e[2])==='free');
	$tag=trim($e[3]);
	$rating=trim($e[4]);
	$inside=true;
	$events[$id]=compact('id','title','free','tag','rating','inside');
	if ($tag) {
		$tags[$tag]=1;
		$tags_events[$tag]=1;
	}
}

?>