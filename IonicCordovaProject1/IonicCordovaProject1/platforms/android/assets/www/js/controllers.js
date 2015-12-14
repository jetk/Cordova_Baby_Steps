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

.controller('recorderCtrl', function ($scope, $state, $cordovaMedia, $ionicLoading) {

    //IONIC RESTORE STATE

    var media = null;

    $scope.Play = function (src) {
        if (media == null) {
            alert("initialising")
            media = $cordovaMedia.newMedia(src, null, null, mediaStatusCallback);
        }
        media.play();
    }

    $scope.stopPlay = function () {
        media.stop();
    }

    $scope.pausePlay = function () {
        media.pause();
    }

    var mediaStatusCallback = function (status) {
        if (status == 1) {
            $ionicLoading.show({ template: 'Loading...' });
        } else {
            $ionicLoading.hide();
        }
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
        //SharedData.setq(0);
        //$state.go('question', {reload:true});
        //$rootScope.initialise();
        $ionicLoading.show({
            template: '<html><body><h1>Getting ready to record! Please put phone to ear and answer the questions you hear</h1><div><img src="../img/countdown.gif" /></div></body></html>',
            animation: 'fade-in',
            showBackdrop: false,
            maxWidth: 80,
            showDelay: 0,
        });
        $timeout(function () {
            $ionicLoading.hide();
            $state.go('alpha', { testvar: 1, mode: "Recording", filepath: null });
        }, 1850);

        //$state.go('alpha', { testvar: 1, mode: "Recording", filepath: null })
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
    }

})

.controller('analyticsCtrl', function ($scope, $state) {
    $scope.tomain = function () {
        $state.go('mainMenu')
    }
})

.controller('alphaCtrl', function ($scope, $state, $stateParams, $http, $ionicLoading, $timeout, LoadData) {


    /*
    if ($stateParams.mode == "Recording")
    {
        //TODO: start recording
        //TODO: generate filename
        //TODO: Start phone-to-ear countdown animation
    }
    else if ($stateParams == "Replaying")
    {
        //TODO: replay
    }
    else if ($stateParams == "Re-Recording")
    {
        //TODO: start recording
        //TODO: generate filename
        //TODO: Start phone-to-ear countdown animation
    }
    else if ($stateParams == "Reviewing")
    {
        //TODO: start recording
        //TODO: generate filename
        //TODO: Start phone-to-ear countdown animation
    }
    */

    $ionicLoading.show({ 
        template: '<html><body><h1>Recording, please put phone to ear</h1><ion-spinner class="ripple" icon="ripple"></ion-spinner></body></html>',
        animation: 'fade-in',
        showBackdrop: false,
        maxWidth: 80,
        showDelay: 0,
        duration: 1800
    });

    /*
    // Decide whether to use this to then kickstart recording
    $timeout(function () {
        $ionicLoading.hide();
    }, 1700);
    */

    $scope.testvar = $stateParams.testvar;
    $scope.flavour_text = $stateParams.mode;

    /*
    var questions = LoadData.getqd();
    alert(questions.length)
    $scope.qd = questions[$stateParams.testvar];
    var number_of_questions = $scope.questions.length - 1;
    var bca = new Array();
    for (i = 0 ; i < number_of_questions ; i++) {
        if (i < $stateParams.testvar)
            bca[i] = true;
        else
            bca[i] = false;
    }
    $scope.BreadCrumbArray = bca;
    */

     
    //Note: asynchronous call, forces me to wrap everything up here
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
    })  
   
    

    $scope.advance = function ()
    {
        if ($stateParams.mode == "Reviewing")
        {
            //TODO: save recording
            $state.go('review')
        }
        else if ($stateParams.testvar < 6)
        {
            //TODO: save recording
            //TODO: pipe filepath to service
            $state.go('alpha', { testvar: $stateParams.testvar + 1, mode: "Recording", filepath: null })
        }
        else
            $state.go('non_audio');
    }

    $scope.rerecord = function () {
        //TODO: dump recording
        $state.go('alpha', { testvar: $stateParams.testvar, mode: "Re-Recording", filepath: null })
    }

    $scope.replay = function () {
        //TODO: save recording
        //TODO: pipe filepath to service
        $state.go('alpha', { testvar: $stateParams.testvar, mode: "Replaying", filepath: null })
    }
})