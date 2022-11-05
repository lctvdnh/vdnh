(function(factory, window){
  "use strict";
  if (typeof define === 'function' && define.amd) {
    define(['leaflet'], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory(require('leaflet'));
  }
  if (typeof window !== 'undefined' && window.L) {
    window.L.Ruler = factory(L);
  }
}(function (L) {
  "use strict";
  L.Control.Ruler = L.Control.extend({
    options: {
      position: 'topright',
      circleMarker: {
        color: '#606060',//'red',
        radius: 4//4
		//,fill: true
		,fillColor: '#606060'
		,fillOpacity: 1
      },
      lineStyle: {
        color: '#606060'
		,weight:2
        ,dashArray: '0,6'
      },
      lengthUnit: {
        display: 'km',
        decimal: 2,
        factor: null,
        label: 'Distance:'
      },
      angleUnit: {
        display: '&deg;',
        decimal: 2,
        factor: null,
        label: 'Bearing:'
      }
    },
    onAdd: function(map) {
      this._map = map;
      this._container = L.DomUtil.create('div', 'leaflet-bar');
      this._container.classList.add('leaflet-ruler');
      L.DomEvent.disableClickPropagation(this._container);
      L.DomEvent.on(this._container, 'click', this._toggleMeasure, this);
      this._choice = false;
      this._defaultCursor = this._map._container.style.cursor;
      this._allLayers = L.layerGroup();
this._markersGroups = [];
this._dragOffset = {x:0, y:0};
this._clickEvents=this._map._events.click;//!

      return this._container;
    },
    onRemove: function() {
      L.DomEvent.off(this._container, 'click', this._toggleMeasure, this);
    },
    _toggleMeasure: function() {
      this._choice = !this._choice;
      this._clickedLatLong = null;
      this._clickedPoints = [];
      this._totalLength = 0;
      if (this._choice){
		this._markersGroups[this._markersGroups.length]=[];
        this._map.doubleClickZoom.disable();
        L.DomEvent.on(this._map._container, 'keydown', this._escape, this);
        L.DomEvent.on(this._map._container, 'dblclick', this._closePath, this);
        this._container.classList.add("leaflet-ruler-clicked");
        this._clickCount = 0;
        this._tempLine = L.featureGroup().addTo(this._allLayers);
        this._tempPoint = L.featureGroup().addTo(this._allLayers);
        this._pointLayer = L.featureGroup().addTo(this._allLayers);
        this._polylineLayer = L.featureGroup().addTo(this._allLayers);
        this._allLayers.addTo(this._map);
        this._map._container.style.cursor = 'pointer';//!'crosshair';
delete this._map._events.click;//!
        this._map.on('click', this._clicked, this);
        this._map.on('mousemove', this._moving, this);
      }
      else {
        if (this._clickCount > 0) {
          this._closePath();
            return;
          }
        this._map.doubleClickZoom.enable();
        L.DomEvent.off(this._map._container, 'keydown', this._escape, this);
        L.DomEvent.off(this._map._container, 'dblclick', this._closePath, this);
        this._container.classList.remove("leaflet-ruler-clicked");
        this._map.removeLayer(this._allLayers);
        this._allLayers = L.layerGroup();
        this._map._container.style.cursor = this._defaultCursor;
        this._map.off('click', this._clicked, this);
        this._map.off('mousemove', this._moving, this);
		for (var i=0;i<this._clickEvents.length;i++) {//!
			let ev=this._clickEvents[i];				//!
			this._map.on('click', ev.fn);				//!
		}												//!
		for (var i=0;i<this._markersGroups.length;i++) {
			let mgroup=this._markersGroups[i];
			for(var j=0;j<mgroup.length;j++) {
				mgroup[j].remove();
				delete mgroup[j];
			}
		}
		this._markersGroups=[];
		
      }
    },
	_circleMarkerCreate(latlng) {
		let newCircleMarker=L.circleMarker(latlng, this.options.circleMarker).addTo(this._pointLayer);
		let newCircleMarkerDrag = new L.Draggable(newCircleMarker.getElement());
		newCircleMarkerDrag.enable();
		newCircleMarker.drag=newCircleMarkerDrag;
		newCircleMarker.on('mousedown', function(e){this._circleMarkerMouseDown(e,newCircleMarker)}, this);
		newCircleMarkerDrag.on('dragstart', function(e){this._circleMarkerDragStart(e,newCircleMarker);}, this);
		newCircleMarkerDrag.on('drag', function(e){this._circleMarkerDrag(e,newCircleMarker);}, this);
		newCircleMarkerDrag.on('dragend', function(e){this._circleMarkerDragEnd(e,newCircleMarker);}, this);
		return newCircleMarker;
	},
	_circleMarkerClean(circleMarker, lines=true) {
		circleMarker.unbindTooltip();
		circleMarker.off('mousedown');
		circleMarker.drag.off('dragstart');
		circleMarker.drag.off('drag');
		circleMarker.drag.off('dragend');
		circleMarker.drag.disable();
		if (lines) {
			if (circleMarker.line_prev !==null) {
				circleMarker.line_prev.remove();
			}
			if (circleMarker.line_next !==null) {
				circleMarker.line_next.remove();
			}
			delete circleMarker.line_prev;
			delete circleMarker.line_next;
		}
		delete circleMarker.drag;
		circleMarker.remove();
	},
	_circleMarkerTooltip: function(circleMarker, distance) {
		let text='<b>' + this.options.lengthUnit.label + '</b>&nbsp;' + distance.toFixed(this.options.lengthUnit.decimal) + '&nbsp;' +  this.options.lengthUnit.display;
		circleMarker.bindTooltip(text, {permanent: true, className: 'result-tooltip'}).openTooltip();
		return circleMarker;
		//text
	},
	testx: function (m,d) {
		let text='<b>' + this.options.lengthUnit.label + '</b>&nbsp;' + d.toFixed(this.options.lengthUnit.decimal) + '&nbsp;' +  this.options.lengthUnit.display;
		m.bindTooltip('asdzzzzzzzzz '+d, {permanent: true, className: 'result-tooltip'}).openTooltip();
	},
    _clicked: function(e) {
      this._clickedLatLong = e.latlng;
      this._clickedPoints.push(this._clickedLatLong);
      //let newCircleMarker=L.circleMarker(this._clickedLatLong, this.options.circleMarker).addTo(this._pointLayer);
      let newCircleMarker=this._circleMarkerCreate(this._clickedLatLong);
	  let line=null;
	  let distance=0;
      if(this._clickCount > 0 && !e.latlng.equals(this._clickedPoints[this._clickedPoints.length - 2])){
        if (this._movingLatLong){
          line=L.polyline([this._clickedPoints[this._clickCount-1], this._movingLatLong], this.options.lineStyle);
		  line.addTo(this._polylineLayer);
        }
	    distance=this._result.Distance;
        this._totalLength += distance;
		this._circleMarkerTooltip(newCircleMarker, this._totalLength);
      }
      this._clickCount++;
      let markers_group_last=this._markersGroups.length-1;
      let marker_n=this._markersGroups[markers_group_last].length;
	  newCircleMarker.distance=distance;
	  newCircleMarker.n=marker_n;
	  newCircleMarker.group_n=markers_group_last;
	  newCircleMarker.line_prev=line;
	  newCircleMarker.line_next=null;
	  if (marker_n>0) {
		  this._markersGroups[markers_group_last][marker_n-1].line_next=line;
	  }
	  this._markersGroups[markers_group_last][marker_n]=newCircleMarker;
    },
	_circleMarkerMouseDown: function(e,circleMarker) {
		let xy=map.latLngToContainerPoint(circleMarker._latlng);
		this._dragOffset={x:e.containerPoint.x-xy.x, y:e.containerPoint.y-xy.y};
	},
	_circleMarkerDragStart: function(e,circleMarker) {
		this._map.off('click', this._clicked, this);
		
	},
	_circleMarkerDrag: function(e,circleMarker) {
		//let latlng=map.containerPointToLatLng([e.originalEvent.clientX-this._dragOffset.x, e.originalEvent.clientY-this._dragOffset.y]);
		let latlng=map.containerPointToLatLng([e.originalEvent.clientX-this._dragOffset.x + e.sourceTarget._startPos.x, e.originalEvent.clientY-this._dragOffset.y + e.sourceTarget._startPos.y]);
		if (circleMarker.line_prev!==null) {
			let latlngs=circleMarker.line_prev.getLatLngs();
			latlngs[1]=latlng;
			circleMarker.line_prev.setLatLngs(latlngs);
		} 
		if (circleMarker.line_next!==null) {
			let latlngs=circleMarker.line_next.getLatLngs();
			latlngs[0]=latlng;
			circleMarker.line_next.setLatLngs(latlngs);
		} 
	},
	_circleMarkerDragEnd: function(e,circleMarker) {
		circleMarker.unbindTooltip();
		var self=this;
		setTimeout(function() {self._map.on('click', self._clicked, self);}, 10);
		let xy_old=map.latLngToContainerPoint(circleMarker._latlng);
		let xy_new=[xy_old.x+e.sourceTarget._newPos.x, xy_old.y+e.sourceTarget._newPos.y];
		let latlng=map.containerPointToLatLng(xy_new);
		let group_n=circleMarker.group_n;
		let marker_n=circleMarker.n;
		let tmp={
			line_prev:circleMarker.line_prev,
			line_next:circleMarker.line_next,
			n:circleMarker.n,
			group_n:circleMarker.group_n
		};
		this._circleMarkerClean(circleMarker, false);
		let newCircleMarker=this._circleMarkerCreate(latlng);
		this._markersGroups[group_n][marker_n]=newCircleMarker;

		let prevDistance=marker_n>0 ? newCircleMarker.getLatLng().distanceTo(this._markersGroups[group_n][marker_n-1].getLatLng())/1000 : 0;
		if (marker_n+1<this._markersGroups[group_n].length)  {
			let nextCircleMarker=this._markersGroups[group_n][marker_n+1];
			nextCircleMarker.distance=newCircleMarker.getLatLng().distanceTo(nextCircleMarker.getLatLng())/1000;
		}
		newCircleMarker.distance=prevDistance;
		for(let idx in tmp) {
			newCircleMarker[idx]=tmp[idx];
		}
		newCircleMarker.bringToFront();
		if (newCircleMarker.line_next!==null) {
			newCircleMarker.line_next.bringToFront();
		}
		if (newCircleMarker.line_prev!==null) {
			newCircleMarker.line_prev.bringToFront();
		}
		let markers_length=this._markersGroups[group_n].length;
		let distance_total=0;
		for(let i=1; i<markers_length;i++) {
			let circleMarker=this._markersGroups[group_n][i];
			distance_total+=circleMarker.distance;
			circleMarker.unbindTooltip();
			this._circleMarkerTooltip(circleMarker, distance_total);
		} 
	},
    _moving: function(e) {
      if (this._clickedLatLong){
//        L.DomEvent.off(this._container, 'click', this._toggleMeasure, this); //!
        this._movingLatLong = e.latlng;
        if (this._tempLine){
          this._map.removeLayer(this._tempLine);
          this._map.removeLayer(this._tempPoint);
        }
        var text;
        this._addedLength = 0;
        this._tempLine = L.featureGroup();
        this._tempPoint = L.featureGroup();
        this._tempLine.addTo(this._map);
        this._tempPoint.addTo(this._map);
        this._calculateBearingAndDistance();
        this._addedLength = this._result.Distance + this._totalLength;
        L.polyline([this._clickedLatLong, this._movingLatLong], this.options.lineStyle).addTo(this._tempLine);
        if (this._clickCount > 1){
//          text = /*'<b>' + this.options.angleUnit.label + '</b>&nbsp;' + this._result.Bearing.toFixed(this.options.angleUnit.decimal) + '&nbsp;' + this.options.angleUnit.display + '<br><b>'*/ '<b>' + this.options.lengthUnit.label + '</b>&nbsp;' + this._addedLength.toFixed(this.options.lengthUnit.decimal) + '&nbsp;' +  this.options.lengthUnit.display + '<br><div class="plus-length">(+' + this._result.Distance.toFixed(this.options.lengthUnit.decimal) + ')</div>';
          text = /*'<b>' + this.options.angleUnit.label + '</b>&nbsp;' + this._result.Bearing.toFixed(this.options.angleUnit.decimal) + '&nbsp;' + this.options.angleUnit.display + '<br><b>'*/ '<b>' + this.options.lengthUnit.label + '</b>&nbsp;' + this._addedLength.toFixed(this.options.lengthUnit.decimal) + '&nbsp;' +  this.options.lengthUnit.display + ' (+' + this._result.Distance.toFixed(this.options.lengthUnit.decimal) + ')';
        }
        else {
          text = /*'<b>' + this.options.angleUnit.label + '</b>&nbsp;' + this._result.Bearing.toFixed(this.options.angleUnit.decimal) + '&nbsp;' + this.options.angleUnit.display + '<br><b>'*/ '<b>' + this.options.lengthUnit.label + '</b>&nbsp;' + this._result.Distance.toFixed(this.options.lengthUnit.decimal) + '&nbsp;' +  this.options.lengthUnit.display;
        }
        L.circleMarker(this._movingLatLong, this.options.circleMarker).bindTooltip(text, {sticky: true, offset: L.point(0, -40) ,className: 'moving-tooltip'}).addTo(this._tempPoint).openTooltip();
      }
    },
    _escape: function(e) {
      if (e.keyCode === 27){
        if (this._clickCount > 0){
          this._closePath();
        }
        else {
          this._choice = true;
          this._toggleMeasure();
        }
      }
    },
    _calculateBearingAndDistance: function() {
      var f1 = this._clickedLatLong.lat, l1 = this._clickedLatLong.lng, f2 = this._movingLatLong.lat, l2 = this._movingLatLong.lng;
      var toRadian = Math.PI / 180;
      // haversine formula
      // bearing
      var y = Math.sin((l2-l1)*toRadian) * Math.cos(f2*toRadian);
      var x = Math.cos(f1*toRadian)*Math.sin(f2*toRadian) - Math.sin(f1*toRadian)*Math.cos(f2*toRadian)*Math.cos((l2-l1)*toRadian);
      var brng = Math.atan2(y, x)*((this.options.angleUnit.factor ? this.options.angleUnit.factor/2 : 180)/Math.PI);
      brng += brng < 0 ? (this.options.angleUnit.factor ? this.options.angleUnit.factor : 360) : 0;
      // distance
      var R = this.options.lengthUnit.factor ? 6371 * this.options.lengthUnit.factor : 6371; // kilometres
      var deltaF = (f2 - f1)*toRadian;
      var deltaL = (l2 - l1)*toRadian;
      var a = Math.sin(deltaF/2) * Math.sin(deltaF/2) + Math.cos(f1*toRadian) * Math.cos(f2*toRadian) * Math.sin(deltaL/2) * Math.sin(deltaL/2);
      var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      var distance = R * c;
      this._result = {
        Bearing: brng,
        Distance: distance
      };
    },
    _closePath: function(x = false) {
      this._map.removeLayer(this._tempLine);
      this._map.removeLayer(this._tempPoint);
      if (this._clickCount <= 1) this._map.removeLayer(this._pointLayer);
      this._choice = false;
      L.DomEvent.on(this._container, 'click', this._toggleMeasure, this);
      this._toggleMeasure();
    }
  });
  L.control.ruler = function(options) {
    return new L.Control.Ruler(options);
  };
}, window));
