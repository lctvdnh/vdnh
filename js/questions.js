function tag_onclick(el) {
	el.classList.toggle('selected');
	let tagsElements=document.querySelectorAll('.tag.selected');
	let tag_list='';
	for(let i=0;i<tagsElements.length;i++) {
		let tag=tagsElements[i].innerHTML;
		tag_list+=tag+"|";
	}
	if (tag_list[tag_list.length-1]=='|') {
		tag_list=tag_list.substring(0,tag_list.length-1);
	}
	document.getElementById('hidden_tags').value=tag_list;
}

function tag_class_selector(value) {
	if (value=='places' || value=='events') {
		return 'tag_'+value;
	}
	return 'tag';
}

function type_onchange(el) {
	let value=el.value;
	let tagsElements=document.querySelectorAll('.tag');
	let className=tag_class_selector(value);
	for (let i=0; i<tagsElements.length; i++) {
		let el=tagsElements[i];
		el.style.display=el.classList.contains(className)?'inline':'none';
	}
}