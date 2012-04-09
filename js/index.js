/*
 * @category  UI interaction
 * @author    Sarven Capadisli <info@csarven.ca>
 * @license   Apache License 2.0
 */


var T = { // Tool

    C : {
        DEBUG : false,
        BASE_URI : "/view",

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
//            T.handleInteraction();
        },

        initSearchPanel : function () {
//            $("#form_search #address").focus();
//console.log("initSearchPanel");
            // the search button has been hit, show nearby schools
            $('#' + T.C.ID_SUBMIT).click(function () {
                T.U.searchAction();
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
            T.I.INDICATOR = $('#' + T.C.ID_INDICATOR).val();
            T.I.COUNTRY = $('#' + T.C.ID_COUNTRY).val();
            T.I.YEAR = $('#' + T.C.ID_YEAR).val();
        },

        setSearchValues : function (urlParams) {
            $('#' + T.C.ID_INDICATOR).val(urlParams.indicator);
            $('#' + T.C.ID_COUNTRY).val(urlParams.country);
            $('#' + T.C.ID_YEAR).val(urlParams.year);
        },

        searchAction : function () {
            if (window.location.pathname != '/'+T.C.BASE_URI) {
                T.U.getSearchValues();

                var urlParams = $.param({
                    'indicator' : T.I.INDICATOR,
                    'country' : T.I.COUNTRY,
                    'year' : T.I.YEAR
                });
//console.log("searchAction");
                window.location = T.C.BASE_URI + '?' + urlParams;
            }

            T.U.showObservations();
        },

        showObservations : function() {
//console.log("showObservations");
            T.U.getSearchValues();

            if (T.I.COUNTRY == '') {
                var params = "indicator=" + T.I.INDICATOR + "&year=" + T.I.YEAR;
                google.load('visualization', '1', {packages: ['geochart']});
            }
            else {
                var params = "indicator=" + T.I.INDICATOR + "&country=" + T.I.COUNTRY;
                google.load('visualization', '1', {packages: ['corechart']});
            }

            google.setOnLoadCallback(T.U.renderChart.indicators(params));
        },


        renderChart : {
            indicators : function (params) {
//                console.log("renderChart.indicators");

                var uri = T.C.API_BASE_OBSERVATIONS + params;
//console.log(uri);

                $('#' + 'results').addClass('processing');
                $.getJSON(uri, function (data, textStatus) {
//console.log(data);

                    var observations = '';

                    if (data != null && data.data[0].length != 0) {
                        dataTable = new google.visualization.DataTable();

                        if (T.I.COUNTRY == "") {
                            var dimensionColumnName = "Years";
                        }
                        else {
                            var dimensionColumnName = "Countries";
                        }

                        dataTable.addColumn('string', dimensionColumnName);
                        dataTable.addColumn('number', data.data[0].indicatorPrefLabel.value + " in " + data.data[0].countryPrefLabel.value + " at " + data.data[0].refPeriod.value);

                        $.each(data.data, function (i, observation) {
                            if (T.I.COUNTRY == "") {
                                var dimension = observation.countryNotation.value;
                            }
                            else {
                                var dimension = observation.refPeriod.value;
                            }

                            var measure = parseInt(observation.obsValue.value);

                            if (measure > 0) {
                                dataTable.addRow([dimension, measure]);
                            }
                        });

                        var options = {
                            title: data.data[0].indicatorDefinition.value,
                            width: 960,
                            height: 320,
                            hAxis: {
                                title: '',
                            },
                            legend: {
                                position: 'top'
                            }
                        };

                        if (T.I.COUNTRY != '') {
                            options.hAxis.title = 'Years';
                            var chart = new google.visualization.LineChart(document.getElementById('results'));
                        }
                        else if (T.I.YEAR != '') {
                            options.hAxis.title = 'Countries';
                            var chart = new google.visualization.GeoChart(document.getElementById('results'));
                        }

                        chart.draw(dataTable, options);
                        $('#' + 'results').removeClass('processing');
                    }
                    else {
//                       observations += '<p class="no_stats">No observation values found, sorry ...</p>';
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
