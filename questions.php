<?
include_once('questions.backend.php')
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
	<form action='questions_generate.php' method='POST'>
	Как Вы хотите провести время?<br>
		<select id='select_type' name='type' onchange='type_onchange(this)' style="margin: 10px 0px; font-size: 18px; font-family: 's', sans-serif; padding: 5px; border: 1px solid #808080; border-radius: 5px;">
			<option value='all'>Посетить место или мероприятие</option>
			<option value='places'>Посетить место </option>
			<option value='events'>Посетить мероприятие</option>
		</select><br>
		<label><input type='checkbox' name='free' value='1'>Бесплатно</label><br>

		<select id='select_type' name='inside' onchange='type_onchange(this)' style="margin: 10px 0px; font-size: 18px; font-family: 's', sans-serif; padding: 5px; border: 1px solid #808080; border-radius: 5px;">
			<option value='out'>Больше времени на улице</option>
			<option value='in'>Больше времени в помещении</option>
			<option value=''>Без разницы</option>
		</select><br>

		<input type=hidden id='hidden_tags'name='tags'>
	<div style='line-height: 35px; max-width: 500px; margin-top: 10px;'>
	<?foreach($tags as $tag=>$v){?>
		<span class="tag<?=(isset($tags_events[$tag])?' tag_events':'')?><?=(isset($tags_places[$tag])?' tag_places':'')?>" onclick="tag_onclick(this)"><?=$tag?></span>
	<?}?>
	</div>
		<input type='submit' value='Сгенерировать маршрут' style="background-color: #336AF7; color: #ffffff; padding: 10px; margin-top: 20px; border: 2px solid #134Ad7; font-size: 18px; font-family: 's', sans-serif; border-radius: 5px; cursor: pointer;">
	</body>
</html>
