import {callFunc, isArray, isNum, isString, loop, random} from "wangct-util";
import {featureEventTypeMap} from "./options";
import './openlayers.less';

export default class CMap{
  constructor(div,options){
    this.map = new OpenLayers.Map(div,{
      projection: "EPSG:4326",
      // displayProjection: "EPSG:4326",
      units: 'm',
      center: [120.15127805298,-58.195605740793],
      zoom: 1,
      ...options,
    });
    window.map = this.map;
    this.initLayers();
    this.initControls();
    this.initEvents();
  }

  getMap(){
    return this.map;
  }

  initLayers(){
    const map = this.getMap();
    const gaodeLayer = getGaodeMapLayer();
    map.addLayers([gaodeLayer]);
  }

  initControls(){
    const map = this.getMap();
    map.addControls([
      new OpenLayers.Control.MousePosition()
    ]);
  }

  initEvents(){
    const map = this.getMap();
    map.events.register('click',map,(e) => {
      const lonLat = map.getLonLatFromPixel(e.xy);
      console.log(`点击:[${lonLat.lon},${lonLat.lat}]`,lonLat);
    });

    new InfoWindow({
      map,
      title:'标题',
      content:'wangct',
      position:[120.15127805298,-58.195605740793],
    });


    const circle = new Circle({
      map,
      center:[120.15127805298,-58.195605740793],
      radius:10,
      fillColor:'yellow',
      cursor:'pointer',
    });

    circle.on('click',() => {
      new InfoWindow({
        map,
        title:'标题',
        content:'wangct',
        position:[120.15127805298,-58.195605740793],
      });
    })

    //
    // circle.on('click',(c) => {
    //   console.log(c);
    //   const options = circle.getOptions();
    //   circle.setOptions({
    //     fillColor:options.fillColor === 'red' ? 'yellow' : 'red',
    //   });
    // });
  }

}


class Overlay{

  static getFeatureEventType(type){
    return featureEventTypeMap[type];
  }
  feature = null;

  constructor(options = {}){
    this.initLayer(options);
    this.setMap(options.map);
  }

  initLayer(options){
    this.layer = new OpenLayers.Layer.Vector("Overlay");
  }

  on(type,func){
    const featureType = Overlay.getFeatureEventType(type);
    this.getLayer().events.register(featureType,null,(e) => {
      func({
        event:e,
        target:this,
        type,
      },e);
    });
  }

  setFeature(feature){
    const layer = this.getLayer();
    const oldFeature = this.getFeature();
    if(oldFeature){
      layer.removeFeatures([oldFeature]);
    }
    layer.addFeatures([feature]);
    this.feature = feature;
  }

  setMap(map){
    map && map.addLayer(this.getLayer());
  }

  getFeature(){
    return this.feature;
  }

  getLayer(){
    return this.layer;
  }

  redraw(){
    const feature = this.getFeature();
    feature.move(feature.geometry.getBounds().getCenterLonLat());
  }

  getOptions(){
    return this.options;
  }

  setOptions(options){
    this.options = {
      ...this.getOptions(),
      ...options,
    };
    this.update();
    this.setZIndex(options.zIndex);
  }

  setZIndex(zIndex){
    isNum(zIndex) && this.getLayer().setZIndex(zIndex);
  }
}

class OverlayMarker extends Overlay{
  initLayer(options) {
    this.layer = new OpenLayers.Layer.Markers("OverlayMarkers");
  }

  setMarker(marker){
    const layer = this.getLayer();
    const oldMarker = this.getMarker();
    if(oldMarker){
      layer.removeMarker(oldMarker);
    }
    layer.addMarker(marker);
    this.marker = marker;
  }

  getMarker(){
    return this.marker;
  }

  on(type,func){
    this.getMarker().events.on({
      [type]:(e) => {
        func({
          event:e,
          target:this,
          type,
        },e);
      }
    });
  }
}

class Marker extends OverlayMarker{
  constructor(options){
    super(options);
    this.setOptions(options);
  }

  update(){
    const options = this.getOptions();
    const marker = new OpenLayers.Marker(toLonLat(options.position),toIcon(options.icon,options.size,options.offset));
    this.setMarker(marker);
  }

}

class Text extends OverlayMarker{
  constructor(options){
    super(options);
    this.setOptions(options);
  }

  update(){
    const options = this.getOptions();
    const icon = new OpenLayers.Icon(null,new OpenLayers.Size(0,0),toPixel(options.offset));
    icon.imageDiv.innerHTML = `<div class="openlayer-text-wrap"><div class="openlayer-text-content">${options.text}</div></div>`;
    const marker = new OpenLayers.Marker(toLonLat(options.position),icon);
    this.setMarker(marker);
  }

}


class InfoWindow{
  constructor(options){
    this.setOptions(options);
  }

  update(){
    const options = this.getOptions();
    const popup = new OpenLayers.Popup(options.id,
      toLonLat(options.position),
      toSize([0,0]),
      this.getLayoutContent(),
      false,
      null);
    this.setPopup(popup);
    this.setContent();
    this.setSize();
  }

  getLayoutContent(){
    return `<div class="cmap-infowindow"><div class="cmap-infowindow-content"></div></div>`;
  }

  getContentElem(){
    return this.getPopup().contentDiv.children[0];
  }

  setContent(){
    const {title,content} = this.getOptions();
    const elem = this.getContentElem();
    window.e = elem;
    const contentElem = elem.querySelector('.cmap-infowindow-content');
    const setHtml = (child,parent) => {
      if(child instanceof Element){
        parent.appendChild(child);
      }else if(child){
        parent.innerHTML += child;
      }
    };
    if(title){
      const headerElem = document.createElement('div');
      contentElem.parentNode.insertBefore(headerElem,contentElem);
      headerElem.className = 'cmap-infowindow-header';
      setHtml(title,headerElem);
      const closeElem = document.createElement('div');
      closeElem.className = 'cmap-infowindow-close';
      closeElem.addEventListener('click',this.close.bind(this));
      headerElem.appendChild(closeElem);
    }
    setHtml(content,contentElem);
  }

  setSize(){
    const {width,height} = this.getOptions();
    const elem = this.getContentElem();
    if(width){
      elem.style.width = width + 'px';
    }
    if(height){
      elem.style.height = height + 'px';
    }
  }

  setPopup(popup){
    const map = this.getOptions().map;
    const oldPopup = this.getPopup();
    if(oldPopup){
      map.removePopup(oldPopup);
    }
    this.popup = popup;
    this.setMap(map);
  }

  getPopup(){
    return this.popup;
  }

  setMap(map){
    map && map.addPopup(this.getPopup());
  }

  setOptions(options){
    this.options = {
      id:options.id || 'cmap_infowindow_' + random(),
      ...this.getOptions(),
      ...options,
    };
    this.update();
  }

  getOptions(){
    return this.options;
  }

  close(){
    this.getPopup().hide();
    callFunc(this.getOptions().onClose);
  }

  open(){
    this.getPopup().show();
  }
}

class Polyline extends Overlay{
  constructor(options){
    super(options);
    this.setOptions(options);
  }

  update(){
    const options = this.getOptions();
    const points = getPoints(options.path);
    const feature = new OpenLayers.Feature.Vector(new OpenLayers.Geometry.LineString(points),null,options);
    this.setFeature(feature);
  }
}

class Polygon extends Overlay{
  constructor(options){
    super(options);
    this.setOptions(options);
  }

  update(){
    const options = this.getOptions();
    const points = getPoints(options.path);
    const feature = new OpenLayers.Feature.Vector(new OpenLayers.Geometry.LinearRing(points),null,options);
    this.setFeature(feature);
  }

}

class Circle extends Overlay{

  constructor(options = {}){
    super(options);
    this.setOptions(options);
  }

  update(){
    const options = this.getOptions();
    const points = getCirlePoints(options.center,options.radius,options.map);
    const feature = new OpenLayers.Feature.Vector(new OpenLayers.Geometry.LinearRing(points),null,options);
    this.setFeature(feature);
  }
}

function getCirlePoints(lonlat,radius,map){
  const pixel = map.getPixelFromLonLat(toLonLat(lonlat));
  return new Array(360).fill(true).map((item,index) => {
    const angle = index * 2 * Math.PI / 180;
    const x = pixel.x + (radius * Math.cos(angle));
    const y = pixel.y + (radius * Math.sin(angle));
    const lonlat = map.getLonLatFromPixel({x,y});
    return new OpenLayers.Geometry.Point(lonlat.lon, lonlat.lat);
  });
}

function getGaodeMapLayer(){
  return new OpenLayers.Layer.XYZ("高德矢量", [
    "http://webrd01.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=7&x=${x}&y=${y}&z=${z}",
    "http://webrd02.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=7&x=${x}&y=${y}&z=${z}",
    "http://webrd03.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=7&x=${x}&y=${y}&z=${z}",
    "http://webrd04.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=7&x=${x}&y=${y}&z=${z}"
  ]);
}

function transformCoords(coords,source = 'EPSG:4326',dist = 'EPSG:900913'){
  const newPoint = OpenLayers.Projection.transform({x:coords[0],y:coords[1]},source,dist);
  return [newPoint.x,newPoint.y];
}

function toLonLat(lonlat){
  if(isArray(lonlat)){
    return new OpenLayers.LonLat(lonlat[0],lonlat[1]);
  }
  return lonlat;
}

function toIcon(icon,size,offset){
  if(isString(icon)){
    return new OpenLayers.Icon(icon,toSize(size),toPixel(offset));
  }
  return icon;
}

function toSize(size){
  if(isArray(size)){
    return new OpenLayers.Size(size[0],size[1]);
  }
  return size;
}

function toPixel(pixel){
  if(isArray(pixel)){
    return new OpenLayers.Pixel(pixel[0],pixel[1]);
  }
  return pixel;
}


function getPoints(path){
  return path.map((item) => {
    const lonlat = toLonLat(item);
    return new OpenLayers.Geometry.Point(lonlat.lon,lonlat.lat);
  })
}
