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
    'owl'               => 'http://www.w3.org/2002/07/owl#',
    'dcterms'           => 'http://purl.org/dc/terms/',
    'foaf'              => 'http://xmlns.com/foaf/0.1/',
    'skos'              => 'http://www.w3.org/2004/02/skos/core#',
    'wgs'               => 'http://www.w3.org/2003/01/geo/wgs84_pos#',
    'dcat'              => 'http://www.w3.org/ns/dcat#',
    'dbo'               => 'http://dbpedia.org/ontology/',
    'dbp'               => 'http://dbpedia.org/property/',
    'dbr'               => 'http://dbpedia.org/resource/',
    'sdmx'              => 'http://purl.org/linked-data/sdmx#',
    'sdmx-attribute'    => 'http://purl.org/linked-data/sdmx/2009/attribute#',
    'sdmx-code'         => 'http://purl.org/linked-data/sdmx/2009/code#',
    'sdmx-concept'      => 'http://purl.org/linked-data/sdmx/2009/concept#',
    'sdmx-dimension'    => 'http://purl.org/linked-data/sdmx/2009/dimension#',
    'sdmx-measure'      => 'http://purl.org/linked-data/sdmx/2009/measure#',
    'sdmx-metadata'     => 'http://purl.org/linked-data/sdmx/2009/metadata#',
    'sdmx-subject'      => 'http://purl.org/linked-data/sdmx/2009/subject#',
    'qb'                => 'http://purl.org/linked-data/cube#',
    'year'              => 'http://reference.data.gov.uk/id/year/',
    'void'              => 'http://rdfs.org/ns/void#',

    'wbld'              => 'http://worldbank.270a.info/',
    'property'          => 'http://worldbank.270a.info/property/',
    'classification'    => 'http://worldbank.270a.info/classification/',
    'indicator'         => 'http://worldbank.270a.info/classification/indicator/',
    'country'           => 'http://worldbank.270a.info/classification/country/',
    'income-level'      => 'http://worldbank.270a.info/classification/income-level/',
    'lending-type'      => 'http://worldbank.270a.info/classification/lending-type/',
    'region'            => 'http://worldbank.270a.info/classification/region/',
    'source'            => 'http://worldbank.270a.info/classification/source/',
    'topic'             => 'http://worldbank.270a.info/classification/topic/',
    'currency'          => 'http://worldbank.270a.info/classification/currency/',
    'project'           => 'http://worldbank.270a.info/classification/project/',

    'g-void'               => 'http://worldbank.270a.info/graph/void',
    'g-meta'               => 'http://worldbank.270a.info/graph/meta',
    'g-climates'           => 'http://worldbank.270a.info/graph/world-bank-climates',
    'g-finances'           => 'http://worldbank.270a.info/graph/world-bank-finances',
    'g-projects'           => 'http://worldbank.270a.info/graph/world-bank-projects-and-operations',
    'g-indicators'         => 'http://worldbank.270a.info/graph/world-bank-indicators'
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


$config['sparql_query']['project'] = "
CONSTRUCT {
    <URI> ?p1 ?o1 .
    ?p1 skos:prefLabel ?propertyLabel .
    ?o1 skos:prefLabel ?conceptLabel .
}
WHERE {
    GRAPH <http://worldbank.270a.info/graph/world-bank-projects-and-operations> {
        <URI> ?p1 ?o1 .
        OPTIONAL {
            {
                ?p1 skos:prefLabel ?propertyLabel .
            }
            UNION
            {
                ?p1 rdfs:label ?propertyLabel .
            }
        }
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
$config['entity']['classification_project']['path']     = '/classification/project/';
$config['entity']['classification_project']['query']    = 'project';
$config['entity']['classification_project']['template'] = 'page.default.html';


$config['sparql_query']['classification'] = "
CONSTRUCT {
    <URI> ?p1 ?o1 .
    ?p1 skos:prefLabel ?propertyLabel .
    ?p1 rdfs:label ?propertyLabel .

    ?o1 skos:prefLabel ?conceptLabel .
    ?o1 rdfs:label ?resourceLabel .
    ?o1 dcterms:title ?resourceTitle .
    ?o1 skos:notation ?conceptNotation .
}
WHERE {
    GRAPH <http://worldbank.270a.info/graph/meta> {
        <URI> ?p1 ?o1 .
        OPTIONAL {
            {
                ?p1 skos:prefLabel ?propertyLabel .
            }
            UNION
            {
                ?p1 rdfs:label ?propertyLabel .
            }
        }
        OPTIONAL {
            {
                ?o1 skos:prefLabel ?conceptLabel .
            }
            UNION
            {
                ?o1 rdfs:label ?resourceLabel .
            }
            UNION
            {
                ?o1 dcterms:title ?resourceTitle .
            }
            UNION
            {
                ?o1 skos:notation ?conceptNotation .
            }
        }
    }
}

";
$config['entity']['classification']['path']     = '/classification/';
$config['entity']['classification']['query']    = 'classification';
$config['entity']['classification']['template'] = 'page.classification.html';

/*
$config['sparql_query']['dataset_world-bank-climates'] = "
CONSTRUCT {
    <URI> ?p1 ?o1 .
    ?p1 skos:prefLabel ?propertyLabel .

    ?o1 skos:prefLabel ?label .
    ?o1 rdfs:label ?label .
    ?o1 dcterms:title ?label .

}
WHERE {
    GRAPH <http://worldbank.270a.info/graph/world-bank-climates> {
        <URI> ?p1 ?o1 .
    }
}
";
*/
$config['entity']['dataset_world-bank-climates']['path']     = '/dataset/world-bank-climates/';
$config['entity']['dataset_world-bank-climates']['query']    = 'default';
$config['entity']['dataset_world-bank-climates']['template'] = 'page.classification.html';


$config['sparql_query']['dataset'] = "
CONSTRUCT {
    <URI> ?p1 ?o1 .
    ?p1 skos:prefLabel ?propertyLabel .

    ?o1 dcterms:title ?title .
    ?o1 skos:prefLabel ?conceptLabel .
}
WHERE {
    GRAPH <http://worldbank.270a.info/graph/meta> {
        <URI> ?p1 ?o1 .
        OPTIONAL {
            {
                ?p1 skos:prefLabel ?propertyLabel .
            }
            UNION
            {
                ?p1 rdfs:label ?resourceLabel .
            }
        }
        OPTIONAL {
            {
                ?o1 skos:prefLabel ?conceptLabel .
            }
            UNION
            {
                ?o1 dcterms:title ?title .
            }
        }
    }
}
";
$config['entity']['dataset']['path']     = '/dataset';
$config['entity']['dataset']['query']    = 'default';
$config['entity']['dataset']['template'] = 'page.default.html';


?>
