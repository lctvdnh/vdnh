function tag_onclick(el) {
	el.classList.toggle('selected');
	filter_routes();
}

function filter_routes () {
	let selectedElements=document.querySelectorAll('.tag.selected');
	let show_routes=[];
	for (let i=0; i<selectedElements.length; i++) {
		let el=selectedElements[i];
		let tag=el.innerHTML;
		
		let tag_routes=TAGS_ROUTES[tag];
		for(let j=0;j<tag_routes.length;j++) {
			let route=tag_routes[j];
			if (show_routes.indexOf(route)===-1) {
				show_routes[show_routes.length]=route;
			}
		}
	}
	let routesElements=document.querySelectorAll('[data-route]');
	let count_show=0;
	for (let i=0; i<routesElements.length; i++) {
		let routeElement=routesElements[i];
		if (show_routes.indexOf(routeElement.dataset.route)>-1) {
			routeElement.style.display= 'block';
			count_show++;
		} else {
			routeElement.style.display= 'none';
		}
	}
	if (count_show==0) {
		document.getElementById('msg_select_tags').style.display='block';
	} else {
		document.getElementById('msg_select_tags').style.display='none';
	}
}
