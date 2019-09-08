import {isArray, isString, loop} from "wangct-util";

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
    ])
  }

  initEvents(){
    const map = this.getMap();
    map.events.register('click',map,(e) => {
      const lonLat = map.getLonLatFromPixel(e.xy);
      console.log(`点击:[${lonLat.lon},${lonLat.lat}]`,lonLat);
    });

    new Circle({
      map,
      center:[120.15127805298,-58.195605740793],
      radius:10,
    });
  }

}


class Marker{
  constructor(options){
    const layer = new OpenLayers.Layer.Markers('Markers');
    const {map} = options;
    const marker = new OpenLayers.Marker(toLonLat(options.position),toIcon(options.icon,options.size,options.offset));
    layer.addMarker(marker);
    this.layer = layer;
    if(map){
      this.setMap(map);
    }
  }

  setMap(map){
    map.addLayer(this.layer);
  }

}

class Polyline{
  constructor(options){
    const layer = new OpenLayers.Layer.Vector("Polyline");
    const {map} = options;
    const points = getPoints(options.path);
    const feature = new OpenLayers.Feature.Vector(new OpenLayers.Geometry.LineString(points),null,options);
    layer.addFeatures([feature]);
    this.layer = layer;
    if(map){
      this.setMap(map);
    }
  }

  setMap(map){
    map.addLayer(this.layer);
  }

}

class Polygon{
  constructor(options){
    const layer = new OpenLayers.Layer.Vector("Polygon");
    const {map} = options;
    const points = getPoints(options.path);
    const feature = new OpenLayers.Feature.Vector(new OpenLayers.Geometry.LinearRing(points),null,options);
    layer.addFeatures([feature]);
    this.layer = layer;
    if(map){
      this.setMap(map);
    }
  }

  setMap(map){
    map.addLayer(this.layer);
  }

}

class Circle{
  constructor(options){
    const layer = new OpenLayers.Layer.Vector("Polygon");
    const {map} = options;

    if(!map){
      return;
    }

    const points = getCirlePoints(options.center,options.radius,map);
    console.log(points);
    const feature = new OpenLayers.Feature.Vector(new OpenLayers.Geometry.LinearRing(points),null,options);
    layer.addFeatures([feature]);
    this.layer = layer;
    if(map){
      this.setMap(map);
    }
  }

  setMap(map){
    map.addLayer(this.layer);
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
