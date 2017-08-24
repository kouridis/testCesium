var viewer = new Cesium.Viewer('cesiumContainer');

var terrainProvider = new Cesium.CesiumTerrainProvider({
url : 'https://assets.agi.com/stk-terrain/v1/tilesets/world/tiles',
requestVertexNormals : true
});

//Enable lighting based on sun/moon positions
viewer.scene.globe.enableLighting = true;


//Enable depth testing so things behind the terrain disappear.
viewer.scene.globe.depthTestAgainstTerrain = true;


//Set bounds of our simulation time
var start = Cesium.JulianDate.fromDate(new Date(2012, 8, 4, 10));
var stop = Cesium.JulianDate.addSeconds(start, 4391, new Cesium.JulianDate());

//Make sure viewer is at the desired time.
viewer.clock.startTime = start.clone();
viewer.clock.stopTime = stop.clone();
viewer.clock.currentTime = start.clone();
viewer.clock.clockRange = Cesium.ClockRange.LOOP_STOP; //Loop at the end
viewer.clock.multiplier = 5;

//Set timeline to simulation bounds
viewer.timeline.zoomTo(start, stop);

function computeFlight() {
  var cords = [
  	[40.6611797422167,22.5204189040969,571.6794],
  	[40.7253362540188,22.5955196668706,544.6128],
  	[40.7629565823876,22.7060582780652,790.6728],
  	[40.7772225815863,22.7450457786604,1007.2056],
  	[40.7996849924399,22.6874123153639,932.5674],
  	[40.8182745449328,22.7980465640737,912.0624],
  	[40.7490963511214,22.8834247974218,1849.551],
  	[40.7188910733937,23.025896531864,1242.603],
  	[40.6760846938943,23.029590855687,1787.2158],
  	[40.7312848906999,22.9900178791553,1369.734],
  	[40.6817516986289,22.8567815770851,1030.1712],
  	[40.6479652527709,22.6667387702853,641.3964],
  	[40.6691600684078,22.4807870027858,618.4308],
  	[40.648155605792,22.4929887068714,114.0078],
  	[40.6472437385459,22.4927770638163,112.3674],
  	[40.6472563114006,22.4927665864373,108.2664]
  	];
    var property = new Cesium.SampledPositionProperty();
    for (var i = 0; i < cords.length; i++) {

        //var radians = Cesium.Math.toRadians(i);
        //var time = Cesium.JulianDate.addSeconds(start, i, new Cesium.JulianDate());
      var time = Cesium.JulianDate.addSeconds(start, 300*i, new Cesium.JulianDate());
        //var position = Cesium.Cartesian3.fromDegrees(lon + (radius * 1.5 * Math.cos(radians)), lat + (radius * Math.sin(radians)), Cesium.Math.nextRandomNumber() * 500 + 1750);
      var position = Cesium.Cartesian3.fromDegrees(cords[i][1], cords[i][0], cords[i][2]);
      property.addSample(time, position);
        /*
        //Also create a point for each sample we generate.
        viewer.entities.add({
            position : position,
            point : {
                pixelSize : 8,
                color : Cesium.Color.TRANSPARENT,
                outlineColor : Cesium.Color.YELLOW,
                outlineWidth : 3
            }
        });
        */
    }
    return property;
}

//Compute the entity position property.
var position = computeFlight();

//Actually create the entity
var entity = viewer.entities.add({

    //Set the entity availability to the same interval as the simulation time.
    availability : new Cesium.TimeIntervalCollection([new Cesium.TimeInterval({
        start : start,
        stop : stop
    })]),

    //Use our computed positions
    position : position,

    //Automatically compute orientation based on position movement.
    orientation : new Cesium.VelocityOrientationProperty(position),

    //Load the Cesium plane model to represent the entity
    model : {
        uri : '../../SampleData/models/CesiumAir/Cesium_Air.gltf',
        minimumPixelSize : 64
    },

    //Show the path as a pink line sampled in 1 second increments.
    path : {
        resolution : 5,
        material : new Cesium.PolylineOutlineMaterialProperty({
            color : new Cesium.Color(255, 0, 255, 255),
			outlineColor : new Cesium.Color(0, 255, 255, 255),
			outlineWidth : 5
        }),
        width : 10,
        leadTime : 0
    }
});

entity.position.setInterpolationOptions({
    interpolationDegree : 5,
    interpolationAlgorithm : Cesium.LagrangePolynomialApproximation
});

//Set up chase camera
var matrix3Scratch = new Cesium.Matrix3();
var positionScratch = new Cesium.Cartesian3();
var orientationScratch = new Cesium.Quaternion();
function getModelMatrix(entity, time, result) {
    var position = Cesium.Property.getValueOrUndefined(entity.position, time, positionScratch);
    if (!Cesium.defined(position)) {
        return undefined;
    }
    var orientation = Cesium.Property.getValueOrUndefined(entity.orientation, time, orientationScratch);
    if (!Cesium.defined(orientation)) {
        result = Cesium.Transforms.eastNorthUpToFixedFrame(position, undefined, result);
    } else {
        result = Cesium.Matrix4.fromRotationTranslation(Cesium.Matrix3.fromQuaternion(orientation, matrix3Scratch), position, result);
    }
    return result;
}
viewer.trackedEntity = undefined;
viewer.zoomTo(viewer.entities, new Cesium.HeadingPitchRange(0, Cesium.Math.toRadians(-90)));
/*
//Add button to track the entity as it moves
Sandcastle.addToolbarButton('View Aircraft', function() {
    var scratch = new Cesium.Matrix4();
    var camera =  viewer.scene.camera;
    viewer.scene.preRender.addEventListener(function(){
        getModelMatrix(entity, viewer.clock.currentTime, scratch);
        var h = Cesium.Math.toRadians(90);
        var p = Cesium.Math.toRadians(-13);
        //camera.lookAtTransform(scratch, new Cesium.Cartesian3(-50, 0, 10));
        camera.lookAtTransform(scratch, new Cesium.HeadingPitchRange(h, p, 50));
    });
});

//Add button to view the path from the top down
Sandcastle.addDefaultToolbarButton('View Top Down', function() {
    viewer.trackedEntity = undefined;
    viewer.zoomTo(viewer.entities, new Cesium.HeadingPitchRange(0, Cesium.Math.toRadians(-90)));
});

//Add button to view the path from the side
Sandcastle.addToolbarButton('View Side', function() {
    viewer.trackedEntity = undefined;
    viewer.zoomTo(viewer.entities, new Cesium.HeadingPitchRange(Cesium.Math.toRadians(-90), Cesium.Math.toRadians(-15), 7500));
});
*/
