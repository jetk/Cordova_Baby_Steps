angular.module('app.controllers', [])
  
.controller('loginCtrl', function($scope) {

})
   
.controller('mainMenuCtrl', function($scope) {

})

.controller('settingsCtrl', function ($scope) {

})

.controller('prerecordCtrl', function ($scope) {

    $scope.toggle = function() {
        if ($scope.Sick_NO == true) {
            alert("TEST")
        }
        else if ($scope.Sick_YES == true) {
            $scope.Sick_NO = false;
        }
    }

})