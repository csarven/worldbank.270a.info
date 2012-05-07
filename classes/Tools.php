<?php
/*
 * @category  Base class
 * @author    Sarven Capadisli <info@csarven.ca>
 * @license   Apache License 2.0
 */

//require_once dirname(__FILE__) . DIRECTORY_SEPARATOR . '../lib/easyrdf/lib/EasyRdf.php';

class Tools
{
    var $config;

    function __construct($data)
    {
        $this->config = array();
        $this->setPrefixes();
        $this->setConfig($data);
//        $this->setObjectMapping();
        $this->setAPIElements();
        $this->getHTTPRequest();
//print_r($this->config);
//exit;



        switch($this->config['requestPath'][0]) {
            case 'view':
                require_once 'templates/tool.world-development-indicators.html';
                break;

            case 'observations': case 'info':
                $this->sendAPIResponse();
                break;

            default: //home
                echo "home";
                exit;
//                require_once 'templates/tool.world-development-indicators.html';
                break;
        }

    }

    function home()
    {

    }


    function getPrefixName($uri)
    {
        $prefixName = array_search(strstr($uri, '#', true).'#', $this->config['prefixes']);
        if ($prefixName) {
            return $prefixName;
        }
        else {
            return $uri;
        }
    }

    function curlRequest($uri)
    {
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $uri);
        curl_setopt($ch, CURLOPT_USERAGENT, "https://github.com/csarven/worldbank.270a.info");
//        curl_setopt($ch, CURLOPT_HEADER, 1);
//        curl_setopt($ch, CURLOPT_HTTPHEADER, array("Accept: application/json"));
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 10);
        $output = curl_exec($ch);
        curl_close($ch);

        return $output;
    }


    function getPrefix($prefix = null)
    {
        if (is_null($prefix)) {
            return $this->config['prefixes'];
        }
        else {
            return $this->config['prefixes'][$prefix];
        }
    }


    function setPrefixes()
    {
        $this->config['prefixes'] = array(
            'rdf'               => 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
            'rdfs'              => 'http://www.w3.org/2000/01/rdf-schema#',
            'owl'               => 'http://www.w3.org/2002/07/owl#',
            'xsd'               => 'http://www.w3.org/2001/XMLSchema#',
            'dcterms'           => 'http://purl.org/dc/terms/',
            'foaf'              => 'http://xmlns.com/foaf/0.1/',
            'skos'              => 'http://www.w3.org/2004/02/skos/core#',
            'wgs'               => 'http://www.w3.org/2003/01/geo/wgs84_pos#',
            'dbo'               => 'http://dbpedia.org/ontology/',

            'sdmx'              => 'http://purl.org/linked-data/sdmx#',
            'sdmx-attribute'    => 'http://purl.org/linked-data/sdmx/2009/attribute#',
            'sdmx-code'         => 'http://purl.org/linked-data/sdmx/2009/code#',
            'sdmx-concept'      => 'http://purl.org/linked-data/sdmx/2009/concept#',
            'sdmx-dimension'    => 'http://purl.org/linked-data/sdmx/2009/dimension#',
            'sdmx-measure'      => 'http://purl.org/linked-data/sdmx/2009/measure#',
            'sdmx-metadata'     => 'http://purl.org/linked-data/sdmx/2009/metadata#',
            'sdmx-subject'      => 'http://purl.org/linked-data/sdmx/2009/subject#',
            'qb'                => 'http://purl.org/linked-data/cube#',

            'year'         => 'http://reference.data.gov.uk/id/year/',

            'property' => 'http://worldbank.270a.info/property/',
            'classification' => 'http://worldbank.270a.info/classification/',
            'indicator' => 'http://worldbank.270a.info/classification/indicator/',
            'country' => 'http://worldbank.270a.info/classification/country/',


            'afn' => 'http://jena.hpl.hp.com/ARQ/function#'
        );
    }


    function setConfig($data)
    {
        $this->config['data'] = $data;
//        print_r($this->config);
    }

    function buildQueryURI($query = null)
    {
        $prefixes = $this->getPrefix();
        $SPARQL_prefixes = '';

        foreach($prefixes as $prefixName => $namespace) {
            $SPARQL_prefixes .= "PREFIX $prefixName: <$namespace>\n";
        }

        return STORE_URI."?query=".urlencode($SPARQL_prefixes.$query)."&output=json";
    }


    function setAPIElements()
    {
        //Using arrays for query paramaters for extensibility
        $this->config['apiElements'] = array(
            'info' => array('indicator'),
            'observations' => array('indicator', 'country', 'year')
        );
    }


    function getAPIElements()
    {
        return $this->config['apiElements'];
    }


    function sendAPIResponse()
    {
        $this->verifyAPIPathQuery();
        $response = $this->getRequestedData();
        $this->returnJSON($response);
    }


    function sendRemoteAPIResponse()
    {
        $this->verifyAPIPathQuery();
        $response = $this->getRemoteAPIData();
        $this->returnJSON($response);
    }


    function getHTTPRequest()
    {
        $this->config['requestPath'] = array();
        $this->config['requestQuery'] = array();

        $url = parse_url(substr($_SERVER['REQUEST_URI'], 1));
        $this->config['requestPath'] = explode('/', $url['path']);

        if (isset($url['query'])) {
            $queries = explode('&', $url['query']);

            $requestQuery = array();

            foreach ($queries as $query) {
                $key = $value = '';
                list($key, $value) = explode("=", $query) + Array(1 => null, null);

                //XXX: I'm not sure why an empty value should return an error.
                //Perhaps I meant the key? Commented out for now.
#                if (!isset($value) || empty($value)) {
#                    $this->returnError('malformed');
#                }

                $requestQuery[$key] = $value;
            }

            //Make sure that we have a proper query
            if (count($requestQuery) < 1) {
                $this->returnError('malformed');
            }

            $this->config['requestQuery'] = $requestQuery;
        }
    }


    function verifyAPIPathQuery()
    {
        $paths   = $this->config['requestPath'];

        $apiElement = null;
        $apiElements = $this->getAPIElements();

        //See if our path is in allowed API functions. Use the first match.
        foreach($paths as $path) {
            if (array_key_exists($path, $apiElements)) {
                $apiElement = $path;
                break;
            }
        }

        if (is_null($apiElement)) {
            $this->returnError('missing');
        }

        $apiElementKeyValue = null;
        $queries = $this->config['requestQuery'];

        //Make sure that the query param is allowed
        foreach($queries as $query => $kv) {
            if (in_array($query, $apiElements[$apiElement])) {
                $apiElementKeyValue[$query] = $kv;
            }
        }

        if (is_null($apiElementKeyValue)) {
            $this->returnError('missing');
        }

        $this->config['apiRequest']['path']  = $apiElement;
        $this->config['apiRequest']['query'] = $apiElementKeyValue;
    }


    function getRequestedData()
    {
        $apiEKV = $this->config['apiRequest']['query'];
//print_r($apiEKV);exit;
        $query = $bindIndicator = '';

        //TODO: Make this more abstract
        $country   = $this->getFormValue($apiEKV, 'country');
        $indicator = $this->getFormValue($apiEKV, 'indicator');
        $year        = $this->getFormValue($apiEKV, 'year');

        $bindIndicator = '';
        if (!empty($indicator)) {
            $indicatorURI = "<http://worldbank.270a.info/classification/indicator/$indicator>";
            $bindIndicator .= "BIND ($indicatorURI as ?indicatorURI)";
        } else {
            $indicatorURI = '?indicatorURI';
        }

        $indicatorGraph = <<<EOD
GRAPH <http://worldbank.270a.info/graph/meta> {
    $indicatorURI
        skos:inScheme classification:indicator ;
        skos:prefLabel ?indicatorPrefLabel ;
        skos:notation ?indicatorNotation ;
    .

    OPTIONAL {
        $indicatorURI
            skos:definition ?indicatorDefinition ;
        .
    }

    $bindIndicator
}


EOD;

        $bindCountry = $countryURI = $countryTriplePatterns = $refAreaTriplePatterns = '';
        $countries = array();
        if (!empty($country)) {
            $countries = explode(",", $country);

            foreach($countries as $c) {
                $countryURI = "<http://worldbank.270a.info/classification/country/$c>";

                $refAreaFilters[] = "?refArea = $countryURI";

//                $bindCountry .= "BIND ($countryURI AS ?countryURI)";
            }

                $countryTriplePatterns .= "
OPTIONAL {
    ?refArea
        skos:prefLabel ?countryPrefLabel ;
    .
}
";
/*

        skos:notation ?countryNotation ;

OPTIONAL {
    ?refArea
        wgs:lat ?countryLat ;
        wgs:long ?countryLong ;
    .
}
";
*/
            $refAreaTriplePatterns .= "
?s sdmx-dimension:refArea ?refArea .
FILTER (".implode("||", $refAreaFilters).")
";

        } else {
            $countryTriplePatterns = "
?countryURI
    skos:prefLabel ?countryPrefLabel ;
    skos:notation ?countryNotation ;
.
";

            $refAreaTriplePatterns .= "?s sdmx-dimension:refArea ?countryURI .";
        }

        $countryGraph = <<<EOD
GRAPH <http://worldbank.270a.info/graph/meta> {
    $countryTriplePatterns

    $bindCountry
}
EOD;

        if (!empty($year)) {
            $refPeriodURI = "http://reference.data.gov.uk/id/year/$year";
            $refPeriodTriplePatterns = "
            ?s sdmx-dimension:refPeriod <$refPeriodURI> .
            BIND(SUBSTR(STR('$refPeriodURI'), 38, 4) AS ?refPeriod) .
            ";
        } else {
            $refPeriodURI = "?refPeriodURI";
            $refPeriodTriplePatterns = "
            ?s sdmx-dimension:refPeriod $refPeriodURI .
            BIND(SUBSTR(STR($refPeriodURI), 38, 4) AS ?refPeriod) .
            ";
        }


        switch($this->config['apiRequest']['path']) {
            case 'info':
                if (!empty($indicator)) {
                    $query = <<<EOD
                        SELECT ?indicatorURI ?indicatorPrefLabel ?indicatorDefinition
                        WHERE {
                            $indicatorGraph
                        }
EOD;

                    $uri = $this->buildQueryURI($query);

                    return $this->curlRequest($uri);
                }
                else {
                    $this->returnError('missing');
                }
            break;

            case 'observations':
//                if (count($location) == 2) {
                    $query = <<<EOD
                        SELECT ?indicatorNotation ?countryPrefLabel ?refPeriod ?obsValue
                        WHERE {
                            $indicatorGraph

                            GRAPH <http://worldbank.270a.info/graph/world-development-indicators> {
                                ?s property:indicator $indicatorURI .
                                $refPeriodTriplePatterns
                                $refAreaTriplePatterns
                                ?s sdmx-measure:obsValue ?obsValue .
                            }

                            $countryGraph
                        }
                        ORDER BY ?refPeriod ?countryNotation

EOD;

//                    $this->setConfig(array('sparqlQueries' => array($query)));
//print_r($this->config['data']);
                    $uri = $this->buildQueryURI($query);

                    return $this->curlRequest($uri);
#                }
#                else {
#                    $this->returnError('missing');
#                }
                break;


            default:
                $this->returnError('missing');
                break;
        }
    }


    function getFormValue($apiElementKeyValue, $key)
    {
        if (isset($apiElementKeyValue[$key]) && !empty($apiElementKeyValue[$key])) {
            return urldecode(trim($apiElementKeyValue[$key]));
        }

        return;
    }


    function cleanLocation($values)
    {
        $center = array();
        foreach ($values as $v) {
            $v = trim($v);

            $center[] = is_numeric($v) ? $v : null;
        }

        if (in_array(null, $center)) {
            $this->returnError('malformed');
        }

        return $center;
    }


    function returnJSON($response = null)
    {
        header('Content-type: application/json; charset=utf-8');

        $response = json_decode($response, true);
        $response = $response['results']['bindings'];
        $response = '{"data": '.json_encode($response).'}';
        echo $response;
        exit;
    }


    function returnError($errorType)
    {
        header('HTTP/1.1 400 Bad Request');
        header('Content-type: application/json; charset=utf-8');

        $s = '';

        switch($errorType) {
            case 'missing': default:
                $s .= '{"error": "missing"}';
                break;
            case 'malformed':
                $s .= '{"error": "malformed"}';
                break;
        }

        echo $s;

        exit;
    }


    function htmlEscape($string)
    {
        static $convmap = array( 34,    34, 0, 0xffff,
                                 38,    38, 0, 0xffff,
                                 39,    39, 0, 0xffff,
                                 60,    60, 0, 0xffff,
                                 62,    62, 0, 0xffff,
                                128, 10240, 0, 0xffff);

        return mb_encode_numericentity($string, $convmap, 'UTF-8');
    }

}

?>
