
let map = L.map('map').setView([17.513599976044855, 78.54508868283548], 12);

let osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: ''
}).addTo(map);

let officeLocation = L.latLng(17.513599976044855, 78.54508868283548);

let officeMarker = L.marker(officeLocation, {
    icon: L.divIcon({
        html: '<img src="images/logo-img.png" alt="GK Zenith" class="office-logo">',
        iconSize: [50, 50],
        iconAnchor: [25, 50],
        popupAnchor: [0, -50]
    })
}).addTo(map).bindPopup("GK Zenith").openPopup();

officeMarker.on('click', function () {
    map.setView(officeLocation, 15);
    officeMarker.getElement().classList.add('highlighted-marker');
});

let routingControl = null;

let poiData = {
    entertainment: [
        { name: 'Radhika Theatre', lat: 17.47721595464331, lng: 78.56310749582637,image: 'images/radhika.jpg' },
        { name: 'Alankrita Resorts', lat: 17.572656190418087, lng: 78.55709967116435,image: 'images/alankrita.JPG' },
        { name: 'RSI club', lat: 17.5049116830756, lng: 78.,image: 'images/rsi.jpg' },
        { name: 'Golf course', lat: 17.51795067991995, lng: 78.52546072218794 ,image: 'images/golf.jpg'},
        { name: 'Bison Environmental Park', lat: 17.514075557173193, lng: 78.52775301500772,image: 'images/bison.jpg' },
        { name: 'Secunderbad club', lat: 17.452985170024938, lng: 78.49766284047917,image: 'images/club.jpg' },
        { name: 'Leonia resorts', lat: 17.57843162669677, lng: 78.6066018693148,image: 'images/leonia.jpg' },
        { name: 'Cinepolis CCPL Mall', lat: 17.457096418137258, lng: 78.53700751052439,image: 'images/ccpl.jpg' }
    ],
    institutions: [
        { name: 'Indus Universal School', lat: 17.506658125752246, lng: 78.55472345165013,image: 'images/indus.jpg' },
        { name: 'DRS International', lat: 17.55860858615004, lng: 78.46353073815717,image: 'images/drs.jpg' },
        { name: 'DPS nacharam', lat: 17.44059915207855, lng: 78.55589948233192,image: 'images/dps.jpg' },
        { name: 'Reqelford International School', lat: 17.478803785478465, lng: 78.63415968418018,image: 'images/req.jpg' },
        { name: 'Bhavans', lat: 17.48962407493703, lng: 78.53510074000354 ,image: 'images/bhavans.jpg'},
        { name: 'Sri Ramakrishna Vidyalaya', lat: 17.302935623144407, lng: 78.43727398048195,image: 'images/ramakrishna.jpg' },
        { name: 'Army Public School', lat: 17.500026461910807, lng: 78.52676434486652 ,image: 'images/army.JPG'},
        { name: 'Valerian Grammar School', lat: 17.50917809157168, lng: 78.53052075534539,image: 'images/valerian.jpg' },
        { name: 'Kendriya Vidyalaya', lat: 17.477827107982417, lng: 78.5204552762086 ,image: 'images/kendriya.jpg'}

    ],
    connectivity: [
        { name: 'Yapral Junction', lat: 17.505147019166127, lng: 78.54027950932084,image: 'images/yapral.jpg' },
        { name: 'Trimulgherry X Roads', lat: 17.485064665483517, lng: 78.51083290608099 ,image:'images/trimulgherry.jpg'},
        { name: 'Sainikpuri', lat: 17.483663179450076, lng: 78.5434655111681,image: 'images/sainikpuri.jpg' },
        { name: 'A S Rao Nagar', lat: 17.478981785722826, lng: 78.5597642669911,image:'images/as-rao.jpg' },
        { name: 'ECIL X Roads', lat: 17.47372896115214, lng: 78.57098685534471 ,image: 'images/ecil.jpeg'},
        { name: 'Airport via ORR', lat: 17.226175675920487, lng: 78.4515013889917,image:'images/airport.jpg' }
    ],
    hospitals: [
        { name: 'Yashoda Clinic', lat: 17.425136915150947, lng: 78.49449818824382 ,image: 'images/yashoda.JPG'},
        { name: 'Apollo Specialty Clinic', lat: 17.440899338452596, lng: 78.50460449703925 ,image:'images/apollo.jpg'},
        { name: 'Poulomi Hospital', lat: 17.482790447223298, lng: 78.55281979582664,image: 'images/poulomi.PNG' },
        { name: 'Rainbow Hospital', lat: 17.502346658430812, lng: 78.52643757642597 ,image:'images/rainbow.jpg'},
        { name: 'Military Hospital', lat: 17.4735359842147, lng: 78.51735178633743 ,image: 'images/military.jpg'},
        { name: 'ECHS Polyclinic', lat: 17.4732883220789, lng: 78.51389422372982 ,image:'images/echs.png'}
    ],
    work_places: [
        { name: 'ECIL', lat: 17.47372896115214, lng: 78.57098685534471,image: 'images/ecil-last.png' },
        { name: 'NFC', lat: 17.45830655858143, lng: 78.57595548695681 ,image:'images/nfc.jpg'},
        { name: 'CCMB', lat: 17.42394417275668, lng: 78.54084645408413 ,image: 'images/ccmb.jpg'},
        { name: 'Genome Valley', lat: 17.658071652727376, lng: 78.59872675435193,image:'images/genome.jpg' },
        { name: 'Cherlapally Industrail Area', lat: 17.46913310509409, lng: 78.57984653013249 ,image: 'images/cherlapally.webp'},
        { name: 'Hakimpet Airforce Station', lat: 17.524794645500943, lng: 78.5230509384711 ,image:'images/hakimpet.jpg'},
        { name: 'CDM', lat: 117.492892091543975, lng: 78.53708426836185 ,image: 'images/cdm.jpg'},
        { name: 'Secunderabad Cantt', lat: 17.444149803410607, lng: 78.50053945808473,image:'images/cantt.jpg' }
    ]
};

function calculateDistance(latlng1, latlng2) {
    return map.distance(latlng1, latlng2);
}

function toggleSlider() {
    let sliderContainer = document.getElementById('slider-container');
    sliderContainer.style.display = sliderContainer.style.display === 'none' ? 'block' : 'none';
}

function toggleCardVisibility() {
    var poiCard = document.getElementById('poi-card');
    var toggleButton = document.getElementById('toggle-card-btn');

    if (poiCard.classList.contains('hidden')) {
        poiCard.classList.remove('hidden');
        toggleButton.classList.remove('hidden');
        toggleButton.innerHTML = '<i class="fa-solid fa-minus fa-xl"></i>';
    } else {
        poiCard.classList.add('hidden');
        toggleButton.classList.add('hidden');
        toggleButton.innerHTML = '<i class="fa-solid fa-plus fa-xl"></i>';
    }
}



function updatePOIs(category) {
// Your existing function to update POIs based on the category
console.log("Updating POIs for category: " + category);
}


function toggleIcons() {
    let iconButtons = document.getElementById('icon-buttons');
    let sliderContainer = document.getElementById('slider-container');
    let poiCardContent = document.getElementById('poi-card-content');

    if (iconButtons.style.display === 'none') {
        iconButtons.style.display = 'block';
        poiCardContent.style.marginTop = '70px'; // Adjust based on the height of the icon-buttons container
        sliderContainer.style.marginTop = '5px'; // Adjusted for smaller gap between POI list and slider
    } else {
        iconButtons.style.display = 'none';
        poiCardContent.style.marginTop = '10px'; // Original margin-top
        sliderContainer.style.marginTop = '10px'; // Original margin-top for the slider
    }
}




let selectedFilterType = 'all'; // Default filter type

function updatePOIs(filterType = selectedFilterType) {
    selectedFilterType = filterType; // Update the selected filter type
    let selectedRadius = document.getElementById('slider').value;

    document.getElementById('slider-value').textContent = `${selectedRadius} km`;

    // Clear existing markers and POI list
    map.eachLayer(function (layer) {
        if (layer instanceof L.Marker && layer !== officeMarker) {
            map.removeLayer(layer);
        }
    });

    let poiList = document.getElementById('poi-list');
    poiList.innerHTML = '';

    let radius = parseInt(selectedRadius);

    Object.keys(poiData).forEach(function (type) {
        if (filterType === 'all' || filterType === type) {
            poiData[type].forEach(function (poi) {
                let poiLocation = L.latLng(poi.lat, poi.lng);
                let distance = calculateDistance(officeLocation, poiLocation) / 1000;

                if (distance <= radius) {
                    let marker = L.marker(poiLocation, {
                        icon: L.divIcon({
                            className: 'icon-blue',
                            html: '<i class="fa-solid fa-location-dot" style="font-size: 30px;"></i>',
                            iconSize: [30, 30],
                            iconAnchor: [15, 30],
                            popupAnchor: [0, -30]
                        })
                    }).addTo(map).bindPopup(`        <div class="poi-popup">
                            <img src="${poi.image}" alt="${poi.name}" class="poi-image" style="width:100px; height:100px;">
                            <p>${poi.name}</p>
                        </div>
                    `);

                    marker.on('click', function () {
                        if (routingControl) {
                            map.removeControl(routingControl);
                        }

                        routingControl = L.Routing.control({
                            waypoints: [
                                officeLocation,
                                poiLocation
                            ],
                            routeWhileDragging: true,
                            createMarker: function (i, wp) {
                                return L.marker(wp.latLng, {
                                    icon: i === 0 ? officeMarker.options.icon : marker.options.icon
                                });
                            },
                            lineOptions: {
                                styles: [{ color: '#0075ff', weight: 5 }]
                            }
                        }).addTo(map);

                        map.setView(poiLocation, 15);
                    });

                    let poiItem = document.createElement('div');
                    poiItem.className = 'poi-item';
                    poiItem.textContent = poi.name;
                    poiItem.onclick = function () {
                        if (routingControl) {
                            map.removeControl(routingControl);
                        }

                        routingControl = L.Routing.control({
                            waypoints: [
                                poiLocation,
                                officeLocation
                            ],
                            routeWhileDragging: true,
                            createMarker: function (i, wp) {
                                return L.marker(wp.latLng, {
                                    icon: i === 1 ? officeMarker.options.icon : marker.options.icon
                                });
                            },
                            lineOptions: {
                                styles: [{ color: '#0075ff', weight: 5 }]
                            }
                        }).addTo(map);

                        map.setView(poiLocation, 15);
                        marker.openPopup();
                    };
                    poiList.appendChild(poiItem);
                }
            });
        }
    });
}

document.getElementById('slider').addEventListener('input', function () {
    updatePOIs(selectedFilterType);
});

// Initial POI load
updatePOIs();

// New function to handle clicks outside of map and POI card
document.addEventListener('click', function (event) {
    const mapElement = document.getElementById('map');
    const poiCardElement = document.getElementById('poi-list');

    const isClickInsideMap = mapElement.contains(event.target);
    const isClickInsidePOICard = poiCardElement.contains(event.target);

    // If the click is outside both the map and the POI card, remove the routing control
    if (!isClickInsideMap && !isClickInsidePOICard) {
        if (routingControl) {
            map.removeControl(routingControl);
            routingControl = null;
        }
    }
});

// Ensure the map does not propagate the click event to the document when a click happens on the map
document.getElementById('map').addEventListener('click', function (event) {
    event.stopPropagation();
});

// Ensure the POI card does not propagate the click event to the document when a click happens on the POI card
document.getElementById('poi-list').addEventListener('click', function (event) {
    event.stopPropagation();
});

document.getElementById('back-icon').addEventListener('click', function() {
window.history.back(); // Navigates back to the previous page
});








