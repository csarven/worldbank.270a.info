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
                console.log('country click');
                $('#form_country').fadeTo('fast', '1');
                $('#form_year').val('').fadeTo('slow', '0.45');
                $('#year').val('');
                T.I.YEAR = '';
            });

            $('#form_year').click(function() {
                console.log('year click');
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
//console.log(T.I.INDICATOR);
//console.log(T.I.COUNTRY);
//console.log(T.I.YEAR);
        },

        setSearchValues : function (urlParams) {
//console.log('setSearchValues');
//console.log(urlParams);
            $('#' + T.C.ID_INDICATOR).val(urlParams.indicator);
            if (urlParams.country != undefined && urlParams.country != '') {
                $('#' + T.C.ID_COUNTRY).val(urlParams.country);
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
                        'country' : T.I.COUNTRY,
                    });
                } else if (T.I.YEAR != '') {
                    var urlParams = $.param({
                        'indicator' : T.I.INDICATOR,
                        'year' : T.I.YEAR
                    });
                }

//console.log(urlParams);
                window.location = T.C.BASE_URI + '?' + urlParams;
//            } else {

//            }

//            T.U.showObservations();
        },

        showObservations : function() {
//console.log("showObservations");
            T.U.getSearchValues();

            if (T.I.COUNTRY != '') {
                var params = T.I.COUNTRY;
                google.load('visualization', '1', {packages: ['corechart']});
            } else if (T.I.YEAR != '') {
                var params = T.I.YEAR;
                google.load('visualization', '1', {packages: ['geochart']});
            }

            google.setOnLoadCallback(T.U.renderChart.indicators(T.I.INDICATOR, params));
        },


        renderChart : {
            indicators : function (indicatorNotation, dimensions) {
//console.log("renderChart.indicators");

//                if (countries.length != 0) {
//                    var uri;
//                    $.each(countries, function(i, country) {
//                        var paramsCountries = 
//                    });
//                }

                var uriIndicator = T.C.API_BASE_INFO + "indicator=" + indicatorNotation;

                if (T.I.COUNTRY != '') {
                    var uriObservations = T.C.API_BASE_OBSERVATIONS + "indicator=" + indicatorNotation + "&country=" + dimensions;
                } else if (T.I.YEAR != '') {
                    var uriObservations = T.C.API_BASE_OBSERVATIONS + "indicator=" + indicatorNotation + "&year=" + dimensions;
                }
//console.log(uriIndicator);
//console.log(uriObservations);

                var indicatorURI, indicatorPrefLabel, indicatorDefinition;
                $('#' + 'results').addClass('processing');
                $.getJSON(uriIndicator, function (data, textStatus) {
//console.log(data);
                    if (data.data[0] != undefined && data.data[0].length != 0) {
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
                    $('#' + 'results').removeClass('processing');
                });


                var countryPrefLabel;

                $('#' + 'results').addClass('processing');
                $.getJSON(uriObservations, function (data, textStatus) {
//console.log(data);

                    var observations;

                    if (data.data[0] != undefined && data.data[0].length != 0) {
                        dataTable = new google.visualization.DataTable();

                        if (T.I.COUNTRY != '') {
                            var dimensionColumnName = "Countries";
                        } else if (T.I.YEAR != '') {
                            var dimensionColumnName = "Years";
                        }

                        dataTable.addColumn('string', dimensionColumnName);
                        dataTable.addColumn('number', indicatorPrefLabel);

                        $.each(data.data, function (i, observation) {
                            if (T.I.COUNTRY != '') {
                                countryPrefLabel = observation.countryPrefLabel.value;
                                var dimension = observation.refPeriod.value;
                            } else if (T.I.YEAR != '') {
                                var dimension = observation.countryPrefLabel.value;
                            }

                            var measure = parseInt(observation.obsValue.value);

                            if (measure > 0) {
                                dataTable.addRow([dimension, measure]);
                            }
                        });

                        var options = {
                            title: indicatorDefinition,
                            width: 960,
                            height: 420,
                            hAxis: {
                                title: '',
                            },
                            legend: {
                                position: 'top'
                            },
                            datalessRegionColor : 'FFFFFF'
                        };

                        if (T.I.COUNTRY != '') {
                            options.hAxis.title = 'Years';
                            options.title = options.title + " [" + countryPrefLabel + "]";
                            var chart = new google.visualization.LineChart(document.getElementById('results'));
                        } else if (T.I.YEAR != '') {
                            options.hAxis.title = 'Countries';
                            var chart = new google.visualization.GeoChart(document.getElementById('results'));
                        }

                        chart.draw(dataTable, options);
                        $('#' + 'results').removeClass('processing');
                    }
                    else {
                       $('#results').html('<p class="warning notfound">No observations are found for indicator <em>' + indicatorNotation + '</em></p>');
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
