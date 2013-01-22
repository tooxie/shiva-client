var app = angular.module('myApp', []);

app.directive('ngSortable', function() {
    return function(scope, element, attrs) {
        console.log('ngSort');
    };
});
