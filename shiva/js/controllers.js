Shiva = {}
Shiva.Controllers = {
    ArtistList: function($scope, $http) {
        $http.get('/api/artists').success(function(data) {
            $scope.artists = data;
            // Hack
            window.document.getElementById('artistName').innerHTML = 'Music Player';
        });
    },

    Artist: function($scope, $http, $routeParams) {
        var artistSlug = $routeParams.artistSlug,
            songSlug = $routeParams.songSlug,
            found = false,
            x = 0;

        if (artistSlug) {
            $http.get('/api/artist/' + artistSlug + '?fulltree=true').success(function (data) {
                $scope.artist = data;
                if (songSlug) {
                    x = data.albums.length;
                    while (x && !found) {
                        if (data.albums[x-1].slug === songSlug) {
                            $scope.album = data.albums[x-1];
                            found = true;
                        }
                        x -= 1;
                    }
                } else {
                    $scope.album = data.albums[0];
                }
                // Hack
                document.getElementById('artistName').innerHTML = data.name;
            });
        }

        $scope.addAlbum = function(album) {
            var index = 0;

            index = Shiva.Playlist.addAlbum(album);

            if (Shiva.Playlist.config.playing == false) {
                Shiva.Playlist.play(index);
            }
        }

        $scope.playToggle = function() {
            if (Shiva.Playlist.config.playing == true) {
                Shiva.Playlist.pause();
            } else {
                Shiva.Playlist.resume();
            }
        }

        $scope.playNext = function() {
            Shiva.Playlist.next();
        }

        $scope.playPrev = function() {
            Shiva.Playlist.prev();
        }

        $scope.playlist = Shiva.Playlist;
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
        var btn = document.getElementById('play');
        secs = (secs.length < 2) ? "0" + secs : secs;

        document.getElementById('timetotal').innerHTML = mins + ':' + secs;
        console.info('Playing "' + this.tracks[Shiva.PlaylistIndex].title + '" (' + mins + ':' + secs + ')');
        btn.className = 'btn btn-play';
        if (btn.children.length > 0) {
            btn.children[0].className = 'icon-play';
        }

        if(Shiva.Playlist.config.playing == true) {
            var btn = document.getElementById('play');
            document.getElementById('progress').className = 'active';
            btn.className = 'btn btn-pause';
            btn.children[0].className = 'icon-pause';
        }
    },
    addOne: function(track) {
        this.tracks = this.tracks.concat(track);
    },
    play: function(index) {
        document.getElementById('play').children[0].className = 'icon-refresh spin';

        Shiva.PlaylistIndex = index || 0;
        Shiva.Player.src = this.tracks[Shiva.PlaylistIndex].stream_uri;

        Shiva.Player.load();
        Shiva.Player.play();
        this.config.playing = true;
    },
    resume: function() {
        if (!this.config.playing && this.tracks.length) {
            console.info('Resuming playback');
            document.getElementById('play').children[0].className = 'icon-pause';
            this.config.playing = true;
            Shiva.Player.play();
        }
    },
    next: function() {
        /*
         * Plays the next song on the playlist. If it reaches the end will
         * start over again when Shiva.Playlist.config.repeat is set to true.
         * Otherwise will just stop the reproduction. If the 'force' parameter
         * is provided then it will ignore the config and go to the first song
         * when the end is reached.
         */
        var _playing = this.config.playing;

        this.pause();

        // If playlist arrived to an end
        if (Shiva.PlaylistIndex == this.tracks.length - 1) {
            Shiva.PlaylistIndex = 0;
            if (this.config.repeat == false) {
                _playing = false;
            }
        } else {
            Shiva.PlaylistIndex = Shiva.PlaylistIndex + 1;
        }

        if (_playing) {
            console.log('Skipping');
            this.play(Shiva.PlaylistIndex);
        }
    },
    prev: function() {
        var _playing = this.config.playing;

        this.pause();

        if (Shiva.PlaylistIndex == 0) {
            Shiva.PlaylistIndex = this.tracks.length - 1;
            if (this.config.repeat == false) {
                _playing = false;
            }
        } else {
            Shiva.PlaylistIndex = Shiva.PlaylistIndex - 1;
        }

        if (_playing) {
            console.log('Skipping');
            this.play(Shiva.PlaylistIndex);
        }
    },
    pause: function() {
        if (this.config.playing) {
            console.log('Pausing');
            document.getElementById('play').children[0].className = 'icon-play';
            Shiva.Player.pause();
            this.config.playing = false;
        }
    },
    stop: function() {
        console.log('Stopping');
        document.getElementById('play').children[0].className = 'icon-play';
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
