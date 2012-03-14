<?php

$config['site']['name']   = 'World Bank Linked Data'; /* Name of your site. Appears in page title, address etc. */
$config['site']['server'] = 'worldbank.270a.info';                /* 'site' in http://site */
$config['site']['path']   = '';                    /* '/foo' in http://site/foo */
$config['site']['theme']  = 'default';             /* 'default' in /var/www/site/theme/default */
$config['site']['logo']   = 'logo_worldbank-linkeddata.png';       /* 'logo_latc.png' in /var/www/site/theme/default/images/logo_latc.png */

/*
 * Common prefixes for this dataset
 */
$config['prefixes'] = array(
    'rdf'               => 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
    'rdfs'              => 'http://www.w3.org/2000/01/rdf-schema#',
    'xsd'               => 'http://www.w3.org/2001/XMLSchema#',
    'skos'              => 'http://www.w3.org/2004/02/skos/core#',
    'foaf'              => 'http://xmlns.com/foaf/0.1/',
    'dcterms'           => 'http://purl.org/dc/terms/',
    'indicator'         => 'http://worldbank.270a.info/classification/indicator/',
);

/**
 * SPARQL Queries
 */
/* Empty query (temporary) */
$config['sparql_query']['empty'] = '';

/**
 * Default query is DESCRIBE
 * '<URI>' value is auto-assigned from current request URI
 */
$config['sparql_query']['default'] = "
    DESCRIBE <URI>
";
/**
 * Entity Set
 */
/* URI path for this entity */
$config['entity']['default']['path']     = '';
/* SPARQL query to use for this entity e.g., $config['sparql_query']['default'] */
$config['entity']['default']['query']    = 'default';
/* HTML template to use for this entity */
$config['entity']['default']['template'] = 'page.default.html';


$config['sparql_query']['site_home'] = "";
$config['entity']['site_home']['path']     = "/";
$config['entity']['site_home']['query']    = 'site_home';
$config['entity']['site_home']['template'] = 'page.home.html';

$config['entity']['site_about']['path']     = "/about";
$config['entity']['site_about']['query']    = 'empty';
$config['entity']['site_about']['template'] = 'page.about.html';



$config['sparql_query']['classification'] = "
CONSTRUCT {
    <URI> ?p1 ?o1 .
    ?o1 skos:prefLabel ?conceptLabel .
}
WHERE {
    GRAPH <http://worldbank.270a.info/graph/meta> {
        <URI> ?p1 ?o1 .
        OPTIONAL {
            {
                ?o1 skos:prefLabel ?conceptLabel .
            }
            UNION
            {
                ?o1 rdfs:label ?conceptLabel .
            }
        }
    }
}
";
$config['entity']['classification']['path']     = '/classification/';
$config['entity']['classification']['query']    = 'classification';
$config['entity']['classification']['template'] = 'page.classification.html';


$config['sparql_query']['dataset'] = "
CONSTRUCT {
    <URI> ?p1 ?o1 .
}
WHERE {
    GRAPH <http://worldbank.270a.info/graph/meta> {
        <URI> ?p1 ?o1 .
    }
}
";
$config['entity']['classification_currency']['path']     = '/dataset';
$config['entity']['classification_currency']['query']    = 'dataset';
$config['entity']['classification_currency']['template'] = 'page.classification.html';


?>
