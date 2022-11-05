function onInput(input) {
	let search=normalize(input.value);
	let allElements=document.querySelectorAll('.point');
	for(let i=0; i<allElements.length; i++) {
		let el=allElements[i];
		let title=el.querySelector('a').innerHTML;
		el.style.display = normalize(title).indexOf(search)>-1 ? 'block' : 'none';
	}
}
function normalize(s) {
	s=s.toLowerCase();
	s=s.replace(/[^a-zA-Zа-яА-Я0-9\s]/ig,"");
	return s;
}
