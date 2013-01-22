// http://docs.angularjs.org/guide/directive
Shiva.app.directive('ngSortable', function() {
    return function(scope, element, attrs, controller) {
        console.log('[DIRECTIVE] ngSortable="' + attrs.ngSortable + '"');

        scope.$watch(attrs.ngSortable, function(values) {
            var tracks = element.children(),
                x = tracks.length;

            console.log(x);
            console.info(tracks);
            while (x--) {
                var track = tracks[x];
                if (track.draggable && !track.handled) {
                    track.handled = true;
                    track.addEventListener('click', function (e) {
                        console.log('*click* on ' + this.id);
                    }, false)
                    // dragstart
                    track.addEventListener('dragstart', function (e) {
                        console.log('dragstart for ' + e.target.id);
                        this.style.opacity = '0.4';
                    }, false)

                    // dragend
                    track.addEventListener('dragend', function (e) {
                        console.log('dragend for ' + e.target.id);
                        this.style.opacity = '1';
                        this.classList.remove('over');
                    }, false)

                    // dragover
                    track.addEventListener('dragover', function (e) {
                        console.log('dragover for ' + e.target.id);
                        this.style.opacity = '1';

                        if (e.preventDefault) {
                            e.preventDefault();
                        }
                        e.dataTransfer.dropEffect = 'move';

                        return false;
                    }, false)

                    // dragenter
                    track.addEventListener('dragenter', function (e) {
                        console.log('dragenter for ' + e.target.id);
                        this.classList.add('over');
                    }, false)

                    // dragleave
                    track.addEventListener('dragleave', function (e) {
                        console.log('dragleave for ' + e.target.id);
                        this.classList.remove('over');
                    }, false)

                    // drop
                    track.addEventListener('drop', function (e) {
                        console.log('dropped on ' + e.target.id);
                        this.classList.remove('over');

                        if (e.stopPropagation) {
                            e.stopPropagation();
                        }

                        return false;
                    }, false)
                }
            }
        });
    };
});
