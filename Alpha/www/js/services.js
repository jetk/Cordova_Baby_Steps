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


.service('LoginService', function($q) {
    return {
        loginUser: function(name, pw) {
            var deferred = $q.defer();
            var promise = deferred.promise;
 
            if (name == 'alpha' && pw == 'secret') {
                deferred.resolve('Welcome ' + name + '!');
            } else {
                deferred.reject('Wrong credentials.');
            }
            promise.success = function(fn) {
                promise.then(fn);
                return promise;
            }
            promise.error = function(fn) {
                promise.then(null, fn);
                return promise;
            }
            return promise;
        }
    }
})

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
        setArray: function(key, value) {
            $window.localStorage[key] = value;
        },
        getArray: function(key, defaultValue) {
            var array_as_string = $window.localStorage[key]
            var array = array_as_string.split(",")
            return array || defaultValue;
        },
        setObject: function(key, value) {
            $window.localStorage[key] = JSON.stringify(value);
        },
        getObject: function(key) {
            return JSON.parse($window.localStorage[key] || '{}');
        },
		setsid: function(){
			
			//checks the number of sessions and sets to one if running for the first time, increments otherwise
			var temp = $window.localStorage['session_number'];
			if (temp > 0)
				$window.localStorage['session_number'] = ++temp
			else
				$window.localStorage['session_number'] = 1
			
			//generates an iso8601 timestamp for the SESSION, not the recording
			
			var today = new Date();
			var hours = today.getHours();
			var mins = today.getMinutes();
			var dd = today.getDate();
			var mm = today.getMonth()+1;
			var yyyy = today.getFullYear();
			if(dd<10)
				dd='0'+dd
			if(mm<10)
				mm='0'+mm
			var isotime = yyyy+"-"+mm+"-"+dd+"-"+hours+"h"+mins+"m"
			
			$window.localStorage['timestamp'] = isotime
		},
		getsid: function() {
			var uid = $window.localStorage['uid'];
			var session_number = $window.localStorage['session_number']
			var timestamp = $window.localStorage['timestamp']
			
			return uid+"_"+session_number+"_"+timestamp
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


.service('SessionID', [function($localstorage){

var sid = null

 return {
        nextsid: function () {
            var temp = $localstorage.get('session_number');
			if(temp>0)
				$localstorage.set('session_number', 1+temp);
			else
				$localstorage.set('session_number', 1);
			var time =  new Date().getTime();
			$localstorage.set('timestamp', date);
        },
        getsid: function () {
            var uid = $localstorage.get('uid')
			var session_number = $localstorage.get('session_number')
			var timestamp = $localstorage.get('timestamp')
			sid = uid+"_"+session_number+"_"+timestamp
			return sid;
        }
    };
}])


//Session Name generator:
/*

'$localstorage'

Session name string is: userid_session_datetime_am/pm

function: Start new session
Gets session count, increments and sets
Gets timestamp, overwrites

function: Get Session Name
Get userid from local storage
Get session from local storage
Get timestamp from local storage // because otherwise you get wierd timings from re-records
return concatenated

*/



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
