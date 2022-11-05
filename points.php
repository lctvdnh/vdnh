<?
$places=json_decode(file_get_contents('./data/places.json'));
$events=json_decode(file_get_contents('./data/events.json'));
?>
<html>
	<head>
		<title>Места и мероприятия</title>
		<link rel="stylesheet" href="./css/vdnh.css">
	</head>
	<body>
		<script src='./js/points.js'></script>
		<div style="padding-top: 25px;">
			<input placeholder='Введите наименование места или мероприятия' oninput='onInput(this)' style='width: 100%; max-width: 750px; font-size: 25px; border-radius: 5px; border: 1px solid #808080; padding: 7px;'>
		</div>

		<h3>Маршрут до места</h3>
<?
	foreach($places as $item) {
		if (isset($item->title)) {
		?>
		<div class="point">
			<a href="./map.php?point=<?=$item->id?>"><?=$item->title?></a>
		</div>
		<?
		}
	}
?>
		<h3>Маршрут до мероприятия</h3>
<?
	foreach($events as $item) {
		if (isset($item->title)) {
		?>
		<div class="point">
			<a href="./map.php?point=<?=$item->id?>"><?=$item->title??''?></a><br>
		</div>
		<?
		}
	}
?>
	</body>
</html>
