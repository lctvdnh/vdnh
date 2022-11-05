<?
include_once('questions.backend.php');
include_once('questions_generate.backend.php');
?>
<!DOCTYPE html>
<html>
	<head>
		<title>ВДНХ</title>
		<meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no" />
		<link rel="stylesheet" href="./css/vdnh.css">
		<link rel="stylesheet" href="./css/tags.css">
		<script src="./js/questions.js"></script>
	</head>
	<body>
		<div style='max-width: 500px;'>
		<?
		$N=1;
		if (count($routes)>0) {
			foreach($routes as $route) {
			?>
				<a href='./map.php?points=<?=$route['id']?>' style='max-width: 500px;'>
					<div style="border: 1px solid #808080; border-radius: 15px; margin-top: 20px; padding: 5px 20px 20px 20px; ">
						<h3>Маршрут <?=$N++?></h3>
						<?foreach($route['points'] as $point) {?>
							<?=$point['title']?><br>
						<?}?>
					</div>
				</a>
			<?
			}
		} else {
		?>
		Не удалось составить маршрут по указанным критериям
		<?}?>
		</div>
	</body>
</html>
