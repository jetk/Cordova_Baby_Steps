// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('app', ['ionic', 'ngCordova', 'app.controllers', 'app.routes', 'app.services', 'app.directives'])

.run(function($ionicPlatform, $ionicPopup) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
      /*
    if(window.Connection) {
                if(navigator.connection.type == Connection.WIFI) {
                    $ionicPopup.confirm({
                        title: "Connected to WIFI",
                        content: "Connected."
                    })
                    .then(function(result) {
                        if(!result) {
                            ionic.Platform.exitApp();
                        }
                    });
                }
            }
      */
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }


    if(window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();

    }
  });
}).config(function($ionicConfigProvider) {
  $ionicConfigProvider.views.maxCache(0);
});