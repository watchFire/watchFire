var Geode =require('geode');
var geo = new Geode('watchFire', {language: 'en', country : 'US'})

//geo.search({name :'Madrid'}, function(err, results){
 //   console.log([err, results])
//})
geo.findNearby({lat:41.65,lng:0.88}, function(err, results){
      console.log((results.geonames[0].name));
})