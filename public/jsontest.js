var viewer = new Cesium.Viewer('cesiumContainer');

var terrainProvider = new Cesium.CesiumTerrainProvider({
url : 'https://assets.agi.com/stk-terrain/v1/tilesets/world/tiles',
requestVertexNormals : true
});

//Enable lighting based on sun/moon positions
viewer.scene.globe.enableLighting = true;


//Enable depth testing so things behind the terrain disappear.
viewer.scene.globe.depthTestAgainstTerrain = true;

Cesium.loadJson('https://raw.githubusercontent.com/kouridis/testCesium/master/input.json').then(function(jsonData) {
    
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
        console.log('tasos');
        var property = new Cesium.SampledPositionProperty();
        var j = 0;
        for (var i = 2; i < jsonData.length; i=i+7) {
            //console.log('tasos_loop');
            var time = Cesium.JulianDate.addSeconds(start, j, new Cesium.JulianDate());
            var one = jsonData[i]["Longitude (Deg)"];
            var two = jsonData[i]["Latitude (Deg)"];
            var three = jsonData[i]["Inertial Altitude (ft)"];
            //console.log(typeof one);
            var position = Cesium.Cartesian3.fromDegrees(parseFloat(one), parseFloat(two), parseFloat(three));
            property.addSample(time, position);
            j++;
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
    /*
    viewer.trackedEntity = undefined;
    viewer.zoomTo(viewer.entities, new Cesium.HeadingPitchRange(0, Cesium.Math.toRadians(-90)));
    */
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
}).otherwise(function(error) {
    // an error occurred
    console.log('ErrOr');
});

