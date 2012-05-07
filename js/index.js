/*
 * @category  UI interaction
 * @author    Sarven Capadisli <info@csarven.ca>
 * @license   Apache License 2.0
 */


var T = { // Tool

    C : {
        DEBUG : false,
        BASE_URI : "/view",

        API_BASE_INFO : "/info?",
        API_BASE_OBSERVATIONS : "/observations?",

        ID_SUBMIT : "submit",
        ID_INDICATOR : "indicator",
        ID_COUNTRY : "country",
        ID_YEAR : "year"

    },

    I : {  },

    U: {
        init : function () {
            T.U.initSearchPanel();
        },

        initSearchPanel : function () {
//console.log("initSearchPanel");
            $('#' + T.C.ID_SUBMIT).click(function () {
                T.U.searchAction();
            });

            $('#form_country').click(function() {
//console.log('country click');
                $('#form_country').fadeTo('fast', '1');
                $('#form_year').val('').fadeTo('slow', '0.45');
                $('#year').val('');
                T.I.YEAR = '';
            });

            $('#form_year').click(function() {
//console.log('year click');
                $('#form_year').fadeTo('fast', '1');
                $('#form_country').val('').fadeTo('slow', '0.45');
                $('#country').val('');
                T.I.COUNTRY = '';
            });

            $("#country").change(function () {
                $('#country option:selected').each(function() {
                    if ($(this).val() != '') {
                        $('#form_year').fadeTo('slow', '0.45');
                    }
                });
            });

            $("#year").change(function () {
                $('#year option:selected').each(function() {
                    if ($(this).val() != '') {
                        $('#form_country').fadeTo('slow', '0.45');
                    }
                });
            });

            urlParams = T.U.getURLParams();

            if (urlParams.indicator != undefined) {
                T.U.setSearchValues(urlParams);
                T.U.showObservations();
            }
        },

        //From http://stackoverflow.com/a/2880929
        getURLParams : function () {
//console.log("getURLParams");
            var urlParams = {};
            var e,
                a = /\+/g,  // Regex for replacing addition symbol with a space
                r = /([^&=]+)=?([^&]*)/g,
                d = function (s) { return decodeURIComponent(s.replace(a, " ")); },
                q = window.location.search.substring(1);

            while (e = r.exec(q)) {
               urlParams[d(e[1])] = d(e[2]);
            }
//console.log(urlParams);
            return urlParams;
        },

        getSearchValues : function () {
//console.log('getSearchValues');
            T.I.INDICATOR = $('#' + T.C.ID_INDICATOR).val();
            T.I.COUNTRY = $('#' + T.C.ID_COUNTRY).val();
            T.I.YEAR = $('#' + T.C.ID_YEAR).val();
//console.log("T.I.INDICATOR: " + T.I.INDICATOR);
//console.log("T.I.COUNTRY: " + T.I.COUNTRY);
//console.log(T.I.COUNTRY);
//console.log("T.I.YEAR: " + T.I.YEAR);
        },

        setSearchValues : function (urlParams) {
//console.log('setSearchValues');
//console.log(urlParams);
            $('#' + T.C.ID_INDICATOR).val(urlParams.indicator);
            if (urlParams.country != undefined && urlParams.country != '') {
//console.log(urlParams.country);
                $('#' + T.C.ID_COUNTRY).val(urlParams.country.split(','));
            } else if (urlParams.year != undefined && urlParams.year != '') {
                $('#' + T.C.ID_YEAR).val(urlParams.year);
            }
        },

        searchAction : function () {
//console.log('searchAction');
//            if (window.location.pathname == T.C.BASE_URI) {
                T.U.getSearchValues();

                if (T.I.COUNTRY != '') {
                    var urlParams = $.param({
                        'indicator' : T.I.INDICATOR,
                        'country' : T.I.COUNTRY.join(",")
                    });
                } else if (T.I.YEAR != '') {
                    var urlParams = $.param({
                        'indicator' : T.I.INDICATOR,
                        'year' : T.I.YEAR
                    });
                }

//console.log(T.C.BASE_URI + '?' + decodeURIComponent(urlParams));
                window.location = T.C.BASE_URI + '?' + decodeURIComponent(urlParams);
//            } else {

//            }

//            T.U.showObservations();
        },

        showObservations : function() {
//console.log("showObservations");
            T.U.getSearchValues();

            if (T.I.COUNTRY != null && T.I.COUNTRY != '') {
                var dimensions = T.I.COUNTRY;
//                google.load('visualization', '1', {packages: ['corechart']});
            } else if (T.I.YEAR != null && T.I.YEAR != '') {
                var dimensions = T.I.YEAR;
//                google.load('visualization', '1', {packages: ['geochart']});
            }
//console.log(dimensions);
            google.setOnLoadCallback(T.U.renderChart.indicators(T.I.INDICATOR, dimensions));
        },


        renderChart : {
            indicators : function (indicatorNotation, dimensions) {
//console.log(indicatorNotation);
                var uriIndicator = T.C.API_BASE_INFO + "indicator=" + indicatorNotation;

                if (T.I.COUNTRY != null && T.I.COUNTRY != '') {
                    var uriObservations = T.C.API_BASE_OBSERVATIONS + "indicator=" + indicatorNotation + "&country=" + dimensions;
                } else if (T.I.YEAR != null && T.I.YEAR != '') {
                    var uriObservations = T.C.API_BASE_OBSERVATIONS + "indicator=" + indicatorNotation + "&year=" + dimensions;
                }
//console.log(uriIndicator);
//console.log(uriObservations);

                var indicatorURI, indicatorPrefLabel, indicatorDefinition;
                $('#' + 'results').addClass('processing');

                $.ajax({
                    url: uriIndicator,
                    error: function(XMLHttpRequest, textStatus, errorThrown) {
//console.log(XMLHttpRequest);
//console.log(textStatus);
//console.log(errorThrown);

                        var urlParams = T.U.getURLParams();
                        $('#results').removeClass('processing');
                        $('#results').html('<div class="error">Sorry indicator <em>' + urlParams.indicator + '</em> does not exist.</p></div>');
                    },
                    success: function(data, textStatus) {
//console.log(data);
                        if (data.data != null && data.data[0] != undefined && data.data[0].length != 0) {
                            $.each(data.data, function (i, indicator) {
                                if (indicator.indicatorURI != undefined) {
                                    indicatorURI = indicator.indicatorURI.value;
                                }
                                if (indicator.indicatorPrefLabel != undefined) {
                                    indicatorPrefLabel = indicator.indicatorPrefLabel.value;
                                }
                                if (indicator.indicatorDefinition != undefined) {
                                    indicatorDefinition = indicator.indicatorDefinition.value;
                                } else {
                                    indicatorDefinition = indicator.indicatorPrefLabel.value;
                                }
                            });
                        }
    //                    $('#' + 'results').removeClass('processing');

                        $('h1').after('<div id="about"/>');

                        $('#about').append('<dl><dt id="indicator-preflabel"><a href="' + indicatorURI + '">' + indicatorPrefLabel + '</a></dt><dd id="indicator-definition">' + indicatorDefinition + '</dd></dl>');

                        var countryPrefLabel = '';

//var start = new Date;
//setInterval(function() {
//    $('#results').text((new Date - start) / 1000 + " seconds");
//}, 1000);


//                $('#' + 'results').addClass('processing');
                        $.ajax({
                            url: uriObservations,
                            dataType: 'json',
                            timeout: 10000,
                            error: function(XMLHttpRequest, textStatus, errorThrown) {
//console.log(XMLHttpRequest);
//console.log(textStatus);
//console.log(errorThrown);
                                $('#results').removeClass('processing');
                                $('#results').html('<div class="error"><p>Sorry, something went wrong while trying:</p><p><code>' + location.href + '</code></p><p>Can you please try again later?</p></div>');
                            },
                            success: function(data, textStatus) {
//console.log(data);
//console.log(textStatus);
                                var observations;

                                if (data.data != null && data.data[0] != undefined && data.data[0].length != 0) {
                                    dataTable = new google.visualization.DataTable();

                                    var increment = 1;

                                    if (T.I.COUNTRY != null && T.I.COUNTRY != '') {
                                        dataTable.addColumn('string', "Countries");
                                        dataTable.addColumn('number', "Years");
                                        dataTable.addColumn('string', "Indicators");
                                        dataTable.addColumn('number', "Values");

                                        increment = T.I.COUNTRY.length;
                                    } else if (T.I.YEAR != null && T.I.YEAR != '') {
                                        dataTable.addColumn('string', "Countries");
                                        dataTable.addColumn('string', "Indicators");
                                        dataTable.addColumn('number', indicatorPrefLabel);
                                    }


                                    var countryKeys = [];

                                    for (var i=0; i < data.data.length; i++) {
                                        var values = [];

            //console.log(dimension);

                                        if (T.I.COUNTRY != null && T.I.COUNTRY != '') {
                                            var countryLabel = data.data[i].countryPrefLabel.value;

                                            values.push(countryLabel);

                                            countryKeys.push('{"key":{"dim0":"' + countryLabel + '"}}');

                                            values.push(parseFloat(data.data[i].refPeriod.value));
                                        } else if (T.I.YEAR != null && T.I.YEAR != '') {
                                            values.push(data.data[i].countryPrefLabel.value);
                                        }

                                        values.push(data.data[i].indicatorNotation.value);

                                        var missingMeasure = false;
            //                            var measures = [];
            //                            var observationRow = [];
            //                            for (var j=0; j < increment; j++) {
                                            m = data.data[i].obsValue.value;

                                            if (m == '') {
                                                missingMeasure = true;
                                                continue;
                                            }
                                            values.push(parseFloat(m));
            //                            }


            //console.log(values);

                                        if (!missingMeasure) {
                                            dataTable.addRow(values);
            //console.log(observationRow);
                                        }
                                    }

                                    countryKeys.join(',');

                                    var options = {
                                        state: '{"playDuration":15000,"xZoomedIn":false,"xZoomedDataMax":1167609600000,"sizeOption":"_UNISIZE","yLambda":1,"xAxisOption":"_TIME","duration":{"multiplier":1,"timeUnit":"Y"},"time":"2007","yZoomedDataMin":0,"yAxisOption":"3","dimensions":{"iconDimensions":["dim0"]},"xZoomedDataMin":-283996800000,"colorOption":"_UNIQUE_COLOR","orderedByY":false,"uniColorForNonSelected":false,"yZoomedDataMax":6000000,"iconType":"LINE","yZoomedIn":false,"orderedByX":false,"xLambda":1,"showTrails":false,"nonSelectedAlpha":0.4,"iconKeySettings":[' + countryKeys +']}',
                                        title: indicatorDefinition,
                                        width: 960,
                                        height: 420,
                                        hAxis: {
                                            title: ''
                                        },
                                        legend: {
                                            position: 'right'
                                        },
                                        datalessRegionColor: 'FFFFFF'
            //                            interpolateNulls: true
                                    };


                                    if (T.I.COUNTRY != null && T.I.COUNTRY != '') {
                                        var countryPrefLabels = [];
                                        $.each(T.I.COUNTRY, function() {
                                            countryPrefLabels.push($('#country [value=' + this + ']').text());
                                        });
                                        countryPrefLabels = countryPrefLabels.join(", ");
                                        options.title = options.title + " [" + countryPrefLabels + "]";

                                        options.hAxis.title = 'Years';

                                        if (!missingMeasure) {
                                            options.interpolateNulls = true;
                                        }

                                        var chart = new google.visualization.MotionChart(document.getElementById('results'));
                                    } else if (T.I.YEAR != null && T.I.YEAR != '') {
                                        options.hAxis.title = 'Countries';
                                        var chart = new google.visualization.GeoChart(document.getElementById('results'));
                                    }

                                    $('#results').removeClass('processing');

                                    chart.draw(dataTable, options);

                                    var seeAlsoWorldBankGraph = '';
                                    if (T.I.COUNTRY != null && T.I.COUNTRY != '') {
                                        wbCountries = T.I.COUNTRY.join("-");

                                        seeAlsoWorldBankGraph = 'See also <a href="http://worldbank.org/">The World Bank</a>\'s graph for this observation: <a href="http://data.worldbank.org/indicator/' + indicatorNotation + '/countries/' + wbCountries + '?display=graph">' + indicatorPrefLabel + '</a>';
                                    }

                                    $('#results').after('<p class="see-also">' + seeAlsoWorldBankGraph + '</p>');

            //                        if (!missingMeasure) {
            //                            if (T.I.COUNTRY != null && T.I.COUNTRY != '') {
            //                                wbCountries = T.I.COUNTRY.join("-");

            //                                $('#results').append('<p>See also The World Bank\'s graph for this observation: <a href="http://data.worldbank.org/indicator/' + indicatorNotation + '/countries/' + wbCountries + '?display=graph">' + indicatorPrefLabel + '</a></p>');
            //                            }

            //                            $('#results').append('<p class="warning">This chart is missing points. In order to show a continuous line, an option is used to guess the value of any missing data based on neighboring points. This option is currently being tested.</p>');
            //                        }
                                }
                                else {
                                   $('#results').removeClass('processing');
                                   $('#results').html('<p class="warning notfound">No observations are found for indicator <em>' + indicatorPrefLabel + '</em></p>');
                                }
                            }
                        });
                    }
                });
            }
        }
    }
};

$(document).ready(function () {
    bodyId = $('body').attr('id');

    switch (bodyId) {
        case 'home':
            break;

        case 'observation':
            T.U.init();
            break;

        default:
            break;
    }
});
