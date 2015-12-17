angular.module('app.services', [])

.factory('DataFactory', [function(){
    var array = [
{
    "Q_Number": 1,
    "Q_Text": "Say baaaaa",
    "Q_Audio": "q1.mp3",
    "Q_Short":"test1",
    "Q_Nav": "(x)-( )-( )-( )-( )-( )"
},
{
    "Q_Number": 2,
    "Q_Text": "Say Hello World",
    "Q_Audio": "q2.wav",
    "Q_Short": "test2",
    "Q_Nav": "(x)-(x)-( )-( )-( )-( )"
},
{
    "Q_Number": 3,
    "Q_Text": "How much did you drink last night?",
    "Q_Audio": "q3.wav",
    "Q_Short": "test3",
    "Q_Nav": "(x)-(x)-(x)-( )-( )-( )"
},
{
    "Q_Number": 4,
    "Q_Text": "How much did you drink last night?",
    "Q_Audio": "q3.wav",
    "Q_Short": "test4",
    "Q_Nav": "(x)-(x)-(x)-(x)-( )-( )"
},
{
    "Q_Number": 5,
    "Q_Text": "How much did you drink last night?",
    "Q_Audio": "q3.wav",
    "Q_Short": "test5",
    "Q_Nav": "(x)-(x)-(x)-(x)-(x)-( )"
},
{
    "Q_Number": 6,
    "Q_Text": "How much did you drink last night?",
    "Q_Audio": "q3.wav",
    "Q_Short": "test6",
    "Q_Nav": "(x)-(x)-(x)-(x)-(x)-(x)"
}
    ];

    return{
        get: function()
        {return array}
    }
}])

.service('SharedData', [function () {
    var q = 0;

    return {
        getq: function () {
            return q;
        },
        setq: function (value) {
            q = value;
        }
    };

}])

.service('SCB', [function () {
    var SCB = true;

    return {
        getSCB: function () {
            return SCB;
        },
        setSCB: function (value) {
            SCB	= value;
        }
    };

}])

.factory('$localstorage', ['$window', function($window) {
    return {
        set: function(key, value) {
            $window.localStorage[key] = value;
        },
        get: function(key, defaultValue) {
            return $window.localStorage[key] || defaultValue;
        },
        setObject: function(key, value) {
            $window.localStorage[key] = JSON.stringify(value);
        },
        getObject: function(key) {
            return JSON.parse($window.localStorage[key] || '{}');
        }
    }
}])

.factory('QuestionData', [function ($http) {

    var questionFactory = {};

    var returndata;
    questionFactory.datagetter = function () {
        $http.get('js/qdata.json')
    .success(function (data) { returndata = data })
    }

    return {
        get: function ()
        { return returndata }
    }

}])

//The below was a nice idea, but a bit pointless

.service('BreadCrumb', [function () {
    //TODO: Make it read from the config file and automatically populate it
    var bc = [false, false, false, false, false, false];

    return {
        getbc: function () {
            return bc;
        },
        setbc: function (index) {
            bc[index] = true;
        },
        resetbc: function(){
            for (i = 0; i < bc.length ; i++)
                bc[i] = 0;
        }
    };

}])

.service('BlankService', [function(){

}])


.service('LoadData', [function ($http) {
    return {
        getqd: function () {
            var questions = [];

            function foo() {
                $http.get('js/qdata.json').success(function (data) {
               return data
            })
            foo().success(function (loadedData) {
                questions
                 })
            }
            return questions
        }
    }
}])

.service('BlankService', [function($ionicPopover, $ionicLoading){
    //Popover

    var template = '<ion-popover-view><ion-header-bar> <h1 class="title">My Popover Title</h1> </ion-header-bar> <ion-content> Hello! </ion-content></ion-popover-view>';

    $scope.popover = $ionicPopover.fromTemplate(template, {
        scope: $scope
    });

    // .fromTemplateUrl() method
    $ionicPopover.fromTemplateUrl('my-popover.html', {
        scope: $scope
    }).then(function (popover) {
        $scope.popover = popover;
    });


    $scope.openPopover = function ($event) {
        $scope.popover.show($event);
    };
    $scope.closePopover = function () {
        $scope.popover.hide();
    };
    //Cleanup the popover when we're done with it!
    $scope.$on('$destroy', function () {
        $scope.popover.remove();
    });
    // Execute action on hide popover
    $scope.$on('popover.hidden', function () {
        // Execute action
    });
    // Execute action on remove popover
    $scope.$on('popover.removed', function () {
        // Execute action
    });


}]);
