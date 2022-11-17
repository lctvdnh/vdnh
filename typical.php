<?
include_once('typical.backend.php')
?>
<!DOCTYPE html>
<html>
	<head>
		<title>ВДНХ</title>
		<meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no" />
		<link rel="stylesheet" href="./css/vdnh.css">
		<link rel="stylesheet" href="./css/tags.css">
		<script src="./js/typical.js"></script>
	</head>
	<body>
	Выберите свои интересы по тегам:
	<div style="line-height: 30px;">
	<?foreach($TAGS as $tag){?>
		<span class="tag" onclick="tag_onclick(this)"><?=$tag?></span> 
	<?}?>
	</div>
	<div style='margin-top: 20px;'>
		<div id='msg_select_tags' style='display: block; color: #a0a0a0'>
			<!--Выберите свои интересы по тегам-->
		</div>
		<?foreach($ROUTES as $title => $info){?>
			<div class='route' data-route='<?=$title?>' style='display: none'>
				<a href='map.php?route=<?=$title?>' ><?=$title?> (<?=$info['time']?> ч)</a><br> 
			</div>
		<?}?>
	</div>
	<script>
		let ROUTES=JSON.parse('<?=str_replace("\\", "\\\\", json_encode($ROUTES))?>');
		let TAGS_ROUTES=JSON.parse('<?=str_replace("\\", "\\\\", json_encode($TAGS_ROUTES))?>');
	</script>
	</body>
</html>
