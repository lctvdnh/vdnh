<?
if ($_POST['type']=='events') {
	$list=$events;
} else if($_POST['type']=='places') {
	$list=$places;
} else {
	$list=array_merge($places,$events);
}

$filter_tags=$_POST['tags']??'';
$filter_tags=empty($filter_tags)?false:explode("|",$filter_tags);
$filter_free=isset($_POST['free'])?true:false;
$filter_inside=$_POST['inside']??'';

foreach($list as $k=> $row) {
	if ($filter_free && !$row['free']) {
		unset($list[$k]);
	}
	if ($filter_inside=='in' && !$row['inside']) {
		unset($list[$k]);
	}
	if ($filter_inside=='out' && $row['inside']) {
		unset($list[$k]);
	}
	if ($filter_tags && !in_array($row['tag'],$filter_tags)) {
		unset($list[$k]);
	}
}

$list=array_values($list);
usort($list,'cmp');

$routes=[];
$n=0;
for($i=0;$i<3;$i++) {
	$points=[];
	$points_id=[];
	for($j=0;$j<3;$j++) {
		if (key_exists($n,$list)) {
			$points[]=$list[$n];
			$points_id[]=$list[$n]['id'];
			$n++;
		}
	}
	if (count($points)>=2) {
		$routes[]=['points'=>$points, 'id'=>implode(';',$points_id)];
	}
}

function cmp($a, $b) {
	if ($a['rating'] == $b['rating']) {
		return 0;
	}
	return ($a['rating'] < $b['rating']) ? 1 : -1;
}


?>