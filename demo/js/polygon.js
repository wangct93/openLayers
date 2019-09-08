var map, controls;
OpenLayers.Feature.Vector.style['default']['strokeWidth'] = '2';
var vectors;
var highlightCtrl;
function init(){
  map = new OpenLayers.Map('map');

  vectors = new OpenLayers.Layer.Vector("vector", {isBaseLayer: true});
  map.addLayers([vectors]);

  var feature = new OpenLayers.Feature.Vector(
    OpenLayers.Geometry.fromWKT(
      "POLYGON((28.828125 0.3515625, 132.1875 -13.0078125, -1.40625 -59.4140625, 28.828125 0.3515625))"
    )
  );
  vectors.addFeatures([feature]);

  var feature2 = new OpenLayers.Feature.Vector(
    OpenLayers.Geometry.fromWKT(
      "POLYGON((-120.828125 -50.3515625, -80.1875 -80.0078125, -40.40625 -20.4140625, -120.828125 -50.3515625))"
    )
  );
  vectors.addFeatures([feature2]);

  var report = function(e) {
    OpenLayers.Console.log(e.type, e.feature.id);
  };

  highlightCtrl = new OpenLayers.Control.SelectFeature(vectors, {
    hover: true,
    highlightOnly: true,
    renderIntent: "temporary",
    eventListeners: {
      beforefeaturehighlighted: report,
      featurehighlighted: report,
      featureunhighlighted: report
    }
  });

  var selectCtrl = new OpenLayers.Control.SelectFeature(vectors,
    {clickout: true}
  );

  map.addControl(highlightCtrl);
  map.addControl(selectCtrl);

  highlightCtrl.activate();
  selectCtrl.activate();

  map.setCenter(new OpenLayers.LonLat(0, 0), 1);

}

init();
