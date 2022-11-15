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

$TILES_URL_LIST=[];
$TILES_URL_LIST['osm']=['https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'];
$TILES_URL_LIST['2gis']=['https://tile2.maps.2gis.com/tiles?x={x}&y={y}&z={z}&v=1&ts=online_sd'];
$TILES_URL_LIST['streets-v11']=['https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/256/{z}/{x}/{y}@2x?access_token=pk.eyJ1IjoiZ2FsaTE5IiwiYSI6ImNsYWgxbW9kNjA1em0zcW1waHRnM2tudmgifQ.dvEFnHoQAluAnNLLvaOqaA'];
$TILES_URL_LIST['outdoors-v11']=['https://api.mapbox.com/styles/v1/mapbox/outdoors-v11/tiles/256/{z}/{x}/{y}@2x?access_token=pk.eyJ1IjoiZ2FsaTE5IiwiYSI6ImNsYWgxbW9kNjA1em0zcW1waHRnM2tudmgifQ.dvEFnHoQAluAnNLLvaOqaA'];
$TILES_URL_LIST['light-v10']=['https://api.mapbox.com/styles/v1/mapbox/light-v10/tiles/256/{z}/{x}/{y}@2x?access_token=pk.eyJ1IjoiZ2FsaTE5IiwiYSI6ImNsYWgxbW9kNjA1em0zcW1waHRnM2tudmgifQ.dvEFnHoQAluAnNLLvaOqaA'];
$TILES_URL_LIST['dark-v10']=['https://api.mapbox.com/styles/v1/mapbox/dark-v10/tiles/256/{z}/{x}/{y}@2x?access_token=pk.eyJ1IjoiZ2FsaTE5IiwiYSI6ImNsYWgxbW9kNjA1em0zcW1waHRnM2tudmgifQ.dvEFnHoQAluAnNLLvaOqaA'];
$TILES_URL_LIST['satellite-streets-v11']=['https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v11/tiles/256/{z}/{x}/{y}@2x?access_token=pk.eyJ1IjoiZ2FsaTE5IiwiYSI6ImNsYWgxbW9kNjA1em0zcW1waHRnM2tudmgifQ.dvEFnHoQAluAnNLLvaOqaA'];
$TILES_URL_LIST['navigation-day-v1']=['https://api.mapbox.com/styles/v1/mapbox/navigation-day-v1/tiles/256/{z}/{x}/{y}@2x?access_token=pk.eyJ1IjoiZ2FsaTE5IiwiYSI6ImNsYWgxbW9kNjA1em0zcW1waHRnM2tudmgifQ.dvEFnHoQAluAnNLLvaOqaA'];
$TILES_URL_LIST['navigation-night-v1']=['https://api.mapbox.com/styles/v1/mapbox/navigation-night-v1/tiles/256/{z}/{x}/{y}@2x?access_token=pk.eyJ1IjoiZ2FsaTE5IiwiYSI6ImNsYWgxbW9kNjA1em0zcW1waHRnM2tudmgifQ.dvEFnHoQAluAnNLLvaOqaA'];
$TILES_URL_LIST['cyclosm']=['https://c.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png'];
$TILES_URL_LIST['opnvkarte']=['https://tileserver.memomaps.de/tilegen/{z}/{x}/{y}.png'];
$TILES_URL_LIST['human']=['https://tile-a.openstreetmap.fr/hot/{z}/{x}/{y}.png'];
$MAP_STYLE='osm';
if (isset($_GET['style']) && key_exists($_GET['style'],$TILES_URL_LIST)) {
	$MAP_STYLE=$_GET['style'];
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
	$marker_n=0;
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
			
			$popup.="<a nohref onclick=\'go_here(".$vdnh_coord->array_name."[".$vdnh_coord->array_num."],".($marker_n++).")\'>проложить маршрут</a><br>";
				
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
	$n=0;
	foreach($file as $line) {
		if (isset($line->id)) {
			$line->array_name=strtoupper($type);
			$line->array_num=$n++;
			$VDNH_COORDINATES[$line->id]=$line;
		}
	}
}

?>