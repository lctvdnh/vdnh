<?
$POINT=null;

if (isset($_GET['point'])) {
	$places_all=json_decode(file_get_contents('./data/places.json'));
	$events_all=json_decode(file_get_contents('./data/events.json'));
	$places_by_id=[];
	$evnts_by_id=[];
	$points_by_id=[];
	foreach($places_all as $k=> $v) {
		if (!empty($v->id)) {
			$places_by_id[$v->id]=$v;
			$points_by_id[$v->id]=$v;
		}
	}
	foreach($events_all as $k=> $v) {
		if (!empty($v->id)) {
			$events_by_id[$v->id]=$v;
			$points_by_id[$v->id]=$v;
		}
	}
	$POINT=$points_by_id[$_GET['point']]??null;
}


$FILE_ALL='';
if (isset($_GET['all']) && in_array($_GET['all'],['events','places'])) {
	$FILE_ALL=$_GET['all'];
}

if (isset($_GET['heatmap'])) {
	$file_places=file('./data/places_tags.tsv');
	foreach($file_places as $row) {
		$e=explode('	',trim($row));
		if (count($e)!=9) {
			continue;
		}
		$id=trim($e[0]);
		$visitors=trim($e[4]);
		if (empty($id) || empty($visitors)) {
			continue;
		}
		$heatmap[$id]=$visitors;
	}
	$HEATMAP=json_encode($heatmap);
}

$route=$_GET['route']??'';
$route_dir=__DIR__ . '/routes';
if ($route) {
	$dir=scandir($route_dir);
	foreach($dir as $k=>$v) {
		if ($v=='.' || $v=='..') {
			unset($dir[$k]);
		}
	}
	$dir=array_values($dir);
	if (!in_array($route.'.geojson',$dir)) {
		$route=false;
	}
}
if ($route) {
	$route_json=file_get_contents($route_dir . '/' . $route.'.geojson');
	$route_obj=json_decode($route_json);
	$route_coordinates=$route_obj->features[0]->geometry->coordinates;
	$route_latlon=[];
	foreach($route_coordinates as $coord) {
		$route_latlon[]=[$coord[1],$coord[0]];
	}
	$ROUTE_JSON=str_replace("\\", "\\\\", $route_json);
}


$input_points=$_GET['points']??'';
if ($input_points!='') {
	$VDNH_COORDINATES=[];
	vdnh_coordinates_load('events');
	vdnh_coordinates_load('places');
	$points_exp=explode(';',$input_points);
	$WAY_POINTS=[];
	foreach($points_exp as $point) {
		$vdnh_coord=$VDNH_COORDINATES[$point]??null;
		if (isset($vdnh_coord) && isset($vdnh_coord->lat) && isset($vdnh_coord->lon)) {
			$lat=$vdnh_coord->lat;
			$lon=$vdnh_coord->lon;
			$popup='';
			$popup.=$vdnh_coord->title.'<br>';
			if(strlen($vdnh_coord->qr)>5) {
				$qr=$vdnh_coord->qr;
				$popup.="<a href=\'$qr\' target=\'_blank\'>подробнее</a><br>";
			}
			if(strlen($vdnh_coord->tickets)>15) {
				$tickets=str_replace("'",'',$vdnh_coord->tickets);
				$popup.="<a nohref onclick=\'tickets(this)\' data-tickets=\'$tickets\'>стоимость билетов</a><br>";
			}

			if(strlen($vdnh_coord->schedule)>15) {
				$schedule=str_replace("'",'',$vdnh_coord->schedule);
				$popup.="<a nohref onclick=\'schedule(this)\' data-schedule=\'$schedule\'>расписание</a><br>";
			}
			$tickets_link=$vdnh_coord->tickets_link??'';
			if(strlen($tickets_link)>5) {
				$popup.="<a href=\'$tickets_link\' target=\'_blank\'>купить билеты</a><br>";
			}
				
			$point="{lat:$lat,lon:$lon,popup:'$popup'}";
		} else {
			if (is_numeric($point)) {
				continue;
			}
		}
		$WAY_POINTS[]=$point;
	}
	$WAY_POINTS=implode(",",$WAY_POINTS);
}

function vdnh_coordinates_load($type) {
	global $VDNH_COORDINATES;
	$file=json_decode(file_get_contents('./data/'.$type.'.json'));
	foreach($file as $line) {
		if (isset($line->id)) {
			$VDNH_COORDINATES[$line->id]=$line;
		}
	}
}

?>