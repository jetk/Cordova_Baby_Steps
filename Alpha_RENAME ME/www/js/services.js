angular.module('app.services', [])

.service('LoginService', function ($q) {
    return {
        loginUser: function (name, pw, inst) {
            var deferred = $q.defer();
            var promise = deferred.promise;

            var key_pair = {
                alpha: {
                    pw: "secret",
                    inst: 1
                },
                beta: {
                    pw: "bcdefg",
                    inst: 2
                },
                gamma: {
                    pw: "b",
                    inst: 3
                },
                "123456": {
                    pw: "d",
                    inst: 4
                }
            }

            if (key_pair[name].pw == pw && key_pair[name].inst == inst) {
                deferred.resolve('Welcome ' + name + '!');
            } else {
                deferred.reject('Wrong credentials.');
            }
            promise.success = function (fn) {
                promise.then(fn);
                return promise;
            }
            promise.error = function (fn) {
                promise.then(null, fn);
                return promise;
            }
            return promise;
        }
    }
})


.service('fileUpload', ['$http', function ($http) {
    this.uploadFileToUrl = function (file, uploadUrl) {
        var fd = new FormData();
        fd.append('file', file);
        $http.post(uploadUrl, fd, {
                transformRequest: angular.identity,
                headers: {
                    'Content-Type': undefined
                }
            })
            .success(function () {})
            .error(function () {});
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
            SCB = value;
        }
    };

}])


.factory('$localstorage', ['$window', function ($window) {
    return {
        set: function (key, value) {
            $window.localStorage[key] = value;
        },
        get: function (key, defaultValue) {
            return $window.localStorage[key] || defaultValue;
        },
        setArray: function (key, value) {
            $window.localStorage[key] = value;
        },
        getArray: function (key, defaultValue) {
            var array_as_string = $window.localStorage[key]
            var array = array_as_string.split(",")
            return array || defaultValue;
        },
        setObject: function (key, value) {
            $window.localStorage[key] = JSON.stringify(value);
        },
        getObject: function (key) {
            return JSON.parse($window.localStorage[key] || '{}');
        },
        setsid: function () {

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
            var mm = today.getMonth() + 1;
            var yyyy = today.getFullYear();
            if (dd < 10)
                dd = '0' + dd
            if (mm < 10)
                mm = '0' + mm

            var isotime = yyyy + "-" + mm + "-" + dd + "-" + hours + "h" + mins + "m"
            var javatime = yyyy + "-" + mm + "-" + dd + " " + hours + ":" + mins + ":00"

            var ampm
            hours >= 13 ? ampm = "PM" : "AM"

            $window.localStorage['ampm'] = ampm
            $window.localStorage['timestamp'] = isotime
            $window.localStorage['javatimestamp'] = javatime
        },
        getsid: function () {
            var uid = $window.localStorage['uid'];
            var session_number = $window.localStorage['session_number']
            var ampm = $window.localStorage['ampm']
            if (session_number < 10) {
                session_number = "000" + session_number
            } else if (session_number < 100 && session_number > 10) {
                session_number = "00" + session_number
            } else if (session_number < 1000 && session_number > 100) {
                session_number = "0" + session_number
            }
            var timestamp = $window.localStorage['timestamp']

            return uid + "_" + session_number + "_" + timestamp + "_" + ampm
        }
    }
}])

.factory('QuestionData', [function ($http) {

    var questionFactory = {};

    var returndata;
    questionFactory.datagetter = function () {
        $http.get('js/qdata.json')
            .success(function (data) {
                returndata = data
            })
    }

    return {
        get: function () {
            return returndata
        }
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
        resetbc: function () {
            for (i = 0; i < bc.length; i++)
                bc[i] = 0;
        }
    };

}])

.service('BlankService', [function () {

}])


.factory('multibatch_uploader', ['$cordovaFile', '$localstorage', '$cordovaFileTransfer', '$q', '$http', function ($cordovaFile, $localstorage, $cordovaFileTransfer, $q, $http) {

    return {
        doit: function (jsfn) {
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


            asyncLoop({
                length: loops,
                functionToLoop: function (loop, i) {
                    console.log('Iteration ' + i);
                    recursive_upload(i);
                    loop();
                },
                callback: function () {
                    var metadata_filenames = new Array;
                    console.log('All uploads initiated!');
                }
            });



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
                        post_to_database();
                    })

                    function delete_files() {
                        for (var index in recording_names) {
                            console.log("attempting to delete " + recording_names[index])
                            $cordovaFile.removeFile(cordova.file.externalDataDirectory, recording_names[index])
                        }
                    }

                    function post_to_database() {
                        console.log("posting metatdata")
                        var post_promises = []
                        var baseURL = "http://longva.cs.ucl.ac.uk:9000"
                        var url1 = baseURL + "/login"
                        var url2 = baseURL + "/storeRecMdata"
                        var url3 = baseURL + "/storeSessionMdata"
                        post_promises.push($http.post(url1, data))
                        post_promises.push($http.post(url2, data))
                        post_promises.push($http.post(url3, data))


                        function post1() {
                            return $http.post(url1, data)
                        }

                        function post2() {
                            return $http.post(url2, data)
                        }

                        function post3() {
                            return $http.post(url3, data)
                        }

                        post_promises.push(post1());
                        post_promises.push(post2());
                        post_promises.push(post3());

                        var all_post_promises = $q.all(post_promises)

                        all_post_promises.then(function (post_responses) {
                            for (var index in post_responses) {
                                console.log(JSON.stringify(post_responses[index]))
                            }
                        })
                    }

                }).error(function () {
                    alert("error reading")
                });
            }
        }
    }
}])


/*
.service('multibatch_uploader', [function ($cordovaFile, $localstorage, $cordovaFileTransfer, $q, $http) {
    return {
        activate: function (jsfn) {
            
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


            asyncLoop({
                length: loops,
                functionToLoop: function (loop, i) {
                    console.log('Iteration ' + i);
                    recursive_upload(i);
                    loop();
                },
                callback: function () {
                    var metadata_filenames = new Array;
                    console.log('All uploads initiated!');
                }
            });



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

        }
    }
}])
*/
.service('SessionID', [function ($localstorage) {

    var sid = null

    return {
        nextsid: function () {
            var temp = $localstorage.get('session_number');
            if (temp > 0)
                $localstorage.set('session_number', 1 + temp);
            else
                $localstorage.set('session_number', 1);
            var time = new Date().getTime();
            $localstorage.set('timestamp', date);
        },
        getsid: function () {
            var uid = $localstorage.get('uid')
            var session_number = $localstorage.get('session_number')
            var timestamp = $localstorage.get('timestamp')
            sid = uid + "_" + session_number + "_" + timestamp
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

.service('BlankService', [function ($ionicPopover, $ionicLoading) {
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