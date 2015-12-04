angular.module('app.controllers', [])
  
.controller('loginCtrl', function($scope) {

})
   
.controller('mainMenuCtrl', function($scope) {

})

.controller('settingsCtrl', function ($scope) {

})

.controller('prerecordCtrl', function ($scope, $location, $rootScope, SharedData)   {

    $scope.toggle = function() {
        if ($scope.Sick_NO == true) {
            alert("TEST")
        }
        else if ($scope.Sick_YES == true) {
            $scope.Sick_NO = false;
        }
    }
    $scope.begin = function () {
        SharedData.setq(0);
        $location.url('question');
    }
})

.controller('questionCtrl', function ($scope, DataFactory, $location, $http, SharedData) {

    var array = DataFactory.get()
    $scope.q;

    $scope.$watch(function () { return SharedData.getq(); }, function (value) {
        $scope.q = value;
    })

    
    $scope.initialise = function () {
        $scope.q = SharedData.getq();
    };
    $scope.initialise();
    

    var record = true;
    var replay = false;
    var review = false;

    
    $http.get('js/qdata.json').success(function(data) {
        array = data;
    });
    

    $scope.question_data = array[$scope.q];
    $scope.flavour_text = "Recording question: " + $scope.q;

    /*
    $scope.play = function (src) {
        var media = new Media(src, null, null, mediaStatusCallback);
        $cordovaMedia.play(media);
    }
    */

    $scope.rerecord = function () {
        $scope.flavour_text = "Re-recording question: " + $scope.q;
    }

    $scope.replay = function () {
        $scope.flavour_text = "Replaying question: " + $scope.q;
    }

    $scope.advance = function () {
        if ($scope.q == 5) {
            $location.path('non_audio');
        }
        else {
            SharedData.setq($scope.q + 1);
            $scope.q = SharedData.getq();
            $scope.question_data = array[$scope.q];
            $scope.flavour_text = "Recording question: " + $scope.q;
            record = true;
        }

    }

})


.controller('non_audioCtrl', function ($scope, $location) {
    
    $scope.data = {};
    $scope.data.numberSelection = 5;
  
    $scope.reviewandfinalise = function () {
        alert($scope.data.numberSelection + " " + $scope.data.comments);
        $location.path('review');
    }

})

.controller('reviewCtrl', function ($scope, $location, $http, $window) {

    $http.get('js/qdata.json').success(function (data) {
        $scope.quests = data;
    });

    $scope.analytics = function () {
        alert("Saving for upload on Wi-Fi")
        $window.location.reload();
        $location.path('analytics')
    }

})

.controller('analyticsCtrl', function ($scope, $location) {
    $scope.tomain = function () {
        $location.path('main')
    }
})