'use strict';

$(init);

var cityIds;

function init() {
	loadFromLocalStorage();
	$('#submit').click(createRequest);
	$(document).on('click', '#save', saveToLocalStorage);
	$(document).on('click', '.panel', getDetails);
	$(document).on('click', '.delete', removeFavorite);
	$(document).on('click', '.findFav', sendRequest);
}

function loadFromLocalStorage() {
	if(localStorage.cityIds === undefined) {
		localStorage.cityIds = '[]';
	}
	cityIds = JSON.parse(localStorage.cityIds);
	for (var i = 0; i < cityIds.length; i++) {
		var cityId = cityIds[i];
		$('#favorites').append(getSavedRequest(cityId)); 
	}
	return;
}

function getSavedRequest(cityId) {
	var units = '&units=' + $('#units').val();
	$.ajax({
		url: `http://api.openweathermap.org/data/2.5/weather?APPID=730a6331a80453a3f5fc4971ae2a807b${units}&id=${cityId}`,
		success: function(data) {
			$('.location:not(#template').remove();
			createFavoritesPanel(data);
			createPanel(data);
			return;
		},
		error: function(error) {
			console.log('error: ', error);
			return;
		}
	})
}

function createFavoritesPanel(data) {
	$('#favsColumn').removeClass('hide');
	var $favsInfo = $('#templateFavorite').clone();
	$favsInfo.removeAttr('id').addClass('favorites');
	$favsInfo.find('.buttonCityId').text(data.id);
	$favsInfo.find('.findFav').text(data.name);
	$('#favorites').append($favsInfo);
	return;
}

function createRequest(event) {
	event.stopPropagation();
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
	var units = '&units=' + $('#units').val();
	if($(this).siblings().children().text()) {
		var cityId = '&id=' + $(this).siblings().children().text();
		coords = '';
	}
	$.ajax({
		url: `http://api.openweathermap.org/data/2.5/weather?APPID=730a6331a80453a3f5fc4971ae2a807b${coords}${units}${cityId}`, 
		success: function(data) {
			$('#city').val('');
			$('#state').val('');
			$('#zip').val('');
			$('#country').val('');
			$('.location:not(#template').remove();
			createPanel(data);
			return data;
		},
		error: function(error) {
			console.log('error: ', error);
			return;
		}
	})
}

function createPanel(data) {
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
	$('#results').append($cityInfo);
}

function saveToLocalStorage(event) {
	event.stopPropagation();
	event.preventDefault();
	var cityId = $('.locationID').text();
	cityIds.push(cityId);
	localStorage.cityIds = JSON.stringify(cityIds);
	for (var i = 0; i < cityIds.length; i++) {
		if(cityIds[i] === cityId) getSavedRequest(cityIds[i]);
	}
}

function getDetails(event) {
	event.stopPropagation();
	event.preventDefault();
	var units = '&units=' + $('#units').val();
	var locationID = $('.locationID').text();
	$.ajax({
		url: `http://api.openweathermap.org/data/2.5/forecast?appid=730a6331a80453a3f5fc4971ae2a807b&id=${locationID}${units}`, 
		success: function(data) {
			$('.forecastDetails:not(#detailsTemplate').remove();
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

function removeFavorite(event) {
	var $this = $(this);
	event.preventDefault();
	event.stopPropagation();
	var cityId = $this.find('.buttonCityId').text();
	cityId = cityId.toString();
	cityIds = cityIds.filter(function(id) {
		return id !== cityId;
	});
	localStorage.cityIds = JSON.stringify(cityIds);
	$this.siblings().remove();
	$this.remove();
}



