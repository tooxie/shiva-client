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

        $scope.playAlbum = function(album) {
            Shiva.Playlist.addAlbum(album);
            Shiva.Playlist.play();
        }
    }
}
Shiva.Player = (function() {
    var audio = new Audio();
    audio.addEventListener('ended', function(){
        Shiva.Playlist.next();
    }, false);

    return audio;
})();
Shiva.Playlist = {
    tracks: [],
    addAlbum: function(album) {
        var tracks = album.tracks,
            max = tracks.length,
            x = max;

        while (x--) {
            this.tracks = this.tracks.concat(tracks[(max - x) - 1]);
            console.log('Adding "' + tracks[(max - x) - 1].title + '" to playlist');
        }
    },
    play: function(index) {
        Shiva.PlaylistIndex = index || 0;
        Shiva.Player.src = this.tracks[Shiva.PlaylistIndex].stream_uri;
        Shiva.Player.load();
        Shiva.Player.play();
        console.info('Playing "' + this.tracks[Shiva.PlaylistIndex].title + '"');
    },
    next: function() {
        var i = Shiva.PlaylistIndex,
            max = this.tracks.length - 1;
        Shiva.PlaylistIndex = i == max ? 0 : i + 1;
        this.play(Shiva.PlaylistIndex);
    },
    pause: function() {
        Shiva.Player.pause();
        Shiva.src = '';
    },
    stop: function() {
        Shiva.Player.pause();
    }
};
Shiva.PlaylistIndex = 0;

Shiva.Controllers.ArtistList.$inject = ['$scope', '$http'];
Shiva.Controllers.Artist.$inject = ['$scope', '$http', '$routeParams'];
