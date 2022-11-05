<?
include_once('map.backend.php');
?>
<!DOCTYPE html>
<html>
	<head>
		<title>ВДНХ</title>
		<meta name="keywords" content='ВДНХ' />
		<meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no" />
		<link rel="stylesheet" href="./libraries/leaflet/plugins/leaflet-routing-machine/leaflet-routing-machine.css">
		<link rel="stylesheet" href="./libraries/leaflet/leaflet-1.7.1.css">
		<link rel="stylesheet" href="./libraries/leaflet/plugins/Control.Geocoder-2.3.0/Control.Geocoder.css" />
		<script src="./libraries/leaflet/leaflet-1.7.1.js"></script>
		<script src="./libraries/leaflet/plugins/leaflet-routing-machine/leaflet-routing-machine.js"></script>

		<link rel="stylesheet" href="./libraries/leaflet/plugins/ruler_gt_v2/css/leaflet-ruler.css" media="nope!" onload="this.media='all'"/>
		<script defer src="./libraries/leaflet/plugins/ruler_gt_v2/js/leaflet-ruler.js"></script>
		<link rel="prefetch" href="./libraries/leaflet/plugins/ruler_gt_v2/dist/icon-colored.png" as="image"/>

		<link rel="stylesheet" href="./libraries/leaflet/plugins/locate/locate.min.css" media="nope!" onload="this.media='all'"/>
		<link rel="stylesheet" href="./libraries/leaflet/plugins/locate/css/font-awesome.min.css" media="nope!" onload="this.media='all'">
		<script defer src="./libraries/leaflet/plugins/locate/locate.min.js"></script>


		<link href='./libraries/leaflet/plugins/Leaflet.markercluster-1.4.1/dist/MarkerCluster.css' rel='stylesheet' />
		<link href='./libraries/leaflet/plugins/Leaflet.markercluster-1.4.1/dist/MarkerCluster.Default.css' rel='stylesheet' />
		<script defer src='./libraries/leaflet/plugins/Leaflet.markercluster-1.4.1/dist/leaflet.markercluster.js'></script>

		<script src="./libraries/leaflet/plugins/Control.Geocoder-2.3.0/2.3.0_dist_Control.Geocoder.js"></script>
		<script src="./js/map.js"></script>

		<script src="./libraries/jquery-3.6.1.min.js"></script>
		<link rel="stylesheet" href="./libraries/jquery-ui/jquery-ui.css">
		<link rel="stylesheet" href="./libraries/jquery-ui/autocomplete.css">
		<script src="./libraries/jquery-ui/jquery-ui.js"></script>

		<script src="./data/events.js"></script>
		<script src="./data/places.js"></script>
		<link rel="stylesheet" href="./css/map.css">
  
	</head>
	<body style='margin: 0px'>
		<div id="map" style="width: 100%; height: 100vh; z-index: 0;">
		</div>
		<script>
			<?if (isset($POINT)) {?>
				let POINT=JSON.parse('<?=str_replace("\\", "\\\\", json_encode($POINT))?>');
			<?}?>
			<?if (isset($ROUTE_JSON)) {?>
				let ROUTE_JSON=JSON.parse('<?=str_replace("\\", "\\\\", json_encode($ROUTE_JSON))?>');
			<?}?>
			<?if (isset($HEATMAP)) {?>
				let HEATMAP=true;
			<?}?>
			let FILE_ALL='<?=$FILE_ALL?>';
			var default_waipoints=[<?=$WAY_POINTS??''?>];
		</script>
	</body>
</html>
