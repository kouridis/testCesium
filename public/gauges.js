

$.getJSON('https://raw.githubusercontent.com/kouridis/testCesium/master/input.json', function(data) {
    var attitude = $.flightIndicator('#attitude', 'attitude', {roll:50, pitch:-20, size:200, showBox : false});
    var heading = $.flightIndicator('#heading', 'heading', {heading:150, showBox:false});
    var variometer = $.flightIndicator('#variometer', 'variometer', {vario:-5, showBox:false});
    var airspeed = $.flightIndicator('#airspeed', 'airspeed', {showBox: false});
    var altimeter = $.flightIndicator('#altimeter', 'altimeter', {showBox: false});
    var turn_coordinator = $.flightIndicator('#turn_coordinator', 'turn_coordinator', {turn:0, showBox:false});

    var i = 0;
    setInterval(function() {
        // Airspeed update
        airspeed.setAirSpeed(parseFloat(data[i]["Ground Speed (knots)"]));

        // Attitude update
        attitude.setRoll(parseFloat(data[i]["Roll (Deg)"]));
        attitude.setPitch(parseFloat(data[i]["Pitch (Deg)"]));

        // Altimeter update
        altimeter.setAltitude(parseFloat(data[i]["Inertial Altitude (ft)"]));
        //altimeter.setPressure(1000+3*Math.sin(increment/50));

        // Heading update
        heading.setHeading(parseFloat(data[i]["Heading (Deg)"]));

        // TC update - note that the TC appears opposite the angle of the attitude indicator, as it mirrors the actual wing up/down position
        turn_coordinator.setTurn(-(parseFloat(data[i]["Roll (Deg)"])));

        i++;

        // Vario update
        variometer.setVario(1.5);
    }, 160);
});
