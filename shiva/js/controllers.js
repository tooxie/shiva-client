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

        $scope.addAlbum = function(album) {
            var index = 0;

            index = Shiva.Playlist.addAlbum(album);

            console.log('addAlbum.index: ' + index);

            if (Shiva.Playlist.config.playing == false) {
                console.log('addAlbum: ' + index);
                Shiva.Playlist.play(index);
            }
        }
    }
}
Shiva.Player = (function() {
    var audio = new Audio();
    audio.addEventListener('ended', function(){
        Shiva.Playlist.next();
    }, false);
    audio.addEventListener('timeupdate', function(){
        Shiva.Playlist.timeUpdate();
    }, false);
    audio.addEventListener('loadedmetadata', function(){
        Shiva.Playlist.getMetadata();
    }, false);

    return audio;
})();
Shiva.Playlist = {
    tracks: [],
    timeUpdate: function() {
        var mins = ~~(Shiva.Player.currentTime / 60);
        var secs = (Shiva.Player.currentTime % 60).toFixed() + '';
        secs = (secs.length < 2) ? "0" + secs : secs;
        var playedPercent =  ((Shiva.Player.currentTime / Shiva.Player.duration) * 100) + "%";

        document.getElementById('timeelapsed').innerHTML = mins + ':' + secs;
        document.getElementById('progressbar').style.width = playedPercent + '%';
    },
    addAlbum: function(album) {
        console.log('Shiva.Playlist.addAlbum()');
        var tracks = album.tracks,
            max = tracks.length,
            x = max;

        console.log('addAlbum.max: ' + max);

        while (x--) {
            this.addOne(tracks[(max - x) - 1]);
            console.log('Adding "' + tracks[(max - x) - 1].title + '" to playlist');
        }

        // Index in the playlist of the first track of the album
        return this.tracks.length - tracks.length;

    },
    getMetadata: function() {
        var mins = ~~(Shiva.Player.duration / 60);
        var secs = (Shiva.Player.duration % 60).toFixed();
        var btn = document.getElementsByClassName('btn-loading');
        secs = (secs.length < 2) ? "0" + secs : secs;

        document.getElementById('timetotal').innerHTML = Shiva.Player.duration;
        console.log('duration: ' + Shiva.Player.duration);
        // btn.className = '';
        if (btn.length > 0) {
            console.info(btn);
            btn[0].className = 'btn btn-play';
            // btn.children[0].className = '';
            if (btn[0].children.length > 0) {
                btn[0].children[0].className = 'icon-play';
            }
        }

        // app.layout.$el.find('.time-total').html(mins + ":" + secs);
        // app.layout.$el.find('.btn-loading').removeClass('btn-loading').addClass('btn-play').find('i').removeClass('icon-refresh').removeClass('spin').addClass('icon-play');
        if(Shiva.Playlist.config.playing == true) {
            Shiva.Playlist.play();
            Shiva.Playlist.config.playing = true;

            document.getElementById('progress').className = 'active';
            // app.layout.$el.find('.progress').addClass('active');
            var btn = document.getElementsByClassName('btn-play')[0];
            btn.className = 'btn btn-pause';
            btn.children[0].className = 'icon-pause';

            // app.layout.$el.find('.btn-play').removeClass('btn-play').addClass('btn-pause').find('i').removeClass('icon-play').addClass('icon-pause');
        }
    },
    addOne: function(track) {
        this.tracks = this.tracks.concat(track);
    },
    play: function(index) {
        console.log('play(' + index + ')');
        console.log('tracks.length: ' + Shiva.Playlist.tracks.length);

        Shiva.PlaylistIndex = index || 0;
        Shiva.Player.src = this.tracks[Shiva.PlaylistIndex].stream_uri;
        console.log(Shiva.Player.src);
        Shiva.Player.load();
        Shiva.Player.play();
        console.info('Playing "' + this.tracks[Shiva.PlaylistIndex].title + '"');
        this.config.playing = true;
    },
    next: function() {
        /*
         * Plays the next song on the playlist. If it reaches the end will
         * start over again when Shiva.Playlist.config.repeat is set to true.
         * Otherwise will just stop the reproduction.
         */
        if (Shiva.PlaylistIndex == this.tracks.length - 1) {
            Shiva.PlaylistIndex = 0;
            if (this.config.repeat == false) {
                Shiva.Playlist.config.playing = false;
            }
        } else {
            Shiva.PlaylistIndex = Shiva.PlaylistIndex + 1;
        }
        if (Shiva.Playlist.config.playing == true) {
            console.log('next: ' + Shiva.PlaylistIndex);
            this.play(Shiva.PlaylistIndex);
        }
    },
    pause: function() {
        Shiva.Player.pause();
        this.config.playing = false;
    },
    stop: function() {
        Shiva.Player.pause();
        Shiva.src = '';
        this.config.playing = false;
    },
    config: {
        playing: false,
        repeat: false
    }
};
Shiva.PlaylistIndex = 0;

Shiva.Controllers.ArtistList.$inject = ['$scope', '$http'];
Shiva.Controllers.Artist.$inject = ['$scope', '$http', '$routeParams'];
