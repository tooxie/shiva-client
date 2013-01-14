Shiva = {}
Shiva.Controllers = {
    ArtistList: function($scope, $http) {
        $http.get('/api/artists').success(function(data) {
            $scope.artists = data;
            // Hack
            window.document.getElementById('artistName').innerHTML = 'Music Player';
        });

        // $scope.orderProp = 'age';
    },
    Artist: function($scope, $http, $routeParams) {
        var artistSlug = $routeParams.artistSlug,
            songSlug = $routeParams.songSlug,
            found = false,
            x = 0;

        if (artistSlug) {
            console.log('artist slug: ' + artistSlug);
            $http.get('/api/artist/' + artistSlug + '?fulltree=true').success(function (data) {
                $scope.artist = data;
                if (songSlug) {
                    console.log('song slug: ' + songSlug);
                    x = data.albums.length;
                    while (x && !found) {
                        console.log(data.albums[x-1].slug);
                        if (data.albums[x-1].slug === songSlug) {
                            console.info();
                            $scope.album = data.albums[x-1];
                            found = true;
                        }
                        x -= 1;
                    }
                } else {
                    $scope.album = data.albums[0];
                }
                console.info($scope.album);
                // Hack
                document.getElementById('artistName').innerHTML = data.name;
            });
        }
    }
}

Shiva.Controllers.ArtistList.$inject = ['$scope', '$http'];
Shiva.Controllers.Artist.$inject = ['$scope', '$http', '$routeParams'];
