# Video Player for Blast!

Blast allows you to search for exact time stamps where words or phrases are spoken in a video and create interesting user experiences with the data. You can query the database using our api endpoint
 ```http://labocine-video.herokuapp.com/api/video-keyword-search/v1/<query-term>```

To get the exact data, replace <query-term> with the actual term you are looking for.

This video player is built with [PopcornJS] (http://popcornjs.org) a media handling library. You can find a [detailed documentation here] (http://popcornjs.org/documentation).

There are two modes to the video player

* ## Montage
The montage creates a continuous video experience by creating a new video of all relevant search results. A search result is a video played snippet by snippet around the time stamp where query terms occur.

* ## Grid View
The grid view is very similar to the montage in terms of content, however it differs in presentation. Each video is shown separately in the grid view. When the user hovers his/her mouse over each grid, the user can see the selected snippets (according to the search results) of the video play. In essence this function provides an overview of the video wrt the search query to the user before actually entering the video web page. 