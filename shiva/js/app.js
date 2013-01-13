angular.module('shiva', []).config(['$routeProvider', function($routeProvider) {
    $routeProvider
        .when('/', {
            templateUrl: 'partials/artist-list.html',
            controller: Shiva.Controllers.ArtistList
        })
        .when('/:artistSlug', {
            templateUrl: 'partials/artist-detail.html',
            controller: Shiva.Controllers.Artist
        })
        .when('/:artistSlug/:songSlug', {
            templateUrl: 'partials/artist-detail.html',
            controller: Shiva.Controllers.Artist
        })
        .otherwise({redirectTo: '/'});
}]);
