var finder= require("entity-finder");
var retext = require('retext');
var nlcstToString = require('nlcst-to-string');
var keywords = require('retext-keywords');

var text = 'So Flipkart has updated the release date of Samsung Galaxy S8 to May 2 from May 4.';

//Extract key words/phrases 
var getKeywords = function(text,callback){
	var keySets =[];

	 retext().use(keywords).process(text, function (err, file) {
	    
	 	file.data.keyphrases.forEach(function (phrase) {
	      keySets.push(phrase.matches[0].nodes.map(nlcstToString).join(''));
	    });

	    file.data.keywords.forEach(function (keyword) {
	      keySets.push(nlcstToString(keyword.matches[0].node));
	    });
	  }
	);

	removeDuplicates(keySets,function(entity){
		callback(entity);
	 });	
};

//Remove substrings from set of key words/phrases
var removeDuplicates = function(keySets,callback){
	var entity=[];
	var flag=0;
	for(var i=0;i<keySets.length;i++){
		flag=0;
		for(var j=0;j<entity.length;j++){
			if(entity[j].indexOf(keySets[i])>=0){
				flag=1;
			}
		}
		if(flag==0){
			entity.push(keySets[i]);
		}
	}
	callback(entity);
};

//Using dbpedia, to annotate the key words/phrases
var getTaxonomy = function(word,callback){

	return new Promise(function(resolve, reject) {
   		finder.find(word, 'en')
			.then(function (entities) {
				if(entities.length > 0){
					resolve(entities[0].description);
				}
				else{
					resolve(undefined);
				}
		});
  	});
};

var getDescriptiveTag = function(entity,callback){

	var description=[];
	for(var i=0;i<entity.length;i++){
		description.push(getTaxonomy(entity[i]));
	}

	Promise.all(description).then(function(response){
		for(var i=0;i<response.length;i++){
			if(response[i]!=undefined){
				entity.push(response[i]);
			}
		}
		callback(entity);
	});
};

getKeywords(text,function(entity){
	try{
		getDescriptiveTag(entity,function(response){
			console.log(response);
		});
	}catch(ex){
		console.log(entity);
	}
});