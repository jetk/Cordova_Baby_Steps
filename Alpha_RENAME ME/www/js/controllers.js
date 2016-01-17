angular.module('app.controllers', [])

.controller('loginCtrl', function ($scope, LoginService, $ionicPopup, $state, $localstorage) {
    $scope.data = {};
    var metadata_filenames = new Array;

    if ($localstorage.get('firstrun') == "false") {
        $state.go('mainMenu')
    }

    $scope.login = function () {
        LoginService.loginUser($scope.data.username, $scope.data.password, $scope.data.instance).success(function (data) {
            $state.go('settings');
            $localstorage.set('uid', $scope.data.username);
            $localstorage.set('instance', $scope.data.instance);
            $localstorage.set('password', $scope.data.password);
            $localstorage.setArray('metadata_filenames', metadata_filenames)
        }).error(function (data) {
            var alertPopup = $ionicPopup.alert({
                title: 'Login failed!',
                template: 'Please check your credentials!'
            });
        });

    }
})

.controller('mainMenuCtrl', function ($scope, $state, $http, $localstorage, $rootScope, $cordovaNetwork, $cordovaFile, multibatch_uploader) {
    $scope.alpha = function () {
        $state.go('prerecord')
    }
    $scope.recorder = function () {
        $state.go('recorder')
    }
        



    //Checks if data exists already, only loads if not (to prevent saving over old names)
    if (JSON.stringify($localstorage.getObject('recording_names')) == "{}") {
        $http.get('js/qdata.json').success(function (data) {
            $localstorage.setObject('question_json', data)
            $localstorage.setObject('recording_names', data[0]['Q_Text'])
            alert("data initialised")
        })
    }

})


.controller('recorderCtrl', function ($scope, $state, $cordovaMedia, $ionicLoading, $cordovaFile, SCB, $localstorage, $cordovaLocalNotification, $rootScope, $cordovaNetwork, $http, $cordovaFileTransfer, fileUpload, $q, multibatch_uploader) {
    $scope.play = function (src) {
        var fullpath = "/android_asset/www/" + src;
        var media = new Media(fullpath, null, mediaError);
        media.play();
    }

    var mediaError = function (e) {
        alert("error")
        alert(JSON.stringify(e))
    }

    var filename = cordova.file.externalDataDirectory + "echo.wav";
    var recordedmedia = new Media(filename);
    $scope.aleph = $localstorage.getObject('recording_names')

    //@YF: please note you need to run a recording first in order for it to attempt upload

    $scope.record = function () {
        recordedmedia.startRecord();
    }

    $scope.stop = function () {
        recordedmedia.stopRecord();
        recordedmedia.release();
        alert(filename);
    }

    $scope.playback = function () {
        var playback = new Media(filename)
        playback.play();
    }

    $scope.add = function () {
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


    $scope.update = function () {
        $cordovaLocalNotification.update({
            id: 1,
            title: 'Title - UPDATED',
            text: 'Text - UPDATED'
        }).then(function (result) {
            // ...
        });
    }

    $scope.start = function () {
        alert('recording names:' + JSON.stringify($localstorage.getObject('recording_names')));
        //$localstorage.setsid();
    }

    $scope.show = function () {

        //alert($localstorage.getsid());
    }

    $scope.save = function () {

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

    $scope.delete = function () {
        alert(JSON.stringify($scope.aleph))
            //$cordovaFile.removeFile(cordova.file.externalDataDirectory, $scope.aleph.q1)
    }

    $scope.deleteRecursive = function () {
        //for (i = 0; i < $scope.aleph.length; i++)
        alert($scope.aleph["q1"]);

        for (var prop in $scope.aleph) {
            alert(prop + " = " + $scope.aleph[prop]);
        }

    }

    $scope.checkConnection = function () {
        var networkState = navigator.network.connection.type;

        var states = {};
        states[Connection.UNKNOWN] = 'Unknown connection';
        states[Connection.ETHERNET] = 'Ethernet connection';
        states[Connection.WIFI] = 'WiFi connection';
        states[Connection.CELL_2G] = 'Cell 2G connection';
        states[Connection.CELL_3G] = 'Cell 3G connection';
        states[Connection.CELL_4G] = 'Cell 4G connection';
        states[Connection.NONE] = 'No network connection';

        alert('Connection type: ' + states[networkState]);

    }

    $scope.setArray = function () {
        var array = ["Banana", "Orange", "Apple", "Mango"]
        $localstorage.setArray('array', array)
    }

    $scope.pushArray = function () {
        var array = $localstorage.getArray('array')
        array.push("Kiwi")
        $localstorage.setArray('array', array)
    }

    $scope.getArray = function () {
        var b = $localstorage.getArray('array')
        alert(b)
        alert(b[0])
        alert(b[1])
    }


    $scope.getMeta = function () {
        var metas = $localstorage.getArray('metadata_filenames')

        for (i = 1; i < metas.length; i++) {
            alert(metas[i])
            $cordovaFile.checkFile(cordova.file.externalDataDirectory, metas[i])
                .then(function (success) {
                    alert("found")
                }, function (error) {
                    alert("not found")
                });
        }
    }

    /*
    $scope.upload_and_delete_tradfor = function ()
    {    
        $scope.propername = null
        $scope.data_holder = {} //for eventually expanding the data object
        $scope.recording_names = {}
        var metas = $localstorage.getArray('metadata_filenames')
        console.log("all metafiles:"+JSON.stringify(metas))
        
        for (var metanum in metas)
        {
            //puts the metatdata json file's name into scope variable for access
            $scope.propername = metas[metanum];
            console.log("Checking for metafile: "+$scope.propername)
            
            //checks if file exists
            $cordovaFile.checkFile(cordova.file.externalDataDirectory, $scope.propername)
              .then(function (success) {
                //formats the filepath for $http
                 var filepath = cordova.file.externalDataDirectory +""+ $scope.propername
                 console.log("metadatafile found at: "+filepath)
                 
                 //uses $http.get to load directly into object that will hold individual recording names
                 $http.get(filepath).success(function (data) {
                     $scope.recording_names = data.rec_names
                     console.log("got recording names: "+JSON.stringify($scope.recording_names))
                     
                     //loops through each name and uploads / deletes file
                     for (var prop in $scope.recording_names)
                         {
                              var filename = cordova.file.externalDataDirectory + $scope.recording_names[prop]
                              var uploadurl = "http://longva.cs.ucl.ac.uk:9000/saveSoundFile?path=//home//figarski//Documents//SoundFiles//" + $scope.recording_names[prop]
                            console.log("will attempt to upload:"+filename)

                            var options = {
                                fileName: $scope.recording_names[prop], //"echo.wav",
                                chunkedMode: true,
                                mimeType: undefined,
                                headers: {'Content-Type':'audio/x-wav'}
                            };

                            $cordovaFileTransfer.upload(uploadurl, filename, options).then(function(result) {
                                console.log("uploaded: "+filename)
                                //alert("SUCCESS: " + JSON.stringify(result.response));
                                //$cordovaFile.removeFile(cordova.file.externalDataDirectory, $scope.propername);
                            }, function(err) {
                                alert("ERROR: " + JSON.stringify(err));
                                $cordovaFile.writeFile(cordova.file.externalDataDirectory, "upload_log.txt", JSON.stringify(err), true);
                            }, function (progress) {
                                // constant progress updates
                            });
                             //$cordovaFile.removeFile(cordova.file.externalDataDirectory, $scope.recording_names[prop])
                         }
                 }).error( function (){alert("error reading")});
            }, function (error) {alert("metadata file not found")});
        }
    }
    */



    $scope.JSON_filenames = $localstorage.getArray('metadata_filenames')
        //console.log("all metafiles:"+JSON.stringify($scope.JSON_filenames))

    $scope.recurse_filenames = function (JSON_filenames, i) {
        console.log("triggering JSON: " + JSON_filenames[i])
        $scope.recursive_upload(JSON_filenames[i]).then(function () {
            if (i < $scope.JSON_filenames.length) {
                $scope.recurse_filenames($scope.JSON_filenames, ++i)
            }
        })
    }

    $scope.trigger = function () {
        if ($scope.JSON_filenames.length > 1) {
            $scope.recurse_filenames($scope.JSON_filenames, 1);
        }
    }

    $scope.recursive_upload = function (namearray) {
        var filepath = cordova.file.externalDataDirectory + namearray
        $http.get(filepath).success(function (data) {
            $scope.recording_names = data.rec_names
            console.log("got recording names: " + JSON.stringify($scope.recording_names))

            //loops through each name and uploads / deletes file
            for (var prop in $scope.recording_names) {
                var filename = cordova.file.externalDataDirectory + $scope.recording_names[prop]
                    //var uploadurl = "http://longva.cs.ucl.ac.uk:9000/saveSoundFile?path=//home//figarski//Documents//SoundFiles//" + $scope.recording_names[prop]
                var uploadurl = "http://requestb.in/1cpqi0z1" //+ $scope.recording_names[prop]
                console.log("will attempt to upload:" + filename)

                var options = {
                    fileName: $scope.recording_names[prop], //"echo.wav",
                    chunkedMode: true,
                    mimeType: undefined,
                    headers: {
                        'Content-Type': 'audio/x-wav'
                    }
                };

                $cordovaFileTransfer.upload(uploadurl, filename, options).then(function (result) {
                    console.log("uploaded: " + filename)
                        //alert("SUCCESS: " + JSON.stringify(result.response));
                        //$cordovaFile.removeFile(cordova.file.externalDataDirectory, $scope.propername);
                }, function (err) {
                    alert("ERROR: " + JSON.stringify(err));
                    $cordovaFile.writeFile(cordova.file.externalDataDirectory, "upload_log.txt", JSON.stringify(err), true);
                }, function (progress) {
                    // constant progress updates
                });
                //$cordovaFile.removeFile(cordova.file.externalDataDirectory, $scope.recording_names[prop])
            }
        }).error(function () {
            alert("error reading")
        });
    }

    $scope.upload_and_delete = function () {
        $scope.propername = null
        $scope.data_holder = {} //for eventually expanding the data object
        $scope.recording_names = {}
        var metas = $localstorage.getArray('metadata_filenames')
        console.log("all metafiles:" + JSON.stringify(metas))

        for (var metanum in metas) {
            //puts the metatdata json file's name into scope variable for access
            $scope.propername = metas[metanum];
            console.log("Checking for metafile: " + $scope.propername)

            //checks if file exists
            $cordovaFile.checkFile(cordova.file.externalDataDirectory, $scope.propername)
                .then(function (success) {
                    //formats the filepath for $http
                    var filepath = cordova.file.externalDataDirectory + "" + $scope.propername
                    console.log("metadatafile found at: " + filepath)

                    //uses $http.get to load directly into object that will hold individual recording names
                    $http.get(filepath).success(function (data) {
                        $scope.recording_names = data.rec_names
                        console.log("got recording names: " + JSON.stringify($scope.recording_names))

                        //loops through each name and uploads / deletes file
                        for (var prop in $scope.recording_names) {
                            var filename = cordova.file.externalDataDirectory + $scope.recording_names[prop]
                            var uploadurl = "http://longva.cs.ucl.ac.uk:9000/saveSoundFile?path=//home//figarski//Documents//SoundFiles//" + $scope.recording_names[prop]
                            console.log("will attempt to upload:" + filename)

                            var options = {
                                fileName: $scope.recording_names[prop], //"echo.wav",
                                chunkedMode: true,
                                mimeType: undefined,
                                headers: {
                                    'Content-Type': 'audio/x-wav'
                                }
                            };

                            $cordovaFileTransfer.upload(uploadurl, filename, options).then(function (result) {
                                console.log("uploaded: " + filename)
                                    //alert("SUCCESS: " + JSON.stringify(result.response));
                                    //$cordovaFile.removeFile(cordova.file.externalDataDirectory, $scope.propername);
                            }, function (err) {
                                alert("ERROR: " + JSON.stringify(err));
                                $cordovaFile.writeFile(cordova.file.externalDataDirectory, "upload_log.txt", JSON.stringify(err), true);
                            }, function (progress) {
                                // constant progress updates
                            });
                            //$cordovaFile.removeFile(cordova.file.externalDataDirectory, $scope.recording_names[prop])
                        }
                    }).error(function () {
                        alert("error reading")
                    });
                }, function (error) {
                    alert("metadata file not found")
                });
        }
    }


    $scope.test_my_service = function () {
        var json_array = $localstorage.getArray('metadata_filenames')
        multibatch_uploader.doit(json_array);
        var metadata_filenames = new Array;
        $localstorage.setArray('metadata_filenames', metadata_filenames)

    }


    var jsfn = $localstorage.getArray('metadata_filenames')
    var loops = jsfn.length

    console.log("current metadata files" + JSON.stringify(jsfn))

    var asyncLoop = function (o) {
        var i = 0,
            length = o.length;

        var loop = function () {
            i++;
            if (i == length) {
                o.callback();
                return;
            }
            o.functionToLoop(loop, i);
        }
        loop(); //init
    }


    $scope.activate_uploads = function () {
        asyncLoop({
            length: loops,
            functionToLoop: function (loop, i) {
                console.log('Iteration ' + i);
                recursive_upload(i);
                loop();
            },
            callback: function () {
                var metadata_filenames = new Array;
                $localstorage.setArray('metadata_filenames', metadata_filenames)
                console.log('All uploads initiated!');
            }
        });
    }


    function recursive_upload(i) {
        var filepath = cordova.file.externalDataDirectory + jsfn[i]
        $http.get(filepath).success(function (data) {
            var recording_names = data.rec_names
            console.log("got recording names: " + JSON.stringify(recording_names))

            var my_promises = promised_upload(recording_names)

            function promised_upload(recording_name_array) {

                console.log("now tackling" + JSON.stringify(recording_name_array))
                var upload_promises = []

                for (var prop in recording_name_array) {
                    var filename = cordova.file.externalDataDirectory + recording_name_array[prop]
                    var uploadurl = "http://longva.cs.ucl.ac.uk:9000/saveSoundFile?path=//home//figarski//Documents//SoundFiles//" + recording_name_array[prop]
                    console.log("will attempt to upload: " + filename)
                    var options = {
                        fileName: recording_name_array[prop], //"echo.wav",
                        chunkedMode: true,
                        mimeType: undefined,
                        headers: {
                            'Content-Type': 'audio/x-wav'
                        }
                    };
                    var promise = $cordovaFileTransfer.upload(uploadurl, filename, options);
                    upload_promises.push(promise);
                }
                return $q.all(upload_promises)
            }


            my_promises.then(function (values) {
                console.log('done uploading')
                delete_files();
            })

            function delete_files() {
                for (var index in recording_names) {
                    console.log("attempting to delete " + recording_names[index])
                    $cordovaFile.removeFile(cordova.file.externalDataDirectory, recording_names[index])
                }
            }

        }).error(function () {
            alert("error reading")
        });
    }









    $scope.upload_and_delete_BACKUP = function () {
        $scope.propername = null
        $scope.data_holder = {} //for eventually expanding the data object
        $scope.recording_names = {}
        var metas = $localstorage.getArray('metadata_filenames')

        for (var metaname in metas) {
            //puts the metatdata json file's name into scope variable for access
            $scope.propername = metaname;

            //checks if file exists
            $cordovaFile.checkFile(cordova.file.externalDataDirectory, $scope.propername)
                .then(function (success) {

                    //formats the filepath for $http
                    var filepath = cordova.file.externalDataDirectory + "" + $scope.propername

                    //uses $http.get to load directly into object that will hold individual recording names
                    $http.get(filepath).success(function (data) {
                        $scope.recording_names = data.rec_names

                        //loops through each name and uploads / deletes file
                        for (var prop in $scope.recording_names) {
                            /*
                             
                            UPLOAD
                            CODE
                            GOES
                            HERE
                             
                             
                            ionic plugin add org.apache.cordova.file-transfer
                             
                            inject $cordovaFileTransfer
                             
                            */

                            // deletes file after upload
                            $cordovaFile.removeFile(cordova.file.externalDataDirectory, $scope.recording_names[prop])
                        }
                        //upload JSON

                        //Delete JSON
                        $cordovaFile.removeFile(cordova.file.externalDataDirectory, $scope.propername)
                    }).error(function () {
                        alert("error reading")
                    });
                }, function (error) {
                    alert("metadata file not found")
                });
        }
    }

    $scope.upload = function () {

        var filename = cordova.file.externalDataDirectory + "echo.wav"
        alert(filename)

        var options = {
            fileName: "echo.wav",
            chunkedMode: true,
            mimeType: undefined,
            headers: {
                'Content-Type': 'audio/x-wav'
            }
        };

        //"http://longva.cs.ucl.ac.uk:9000/saveSoundFile?path=//home//figarski//Documents//SoundFiles"

        $cordovaFileTransfer.upload("http://longva.cs.ucl.ac.uk:9000/saveSoundFile?path=//home//figarski//Documents//SoundFiles//echo.wav", filename, options).then(function (result) {
            alert("SUCCESS: " + JSON.stringify(result.response));
            $cordovaFile.writeFile(cordova.file.externalDataDirectory, "upload_log.txt", JSON.stringify(result), true)
        }, function (err) {
            alert("ERROR: " + JSON.stringify(err));
            $cordovaFile.writeFile(cordova.file.externalDataDirectory, "upload_log.txt", JSON.stringify(err), true);
        }, function (progress) {
            // constant progress updates
        });
    }

    $scope.post = function () {
        var data = {
            instance: "2",
            password: "bcdefg"
        };
        alert(JSON.stringify(data));
        var target_URL = "http://longva.cs.ucl.ac.uk:9000/login";

        $http.post(target_URL, JSON.stringify(data)).success(function (response) {
            alert(JSON.stringify(response))
        })

    }

    $scope.upload_service = function () {

        var filename = cordova.file.externalDataDirectory + "echo.wav";
        var url = "http://longva.cs.ucl.ac.uk:9000/saveSoundFile?path=//home//figarski//Documents//SoundFiles//echo.wav"

        fileUpload.uploadFileToUrl(filename, uploadUrl)
    }

    $scope.get_json_info = function () {

    }

    $scope.httpget = function () {
        /*
        var filename = cordova.file.externalDataDirectory + "echo.wav";
        
    var fd = new FormData();
    var url = "http://longva.cs.ucl.ac.uk:9000/saveSoundFile?path=home/figarski/Documents/SoundFiles/echo.wav"
    //Take the first selected file
    fd.append("file", filename);

    $http.post(url, fd, {
        withCredentials: true,
        headers: {'Content-Type': undefined },
        transformRequest: angular.identity
    }).success(function(data){
        alert(JSON.stringify(data))}
               .error(function(data){alert(JSON.stringify(data))});

    });
*/
    }

    $scope.httpgetlongva = function () {
        $http.get('http://longva.cs.ucl.ac.uk:9000/users').success(function (data) {
            alert(JSON.stringify(data))
        });
    }

    //"ftp://csrw.cs.ucl.ac.uk/cs/student/msc3/cs/2015/figarski/Desktop"

    /*
    $scope.betterMeta = function ()
    {    
        $scope.propername = null
        $scope.data_holder = {} //for eventually expanding the data object
        $scope.recording_names = {}
        var metas = $localstorage.getArray('metadata_filenames')
        
        for (i=1; i<metas.length; i++)
        {
            $scope.propername = metas[i]
            $cordovaFile.checkFile(cordova.file.externalDataDirectory, $scope.propername)
              .then(function (success) {
                 var filepath = cordova.file.externalDataDirectory +""+ $scope.propername
                 $http.get(filepath).success(function (data) {
                     $scope.recording_names = data
                     
                     alert("single extracted: "+$scope.recording_names.q1)
                     
                     for (var prop in $scope.recording_names)
                         {
                             alert(prop + " = " + $scope.recording_names[prop]);
                         }
                     
                 }).error(function (){alert("error reading")});
            }, function (error) {
                alert("not found")
            });
        }
    }
    */
})


.controller('settingsCtrl', function ($scope, $localstorage, $state, $cordovaLocalNotification, $cordovaNetwork, multibatch_uploader,$rootScope) {

    //pulls in a firstrun boolean, used to determine whether the 'save' or 'update' buttons are visible	
    $scope.firstrun = $localstorage.get('firstrun')
    console.log("localstorage firstrun: "+$localstorage.get('firstrun'))
    
    
    // Listens for whether the device is online (directely from ngCordova documentation)
    
    var upload_on_wifi = function () {
        // listen for Online event
        $rootScope.$on('$cordovaNetwork:online', function (event, networkState) {
            console.log("online")
            if ($cordovaNetwork.getNetwork() == Connection.WIFI) {
                console.log("wifi detected, attempting upload")
                var json_array = $localstorage.getArray('metadata_filenames')
                if (json_array.length > 1) {
                    console.log("files found, beginning upload")
                    multibatch_uploader.doit(json_array);
                    var metadata_filenames = new Array;
                    $localstorage.setArray('metadata_filenames', metadata_filenames)
                } else {
                    console.log("nothing to upload for now")
                }
            }
        })
        //listen for Offline event
        $rootScope.$on('$cordovaNetwork:offline', function (event, networkState) {
            console.log("going offline")
            var offlineState = networkState;
        })
    }

    if ($scope.firstrun == "false")
    {
        console.log("no additional event listener added")
    }
   else
       {
    console.log("scope firstun: "+$scope.firstrun)
    console.log("adding event listner")
    document.addEventListener("deviceready", upload_on_wifi, true);
       }
    


    $scope.settings = {
        WDAM: new Date($localstorage.get('WDAM')),
        WDPM: new Date($localstorage.get('WDPM')),
        //WEAM: '',
        //WEPM: ''
    };

    ($scope.firstrun) ? $scope.button_text = "UPDATE SETTINGS": $scope.button_text = "SAVE SETTINGS"


    var generate_times = function () {
        //saves to localstorage in case reminders fail
        $localstorage.set('WDAM', $scope.settings.WDAM)
        $localstorage.set('WDPM', $scope.settings.WDPM)

        /*
        $localstorage.set('WEAM', $scope.settings.WEAM)
        $localstorage.set('WEPM', $scope.settings.WEPM)
		*/

        //Creates components for alarm datetime
        var dd = new Date().getDate();
        var mm = new Date().getMonth() + 1;
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
            "WDAM": AM_datetime,
            "WDPM": PM_datetime
        }
    }


    $scope.save = function () {

        //Pulls in datetimes for notifications
        var datetime_object = generate_times()

        $cordovaLocalNotification.cancelAll();
        $cordovaLocalNotification.clearAll();

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
    /*
    $scope.saveBACKUP = function () {
		//saves to localstorage in case reminders fail
        $localstorage.set('WDAM', $scope.settings.WDAM)
		$localstorage.set('WDPM', $scope.settings.WDPM)
		
		
		
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
    */
})

.controller('prerecordCtrl', function ($scope, $location, $rootScope, SharedData, $state, $ionicLoading, $timeout, SCB, $localstorage) {



    $scope.yes_no_list = [
        {
            text: "Yes",
            value: 1
        },
        {
            text: "No",
            value: 0
        }
  ];

    $scope.serverSideChange = function (item) {
        console.log("Selected Serverside, text:", item.text, "value:", item.value);
    };

    $scope.data = {
        elsewhere: 9,
        sick: 9
    };


    $scope.begin = function () {
        //storing a flag that we are still recording (determines playback control)
        SCB.setSCB(false);
        $localstorage.setsid();

        //store info into localstorage
        $localstorage.set('elsewhere', $scope.data.elsewhere)
        $localstorage.set('sick', $scope.data.sick)

        //Generating an animated popover to prompt the user to return phone to ear
        $ionicLoading.show({
            template: '<html><body><h1>Getting ready to record! Please put phone to ear and answer the questions you hear</h1><div><img src="img/countdown.gif" /></div></body></html>',
            animation: 'fade-in',
            showBackdrop: false,
            maxWidth: 80,
            showDelay: 0,
            duration: 1800
        });
        $timeout(function () {
            $state.go('alpha', {
                testvar: 1,
                mode: "Recording",
                filepath: null
            });
        }, 1850);


        //TODO: convert to sliders, suck them into defined places in session_metadata

        //Generates a timestamped session ID for use with all recording names		

    }

})

.controller('non_audioCtrl', function ($scope, $state, SCB, $localstorage) {

    //Object that stores metadata for additional wellbeing information gathering
    $scope.data = {};
    //Sets a default for the mood slider
    $scope.data.numberSelection = 5;


    SCB.setSCB(false);

    $scope.reviewandfinalise = function () {
        //stores some metadata into local storage
        $localstorage.set('mood', $scope.data.numberSelection)
        $localstorage.set('comments', $scope.data.comments)
        $state.go('review');
    }

})

.controller('reviewCtrl', function ($scope, $location, $http, $state, SCB, $cordovaFile, $localstorage) {

    //Pulls in the Session ID and sets the filename for this session's metadata JSON
    var sid = $localstorage.getsid();
    var json_filename = sid + ".json";
    var uid = $localstorage.get('uid');

    //Pulls in recording session for the sake of display and thanking the user
    $scope.session_number = $localstorage.get('session_number');

    //Pulls in question_json for the short names of the recordings
    $scope.quests = $localstorage.getObject('question_json');

    $scope.metadata = {
        sessionIDExt: sid,
        sessionLocation: $localstorage.get('elsewhere'),
        sessionReference: $localstorage.get('mood'),
        sessionCondition: $localstorage.get('sick'),
        sessionComments: $localstorage.get('comments'),
        userID: uid,
        user_ID: uid
    }

    $scope.userdata = {
        userID: uid,
        instance: $localstorage.get('instance'),
        password: $localstorage.get('password'),
    }


    //Pulls in the recording names from local storage
    $scope.rec_names = $localstorage.getObject('recording_names');

    $scope.audio_file = {
        fileID: sid,
        fileName1: $scope.rec_names.q1,
        fileName2: $scope.rec_names.q2,
        fileName3: $scope.rec_names.q3,
        fileName4: $scope.rec_names.q4,
        fileName5: $scope.rec_names.q5,
        fileName6: $scope.rec_names.q6,
        fileTimestamp: $localstorage.get('javatimestamp'),
        fileSession: $localstorage.get('ampm'),
        filePath: "C:\folder",
        unique_sessionID: sid,
        userID: uid
    }


    $scope.data_for_json = {
        cell_user: $scope.userdata,
        audio_file: $scope.audio_file,
        recording_session: $scope.metadata,
        rec_names: $scope.rec_names
    }


    // TODO: Note that we used to use HTTP but then switched to localstorage

    //Sets the Session Complete Boolean to true, meaning that the advance button brings us to 
    SCB.setSCB(true);

    //Sends user to specific question they had selected for rerecording
    $scope.reviewquestions = function (q) {
        $state.go('alpha', {
            testvar: q,
            mode: "Reviewing",
            filepath: null
        })
    }

    $scope.analytics = function () {
        alert("Saving for upload on Wi-Fi")



        //creates the metadata JSON



        //writes metadata to JSON file
        $cordovaFile.writeFile(cordova.file.externalDataDirectory, json_filename, JSON.stringify($scope.data_for_json), true)
            .then(
                function (success) {
                    //on succes, pushes the metadata file's name to localstorage
                    var temp = $localstorage.getArray('metadata_filenames')
                    temp.push(json_filename);
                    $localstorage.setArray('metadata_filenames', temp)
                        //alert('SUCCESS3: ' + JSON.stringify(success));
                },
                function (error) {
                    alert('ERROR3: ' + JSON.stringify(error));
                });


        SCB.setSCB(false)
            /*TODO: lots of heavy lifting:
			>Save over 'recording_names' with 'question_json'[0]['Q_Text']
			>listen for WIFI
			>if WIFI, begin upload
		*/

        $state.go('mainMenu')
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

    //TODO: hide buttons until recorded


    /*
        document.addEventListener("deviceready", function () {
            alert("hello")
  }, false);
    */


    //initialisations. Pulling q# and mode out of the state
    $scope.testvar = $stateParams.testvar;
    $scope.flavour_text = $stateParams.mode;
    $scope.rec_names = $localstorage.getObject('recording_names')
    $scope.show_buttons = false;
    var sid = $localstorage.getsid();
    var unique_filename = sid + "_q" + $scope.testvar + ".wav"
    var rec_filepath = "Android/data/com.ionicframework.alpha540629/files/" + unique_filename
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
    src = "questions/" + $scope.qd.Q_Audio

    number_of_questions = $scope.questions_array.length - 1;

    var bca = $scope.questions_array[0]['Q_Number'];
    for (i = 0; i < number_of_questions; i++) {
        if (i < $stateParams.testvar)
            bca[i] = true;
        else
            bca[i] = false;
    }
    $scope.BreadCrumbArray = bca;



    //Control for different modes

    if ($stateParams.mode == "Recording") {
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
            var fullpath = "/android_asset/www/" + src;
            media = new Media(fullpath, null, mediaError);
            media.play();
            var mediaError = function (e) {
                alert("error")
            }
        }, popover_sustain);

        $timeout(function () {
            media.stop();
            media.release();
            $scope.show_buttons = true;
            recorder = new Media(rec_filepath);
            recorder.startRecord();
        }, 4000);
    } else if ($stateParams.mode == "Replaying") {
        $scope.show_buttons = true;

        var fullpath = rec_filepath;
        media = new Media(fullpath, null, mediaError);
        media.play();
        var mediaError = function (e) {
            alert("Error, file missing or corrupt")
        }
    } else if ($stateParams.mode == "Re-Recording") {
        $scope.show_buttons = true;


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
    } else if ($stateParams.mode == "Reviewing") {
        var fullpath = rec_filepath;
        $scope.show_buttons = true;

        media = new Media(fullpath, null, mediaError);
        media.play();
        var mediaError = function (e) {
            alert("error")
        }
    }


    //B

    $scope.advance = function () {
        if ($stateParams.mode == "Reviewing") {
            if (media != null) {
                media.stop();
                media.release();
            }
            $state.go('review')
        } else if ($stateParams.mode == "Re-Recording" && $scope.session_complete == true) {
            if (recorder != null) {
                recorder.stopRecord();
                recorder.release();
            }
            $state.go('review')
        } else if ($stateParams.testvar < number_of_questions) {
            if (recorder != null) {
                recorder.stopRecord();
                recorder.release();
            }
            $scope.rec_names["q" + $scope.testvar] = unique_filename
            $localstorage.setObject('recording_names', $scope.rec_names);
            $state.go('alpha', {
                testvar: $stateParams.testvar + 1,
                mode: "Recording",
                filepath: null
            })
        } else if ($stateParams.testvar == number_of_questions) {
            if (recorder != null) {
                recorder.stopRecord();
                recorder.release();
            }
            $scope.rec_names["q" + $scope.testvar] = unique_filename
            $localstorage.setObject('recording_names', $scope.rec_names);
            $state.go('non_audio');
        }
    }

    $scope.rerecord = function () {
        if (recorder != null) {
            recorder.stopRecord();
            recorder.release();
        }
        $state.go('alpha', {
            testvar: $stateParams.testvar,
            mode: "Re-Recording",
            filepath: null
        })
    }

    $scope.replay = function () {
        if (recorder != null) {
            recorder.stopRecord();
            recorder.release();
        }
        $scope.rec_names["q" + $scope.testvar] = unique_filename //rec_filepath;
        $localstorage.setObject('recording_names', $scope.rec_names);
        $state.go('alpha', {
            testvar: $stateParams.testvar,
            mode: "Replaying",
            filepath: null
        })
    }
})

.controller('testsCtrl', function ($scope, $state, $cordovaMedia, $ionicLoading, $cordovaFile, SCB, $localstorage, $cordovaLocalNotification, $rootScope, $cordovaNetwork, $http, $cordovaFileTransfer, fileUpload, $q) {

    //read the metanames from localstorage

    //outer loop

    //http get first recording names

    //then for each recording name, pass it into upload service
    //maybe: structure the upload as a service, have it return a promise
    //once those promises are resolved, do delete the files

    //use $q all to hold promises of upload, then start next loop?


    //a function that returns http.post (which returns a promise)

    /*
    var allPromise = $q.all([  
    post(1),
    post(2),
    post(3),
    ]);
    
    function post(i){
        return $http.post("http://requestb.in/16ll6du1",{fizz:i})    
    }
    
    allPromise.then(function(values) {  
    console.log('value #1: '+JSON.stringify(values[0]))
    console.log('value #1: '+JSON.stringify(values[1]))
    console.log('value #1: '+JSON.stringify(values[2]))
    console.log('done');
});
    */
    /*
    var queso = {
        question_1: "bapple",
        question_2: "banana",
        question_3: "bear"
    }



    function shodan(questions) {

        var promises = []

        angular.forEach(questions, function (question) {

            var promise = $http({
                url: 'http://requestb.in/16ll6du1',
                method: 'POST',
                data: question
            });

            promises.push(promise);

        });

        return $q.all(promises);
    }


    var barray = ["kilo", "lima", "uniform", "golf"]

    var my_promises = nodens(barray);

    function nodens(barray) {

        var promises = []

        for (i = 0; i < barray.length; i++) {
            console.log("posting " + i)

            var promise = $http({
                url: 'http://requestb.in/16ll6du1',
                method: 'POST',
                data: barray[i]
            });

            promises.push(promise);

        }


        return $q.all(promises);
    }

    my_promises.then(function (values) {
        console.log('donezo')
        for (var index in values) {
            console.log(JSON.stringify(values[index]))
        }
    })


    */

    var jsfn = $localstorage.getArray('metadata_filenames')

    var filepath = cordova.file.externalDataDirectory + "" + jsfn[1]

    //BASE

    $http.get(filepath).success(function (metadata) {
        var promises = []
        var baseURL = "http://longva.cs.ucl.ac.uk:9000"
        var url1 = baseURL + "/login"
        var url2 = baseURL + "/storeRecMdata"
        var url3 = baseURL + "/storeSessionMdata"

        function post1() {
            return $http.post(url1, metadata)
        }

        function post2() {
            return $http.post(url2, metadata)
        }

        function post3() {
            return $http.post(url3, metadata)
        }

        promises.push(post1());
        promises.push(post2());
        promises.push(post3());

        var all_promises = $q.all(promises)

        all_promises.then(function (responses) {
            for (var index in responses) {
                console.log(JSON.stringify(responses[index]))
            }
        })

    })

})