// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
var app = angular.module('grimario', ['ionic', 'ngCordova','lokijs', 'textAngular', 'grimario.controllers', 'grimario.services'])

        .constant('urlBase', 'http://grimario.grimorum.com/api/')
        //.constant('urlBase', 'http://localhost/grimario/public/api/')
        
        //.value('_db')

        .run(function($ionicPlatform) {
            $ionicPlatform.ready(function() {
                // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
                // for form inputs)
                if (window.cordova && window.cordova.plugins.Keyboard) {
                    cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
                    cordova.plugins.Keyboard.disableScroll(true);

                }
                if (window.StatusBar) {
                    // org.apache.cordova.statusbar required
                    StatusBar.styleDefault();
                }
                
            });
        })

        .config(function($stateProvider, $urlRouterProvider) {
            $stateProvider

                    .state('welcome', {
                        url: '/welcome',
                        templateUrl: "views/welcome.html",
                        controller: 'WelcomeCtrl'
                    })

                    .state('app', {
                        url: '/app',
                        abstract: true,
                        templateUrl: 'views/menu.html',
                        controller: 'AppCtrl'
                    })
                    
                    .state('task', {
                        url: '/task',
                        abstract: true,
                        templateUrl: 'views/menu.html',
                        controller: 'AppCtrl'
                    })
                    
                    
                    .state('task.dash', {
                        url: '/dash',
                        views: {
                            'menuContent': {
                                templateUrl: 'views/dash.html',
                                controller: 'DashCtrl'
                            }
                        }
                    })

                    
                    .state('task.show', {
                        url: '/show/:taskId',
                        views: {
                            'menuContent': {
                                templateUrl: 'views/tasks/task.html',
                                controller: 'TaskCtrl'
                            }
                        }
                    })
                    .state('task.pause', {
                        url: '/pause/:taskId',
                        views: {
                            'menuContent': {
                                templateUrl: 'views/tasks/pause.html',
                                controller: 'TaskPauseCtrl'
                            }
                        }
                    })

                    .state('task.list', {
                        url: '/list',
                        views: {
                            'menuContent': {
                                templateUrl: 'views/tasks/tasks.html',
                                controller: 'TasksCtrl'
                            }
                        }
                    })
                    
                                       
                    .state('task.costc', {
                        url: '/costc/:taskId',
                        views: {
                            'menuContent': {
                                templateUrl: 'views/costs/create.html',
                                controller: 'CostCtrl'
                            }
                        }
                    })
                    .state('task.costs', {
                        url: '/costs/:taskId',
                        views: {
                            'menuContent': {
                                templateUrl: 'views/costs/list.html',
                                controller: 'CostsCtrl'
                            }
                        }
                    })
                    .state('task.comment', {
                        url: '/comment/:commentId',
                        views: {
                            'menuContent': {
                                templateUrl: 'views/comments/show.html',
                                controller: 'CommentCtrl'
                            }
                        }
                    })
                    .state('task.commentc', {
                        url: '/commentc/:taskId',
                        views: {
                            'menuContent': {
                                templateUrl: 'views/comments/create.html',
                                controller: 'CommentcCtrl'
                            }
                        }
                    })
                    .state('task.comments', {
                        url: '/comments/:taskId',
                        views: {
                            'menuContent': {
                                templateUrl: 'views/comments/list.html',
                                controller: 'CommentsCtrl'
                            }
                        }
                    })
                    .state('app.pros', {
                        url: '/pros',
                        views: {
                            'menuContent': {
                                templateUrl: 'views/playlists.html',
                                controller: 'ProsCtrl'
                            }
                        }
                    })

                    .state('app.pro', {
                        url: '/pros/:playlistId',
                        views: {
                            'menuContent': {
                                templateUrl: 'views/playlist.html',
                                controller: 'ProCtrl'
                            }
                        }
                    });
            // if none of the above states are matched, use this as the fallback
            $urlRouterProvider.otherwise('/welcome');
        });

app.directive('dynamicModel', ['$compile', function($compile) {
        return {
            'link': function(scope, element, attrs) {
                scope.$watch(attrs.dynamicModel, function(dynamicModel) {
                    if (attrs.ngModel == dynamicModel || !dynamicModel)
                        return;

                    element.attr('ng-model', dynamicModel);
                    if (dynamicModel == '') {
                        element.removeAttr('ng-model');
                    }

                    // Unbind all previous event handlers, this is 
                    // necessary to remove previously linked models.
                    element.unbind();
                    $compile(element)(scope);
                });
            }
        };
    }]);