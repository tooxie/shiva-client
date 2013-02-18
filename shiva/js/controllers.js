Shiva = {};

Shiva.constants = {
    PAUSED: 'PAUSED',
    PLAYING: 'PLAYING',
    LOADING: 'LOADING',
    EMPTY: 'EMPTY'
};

// TODO
Shiva.ActiveAlbum = {
    album: null
};

Shiva.Controllers = {
    ArtistList: function($scope, $http) {
        $http.get('/api/artists').success(function(data) {
            $scope.artists = data;
            // HACK
            document.getElementById('artistname').innerHTML = 'Music Player';
            document.getElementsByTagName('title')[0].innerHTML = 'Shiva &raquo; Music Player';
        });
        if (Shiva.Player.audio.timeUpdateHandler) {
            Shiva.Player.audio.removeEventListener('timeupdate', Shiva.Player.audio.timeUpdateHandler, false);
        }
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
                // HACK: How can I delegate this to angular?
                document.getElementById('artistname').innerHTML = data.name;
                document.getElementsByTagName('title')[0].innerHTML = 'Shiva &raquo; ' + data.name;
            });

            // Events
            if (!Shiva.Player.audio.timeUpdateHandler) {
                Shiva.Player.audio.timeUpdateHandler = function() {
                    Shiva.Playlist.update();
                    $scope.$apply(function() {
                        $scope.player = Shiva.Player;
                    });
                }
            }
            Shiva.Player.audio.addEventListener('timeupdate', Shiva.Player.audio.timeUpdateHandler, false);
            Shiva.Player.audio.addEventListener('loadedmetadata', function(){
                Shiva.Playlist.setMetadata();
                $scope.$apply(function() {
                    $scope.player = Shiva.Player;
                });
            }, false);
        }

        $scope.playlist = Shiva.Playlist;
        $scope.player = Shiva.Player;
        // $scope.activeAlbum = Shiva.ActiveAlbum;
    }
}

Shiva.Playlist = {
    tracks: [],

    index: 0,

    config: {
        repeat: false
    },

    isPlaying: function () {
        return Shiva.Player.isPlaying();
    },

    timeUpdate: function() {
        var mins = ~~(Shiva.Player.currentTime / 60),
            secs = (Shiva.Player.currentTime % 60).toFixed() + '',
            timeline = document.getElementById('timeelapsed'),
            playedPercent =  ((Shiva.Player.currentTime / Shiva.Player.duration) * 100) + "%";

        secs = (secs.length < 2) ? "0" + secs : secs;

        if (timeline) {
            timeline.innerHTML = mins + ':' + secs;
            document.getElementById('progressbar').style.width = playedPercent + '%';
        }
    },

    addAlbum: function(album) {
        var track = null,
            tracks = album.tracks,
            max = tracks.length,
            x = max;

        while (x--) {
            track = tracks[(max - x) - 1];

            this.addOne(track);

            console.log('Adding "' + tracks[(max - x) - 1].title + '" to playlist');
        }

        // Index in the playlist of the first track of the album
        return this.tracks.length - tracks.length;

    },

    setMetadata: function() {
        Shiva.Player.setMetadata();
    },

    update: function() {
        Shiva.Player.update();
    },

    addOne: function(track) {
        this.tracks = this.tracks.concat(track);
        if (!Shiva.Player.track) {
            Shiva.Player.setTrack(track);
        }
    },

    removeTrack: function(index) {
        var thisTrack = this.index === index,
            lastTrack = index === this.tracks.length - 1,
            wasPlaying = this.isPlaying;

        this.tracks.splice(index, 1);

        if (thisTrack) {
            if (lastTrack) {
                this.index = 0;
            }

            this.stop();
            if (this.tracks.length) {
                if (this.config.loop) {
                    this.reload();
                    if (!wasPlaying) {
                        this.pause();
                    }
                } else {
                    this.load();
                }
            }
        }
        if (this.stopAt === index) {
            this.stopAt = -1;
        }
    },

    play: function(index) {
        if (!this.isPlaying()) {
            this.index = index || 0;
            Shiva.Player.setTrack(this.tracks[this.index]);
            Shiva.Player.play();
        }
    },

    resume: function() {
        if (!this.isPlaying() && this.tracks.length) {
            console.info('Resuming playback');
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
        var _playing = this.isPlaying();

        // If playlist arrived to an end
        if (this.index == this.tracks.length - 1) {
            this.index = 0;
            if (this.config.repeat == false) {
                _playing = false;
                Shiva.Player.pause();
            }
        } else {
            this.index = this.index + 1;
        }

        if (_playing) {
            Shiva.Player.setTrack(this.tracks[this.index]);
            Shiva.Player.play();
        }
    },

    prev: function() {
        var _playing = this.isPlaying();

        if (this.index == 0) {
            this.index = this.tracks.length - 1;
            if (this.config.repeat == false) {
                _playing = false;
            }
        } else {
            this.index = this.index - 1;
        }

        if (_playing) {
            Shiva.Player.setTrack(this.tracks[this.index]);
            Shiva.Player.play();
        }
    },

    pause: function() {
        if (this.isPlaying()) {
            Shiva.Player.pause();
        }
    },

    stop: function() {
        Shiva.Player.pause();
        Shiva.src = '';
    },

    setCurrentTrack: function(track) {
        Shiva.CurrentTrack.track = track;
    },

    setActiveAlbum: function(album) {
        Shiva.ActiveAlbum.album = album;
    }
};

Shiva.Player = {
    track: null,

    audio: new Audio(),

    bitrate: 0,

    playbackStatus: Shiva.constants.EMPTY,

    elapsed: {
        minutes: 0,
        seconds: '00',
        percent: 0
    },

    duration: {
        minutes: 0,
        seconds: '00'
    },

    isPlaying: function() {
        return this.playbackStatus === Shiva.constants.PLAYING;
    },

    setTrack: function(track) {
        this.track = track;
        this.bitrate = track.bitrate;
        this.audio.src = track.stream_uri;
        this.audio.load();
        this.playbackStatus = Shiva.constants.PAUSED;
    },

    setMetadata: function() {
        var _seconds = (this.audio.duration % 60).toFixed();

        this.duration.minutes = ~~(this.audio.duration / 60);
        this.duration.seconds = (_seconds.length < 2) ? "0" + _seconds : _seconds;
    },

    update: function() {
        var _seconds = (this.audio.currentTime % 60).toFixed() + '';

        this.elapsed.minutes = ~~(this.audio.currentTime / 60);
        this.elapsed.seconds = (_seconds.length < 2) ? "0" + _seconds : _seconds;
        this.elapsed.percent =  (this.audio.currentTime / this.audio.duration) * 100;
    },

    togglePlay: function() {
        if (this.track) {
            if (this.isPlaying()) {
                this.pause();
            } else {
                this.play();
            }
        } else {
            console.log('DERP');
        }
    },

    play: function() {
        console.info('Playing "' + this.track.title + '"');
        this.playbackStatus = Shiva.constants.PLAYING;
        this.audio.play();
    },

    pause: function() {
        console.log('Pausing');
        this.playbackStatus = Shiva.constants.PAUSED;
        this.audio.pause();
    }
};

Shiva.Player.audio.addEventListener('ended', function(){
    Shiva.Playlist.next();
}, false);

Shiva.Controllers.ArtistList.$inject = ['$scope', '$http'];
Shiva.Controllers.Artist.$inject = ['$scope', '$http', '$routeParams'];
