L.Control.SliderControl = L.Control.extend({
    options: {
        position: 'bottomleft',
        layer: null,
        timeAttribute: 'time',
        isEpoch: false,     // whether the time attribute is seconds elapsed from epoch
        startTimeIdx: 0,    // where to start looking for a timestring
        timeStrLength: 19,  // the size of  yyyy-mm-dd hh:mm:ss - if millis are present this will be larger
        maxValue: -1,
        minValue: -1,
        showAllOnStart: false,
        markers: null,
        range: false,
        follow: false,
        alwaysShowDate: false,
        rezoom: null,
        currentvalue: 0,
        lastvalue: 0
    },

    initialize: function (options) {
        L.Util.setOptions(this, options);
        this._layer = this.options.layer;

    },

    extractTimestamp: function (time, options) {
        if (options.isEpoch) {
            time = (new Date(parseInt(time))).toString(); // this is local time
        }
        return time.substr(options.startTimeIdx, (options.startTimeIdx + options.timeStrLength));
    },

    setPosition: function (position) {
        var map = this._map;

        if (map) {
            map.removeControl(this);
        }

        this.options.position = position;

        console.log(position);

        if (map) {
            map.addControl(this);
        }
        this.startSlider();
        return this;
    },

    onAdd: function (map) {
        this.options.map = map;

        // Create a control sliderContainer with a jquery ui slider
        var sliderContainer = L.DomUtil.create('div', 'slider', this._container);
        $(sliderContainer).append('<div id="leaflet-slider" class="mySlider"><span><img src="css/images/timeline.png" style="width: 885px; margin-top: -51px;margin-left: -35px;" </span><div class="ui-slider-handle" ></div><div id="slider-timestamp" class="mySliderTimestamp"></div></div>');

        //Prevent map panning/zooming while using the slider
        $(sliderContainer).mousedown(function () {
            map.dragging.disable();
        });
        $(document).mouseup(function () {
            map.dragging.enable();

            //Hide the slider timestamp if not range and option alwaysShowDate is set on false
            if (options.range || !options.alwaysShowDate) {
                $('#slider-timestamp').html('');
            }
        });

        var options = this.options;
        this.options.markers = [];
        this.options.unique_time_values = [];

        //If a layer has been provided: calculate the min and max values for the slider
        if (this._layer) {

            var flags = [], unique_values = [], len;
            this._layer.eachLayer(function (layer) {

                if (flags[layer.feature.properties.time]) return;
                flags[layer.feature.properties.time] = true;
                unique_values.push(layer.feature.properties.time);
                ++len;

            });

            var all_features = [];
            for (var i = 0; i < unique_values.length; i++) {
                all_features[i] = [];
            }

            var layers = this._layer.getLayers();

            for (var i = 0; i < layers.length; i++) {

                var index = unique_values.indexOf(layers[i].feature.properties.time);
                all_features[index].push(layers[i]);// add the items of the same year to one features group

            }

            for (var i = 0; i < all_features.length; i++) {
                var poplist = [];
                var popflag = [];
                var urllist = [];
                for (var j = 0; j < all_features[i].length; j++) {
                    // one marker one location

                    var f = popflag.indexOf(all_features[i][j].feature.properties.Genre + all_features[i][j].feature.geometry.coordinates[1]);
                    if (f === -1) {
                        popflag.push(all_features[i][j].feature.properties.Genre + all_features[i][j].feature.geometry.coordinates[1]);

                        var t = all_features[i][j].feature.properties.AUTHOR + ";" + all_features[i][j].feature.properties.BORNDIED + ";" + all_features[i][j].feature.properties.time + ";" + all_features[i][j].feature.properties.LOCATION + ";" + all_features[i][j].feature.properties.Genre + ";" + all_features[i][j].feature.properties.TECHNIQUE + ";" + all_features[i][j].feature.properties.TITLE;
                        var tt = all_features[i][j].feature.properties.URL;
                        var hh = "" + all_features[i][j].feature.properties.TITLE + "<br/><img class='myimg' src='" + tt + "' alt='" + t + "' width='280px' onclick='paintingPopup(this.src,this.alt)'/><br/><br/>";

                        all_features[i][j].bindPopup(hh, customOptions);
                        all_features[i][j].bindTooltip(all_features[i][j].feature.properties.LOCATION);
                        if (all_features[i][j].feature.properties.time === "1841") {

                        }

                        poplist.push(all_features[i][j]);
                        urllist.push(hh);

                    }
                    else {

                        var t = all_features[i][j].feature.properties.AUTHOR + ";" + all_features[i][j].feature.properties.BORNDIED + ";" + all_features[i][j].feature.properties.time + ";" + all_features[i][j].feature.properties.LOCATION + ";" + all_features[i][j].feature.properties.Genre + ";" + all_features[i][j].feature.properties.TECHNIQUE + ";" + all_features[i][j].feature.properties.TITLE;
                        var tt = all_features[i][j].feature.properties.URL;

                        urllist[f] = urllist[f] + "" + all_features[i][j].feature.properties.TITLE + "<br/><img class='myimg' src='" + tt + "' alt='" + t + "' width='280px'onclick='paintingPopup(this.src,this.alt)'/><br/><br/>";
                        poplist[f].bindPopup(urllist[f], customOptions);

                    }
                }
                var greatclus = L.markerClusterGroup({showCoverageOnHover: false});
                for (var k = 0; k < poplist.length; k++) {
                    greatclus.addLayer(poplist[k]);
                }
                options.markers[i] = greatclus;
            }
            options.maxValue = all_features.length - 1;
            this.options = options;
            this.options.unique_time_values = unique_values

        } else {
            console.log("Error: You have to specify a layer via new SliderControl({layer: your_layer});");
        }
        return sliderContainer;
    },

    onRemove: function (map) {
        //Delete all markers which where added via the slider and remove the slider div

        for (var i = 0; i < this.options.unique_time_values.length; i++) {
            map.removeLayer(this.options.markers[i]);
        }
        $('#leaflet-slider').remove();

        this.options.lastvalue = this.options.currentvalue;

    },

    startSlider: function () {
        _options = this.options;
        _extractTimestamp = this.extractTimestamp;
        var index_start = _options.minValue;
        if (_options.showAllOnStart) {
            index_start = _options.maxValue;
            if (_options.range) _options.values = [_options.minValue, _options.maxValue];
            else _options.value = _options.maxValue;
        }
        $("#leaflet-slider").slider({
            range: _options.range,
            value: _options.lastvalue,

            values: _options.values,
            min: _options.minValue,
            max: _options.maxValue,
            step: 1,
            create: function (e, ui) {
                if (_options.lastvalue !== 0) {
                    ui.value = _options.lastvalue;
                    var map = _options.map;
                    map.addLayer(_options.markers[_options.lastvalue]);
                    $('#slider-timestamp').html(
                        _extractTimestamp(_options.unique_time_values[ui.value], _options));
                }
            },

            slide: function (e, ui) {
                var map = _options.map;
                var fg = L.featureGroup();
                if (!!_options.markers[ui.value]) {

                    // If there is no time property, this line has to be removed (or exchanged with a different property)
                    if (_options.markers[ui.value].feature !== undefined) {
                        if (_options.markers[ui.value].feature.properties[_options.timeAttribute]) {
                            if (_options.markers[ui.value]) $('#slider-timestamp').html(
                                _extractTimestamp(_options.unique_values[ui.value].feature.properties[_options.timeAttribute], _options));
                        } else {
                            console.error("Time property " + _options.timeAttribute + " not found in data");
                        }
                    } else {
                        // set by leaflet Vector Layers
                        if (_options.unique_time_values[ui.value]) {

                            if (_options.markers[ui.value]) $('#slider-timestamp').html(
                                _extractTimestamp(_options.unique_time_values[ui.value], _options));
                        } else {
                            console.error("Time property " + _options.timeAttribute + " not found in data");
                        }
                    }

                    $('.ui-slider-handle').mouseover(function () {
                        $('#slider-timestamp').html(_extractTimestamp(_options.unique_time_values[ui.value], _options));
                    });
                    $('.ui-slider-handle').mouseleave(function () {
                        $('#slider-timestamp').html('');
                    });
                    $('.ui-slider-handle').mousedown(function () {
                        $('#slider-timestamp').html(_extractTimestamp(_options.unique_time_values[ui.value], _options));
                    });

                    var i;
                    // clear markers
                    for (i = _options.minValue + 1; i <= _options.maxValue; i++) {
                        if (_options.markers[i]) map.removeLayer(_options.markers[i]);
                    }
                    if (_options.range) {
                        // jquery ui using range
                        for (i = ui.values[0]; i <= ui.values[1]; i++) {
                            if (_options.markers[i]) {
                                map.addLayer(_options.markers[i]);
                                fg.addLayer(_options.markers[i]);
                            }
                        }
                    } else if (_options.follow) {

                        for (i = ui.value - _options.follow + 1; i <= ui.value; i++) {
                            if (_options.markers[i]) {
                                map.addLayer(_options.markers[i]);
                                fg.addLayer(_options.markers[i]);
                            }
                        }
                    } else {
                        for (i = _options.minValue; i <= ui.value; i++) {
                            if (_options.markers[i]) {
                                map.addLayer(_options.markers[i]);
                                fg.addLayer(_options.markers[i]);
                            }
                        }
                    }
                };
                if (_options.rezoom) {
                    map.fitBounds(fg.getBounds(), {
                        maxZoom: _options.rezoom
                    });
                }
                _options.currentvalue = ui.value;
            }
        });

        if (!_options.range && _options.alwaysShowDate) {
            $('#slider-timestamp').html(_extractTimeStamp(_options.markers[index_start].feature.properties[_options.timeAttribute], _options));
        }
        for (i = _options.minValue; i < index_start; i++) {
            _options.map.addLayer(_options.markers[i]);
        }
    }
});

L.control.sliderControl = function (options) {
    return new L.Control.SliderControl(options);
};

