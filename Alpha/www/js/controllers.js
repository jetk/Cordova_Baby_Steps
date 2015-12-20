angular.module('app.controllers', [])
  
.controller('loginCtrl', function($scope) {

})
   
.controller('mainMenuCtrl', function($scope, $state) {
    $scope.alpha = function()
    {
        $state.go('prerecord')
    }
    $scope.recorder = function () {
        $state.go('recorder')
    }
})

.controller('recorderCtrl', function ($scope, $state, $cordovaMedia, $ionicLoading, $cordovaFile, SCB, $localstorage) {

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
	
	$scope.start = function()
	{
		$localstorage.setObject('Alpha',{key:'BETA'})
	}
	
	$scope.show = function ()
	{
		$scope.b = $localstorage.getObject('Alpha');
		alert($scope.b.key);
	}
	
	$scope.save = function ()
	{

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
	
	
	$cordovaFile.writeFile(cordova.file.dataDirectory, "file.txt", "the text inside the file", true)
    .then(function (success) {
        alert(cordova.file.dataDirectory);
		alert('SUCCESS3: ' + JSON.stringify(success));
    }, function (error) {
        alert('ERROR3: ' + JSON.stringify(error));
    });
	}
})


.controller('settingsCtrl', function ($scope, $localstorage) {

    $scope.settings = {
        WDAM: '',
        WDPM: '',
        WEAM: '',
        WEPM: ''
    }

    $scope.show = function () {
        alert($localstorage.get('WDAM')+$localstorage.get('WDPM'))
    }
    $scope.save = function () {
        $localstorage.set('WDAM', $scope.settings.WDAM)
		$localstorage.set('WDPM', $scope.settings.WDPM)
        $localstorage.set('WEAM', $scope.settings.WEAM)
        $localstorage.set('WEPM', $scope.settings.WEPM)
    }
})

.controller('prerecordCtrl', function ($scope, $location, $rootScope, SharedData, $state, $ionicLoading, $timeout, SCB, $localstorage)   {

    $scope.begin = function () {
        
		//Start unique name generator service
		SCB.setSCB(false);
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
		$localstorage.setObject('recording_names',{q1:null, q2:"a", q3:null, q4:null, q5:null, q6:null})		
    }

})

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
    
    $scope.data = {};
    $scope.data.numberSelection = 5;
	SCB.setSCB(false);
  
    $scope.reviewandfinalise = function () {
        alert($scope.data.numberSelection + " " + $scope.data.comments);
        $state.go('review');
    }

})

.controller('reviewCtrl', function ($scope, $location, $http, $state, SCB) {

    $http.get('js/qdata.json').success(function (data) {
        $scope.quests = data;
    });

	SCB.setSCB(true);
    //TODO: pull recording number from 

    $scope.reviewquestions = function (q) {
        $state.go('alpha', { testvar: q, mode: "Reviewing", filepath: null })
    }

    $scope.analytics = function () {
        alert("Saving for upload on Wi-Fi")
        $state.go('analytics')
    }

})

.controller('analyticsCtrl', function ($scope, $state) {
    $scope.tomain = function () {
        $state.go('mainMenu')
    }
})

.controller('alphaCtrl', function ($scope, $state, $stateParams, $http, $ionicLoading, $cordovaMedia, $timeout, $ionicPlatform, $cordovaFile, SCB, LoadData,  $localstorage) {

	//initialisations. Pulling q# and mode out of the state
	$scope.testvar = $stateParams.testvar;
    $scope.flavour_text = $stateParams.mode;
	$scope.rec_names = $localstorage.getObject('recording_names')
	
	
	var rec_filepath = "Android/data/com.ionicframework.alpha540629/files/unique_q"+$scope.testvar+".wav"
	var recorder
	
	
	//TODO: generate a filename via the service
	//TODO: put filename into an array
	
	//Q_Audio source and media object, probably should rename
	var src;
	var media;
	var popover_sustain = 1800;
	var number_of_questions;
	
	//Pipes in boolean value of whether we're done with the first pass of the session
	$scope.session_complete = SCB.getSCB();

	//Loading up question data from JSON file (kept external for reconfigurability)
    //Note: asynchronous call, forces me to wrap everything up here
	//TODO: pull out as a service 
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
	
	
	//Control for different modes

    if ($stateParams.mode == "Recording")
    {
        //TODO: start recording
        
		//TODO: generate filename
		// @ service with exposed get method
		
		
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
        alert("error")
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
			//Stop playback and go to the review page
			if(media!=null)
				media.stop();
            $state.go('review')
        }
		else if ($stateParams.mode == "Re-Recording" && $scope.session_complete == true)
        {
            //TODO: save recording and go to the review page
			if(recorder!=null)
				recorder.stopRecord();
            $state.go('review')
        }
        else if ($stateParams.testvar < number_of_questions)
        {
            //TODO: save recording and move on to the next one
            //TODO: pipe filepath to service
            if(recorder!=null)
				recorder.stopRecord();
			$scope.rec_names["q"+$scope.testvar] = rec_filepath;
			$localstorage.setObject('recording_names',$scope.rec_names);
            $state.go('alpha', { testvar: $stateParams.testvar + 1, mode: "Recording", filepath: null })
        }
        else if ($stateParams.testvar == number_of_questions)
		{
			//TODO: save the recording and move on to the non-audio questions
			
			if(recorder!=null)
				recorder.stopRecord();
            $scope.rec_names["q"+$scope.testvar] = rec_filepath;
			$localstorage.setObject('recording_names',$scope.rec_names);
			$state.go('non_audio');			
		}
    }

    $scope.rerecord = function () {
        //TODO: dump recording
		if(recorder!=null)
			recorder.stopRecord();
        $state.go('alpha', { testvar: $stateParams.testvar, mode: "Re-Recording", filepath: null })
    }

    $scope.replay = function () {
        //TODO: save recording
        //TODO: pipe filepath to service
		if(recorder!=null)
				recorder.stopRecord();
		$scope.rec_names["q"+$scope.testvar] = rec_filepath;
		$localstorage.setObject('recording_names',$scope.rec_names);
        $state.go('alpha', { testvar: $stateParams.testvar, mode: "Replaying", filepath: null })
    }
})