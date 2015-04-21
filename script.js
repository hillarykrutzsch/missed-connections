var geocoder;
var buildString = "";
var tweetQuery = [];
var missedQuery = ['#missedconnections', 'missedconnections', '#missedconnection', 'missedconnection'];

$(document).ready(function(){
	// opening slide animation of tweets
	$('#twitter-ticker').slideDown('slow');
	
	// access location search
	geocoder = new google.maps.Geocoder();
	
	callTwitterSearch("","");
	
	// Jquery for when submit button is pushed
	$('#myForm').ajaxForm(
		{ 	 
			dataType: 'json', 
			success:  callSearchFunction 
		}
	); 
	
});

// takes address string and outputs longitude/ latitude
function codeAddress(addr) {
    var address = addr;
    geocoder.geocode( { 'address': address}, function(results, status) {
      if (status == google.maps.GeocoderStatus.OK) {
		callTwitterSearch(results[0].geometry.location.lat(), results[0].geometry.location.lng());
      } else {
        alert("Geocode was not successful for the following reason: " + status);
		callTwitterSearch("","");
      }
    });
  }

// for the search field
function callSearchFunction(data){
	
	tweetQuery = [];
	
	if(data != undefined){
		
		addToTweetArray(data.searchText, tweetQuery);
		addToTweetArray(data.gender, tweetQuery);
		if(data.location.toString().length > 0){			
			codeAddress(data.location);		
		}
		else{
			callTwitterSearch("","");
		}
	}
	
	
}

// putting it all together - prepping string for twitter api call
function callTwitterSearch(geocodeLat, geocodeLong){
	
	buildString = "";
	for(var i=0;i<missedQuery.length;i++)
	{
		// #missedconnections or missedconnections
		if(i > 0){
			buildString+='+OR+';			
		}
		buildString+=missedQuery[i];
	}
	
	for(var i=0;i<tweetQuery.length;i++)
	{
		// actual search terms
		if(i > 0){
			buildString+='+AND+';			
		}
		else{
			buildString+='+';		
		}
		buildString+=tweetQuery[i];
	}
	
	buildString = escape(buildString);
	
	var fileref = document.createElement('script');
	var distance = '25';
	
	// Geolocation
	var geoCodeString;
	if(geocodeLat.toString().length>0){
		geoCodeString = "&geocode="+geocodeLat+"%2C"+geocodeLong+"%2C"+distance+"mi";
	}
	else{
		geoCodeString = "";
	}

	fileref.setAttribute("type","text/javascript");
	
	// call to Twitter API
	var searchStr = "http://search.twitter.com/search.json?q="+buildString+"&callback=TweetTick&rpp=50"+geoCodeString ;
	
	fileref.setAttribute("src", searchStr);
	
	document.getElementsByTagName("head")[0].appendChild(fileref);
}

function addToTweetArray(str, arr){
	if(str.length > 0){			
		arr.push(str);
	}
}

function TweetTick(ob)		// this is what the Twitter API returns
{
	var container=$('#tweet-container');
	container.html('');
	
	$(ob.results).each(function(el){
	
		var str = '	<div class="tweet">\
					<div class="avatar"><a href="http://twitter.com/'+this.from_user+'" target="_blank"><img src="'+this.profile_image_url+'" alt="'+this.from_user+'" /></a></div>\
					<div class="user"><a href="http://twitter.com/'+this.from_user+'" target="_blank">'+this.from_user+'</a></div>\
					<div class="time">'+relativeTime(this.created_at)+'</div>\
					<div class="txt">'+formatTwitString(this.text)+'</div>\
					</div>';
		
		container.append(str);
	
	});
	
	container.jScrollPane();
}

function formatTwitString(str)	// formatting function and links
{
	str=' '+str;
	str = str.replace(/((ftp|https?):\/\/([-\w\.]+)+(:\d+)?(\/([\w/_\.]*(\?\S+)?)?)?)/gm,'<a href="$1" target="_blank">$1</a>');
	str = str.replace(/([^\w])\@([\w\-]+)/gm,'$1@<a href="http://twitter.com/$2" target="_blank">$2</a>');
	str = str.replace(/([^\w])\#([\w\-]+)/gm,'$1<a href="http://twitter.com/search?q=%23$2" target="_blank">#$2</a>');
	return str;
}

function relativeTime(pastTime)		// formats time stamp
{	
	var origStamp = Date.parse(pastTime);
	var curDate = new Date();
	var currentStamp = curDate.getTime();
	
	var difference = parseInt((currentStamp - origStamp)/1000);

	if(difference < 0) return false;

	if(difference <= 5)				return "Just now";
	if(difference <= 20)			return "Seconds ago";
	if(difference <= 60)			return "A minute ago";
	if(difference < 3600)			return parseInt(difference/60)+" minutes ago";
	if(difference <= 1.5*3600) 		return "One hour ago";
	if(difference < 23.5*3600)		return Math.round(difference/3600)+" hours ago";
	if(difference < 1.5*24*3600)	return "One day ago";
	
	var dateArr = pastTime.split(' ');
	return dateArr[4].replace(/\:\d+$/,'')+' '+dateArr[2]+' '+dateArr[1]+(dateArr[3]!=curDate.getFullYear()?' '+dateArr[3]:'');
}