


var layer = new OpenLayers.Layer.XYZ("高德矢量", [
  "http://webrd01.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=7&x=${x}&y=${y}&z=${z}",
  "http://webrd02.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=7&x=${x}&y=${y}&z=${z}",
  "http://webrd03.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=7&x=${x}&y=${y}&z=${z}",
  "http://webrd04.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=7&x=${x}&y=${y}&z=${z}"
], {
  isBaseLayer: true,
  visibility: true,
  displayInLayerSwitcher: true
});

const map = new OpenLayers.Map("map",{
  projection: "EPSG:900913",
  displayProjection: "EPSG:4326",
  units: 'm',
  layers: [layer],
  center: [13374137.810138, 3542892.3078249],
  zoom: 11
});
map.addControl(new OpenLayers.Control.LayerSwitcher());
map.addControl(new OpenLayers.Control.MousePosition());

// var wms = new OpenLayers.Layer.WMS(
//   "省级行政区",
//   "http://200.200.200.220:8080/geoserver/wms",
//   {
//     LAYERS: "pro",
//     transparent:true
//   },
//   {
//     singleTile: false,
//     ratio: 1,
//     isBaseLayer: false,
//     visibility:true,
//     yx : {'EPSG:4326' : true}
//   }
// );
// map.addLayer(wms);

let ary = [
  [13377501.039382,3541745.7524008],
  [13388507.971454,3541516.441316],
  [13383921.749757,3533337.6792906]
];

ary = [
  [0,100],
  [0,200],
  [200,200]
];

var style = new OpenLayers.StyleMap({
  'default': OpenLayers.Util.applyDefaults(
    {label: "${l}", pointRadius: 10},
    OpenLayers.Feature.Vector.style["default"]
  ),
  'select': OpenLayers.Util.applyDefaults(
    {pointRadius: 10},
    OpenLayers.Feature.Vector.style.select
  )
});

var polygonLayer = new OpenLayers.Layer.Vector("polygonLayer 1", {
  styleMap: style,
});

const points = ary.map(item => {
  return new OpenLayers.LonLat(item[0],item[1]);
});

const lines = new OpenLayers.Geometry.LineString(points);

map.addLayer(polygonLayer);

polygonLayer.addFeatures([
  new OpenLayers.Feature.Vector(new OpenLayers.Geometry.Point(-1,1),null,{
    fillColor:'red',
  }),
]);



map.events.register('click',null,(e) => {
  const pixel = new OpenLayers.Pixel(e.xy.x,e.xy.y);
  const lnglat = map.getLonLatFromPixel(pixel);
  console.log(e,lnglat);
})
