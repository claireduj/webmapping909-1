
///// A PROPOS /////*

//Récupérer les éléments DOM
var infoButton = document.getElementById('info-button');
var infoContent = document.getElementById('info-content');

// Ajouter un gestionnaire d'événements de clic au bouton "Infos"
infoButton.addEventListener('click', function() {
// Obtenir la valeur calculée de la propriété "display"
var displayValue = window.getComputedStyle(infoContent).getPropertyValue('display');

// Vérifier si le div d'informations est actuellement visible ou non
if (displayValue === 'none') {
    // Si le div est caché, le rendre visible
    infoContent.style.display = 'block';
} else {
    // Si le div est visible, le cacher
    infoContent.style.display = 'none';
}
});

///// CARTE LEAFLET ///////

/// Définir la carte
var mapOptions = {
    center: [43.298864, 0.855184],
    zoom: 14,
    zoomControl: false
    }

var map = L.map('map',mapOptions);


/// Définir les couches

/// Fonds de carte
var basemap_osm = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: ' <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
})

//// AJOUT DE COUCHES GEOPORTAIL

/// BD ortho
var ortho = L.tileLayer('https://data.geopf.fr/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=HR.ORTHOIMAGERY.ORTHOPHOTOS&STYLE=normal&FORMAT=image/jpeg&TILEMATRIXSET=PM&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}', {
    attribution: '<a href="https://www.geoportail.gouv.fr/" title="Orthophotos IGN" target="_blank">&copy; <b>Orthophotos</b></a> &copy; <a href="https://www.geoportail.gouv.fr/">IGN</a>',
    maxZoom: 22,
    tileSize : 256,
  }).addTo(map);

  var ortho_irc = L.tileLayer('https://data.geopf.fr/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=ORTHOIMAGERY.ORTHOPHOTOS.IRC&STYLE=normal&FORMAT=image/jpeg&TILEMATRIXSET=PM&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}', {
    attribution: '<a href="https://www.geoportail.gouv.fr/" title="Orthophotos IGN" target="_blank">&copy; <b>Orthophotos</b></a> &copy; <a href="https://www.geoportail.gouv.fr/">IGN</a>',
    maxZoom: 22,
    tileSize : 256,
  }) 

/// requête pour renvoyer n'importe quelle couche depuis geoplateforme (attention il faut le format image/jpeg)
/**
* Renvoie l'URL de la couche geoportail
*/
function getGeoplateformeURL( layerName ){
    var url = "https://data.geopf.fr/wmts?SERVICE=WMTS&VERSION=1.0.0&REQUEST=GetTile";
    url += "&LAYER="+layerName;
    url += "&STYLE=normal&FORMAT=image/png";
    url += "&TILEMATRIXSET=PM&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}" ;
    return url;
}

var plan_ign = L.tileLayer(getGeoplateformeURL('GEOGRAPHICALGRIDSYSTEMS.PLANIGNV2'), {
    maxZoom: 18,
    attribution: '&copy; <a href="https://www.ign.fr/">IGN</a>',
    id: 'ignf/carte'
})


/// FLUX WMS GEOSERVEUR
var wmsurl = 'https://www.geotests.net/geoserver/cdujardin/wms'

var raster_classif = L.tileLayer.wms(wmsurl, {
     layers: 'cdujardin:cd_carte_lvl2',
     transparent: true,
     format: 'image/png',
     attribution: '&copy; <a href="http://sigma.univ-toulouse.fr/fr/index.html">Master SIGMA</a>'
 })//.addTo(map);


 //// FLUX WFS GEOSERVEUR (geojson)

/// Créer une nouvelle couche vide
var wfs_samples = new L.featureGroup( 
);
wfs_samples.addTo(map);


/// Fonction pour le style selon la classe de polygone 
var style_json = {
    "color": "#F04900",
    "weight": 2,
    "opacity": 0.65
};

/// Style quand on clique dessus
var style_select = {
    "color": "#FF2276",
    "weight": 4,
    "opacity": 0.85
};


/// Adresse du flux WFS en json
var wfs_geoserver= 'https://www.geotests.net/geoserver/cdujardin/ows?'
var wfsURL = wfs_geoserver + "service=WFS&version=1.0.0&request=GetFeature&typeName=cdujardin%3Acd_samples_foret84&maxFeatures=1400&outputFormat=application%2Fjson";

var selectedPolygon = null; // polygone cliqué


async function getWFSgeojson() {
    try {
        const response = await fetch(wfsURL);
        const data = await response.json();

        /// Style catégorisé
        function style_json(feature) {
            // Définir un style par défaut
            var defaultStyle = {
                fillColor: 'blue', // couleur de remplissage par défaut
                color: 'white',    // couleur de la bordure par défaut
                weight: 2,         // largeur de la bordure par défaut
            };

            // Style conditionnel
            if (feature.properties.Nom_lvl2 === 'Conifères autres que pin') {
                return {
                    fillColor: '#E76F51',  
                    color: '#E76F51',
                    weight: 2,
                    fillOpacity: 0.6
                };
            } else if (feature.properties.Nom_lvl2 === 'Feuillus') {
                return {
                    fillColor: '#59B565',    
                    color: '#59B565',
                    weight: 2,
                    fillOpacity: 0.6
                };

            } else if (feature.properties.Nom_lvl2 === 'Mélange de Pins et autres conifères') {
                return {
                    fillColor: '#F4A261',    
                    color: '#F4A261',
                    weight: 2,
                    fillOpacity: 0.6
                };
                
            } else if (feature.properties.Nom_lvl2 === 'Peupleraie') {
                return {
                    fillColor: '#ffc60b',    
                    color: '#ffc60b',
                    weight: 2,
                    fillOpacity: 0.6
                };
                
            } else if (feature.properties.Nom_lvl2 === 'Pins') {
                return {
                    fillColor: '#6C8B96',  
                    color: '#6C8B96',
                    weight: 2,
                    fillOpacity: 0.6
                };
                
            }

            // Retourner le style par défaut si aucune condition ne correspond
            return defaultStyle;
        }

        // Créer la couche Leaflet avec les données GeoJSON et la fonction de style
        var wfsPolyLayer = L.geoJSON(data, {
            
            attribution: '&copy; <a href="http://sigma.univ-toulouse.fr/fr/index.html">Master SIGMA</a>',
            style: style_json, // Utiliser la fonction de style dynamique
            onEachFeature: function(feature, layer) {
                // Options du pop up :
                var customOptions = {
                    "maxWidth": "1000px",
                    "className": "customPop"
                };

                // Définir le comportement lors du clic sur un polygone
                layer.on('click', function() {
                    // Réinitialiser le style du polygone précédemment sélectionné
                    if (selectedPolygon) {
                        selectedPolygon.setStyle(style_json(selectedPolygon.feature));
                    }

                    // Appliquer le style select au polygone actuellement sélectionné
                    layer.setStyle(style_select);
                    selectedPolygon = layer; // Mettre à jour la référence du polygone sélectionné
                });

                var popupContent = "<div>Echantillon<br><b>" + feature.properties.Nom_lvl2 + "</b></div>";
                layer.bindPopup(popupContent, customOptions);
            }
        });

        // Ajouter la couche WFS à la carte
        wfsPolyLayer.addTo(wfs_samples);
        
    } catch(err) {
        console.log(err);
    }
}

// Activer la fonction
getWFSgeojson();




/// LEGENDE

// Fonction pour mettre à jour la légende selon si une couche est affichée ou non

function updateLegend() {
    var legendDiv = document.getElementById('legend');
    var noLayersDiv = document.getElementById('no-layers');
    
    // Définir les URL des légendes pour chaque couche
    var legendURL = {
        raster_classif: 'https://www.geotests.net/geoserver/cdujardin/wms?service=WMS&version=1.1.0&request=GetLegendGraphic&VERSION=1.0.0&FORMAT=image/png&transparent=true&WIDTH=20&HEIGHT=20&LAYER=cd_carte_lvl2',
        wfs_samples: 'https://www.geotests.net/geoserver/cdujardin/wms?service=WMS&version=1.1.0&request=GetLegendGraphic&VERSION=1.0.0&FORMAT=image/png&transparent=true&WIDTH=20&HEIGHT=20&LAYER=cd_carte_lvl2'
    };

    // Vérifier si les deux couches sont visibles
    var isBothVisible = Object.keys(legendURL).every(function(layer) {
        return map.hasLayer(window[layer]);
    });

    if (isBothVisible) {
        // Afficher la légende d'une seule des couches si les deux sont visibles
        var legendURLForBothLayers = legendURL.raster_classif; /// légende du raster affichée 
        legendDiv.innerHTML = '<img src="' + legendURLForBothLayers + '" alt="Legend">';
        noLayersDiv.style.display = 'none'; // Masquer l'élément #no-layers
    } else {
        // Si une seule des couches est visible ou aucune, afficher la légende correspondante
        var isVisible = Object.keys(legendURL).some(function(layer) {
            return map.hasLayer(window[layer]);
        });

        if (isVisible) {
            // Afficher la légende de la couche visible
            legendDiv.innerHTML = Object.keys(legendURL).map(function(layer) {
                if (map.hasLayer(window[layer])) {
                    return '<img src="' + legendURL[layer] + '" alt="Legend">';
                }
            }).join('');
            noLayersDiv.style.display = 'none'; // Masquer l'élément #no-layers si une des couches est visible
        } else {
            // Aucune couche n'est visible, masquer la légende et afficher l'élément #no-layers
            legendDiv.innerHTML = ''; // Supprimer le contenu de la légende
            noLayersDiv.style.display = 'block'; // Afficher l'élément #no-layers
        }
    }
}



// Appeler updateLegend lorsque la page est entièrement chargée
document.addEventListener('DOMContentLoaded', function() {
    updateLegend(); // Mettre à jour la légende lorsque la page est chargée
});

// Événement déclenché lorsque la visibilité des couches change
map.on('overlayadd overlayremove', function(eventLayer) {
    if (eventLayer.layer === raster_classif || eventLayer.layer === wfs_samples) {
        updateLegend(); // Mettre à jour la légende lorsque la visibilité des couches change
    }
});


/// BARRE D'ECHELLE
L.control.scale({imperial: false}).addTo(map);
L.control.zoom({position: 'bottomleft'}).addTo(map);

/// CONTROLE DES COUCHES 
var baseMaps = {         
    "OpenStreetMap": basemap_osm,
    "Plan IGN V2" : plan_ign,
    "Photo aérienne (BD ORTHO®)" : ortho,
    "Photo aérienne IRC (BD ORTHO® IRC) ": ortho_irc
    
};
var overlayMaps = {
    "Echantillons": wfs_samples,
    "Résultat de la classification": raster_classif

}

var layer_raster_classif = {"Résultat de la classification": raster_classif}
//OpacityControl
var opacityControl = L.control
    .opacity(layer_raster_classif, {
        label: 'Transparence',
    })
    .addTo(map);

var layerControl = L.control.layers(baseMaps, overlayMaps,{position: 'topright'}).addTo(map);

/// ACTION AU CLIC : récupérer la valeur du pixel et l'afficher dans un popup

map.on("click", function(e) {
    // Vérifier si la couche raster_classif est affichée
    if (map.hasLayer(raster_classif)) { //si la couche est affichée
        // Générer l'URL de requête geoserveur (GetFeatureInfo)
        var url = `${wmsurl}?request=GetFeatureInfo&service=WMS
            &version=1.1.1
            &layers=cdujardin%3Acd_carte_lvl2
            &styles=
            &srs=EPSG%3A4326
            &format=image%2Fpng
            &bbox=${map.getBounds().toBBoxString()}
            &width=${map.getSize().x}
            &height=${map.getSize().y}
            &query_layers=cdujardin%3Acd_carte_lvl2
            &info_format=application/json
            &feature_count=50
            &x=${map.latLngToContainerPoint(e.latlng).x}
            &y=${map.latLngToContainerPoint(e.latlng).y}
            &exceptions=application%2Fvnd.ogc.se_xml`;

        // nécessite la librairie Axios, aller chercher la valeur qui nous intéresse dans le js 
        axios.get(url).then(function(response) {
            var jsonresponse = response.data;
            var raster_value = jsonresponse.features[0].properties.ESS_LVL2;

            if (raster_value !== 0) {

                // Faire correspondre le nom de la classe à son code
                function classevaleur(raster_value) {
                    let classe;
                    if (raster_value == 10) { classe = 'Feuillus'; }
                    else if (raster_value == 11) { classe = 'Peupleraie'; }
                    else if (raster_value == 21) { classe = 'Conifères autres que pins'; }
                    else if (raster_value == 22) { classe = 'Pins'; }
                    else if (raster_value == 23) { classe = 'Mélange Pins et autres conifères'; }

                    return classe;
                }

                // Définir la variable que l'on va afficher
                var classe = classevaleur(raster_value);

                // Affiche le popup à l'endroit du clic        
                L.popup().setLatLng(e.latlng).setContent(classe).openOn(map);
            }
        });
    }
});










