var video_items;

function populate_grid(data, _search_results){
	if (data.number_of_results == 0){
		_search_results.append("No results found");
	}
	else
	{
		video_items = new Array();
		for(var i=0; i < data.number_of_results; i++){

			var _id = data.results[i]['id'];
			var _new_div;
			
			_new_div = "<div class='tile'><a href='http://labocine.com/film/" + _id + "'><video id='_" + String(i) + "' preload='none'><source src='" + data.results[i]['url'] + "'></source></video><img src='http://labocine.com/stills/" + _id + ".jpg'/></a></div>";

			
			_search_results.append(_new_div);
			video_items.push(Popcorn("#_" + String(i)));
		}

	}
}

function convert_to_secs(time){
	time = time.split(',');
	var hms = time[0].split(':');
	return Date.UTC(1970, 0, 1, hms[0], hms[1], hms[2]) / 1000;
}

function start_stop_times(i,j,snippets){
	video_items[i].cue(convert_to_secs(snippets[j]['end_time'])+1, function(){
		if ( j == snippets.length - 1){
			video_items[i].pause();
		}
		else{
			video_items[i].currentTime(convert_to_secs(snippets[j+1]['start_time']));
		}
	})
}

function cue_video(i, snippets){
	video_items[i].cue(0, function(){
		video_items[i].currentTime(convert_to_secs(snippets[0]['start_time']));
	});
	for (var j = 0; j < snippets.length; j++){
		start_stop_times(i,j,snippets);
	}
}

function setup_video(i, snippets){
	$('#_' + String(i)).parent().parent().mouseenter(function(){
		$(this).find('img').hide();
		$(this).find('video').show();
		cue_video(i, snippets);
		video_items[i].play();
		console.log(video_items[i].currentTime());
		
	});
	$('#_' + String(i)).parent().parent().mouseleave(function(){
		$(this).find('video').hide();
		$(this).find('img').show();
		video_items[i].pause();
		video_items[i].currentTime(0);
	});
}

function search_term(query_term){
	var url = "https://labocine-video.herokuapp.com/api/video-keyword-search/v1/"
	var query_URL = url + query_term;
	var _search_results = $('.search-results');

	_search_results.empty();
	$.ajax({
		url: query_URL,
		type: 'GET',
		dataType: 'json',
		async: false,
		error: function(data){
			console.log(data);
		},
		success: function(data){
			$.when(populate_grid(data, _search_results)).done(function(){
				for (var i = 0; i < data.number_of_results; i++){
					setup_video(i, data.results[i]['snippets']);
				}
			})
		}
	});

}

$(document).ready(function(){
	$('#search-box').submit(function(event){
		event.preventDefault();
		var _query = $('#search-box input').val()
		search_term(_query);
	});
});
	