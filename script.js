/*
 * Author : Abhijai Garg
 * Email  : abhijai.garg@gmail.com
 * 
 * -----Project Blast for Labocine-----
 *
 */ 



/*
 * global variables for video_items and montage
 */

var video_items;
var montage;


/*
 * Helper function to convert hh:mm:ss string into seconds
 */

function convert_to_secs(time){
	time = time.split(',');
	var hms = time[0].split(':');

	return parseFloat(String(Date.UTC(1970, 0, 1, hms[0], hms[1], hms[2]) / 1000));

}

/*
 * 
 */

function cue_video(popcorn_element, snippets){
	popcorn_element.cue(0, function(){
		popcorn_element.currentTime(convert_to_secs(snippets[0]['start_time']));
	});
	for (var j = 0; j < snippets.length; j++){
		start_stop_times(popcorn_element,j, snippets);
	}
}



function get_sequence(data){
	var sequence = new Array();
	for(var i = 0; i < data.number_of_results; i++){
		for(var j = 0; j < data.results[i]['snippets'].length; j++){
			var _in = convert_to_secs(data.results[i]['snippets'][j]['start_time']);
			var _out = convert_to_secs(data.results[i]['snippets'][j]['end_time'])
			var _cue = { src: data.results[i].url, in: _in, out: _out}
			sequence.push(_cue);
		}
	} 
	return sequence;
}


/*
 * After videos are populated, instantiate as popcorn objects
 */

function instantiate_video_popcorn(n){
	for (var i = 0; i < n ; i++){
		video_items.push(Popcorn("#_" + String(i)));	
	}
}

/*
 * Populate montage with search result videos sequencially
 */

function populate_modal_window(data, query_term, n){
	$('.modal-title').html("Blast result for '" + query_term + "' - " + n + ' videos in this montage');
	
	// set up first video and queue others
	var sequence = get_sequence(data);

	montage = Popcorn.sequence('montage', sequence);

}

/*
 * function to populate grid for search result list
 */ 

function populate_grid(data, _search_results){
	
	video_items = new Array();
	var _new_div = '';
	for(var i=0; i < data.number_of_results; i++){

		var _id = data.results[i]['id'];
		var _temp_div = '';
					
		_temp_div = "<div class='tile'><div class='loader'><img src=''></div><a href='http://labocine.com/film/" + _id + "'><div class='title'><h4>" + data.results[i]['title'] +"</h4></div><video id='_" + String(i) + "' preload='none'><source src='" + data.results[i]['url'] + "'></source></video><img src='http://labocine.com/stills/" + _id + ".jpg'/></a></div>";

		// change row after every third element

		if (i % 3 === 0){
			if ( i === 0){
				_new_div = "<div class='row'>" + _temp_div;
			}
			else if ( i == data.number_of_results - 1){
				_new_div += _temp_div + "</div>";
			}
			else{
				_new_div = _new_div + "</div><div class='row'>" + _temp_div;
			}	
		}
		else{
			_new_div += _temp_div;
		}
	}
	_search_results.html(_new_div);


}

/*
 *  setup events triggered on mouse enter and leave
 */


function setup_video(i, snippets){
	
	$('#_' + String(i)).parent().parent().mouseenter(function(){
		$(this).find('img').hide();
		$(this).find('video').show();
		cue_video(video_items[i], snippets);
		video_items[i].play();
		
	});


	$('#_' + String(i)).parent().parent().mouseleave(function(){
		$(this).find('video').hide();
		$(this).find('img').show();
		video_items[i].pause();
		video_items[i].currentTime(0);
	});
}

/*
 *
 */

function start_stop_times(popcorn_element,j,snippets){
	
	var _end = convert_to_secs(snippets[j]['end_time']);

	
	popcorn_element.cue(_end, function(){
		if ( j == snippets.length - 1){
			popcorn_element.pause();	
		}
		else{
			var _start = convert_to_secs(snippets[j+1]['start_time'])
			if (_start == _end){
				_start += 1;
			}

			
			popcorn_element.currentTime(_start);
		}
	})
}



/*
 * AJAX function to call search results.
 */

function search_term(query_term, play_type){
	// base query url
	var url = "https://labocine-video.herokuapp.com/api/video-keyword-search/v1/"

	// create query url based on query term
	var query_URL = url + query_term;

	// empty search results box
	var _search_results = $('.search-results');
	_search_results.empty();

	// ensure that on results page the input box still shows the query term
	$('#search-box input').val(query_term);


	$.ajax({
		url: query_URL,
		type: 'GET',
		dataType: 'json',
		async: false,
		error: function(data){
			$('.search-results').html('Something went wrong');
		},
		success: function(data){
			var _loaded = 0;
			if (data.number_of_results > 0){

				// for play_type == "grid", populate results as a list
				if (play_type == 'grid'){
					$.when(populate_grid(data, _search_results)).done(function(){
						$.when(instantiate_video_popcorn(data.number_of_results)).done(function(){
							for (var i = 0; i < data.number_of_results; i++){
								setup_video(i, data.results[i]['snippets']);
							}
							
						});
					});	
				}

				// if play_type == "montage", populate results on the modal window
				else if (play_type == 'montage'){
					// wait for populate_modal_window to end before play is triggered

					console.log('num of results: ' + data.number_of_results);

					$.when(populate_modal_window(data, query_term, data.number_of_results)).done(function(){
						console.log('wassup');
						var v = document.getElementById('montage');
						
						v.addEventListener('loadeddata',function(e){

							$('#myModal').modal('show');
							montage.play();
						}, true);
						
					});
				}
			}

			// if no search results returned
			else{

				$('.search-results').html('No Results Found');
			}

		}
	});


}


/*
 * Function to return parameters in the URL
 */

var getURLParameter = function getUrlParameter(sParam) {
    var sPageURL = decodeURIComponent(window.location.search.substring(1)),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : sParameterName[1];
        }
    }
};


	