'use strict';

$(init);

var cityIds;

function init() {
	loadFromLocalStorage();
	$('#submit').click(createRequest);
	$('#save').click(saveToLocalStorage);
}

function loadFromLocalStorage() {
	if(localStorage.cities === undefined) {
		localStorage.cityIds = '[]';
	}
	cityIds = JSON.parse(localStorage.cityIds);
	for (var i = 0; i < cityIds.length; i++) {
		$('#favorites').append(getSavedRequest(cityIds[i])); 
	}
}

function getSavedRequest(cityId) {
	console.log('city id: ', cityId);
	$.ajax({
		url: `http://api.openweathermap.org/data/2.5/weather?id=524901&APPID=730a6331a80453a3f5fc4971ae2a807b&id=${cityId}`,
		success: function(data) {
			$('.favorite:not(#templateFavorites').remove();
			console.log('data: ', data);
			$('#favorites').append(createFavoritesPanel(data));
			return;
		},
		error: function(error) {
			console.log('error: ', error);
			return;
		}
	})
}

function createFavoritesPanel(data) {
	console.log(data);
	$('#favsColumn').removeClass('hide');
	var $favsInfo = $('#template').clone()
	$favsInfo.removeAttr('id').addClass('favorite');
	$favsInfo.find('.locationID').text(data.id);
	$favsInfo.find('.cityName').text(data.name);
	console.log(data.main);
	$favsInfo.find('.temp').text('Temp: ' + data.main.temp + '°');
	console.log('temp: ', data.main.temp);
	$favsInfo.find('.highTemp').text('High: ' + data.main.temp_max + '°');
	$favsInfo.find('.lowTemp').text('Low: '  + data.main.temp_min + '°');
	return $favsInfo;
}

function createRequest(event) {
	event.preventDefault();
	var city = '';
	var zip = '';
	var country = '';
	var state = '';
	var $city = $('#city');
	var $state = $('#state');
	var $zip = $('#zip');
	var $country = $('#country');
	var units = '&units=' + $('#units').val();
	if($city.val()) city = $city.val();
	if($state.val()) state = $state.val();
	if($zip.val()) zip = $zip.val();
	if($country.val()) country = $country.val();
	if(zip && country) {
		findLocation(city, state, zip, country, units);
		return;
	}
}

function findLocation(city, state, zip, country, units) {
	if(zip) {
		$.ajax({
			url: `https://api.zippopotam.us/${country}/${zip}`,
			success: function(data) {
				for (var i = 0; i < data.places.length; i++) {
					var coords = [data.places[i].latitude, data.places[i].longitude];
				}
				var lat = '&lat=' + parseFloat(coords[0]).toFixed(2);
				var lon = '&lon=' + parseFloat(coords[1]).toFixed(2);
				var loca = lat + lon;
				sendRequest(loca, units);
				return;
			},
			error: function(error) {
				console.log('error: ', error);
				return;
			}
		})
	} else {
		$.ajax({
			url: `https://api.zippopotam.us/${country}/${state}/${city}`,
			success: function(data) {
				for (var i = 0; i < data.places.length; i++) {
					var coords = [data.places[i].latitude, data.places[i].longitude];
				}
				var lat = '&lat=' + parseFloat(coords[0]).toFixed(2);
				var lon = '&lon=' + parseFloat(coords[1]).toFixed(2);
				var loca = lat + lon;
				sendRequest(loca, units);
				return;
			},
			error: function(error) {
				console.log('error: ', error);
				return;
			}
		})
	}
}

function sendRequest(coords, units) {
	$.ajax({
		url: `http://api.openweathermap.org/data/2.5/weather?id=524901&APPID=730a6331a80453a3f5fc4971ae2a807b${coords}${units}`, 
		success: function(data) {
			$('#city').val('');
			$('#state').val('');
			$('#zip').val('');
			$('#country').val('');
			$('.location:not(#template').remove();
			$('#results').append(createPanel(data));
			$('.location').click(getDetails(units));
			return data;
		},
		error: function(error) {
			console.log('error: ', error);
			return;
		}
	})
}

function createPanel(data) {
	console.log(data);
	var icon;
	for (var i = 0; i < data.weather.length; i++) {
		icon = data.weather[i].icon;
		var iconCap = data.weather[i].main;
	}
	var $cityInfo = $('#template').clone();
	$cityInfo.removeAttr('id');
	$cityInfo.find('.locationID').text(data.id);
	$cityInfo.find('.cityName').text(data.name);
	$cityInfo.find('.temp').text('Temp: ' + data.main.temp + '°');
	$cityInfo.find('.highTemp').text('High: ' + data.main.temp_max + '°');
	$cityInfo.find('.lowTemp').text('Low: '  + data.main.temp_min + '°');
	$cityInfo.find('.weatherIconCap').text(iconCap);
	$cityInfo.find('.weatherIcon').attr('src', `http://openweathermap.org/img/w/${icon}.png`);
	return $cityInfo;
}

function saveToLocalStorage(event) {
	event.stopPropagation();
	event.preventDefault();
	var data = sendRequest();
	var cityId = data.id;
	cityIds.push(cityId);
	$('#favorites').append(getSavedRequest(data));
	localStorage.cityIds = JSON.stringify(cityIds);
}

function getDetails(units) {
	var locationID = $('.locationID').text();
	console.log(locationID);
	$.ajax({
		url: `http://api.openweathermap.org/data/2.5/forecast?appid=730a6331a80453a3f5fc4971ae2a807b&id=${locationID}${units}`, 
		success: function(data) {
			$('.forecaseDetails:not(#detailsTemplate').remove();
			console.log('success: ', data);
			$('#forecast').append(showDetails(data));
			return;
		},
		error: function(error) {
			console.log('error: ', error);
			return;
		}
	})
}

function showDetails(data) {
	var $detailInformation = $('#detailsTemplate').clone();
	$detailInformation.removeAttr('id');
	var list = data.list;
	var arr = [];
	for (var a = 0, b = 3; b < list.length; a++, b += 8) {
			var date = list[b].dt_txt.slice(5,10).split('-').join('/');
			$detailInformation.find(`.day${a}`).text(date);
			for (var d = 0; d < list[b].weather.length; d++) {
				var dayIcon = list[b].weather[d].icon;
				var dayIconCap = list[b].weather[d].main;
				$detailInformation.find(`.dayIcon${a}`).attr('src', `http://openweathermap.org/img/w/${dayIcon}.png`);
				$detailInformation.find(`.dayIconCap${a}`).text(dayIconCap);
			}
			$detailInformation.find(`.dayTemp${a}`).text('Temp: ' + list[b].main.temp + '°');
			$detailInformation.find(`.dayHigh${a}`).text('High: ' + list[b].main.temp_max + '°');
			$detailInformation.find(`.dayLow${a}`).text('Low: '  + list[b].main.temp_min + '°');
			$detailInformation.find(`.dayHumid${a}`).text('Humidity: ' + list[b].main.humidity + '%');
			$detailInformation.find(`.dayWindSpd${a}`).text('Wind Speed: ' + list[b].wind.speed);			
		}

		return $detailInformation;
}




