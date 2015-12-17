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

.controller('recorderCtrl', function ($scope, $state, $cordovaMedia, $ionicLoading, $cordovaFile, SCB) {

  $scope.play = function(src) {
		var fullpath = "/android_asset/www/"+src;
        var media = new Media(fullpath, null, mediaError);
        media.play();
    }
 
    var mediaError = function(e) {
        alert("error")
        alert(JSON.stringify(e))
    }
	
	var filename = "gamma.wav"
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
		media.play();
	}
	
	$scope.showSCB = function ()
	{
		$scope.SCB=SCB.getSCB();
		alert("the value of SCB is:"+$scope.SCB);
	}
	
	$scope.toggleSCB = function ()
	{
		$scope.temp = SCB.getSCB();
		if ($scope.temp == true)
			SCB.setSCB(false);
		else if ($scope.temp == false)
			SCB.setSCB(true);
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
        alert($scope.settings.WDAM)
        $localstorage.set('WDAM', $scope.settings.WDAM)
        $localstorage.set('WDPM', $scope.settings.WDPM)
        $localstorage.set('WEAM', $scope.settings.WEAM)
        $localstorage.set('WEPM', $scope.settings.WEPM)
    }
})

.controller('prerecordCtrl', function ($scope, $location, $rootScope, SharedData, $state, $ionicLoading, $timeout)   {

    $scope.begin = function () {
        
		//Start unique name generator service
		
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


.controller('non_audioCtrl', function ($scope, $state) {
    
    $scope.data = {};
    $scope.data.numberSelection = 5;
  
    $scope.reviewandfinalise = function () {
        alert($scope.data.numberSelection + " " + $scope.data.comments);
        $state.go('review');
    }

})

.controller('reviewCtrl', function ($scope, $location, $http, $state) {

    $http.get('js/qdata.json').success(function (data) {
        $scope.quests = data;
    });

    //TODO: pull recording number from 

    $scope.reviewquestions = function (q) {
        $state.go('alpha', { testvar: q, mode: "Reviewing", filepath: null })
    }

    $scope.analytics = function () {
        alert("Saving for upload on Wi-Fi")
        $state.go('analytics')
		//TODO: SCB.set(true);
    }

})

.controller('analyticsCtrl', function ($scope, $state) {
    $scope.tomain = function () {
        $state.go('mainMenu')
    }
})

//PIPE IN SCB Service
.controller('alphaCtrl', function ($scope, $state, $stateParams, $http, $ionicLoading, $cordovaMedia, $timeout, $ionicPlatform, $cordovaFile, LoadData) {

	//initialisations. Pulling q# and mode out of the state
	$scope.testvar = $stateParams.testvar;
    $scope.flavour_text = $stateParams.mode;
	
	//Q_Audio source and media object, probably should rename
	var src;
	var media;
	var popover_sustain = 1800;
	//TODO: Pipe in a boolean about whether or not recording is complete
	var session_complete = false; //will be: SCB.getSCB()

	//Loading up question data from JSON file (kept external for reconfigurability)
    //Note: asynchronous call, forces me to wrap everything up here
	//TODO: pull out as a service 
    $http.get('js/qdata.json').success(function (data) {
        $scope.qd = data[$stateParams.testvar];
        var number_of_questions = data.length - 1;
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
    }
    else if ($stateParams.mode == "Replaying")
    {
        var fullpath = "/android_asset/www/questions/saved_question.m4a";
		alert(fullpath)
        media = new Media(fullpath, null, mediaError);
        media.play();
		var mediaError = function(e) {
        alert("error")
		}
		//TODO: replay
    }
    else if ($stateParams.mode == "Re-Recording")
    {
        //TODO: start recording
        //TODO: generate filename
        //TODO: Start phone-to-ear countdown animation
		
		//Generates a re-recording dpopover with instructions to put the phone up to one's ear
		$ionicLoading.show({ 
        template: '<html><body><h1>Re-recording question, please put the phone to your ear and speak directly</h1><ion-spinner class="ripple" icon="ripple"></ion-spinner></body></html>',
        animation: 'fade-in',
        showBackdrop: false,
        maxWidth: 80,
        showDelay: 0,
        duration: popover_sustain
		});
    }
    else if ($stateParams.mode == "Reviewing")
    {
         var fullpath = "/android_asset/www/questions/saved_question.m4a";
		alert(fullpath)
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
            //TODO: save recording
			if(media!=null)
				media.stop();
            $state.go('review')
        }
		if ($stateParams.mode == "Re-Recording" && session_complete == true)
        {
            //TODO: save recording
			if(media!=null)
				media.stop();
            $state.go('review')
        }
        else if ($stateParams.testvar < 6)
        {
            //TODO: save recording
            //TODO: pipe filepath to service
            if(media!=null)
				media.stop();
            $state.go('alpha', { testvar: $stateParams.testvar + 1, mode: "Recording", filepath: null })
        }
        else
			if(media!=null)
				media.stop();
            $state.go('non_audio');
			session_complete = true;
    }

    $scope.rerecord = function () {
        //TODO: dump recording
		if(media!=null)
				media.stop();
        $state.go('alpha', { testvar: $stateParams.testvar, mode: "Re-Recording", filepath: null })
    }

    $scope.replay = function () {
        //TODO: save recording
        //TODO: pipe filepath to service
		if(media!=null)
				media.stop();
        $state.go('alpha', { testvar: $stateParams.testvar, mode: "Replaying", filepath: null })
    }
})