Master 2 SIGMA - WEBMAPPING

Ce projet de carte web présente le résultat du projet de classification mené dans le cadre de l’UE 902-1. 
L’objectif était de détecter automatiquement les types d’arbres dans les peuplements forestiers, 
selon différents niveaux de finesse de nomenclature (allant de la simple distinction feuillus/résineux à l’essence). 
Pour ce projet, on affiche les résultats au niveau intermédiaire, c’est-à-dire les grands types d’essences : 
feuillus, pins, peupleraie, conifères, mélange de pins et autres conifères.

Les données diffusées via le Geoserveur sont :
 Un fichier raster au format (résultat de la classification), diffusé en WMS
 Un fichier vecteur (échantillons utilisés pour l’entraînement du modèle de classification), diffusé en WFS

La carte est créée avec la bibliothèque Leaflet intégrée dans une page HTML. Elle se compose de ces éléments :
 Des fonds de cartes issus d’OpenStreetMap (L.TileLayer) et de la Géoplateforme de l’IGN (flux WMTS, L.TileLayer).
 Le raster de résultats de classification (flux WMS depuis le Geoserveur, affiché au format PNG pour pouvoir gérer la transparence du raster.
 Le vecteur des échantillons (flux WFS depuis le Geoserveur au format GeoJSON avec la fonction L.geoJSON qui ajoute les polygones à la carte à partir des coordonnées lues dans le GeoJSON.
 Barre d’échelle, contrôle du niveau de zoom et des couches : paramètres de Leaflet
 Contrôle de la transparence du raster classifié : plugin Leaflet Control.Opacity
 Légende : elle est lue depuis le flux WMS du raster sur le Géoserveur avec la requête GetLegend, qui renvoie une image de la légende qui peut ensuite être intégrée dans un div.

Interaction
Pour rendre les deux couches interrogeables par l’utilisateur, deux méthodes :
 Flux WMS : création d’une action au clic sur la carte (si la couche est active). Le clic génère une URL de requête GetFeatureInfo de Geoserveur intégrant la valeur X et Y du clic. 
Elle renvoie une réponse au format Json (la même requête qui est utilisée dans le Geoserveur pour visualiser les couches). Le Json est ensuite lu 
avec la librairie Axios pour en extraire la valeur du pixel. Cette valeur sert ensuite à créer un popup (avec le label correspondant à la classe).
 Flux WFS : l’action au clic est intégrée dans la fonction de création des polygones à partir du GeoJSON. Le clic déclenche 2 actions : changement 
de la couleur du polygone, et lecture de la propriété du feature qui nous intéresse, qui est ensuite affichée dans un popup.
Interface graphique
La page est composée d’un élément principal (grid container) qui sert à organiser les éléments à l’intérieur grâce au CSS : carte, barre de titre, 
barre des mentions du site, ainsi que la légende et une zone pour afficher un texte de présentation. Les autres éléments sont intégrés à l’intérieur de la map Leaflet.
