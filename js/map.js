window.addEventListener('DOMContentLoaded', page_loaded, true);

function page_loaded() {
	let center=[55.834, 37.62703];
	waypoint_popup=[];
	geometry_polygon=L.geoJSON(null);
	popup_content_for_marker=false;
	map = L.map("map", {closePopupOnClick:false, zoomControl: false} ).setView(center, 14);
	L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
		maxZoom: 18,
		attribution: "&copy; <a href='https://openstreetmap.org/copyright'>OpenStreetMap contributors</a>"
	}).addTo(map);

	
	document.getElementById('map').style.cursor='default';

	L.control.zoom().setPosition('topright').addTo(map);
	L.Routing.Localization='ru';
	var router=new L.Routing.OSRMv1({geometryOnly: true, profile: 'foot'});
	routingControl = L.Routing.control({
		fitSelectedRoutes: false,
		router: router,
		waypoints: default_waipoints,
		formatter: new L.Routing.Formatter({language: 'ru'}),
		geocoder: L.Control.Geocoder.nominatim(),
		position: 'topleft',
		createMarker: function(i, wp, nWps) {
			let marker=L.marker(wp.latLng,{draggable: true});
			let popupContent=false;
			if (i in waypoint_popup && waypoint_popup[i]) {
				popupContent=waypoint_popup[i];
			}
			if (!(popup_content_for_marker===false)) {
				if (i in popup_content_for_marker && popup_content_for_marker[i]) {
					popupContent=popup_content_for_marker[i];
					popup_content_for_marker=false;
				}
			}
			if (!(popupContent===false)) {
				wp.popup=popupContent;
				marker.bindPopup(popupContent).on('movestart',function(){this.setPopupContent('').unbindPopup();});
			}
			return marker;
		}
	}).on('routesfound', function(e) {
		let distance=e.routes[0].summary.totalDistance;
		let distance_km=distance/1000;
		document.getElementById('span_distance').innerText=(Math.round(distance_km*10)/10) +' км';
    }).on('routingstart', function(e) {
		waypoint_popup=[];
		for(let i=0; i<e.sourceTarget.options.waypoints.length; i++) {
			let wp=e.sourceTarget.options.waypoints[i];
			if ('popup' in wp) {
				waypoint_popup[i]=wp.popup;
			} else {
				waypoint_popup[i]=null;
			}
		}
    })
	.addTo(map);
	let distance_html='';
	distance_html+='<div style="z-index: 1000; background-color: #ffffff; border-radius: 5px; padding: 5px; padding-top: 0px" >';
	distance_html+='Расстояние: <span id="span_distance"></span><br>';
	distance_html+='</div>';
	let elements_route = document.getElementsByClassName('leaflet-routing-container');	
	var el=elements_route[0].appendChild(document.createElement("div"));
	el.innerHTML=distance_html;


	let leaflet_options = {
		lengthUnit: {display: 'km',decimal: 2, factor: null, label: ''}
	};
	L.control.ruler(leaflet_options).addTo(map);
	control_locate=L.control.locate({position: 'topright', keepCurrentZoomLevel: true, flyTo: false, setView: false}).addTo(map);
	map.on('locationerror',leaflet_location_error);
	map.on('locationfound',leaflet_location_found);

	if (typeof POINT !== 'undefined') {
		var point_route_options = {
			enableHighAccuracy: true,
			timeout: 30000,
			maximumAge: 0
		};
		navigator.geolocation.getCurrentPosition(point_route_success, point_route_error, point_route_options);
	}

	if (FILE_ALL==='places') {
		show_all_points(PLACES);
	} else if (FILE_ALL==='events') {
		show_all_points(EVENTS);
	}
	if (typeof ROUTE_JSON!=='undefined') {
		route_obj=JSON.parse(ROUTE_JSON);
		L.geoJSON(route_obj).bindPopup(function(layer) {return layer.feature.properties.description;}).addTo(map);
	}

	if (typeof HEATMAP!=='undefined') {
		heatmap();
	}
	map.on("click", map_onclick);
	map.on("mousedown", coordinates_to_navigator);
}

function coordinates_to_navigator(e) {
	var el = document.activeElement;
	if (el.tagName=='INPUT' && el.parentElement.classList.contains('leaflet-routing-geocoder') && el.value=='') {
		var n=geocoder_n_by_input(el);
		var lon=e.latlng.lng;
		var lat=e.latlng.lat;
		waypoint_update(n,lon,lat);
	}
}

function geocoder_n_by_input(el_input) {
	var el1=el_input.parentElement.parentElement.children;
	var el2=el_input.parentElement;
	var n=Array.prototype.indexOf.call(el1, el2);
	return n;
}

function waypoint_update(n,lon,lat,name=null) {
	var wps=routingControl.getWaypoints();
	var latLng={};
	var wp={};
	wp.latLng={lat: lat,lng:lon};
	if (name!==null) {
		wp.name=name;
	}
	wps[n]=wp;
	routingControl.setWaypoints(wps);
}

function map_onclick(e) {
	var clon=e.latlng.lng;
	var clat=e.latlng.lat;
	let center=map.getCenter();
	let mlon=center.lng.toFixed(6);
	let mlat=center.lat.toFixed(6);
	let zoom=map.getZoom();
	let size=map.getSize();
	let url='https://api.geotree.ru/tree_reverse.php?';
	url+='zoom='+zoom;
	url+='&clon='+clon+'&clat='+clat;
	url+='&mlon='+mlon+'&mlat='+mlat;
	var width=Math.round(size.x);
	var height=Math.round(size.y);
	url+='&width='+width+'&height='+height;
	jQuery.get(url)
	.done(function(obj) {
		var obj=JSON.parse(obj);
		var list=obj.list;
		let n=obj.n;
		if ('geometry' in obj && 'n' in obj) {
			geometry_print(obj['geometry'], list[n]);
		}
	})
}

function geometry_print(geometry,osm) {
	geometry_polygon.remove();
	if (osm.name==='Выставка достижений народного хозяйства') {
		return;
	}
	let geojson=JSON.parse(geometry.geojson);
	var color='#2040b0';
	var style = {"color": color, "weight": 1, "fillOpacity": 0.1};
	let title=osm.name.replace(' - проспект', '<br>проспект');
	title='<div style="text-align: center">'+title+'</div>';
	geometry_polygon=L.geoJSON(geojson, {style: style}).bindTooltip(title, {sticky: true, direction: 'bottom'}).addTo(map);
	let geometry_bounds=geometry_polygon.getBounds();
	let map_bounds=map.getBounds();
	if (geometry_bounds.contains(map_bounds)) {
		geometry_polygon.setStyle({"fillOpacity": 0});
	}
}

function show_all_points(points) {
	var markersCluster = L.markerClusterGroup();
	markers=[];
	for(let i=0;i<points.length;i++) {
		let row=points[i];
		if (!row.lon || !row.lat) {
			continue;
		}
		let html=popup_html(row, i);
		markers[row.id]=L.marker([row.lat,row.lon]).bindPopup(html,{autoPan:false});//.addTo(map);
		markersCluster.addLayer(markers[row.id]);
	}
	map.addLayer(markersCluster);
}

function popup_html(row,array_num=null) {
	let html='';
	html+=row.type+'<br>\n';
	html+=row.title+'<br>\n';
	if (row.qr.length>5) {
		html+='<a href="'+row.qr+'" target="_blank">подробнее</a><br>\n';
	}
	if (row.schedule.length>15) {
		html+='<a nohref onclick="schedule(this)" data-schedule="'+row.schedule+'">расписание</a><br>\n';
	}
	if (row.tickets.length>15) {
		html+='<a nohref onclick="tickets(this)" data-tickets="'+row.tickets+'">стоимость билетов</a><br>\n';
	}
	if (row.tickets_link && row.tickets_link.length>5) {
		html+='<a href="'+row.tickets_link+'" target="_blank">купить билеты</a><br>\n';
	}
	if (array_num!==null) {
		html+='<a nohref onclick="go_point('+FILE_ALL.toUpperCase()+'['+array_num+'],0)" >проложить маршрурт</a><br>\n';
	}
	return html;
}

function readTextFile(file, callback) {
	var rawFile = new XMLHttpRequest();
	rawFile.overrideMimeType("application/json");
	rawFile.open("GET", file, true);
	rawFile.onreadystatechange = function() {
		if (rawFile.readyState === 4 && rawFile.status == "200") {
			callback(rawFile.responseText);
		}
	}
	rawFile.send(null);
}


function point_route_success(pos) {
	popup_content_for_marker=[false,popup_html(POINT)];
	var coords = pos.coords;
	let lat=coords.latitude;
	let lon=coords.longitude;
	let wps=[[lat,lon],[POINT.lat,POINT.lon]];
	
	let oldValue=routingControl.options.fitSelectedRoutes;
	routingControl.options.fitSelectedRoutes=true;
	routingControl.setWaypoints(wps);
	routingControl.options.fitSelectedRoutes=oldValue;
};

function point_route_error(err) {
	popup_content_for_marker=[popup_html(POINT)];
	var wps=routingControl.getWaypoints();
	var latLng={lat:POINT.lat, lng: POINT.lon};
	wps[0].latLng=latLng;
	wps[0].name=POINT.title;
	routingControl.setWaypoints(wps);
	setTimeout(alert, 500, err.message);
};

function leaflet_location_found(ev) {
	let lat=ev.latitude;
	let lon=ev.longitude;
	map.setView([lat,lon],map.getZoom());
}

function leaflet_location_error(ev) {
	let message=ev.message;
}


function join(arr) {
  var separator = arguments.length > 1 ? arguments[1] : ", ";
  return arr.filter(function(n){return n}).join(separator);
}

function makeAddressString(address){
  if ((address.region || address.area) && !address.city && !address.settlement) {
    return "";  
  } else {
	  
    return join([
      address.city_with_type,
      address.settlement_with_type,
      address.street_with_type,
      join([address.house_type, address.house,
            address.block_type, address.block], " "),
      join([address.flat_type, address.flat], " ")
    ]);
  }
}
  
function formatResult(value, currentValue, suggestion, options) {
  var newValue = makeAddressString(suggestion.data) || value;
  suggestion.value = newValue;
  return plugin1.formatResult(newValue, currentValue, suggestion, options);
}

function formatSelected(suggestion) {
  return makeAddressString(suggestion.data);
}

function reverse_blocks(container) {
	var childs=container.childNodes;
	if (childs[1].classList.contains('leaflet-routing-remove-waypoint')) {
		return;
	}
	container.insertBefore(childs[2], childs[1]);
}

function tickets(el) {
	s=el.dataset.tickets;
	let data = JSON.parse(s);
	let text='';
	for(let i=0;i<data.length;i++) {
		let row=data[i];
		text+=row.title+': '+row.value+"\n"+row.description+'\n\n';
	}
	alert(text);
}

function schedule(el) {
	let s=el.dataset.schedule;
	let data = JSON.parse(s);
	let text='';
	for(let i=0;i<data.length;i++) {
		let row=data[i];
		text+=row.left+': '+row.right+"\n";
	}
	alert(text);
}

function heatmap() {
	for(let i=0;i<PLACES.length;i++) {
		let place=PLACES[i];
		let id=place.id;
		if (!(id in HEATMAP)) {
			continue;
		}
		color='#0000E8';
		let visitors=HEATMAP[id];
		if (visitors>90000) {color='#880404';}
		else if (visitors>80000) {color='#E50000';}
		else if (visitors>70000) {color='#FF6000';}
		else if (visitors>60000) {color='#FFC100';}
		else if (visitors>50000) {color='#D2FF24';}
		else if (visitors>40000) {color='#7EFF78';}
		else if (visitors>30000) {color='#23FFD3';}
		else if (visitors>20000) {color='#00AEFF';}
		else if (visitors>10000) {color='#0048FF';}
		visitors=Math.round(visitors/100)/10;
		let label='<div style="text-align: center">'+place.title+'<br>'+visitors+' тыс.чел.</div>';
		L.circleMarker([place.lat, place.lon],{radius: 7, color: color, fillOpacity: 0.75}).bindTooltip(label,{direction: 'bottom'}).addTo(map);
	}
}

function autocomplete(input,container) {
    $(input).autocomplete({
		delay: 0,
		source: autocomplete_source,
		select: autocomplete_select
    });
	setTimeout(reverse_blocks,100,container);
	setTimeout(reverse_blocks,1000,container);
}

function autocomplete_source(request, response) {
	let items=[];
	let term=normalize(request.term);
	add_item_begin(term, PLACES, items);
	add_item_middle(term, PLACES, items);
	add_item_begin(term, EVENTS, items);
	add_item_middle(term, EVENTS, items);
	response(items);
}

function add_item_begin(term, points, items) {
	if (items.length>3) {
		return;
	}
	for(let i=0;i<points.length;i++) {
		let point=points[i];
		if (!('lat' in point) || !('lon' in point)) {
			continue;
		}
		let normalize_title=normalize(point.title);
		if ((term===normalize_title.substring(0,term.length) || normalize_title.indexOf(' '+term)>-1) && !item_exists(items, point.title)) {
			let item={label: point.title, point: point};
			items[items.length]=item;
			if (items.length>3) {
				return;
			}
		}
	}
}

function add_item_middle(term, points, items) {
	if (items.length>3) {
		return;
	}
	for(let i=0;i<points.length;i++) {
		let point=points[i];
		if (!('lat' in point) || !('lon' in point)) {
			continue;
		}
		if (normalize(point.title).indexOf(term)>-1 && !item_exists(items, point.title)) {
			let item={label: point.title, point: point};
			items[items.length]=item;
			if (items.length>3) {
				return;
			}
		}
	}
}

function item_exists(items, label) {
	for(let i=0;i<items.length;i++) {
		if (items[i].label==label) {
			return true;
		}
	}
	return false;
}

function normalize(s) {
	s=s.toLowerCase();
	s=s.replace(/[^a-zA-Zа-яА-Я0-9\s]/ig,"");
	return s;
}

function autocomplete_select(event, ui) {
	let item=ui.item;
	var el1=this.parentElement.parentElement.children;
	var el2=this.parentElement;
	var n=Array.prototype.indexOf.call(el1, el2);
	popup_content_for_marker=[];
	popup_content_for_marker[n]=popup_html(item.point);
	var wps=routingControl.getWaypoints();
	var latLng={lat:item.point.lat, lng: item.point.lon, test1:'t1'};
	wps[n].latLng=latLng;
	wps[n].name=item.value;
	routingControl.setWaypoints(wps);
}

function geocoder_placeholder_onfocus(el_input) {
	el_input=el_input.target;
	el_input.placeholder='Введите адрес или кликните на карту';
}

function geocoder_placeholder_onblur(el_input) {
	el_input=el_input.target;
	let n=geocoder_n_by_input(el_input);
	let count=document.getElementsByClassName('leaflet-routing-geocoder').length;
	el_input.placeholder=geocoder_placeholder_default(n,count);
}

function geocoder_placeholder_default(n,count) {
	if (n===0) {
		return 'Откуда';
	} else if (n===count-1) {
		return 'Куда';
	}
	return 'Остановка '+(n);
}

function go_point(point, marker_n) {
	POINT=point;
	var point_route_options = {
		enableHighAccuracy: true,
		timeout: 30000,
		maximumAge: 0
	};
	navigator.geolocation.getCurrentPosition(point_route_success, go_here_error, point_route_options);
	GO_HERE_MARKER_N=marker_n;
}

function go_here(point, marker_n) {
	POINT=point;
	var point_route_options = {
		enableHighAccuracy: true,
		timeout: 30000,
		maximumAge: 0
	};
	navigator.geolocation.getCurrentPosition(go_here_success, go_here_error, point_route_options);
	GO_HERE_MARKER_N=marker_n;
}

function go_here_success(pos) {
	popup_content_for_marker=[false,popup_html(POINT)];
	var coords = pos.coords;
	let lat=coords.latitude;
	let lon=coords.longitude;
	var wps=routingControl.getWaypoints();
	if (GO_HERE_MARKER_N>1) {
		wps[wps.length]=[lat,lon];
	} else {
		wps.unshift([lat,lon]);
	}
	
	let oldValue=routingControl.options.fitSelectedRoutes;
	routingControl.options.fitSelectedRoutes=true;
	routingControl.setWaypoints(wps);
	routingControl.options.fitSelectedRoutes=oldValue;
}

function go_here_error(err) {
	alert(err.message);
}
