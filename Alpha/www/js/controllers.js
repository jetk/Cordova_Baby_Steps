angular.module('app.controllers', [])

/*
>figure out logic for locating and uploading files
*/

.controller('loginCtrl', function($scope, LoginService, $ionicPopup, $state, $localstorage) {
    $scope.data = {};
 
	if($localstorage.get('firstrun') == false)
		$state.go('mainMenu')
	
    $scope.login = function() {
        LoginService.loginUser($scope.data.username, $scope.data.password).success(function(data) {
            $state.go('settings');
			$localstorage.set('uid', $scope.data.username);
        }).error(function(data) {
            var alertPopup = $ionicPopup.alert({
                title: 'Login failed!',
                template: 'Please check your credentials!'
            });
        });
 
	}
})
   
.controller('mainMenuCtrl', function($scope, $state, $http, $localstorage) {
    $scope.alpha = function(){
        $state.go('prerecord')
    }
    $scope.recorder = function () {
        $state.go('recorder')
    }

    if ($localstorage.getObject('recording_names'==undefined))
        {   
	$http.get('js/qdata.json').success(function (data) {
		$localstorage.setObject('question_json',data)
		$localstorage.setObject('recording_names',data[0]['Q_Text'])
    })
    alert("Data Initialised")
        }
})


.controller('recorderCtrl', function ($scope, $state, $cordovaMedia, $ionicLoading, $cordovaFile, SCB, $localstorage, $cordovaLocalNotification) {

  $scope.play = function(src) {
		var fullpath = "/android_asset/www/"+src;
        var media = new Media(fullpath, null, mediaError);
        media.play();
    }
 
    var mediaError = function(e) {
        alert("error")
        alert(JSON.stringify(e))
    }
	
	var filename = "Android/data/com.ionicframework.alpha540629/files/echo.wav"
	var recordedmedia = new Media(filename);
    $scope.aleph = $localstorage.getObject('recording_names')
	
	$scope.record = function()
	{
        recordedmedia.startRecord();
	}
	
	$scope.stop = function()
	{
		recordedmedia.stopRecord();
		recordedmedia.release();
		alert(filename);
	}
	
	$scope.playback = function()
	{
		var playback = new Media (filename)
		playback.play();
	}
	
	$scope.add = function() {
        var alarmTime = new Date();
        alarmTime.setMinutes(alarmTime.getMinutes() + 1);
        $cordovaLocalNotification.schedule({
            id: 1,
            firstAt: alarmTime,
			every: 'minute',
            title: "This is a title",
            text: "This is a message",
            autoCancel: true,
            sound: null
        }).then(function () {
            console.log("The notification has been set");
        });
    };
	
	
	$scope.update = function ()
	{
		$cordovaLocalNotification.update({
        id: 1,
        title: 'Title - UPDATED',
        text: 'Text - UPDATED'
      }).then(function (result) {
        // ...
      });
	}
	
	$scope.start = function()
	{
		alert('recording names:' + JSON.stringify($localstorage.getObject('recording_names')));
		//$localstorage.setsid();
	}
	
	$scope.show = function ()
	{
		
		//alert($localstorage.getsid());
	}
	
	$scope.save = function ()
	{
	
    //$scope.aleph = $localstorage.getObject('recording_names')
	//alert(JSON.stringify($scope.aleph));
    
        
	/*
	$cordovaFile.createFile("Android/data/com.ionicframework.alpha540629/files/", "file.txt")
    .then(function (success) {
        alert('SUCCESS1: ' + JSON.stringify(success));
    }, function (error) {
        alert('ERROR1: ' + JSON.stringify(error));
    });
	
	$cordovaFile.writeExistingFile("Android/data/com.ionicframework.alpha540629/files/", "file.txt", "the text inside the file")
    .then(function (success) {
        alert('SUCCESS2: ' + JSON.stringify(success));
    }, function (error) {
        alert('ERROR2: ' + JSON.stringify(error));
    });
	*/
    
	$cordovaFile.writeFile(cordova.file.externalDataDirectory, "recnames.json", JSON.stringify($scope.aleph), true)
    .then(function (success) {
		alert('SUCCESS3: ' + JSON.stringify(success));
    }, function (error) {
        alert('ERROR3: ' + JSON.stringify(error));
    });
	
	}
    
    $scope.delete = function ()
    {
        $cordovaFile.removeFile(cordova.file.externalDataDirectory, $scope.aleph.q1)
    }
    
    $scope.deleteRecursive = function ()
    {
        $scope.aleph.forEach(function(i){
            alert($scope.aleph[i]);       
        });
    }
    
})


.controller('settingsCtrl', function ($scope, $localstorage, $state, $cordovaLocalNotification) {
	
	//pulls in a firstrun boolean, used to determine whether the 'save' or 'update' buttons are visible	
	$scope.firstrun = $localstorage.get('firstrun')
	
    $scope.settings = {
        WDAM: $localstorage.get('WDAM'),
        WDPM: $localstorage.get('WDPM'),
        //WEAM: '',
        //WEPM: ''
    }
	
	
	var generate_times = function()
	{
		//saves to localstorage in case reminders fail
        $localstorage.set('WDAM', $scope.settings.WDAM)
		$localstorage.set('WDPM', $scope.settings.WDPM)
		
		/*
        $localstorage.set('WEAM', $scope.settings.WEAM)
        $localstorage.set('WEPM', $scope.settings.WEPM)
		*/
		
        //Creates components for alarm datetime
		var dd = new Date().getDate();
        var mm = new Date().getMonth()+1;
        var yy = new Date().getFullYear();
		
		//extracts AM reminder hour and minutes
        var AMhh = new Date($scope.settings.WDAM).getHours();
        var AMmm = new Date($scope.settings.WDAM).getMinutes();
		
		//extracts PM reminder hour and minutes
		var PMhh = new Date($scope.settings.WDPM).getHours();
        var PMmm = new Date($scope.settings.WDPM).getMinutes();
		
		//Generates correctly formatted string for closest AM reminder time and turns it into a datetime
		var AMsource = yy + ',' + mm + ',' + dd + ' ' + AMhh + ':' + AMmm;
		var AM_datetime = new Date(AMsource);
		
		//Generates correctly formatted string for closest PM reminder time and turns it into a datetime
		var PMsource = yy + ',' + mm + ',' + dd + ' ' + PMhh + ':' + PMmm;
		var PM_datetime = new Date(PMsource);
		
        //Returns an object with the datetimes for use in the save and update functions
		return {
		"WDAM" : AM_datetime,
		"WDPM" : PM_datetime
		}
	}
	
	
	$scope.save = function(){
		
        //Pulls in datetimes for notifications
		var datetime_object = generate_times()
		
        //Creates notifications
		$cordovaLocalNotification.schedule({
            id: 1,
            firstAt: datetime_object.WDAM,
			every: 'day',
            title: "LVAP",
            text: "Hi! Time for your morning recording.",
            autoCancel: true,
            sound: null
        }).then(function () {
           alert("Morning reminder set")
        });
		
		$cordovaLocalNotification.schedule({
            id: 2,
            firstAt: datetime_object.WDPM,
			every: 'day',
            title: "LVAP",
            text: "Hi! Time for your evening recording.",
            autoCancel: true,
            sound: null
        }).then(function () {
           alert("Evening reminder set")
        });
		
        $scope.firstrun = false
		$localstorage.set('firstrun', $scope.firstrun)
		$state.go('mainMenu');
	}
	
	
	//TODO:DELETE
    $scope.saveBACKUP = function () {
		//saves to localstorage in case reminders fail
        $localstorage.set('WDAM', $scope.settings.WDAM)
		$localstorage.set('WDPM', $scope.settings.WDPM)
		
		/*
        $localstorage.set('WEAM', $scope.settings.WEAM)
        $localstorage.set('WEPM', $scope.settings.WEPM)
		*/
		
		$localstorage.set('firstrun', false)
		
		
		//generates a date seed to combine with input time to match the format local notifications require
		var dd = new Date().getDate();
        var mm = new Date().getMonth()+1;
        var yy = new Date().getFullYear();
		
		//extracts AM reminder hour and minutes
        var AMhh = new Date($scope.settings.WDAM).getHours();
        var AMmm = new Date($scope.settings.WDAM).getMinutes();
		
		//extracts PM reminder hour and minutes
		var PMhh = new Date($scope.settings.WDPM).getHours();
        var PMmm = new Date($scope.settings.WDPM).getMinutes();
		
		//Generates correctly formatted string for closest AM reminder time and turns it into a datetime
		var AMsource = yy + ',' + mm + ',' + dd + ' ' + AMhh + ':' + AMmm;
		var AM_datetime = new Date(AMsource);
		
		//Generates correctly formatted string for closest PM reminder time and turns it into a datetime
		var PMsource = yy + ',' + mm + ',' + dd + ' ' + PMhh + ':' + PMmm;
		var PM_datetime = new Date(PMsource);

		//Sets up a reminder to repeat daily at the morning time
        $cordovaLocalNotification.schedule({
            id: 1,
            firstAt: AM_datetime,
			every: 'day',
            title: "LVAP",
            text: "Hi! Time for your morning recording.",
            autoCancel: true,
            sound: null
        }).then(function () {
           alert("Morning reminder set")
        });
		
		//Sets up a reminder to repeat daily at the evening time
		$cordovaLocalNotification.schedule({
            id: 2,
            firstAt: PM_datetime,
			every: 'day',
            title: "LVAP",
            text: "Hi! Time for your evening recording.",
            autoCancel: true,
            sound: null
        }).then(function () {
           alert("Evening reminder set")
        });
		
		$state.go('mainMenu');
    }
	
	$scope.update = function () {
        //clears and then creates new notifications
		$cordovaLocalNotification.cancelAll()
		$scope.save();
		$state.go('mainMenu');
    }
	
	$scope.cancel_update = function () {
		$state.go('mainMenu');
	}
})

.controller('prerecordCtrl', function ($scope, $location, $rootScope, SharedData, $state, $ionicLoading, $timeout, SCB, $localstorage)   {

    $scope.begin = function () {
		//storing a flag that we are still recording (determines playback control)
		SCB.setSCB(false);
        
        //Generating an animated popover to prompt the user to return phoen to ear
        $ionicLoading.show({
            template: '<html><body><h1>Getting ready to record! Please put phone to ear and answer the questions you hear</h1><div><img src="img/countdown.gif" /></div></body></html>',
            animation: 'fade-in',
            showBackdrop: false,
            maxWidth: 80,
            showDelay: 0,
        });
        $timeout(function () {
            $ionicLoading.hide();
            $state.go('alpha', { testvar: 1, mode: "Recording", filepath: null });
        }, 1850);
        
        //Generates a timestamped session ID for use with all recording names		
		$localstorage.setsid();
    }

})

//TODO: DELETE
.controller('questionCtrl', function ($scope, DataFactory, $rootScope, $location, $http, $state, SharedData) {

    var record = true;
    var replay = false;
    var rerecord = false;
    var array = DataFactory.get();
    $scope.q;
    
    $scope.$watch(function () { return SharedData.getq(); }, function (value) {
        $scope.q = value;
    })
    
    $http.get('js/qdata.json').success(function (data) {
        array = data;
        alert("init");
        $scope.q = SharedData.getq();
        $scope.question_data = array[$scope.q];
        $scope.flavour_text = $scope.return_flavour_text(record, replay, rerecord);
    });



    
       
    /*
    $rootScope.initialise = function () {
        alert("init");
        $scope.q = SharedData.getq();
        $scope.question_data = array[$scope.q];
        $scope.flavour_text = "Recording question: " + $scope.q;
    };
    $rootScope.initialise();
    */
    

    $scope.rerecord = function () {
        record = false;
        replay = false;
        rerecord = true;
        $scope.flavour_text = $scope.return_flavour_text(record, replay, rerecord);
    }

    $scope.replay = function () {
        record = false;
        replay = true;
        rerecord = false;
        $scope.flavour_text = $scope.return_flavour_text(record, replay, rerecord);
    }

    $scope.advance = function () {
        if ($scope.q == 5) {
            $state.go('non_audio');
            SharedData.setq(0);
        }
        else {
            SharedData.setq(++$scope.q);
            $scope.q = SharedData.getq();
            $scope.question_data = array[$scope.q];
            record = true;
            replay = false;
            rerecord = false;
            $scope.flavour_text = $scope.return_flavour_text(record, replay, rerecord);
        }
    }

    $scope.return_flavour_text = function (record, replay, rerecord)
    {
        if (record == true && replay == false && rerecord == false)
            return "Recording"
        if (record == false && replay == true && rerecord == false)
            return "Replaying"
        else {
            return "Re-recording"
        }
    }
})

.controller('non_audioCtrl', function ($scope, $state, SCB) {
    
    //Object that stores metadata for additional wellbeing information gathering
    $scope.data = {};
    //Sets a default for the mood slider
    $scope.data.numberSelection = 5;
	SCB.setSCB(false);
  
    $scope.reviewandfinalise = function () {
        //alert($scope.data.numberSelection + " " + $scope.data.comments);
        $state.go('review');
    }

})

.controller('reviewCtrl', function ($scope, $location, $http, $state, SCB, $cordovaFile, $localstorage) {

    //Pulls in the Session ID and sets the filename for this session's metadata JSON
    var sid = $localstorage.getsid();
    var json_filename = sid + ".json";
    
    //Pulls in question_json for the short names of the recordings
    $scope.quests = $localstorage.getObject('question_json');
    
    //Pulls in the recording names from local storage
    $scope.rec_names = $localstorage.getObject('recording_names');
    
    // TODO: Note that we used to use HTTP but then switched to localstorage
    
    //Sets the Session Complete Boolean to true, meaning that the advance button brings us to 
	SCB.setSCB(true); 

    //Sends user to specific question they had selected for rerecording
    $scope.reviewquestions = function (q) {
        $state.go('alpha', { testvar: q, mode: "Reviewing", filepath: null })
    }

    $scope.analytics = function () {
        alert("Saving for upload on Wi-Fi")
		
        //creates the metadata JSON
        $cordovaFile.writeFile(cordova.file.externalDataDirectory, json_filename, JSON.stringify($scope.rec_names), true)
        .then(
        function (success) {
            //alert('SUCCESS3: ' + JSON.stringify(success));
        }, function (error) {
            alert('ERROR3: ' + JSON.stringify(error));
        });
        /*TODO: lots of heavy lifting:
			>Save over 'recording_names' with 'question_json'[0]['Q_Text']
			>listen for WIFI
			>if WIFI, begin upload
		*/
        
        $state.go('analytics')
    }

})

.controller('analyticsCtrl', function ($scope, $state) {
    $scope.tomain = function () {
        $state.go('mainMenu')
    }
})

.controller('alphaCtrl', function ($scope, $state, $stateParams, $http, $ionicLoading, $cordovaMedia, $timeout, $ionicPlatform, $cordovaFile, SCB, LoadData, $localstorage) {

    //TODO: Note that this template could have been architectected either as: all individual functions that check a few mode variables
    //In a service, or by paramaterised URL. Use a hybrid system because data is there on pageload and because it saves us from constantly
    //switching and querying a third party variable (only switched once per session, only checked in relevant cases)
    
    //TODO: Note that we used to load in data from the JSON by HTTP, but this was a) overkill as the data shouldn't change and
    //b) was cumbersome to program for because HTTP.GET is async, forcing me to wrap up things in a success function
    
    
	//initialisations. Pulling q# and mode out of the state
	$scope.testvar = $stateParams.testvar;
    $scope.flavour_text = $stateParams.mode;
	$scope.rec_names = $localstorage.getObject('recording_names')
		var sid = $localstorage.getsid();
    var unique_filename = sid+"_q"+$scope.testvar+".wav"
	var rec_filepath = "Android/data/com.ionicframework.alpha540629/files/"+unique_filename
	var recorder // media object of the recorder
	
	
	//TODO: generate a filename via the service
	//TODO: put filename into an array
	
	//Q_Audio source and media object, probably should rename
	var src;
	var media; //media object for the question
	var popover_sustain = 1800;
	var number_of_questions;
	
    
    
	//Pipes in boolean value of whether we're done with the first pass of the session
	$scope.session_complete = SCB.getSCB();

	//Loading up question data from JSON file (kept external for reconfigurability)
    //Note: asynchronous call, forces me to wrap everything up here
	//TODO: swap out with localstorage call, which is synchro
	/*
	
	$http.get('js/qdata.json').success(function (data) {
        $scope.qd = data[$stateParams.testvar];
        number_of_questions = data.length - 1;
        var bca = new Array();
        for (i = 0 ; i < number_of_questions ; i++) {
            if (i < $stateParams.testvar)
                bca[i] = true;
            else
                bca[i] = false;
        }
        $scope.BreadCrumbArray = bca;
        src = "questions/"+$scope.qd.Q_Audio
    })
	*/
	
	//Replacement code, pulls in data from local storage synchronously
	
	$scope.questions_array = $localstorage.getObject('question_json'); 
	$scope.qd = $scope.questions_array[$stateParams.testvar];
	src = "questions/"+$scope.qd.Q_Audio
    
    number_of_questions = $scope.questions_array.length - 1;

	var bca = $scope.questions_array[0]['Q_Number'];
	for (i = 0 ; i < number_of_questions ; i++) {
		if (i < $stateParams.testvar)
			bca[i] = true;
		else
			bca[i] = false;
	}
	$scope.BreadCrumbArray = bca;
	
	
	
	//Control for different modes

    if ($stateParams.mode == "Recording")
    {
		//Generates a popover with instructions to put the phone up to one's ear
		$ionicLoading.show({ 
        template: '<html><body><h1>Recording, please put phone to ear</h1><ion-spinner class="ripple" icon="ripple"></ion-spinner></body></html>',
        animation: 'fade-in',
        showBackdrop: false,
        maxWidth: 80,
        showDelay: 0,
        duration: popover_sustain
		});
		
		//waits until popover hides, then plays the question audio file
		$timeout(function () {
        var fullpath = "/android_asset/www/"+src;
        media = new Media(fullpath, null, mediaError);
        media.play();
		var mediaError = function(e) {
        alert("error")
		}
        }, popover_sustain);
		
		$timeout(function () {
        media.stop();
		recorder = new Media(rec_filepath);
		recorder.startRecord();
        }, 4000);
    }
    else if ($stateParams.mode == "Replaying")
    {
        var fullpath = rec_filepath;
        media = new Media(fullpath, null, mediaError);
        media.play();
		var mediaError = function(e) {
        alert("Error, file missing or corrupt")
		}
    }
    else if ($stateParams.mode == "Re-Recording")
    {
        //TODO: start recording
        //TODO: generate filename
		
		//Generates a re-recording popover with instructions to put the phone up to one's ear
		$ionicLoading.show({ 
        template: '<html><body><h1>Re-recording question, please put the phone to your ear and speak directly</h1><ion-spinner class="ripple" icon="ripple"></ion-spinner></body></html>',
        animation: 'fade-in',
        showBackdrop: false,
        maxWidth: 80,
        showDelay: 0,
        duration: popover_sustain
		});
		
		$timeout(function () {
		recorder = new Media(rec_filepath);
		recorder.startRecord();
        }, popover_sustain);
    }
    else if ($stateParams.mode == "Reviewing")
    {
        var fullpath = rec_filepath;
        media = new Media(fullpath, null, mediaError);
        media.play();
		var mediaError = function(e) {
        alert("error")
		}
    }

    $scope.advance = function ()
    {
        if ($stateParams.mode == "Reviewing")
        {
			if(media!=null)
				media.stop();
            $state.go('review')
        }
		else if ($stateParams.mode == "Re-Recording" && $scope.session_complete == true)
        {
			if(recorder!=null)
				recorder.stopRecord();
            $state.go('review')
        }
        else if ($stateParams.testvar < number_of_questions)
        {
            if(recorder!=null)
				recorder.stopRecord();
			$scope.rec_names["q"+$scope.testvar] = unique_filename//rec_filepath;
			$localstorage.setObject('recording_names',$scope.rec_names);
            $state.go('alpha', { testvar: $stateParams.testvar + 1, mode: "Recording", filepath: null })
        }
        else if ($stateParams.testvar == number_of_questions)
		{
			if(recorder!=null)
				recorder.stopRecord();
            $scope.rec_names["q"+$scope.testvar] = unique_filename//rec_filepath;
			$localstorage.setObject('recording_names',$scope.rec_names);
			$state.go('non_audio');			
		}
    }

    $scope.rerecord = function () {
		if(recorder!=null)
			recorder.stopRecord();
        $state.go('alpha', { testvar: $stateParams.testvar, mode: "Re-Recording", filepath: null })
    }

    $scope.replay = function () {
		if(recorder!=null)
				recorder.stopRecord();
		$scope.rec_names["q"+$scope.testvar] = unique_filename//rec_filepath;
		$localstorage.setObject('recording_names',$scope.rec_names);
        $state.go('alpha', { testvar: $stateParams.testvar, mode: "Replaying", filepath: null })
    }
})