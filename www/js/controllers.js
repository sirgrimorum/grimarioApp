angular.module('grimario.controllers', [])

        .controller('WelcomeCtrl', function($scope, $state, UserService, Login, SessionService, $ionicLoading) {
            // Form data for the login modal
            $scope.loginData = {};

            $scope.doLogin = function() {
                $ionicLoading.show({
                    template: 'Autenticando...'
                });
                //console.log('Doing login', $scope.loginData);
                var auth = Login.auth($scope.loginData);
                auth.success(function(response) {
                    console.log(response);
                    SessionService.unset('auth');
                    SessionService.unset('user');
                    $ionicLoading.hide();
                    if (response.result == 0) {
                        SessionService.set('auth', true);
                        SessionService.set('user', response.user);
                        $state.go('app.dash');
                    } else if (response.result == 1) {
                        alert(response.message.email + "\n" + response.message.password);
                    } else {
                        alert(response.message);
                    }
                });
            }

            $scope.showBtnGoogle = false;
            /*window.plugins.googleplus.isAvailable(
             function(available) {
             if (available) {
             $scope.showBtnGoogle = true;
             }
             }
             );*/

            //This method is executed when the user press the "Login with Google" button
            $scope.googleSignIn = function() {
                $ionicLoading.show({
                    template: 'Logging in...'
                });

                window.plugins.googleplus.login(
                        {},
                        function(user_data) {
                            console.log(user_data);

                            //for the purpose of this example I will store user data on local storage
                            UserService.setUser({
                                userID: user_data.userId,
                                name: user_data.displayName,
                                email: user_data.email,
                                picture: user_data.imageUrl,
                                accessToken: user_data.accessToken,
                                idToken: user_data.idToken
                            });

                            $ionicLoading.hide();
                            $state.go('app.dash');
                        },
                        function(msg) {
                            $ionicLoading.hide();
                            console.log(msg);
                        }
                );
            };
        })

        .controller('AppCtrl', function($scope, $state, SessionService, Login, $ionicLoading, $ionicModal, $timeout) {
            if (SessionService.get('auth') == true) {
                // With the new view caching in Ionic, Controllers are only called
                // when they are recreated or on app start, instead of every page change.
                // To listen for when this page is active (for example, to refresh data),
                // listen for the $ionicView.enter event:
                //$scope.$on('$ionicView.enter', function(e) {
                //});

                $scope.user = SessionService.get('user');
                $scope.logout = function() {
                    $ionicLoading.show({
                        template: 'Cerrando sesión...'
                    });
                    var logout = Login.logout();
                    logout.success(function(response) {
                        console.log(response);
                        SessionService.unset('auth');
                        SessionService.unset('user');
                        $ionicLoading.hide();
                        $state.go('welcome');
                    });
                };

                /*
                 // Form data for the login modal
                 $scope.loginData = {};
                 
                 // Create the login modal that we will use later
                 $ionicModal.fromTemplateUrl('templates/login.html', {
                 scope: $scope
                 }).then(function(modal) {
                 $scope.modal = modal;
                 });
                 
                 // Triggered in the login modal to close it
                 $scope.closeLogin = function() {
                 $scope.modal.hide();
                 };
                 
                 // Open the login modal
                 $scope.login = function() {
                 $scope.modal.show();
                 };*/

            } else {
                $state.go('welcome');
            }

        })

        .controller('DashCtrl', function($scope, FavTasks, SessionService) {

            $scope.tasks = FavTasks.all();
            $scope.remove = function(task) {
                FavTasks.remove(task);
            };
            $scope.start = function(task) {
                FavTasks.remove(task);
            };

        })

        .controller('TaskCtrl', function($scope, $state, $stateParams, Tasks, FavTasks, SessionService, $ionicLoading, $ionicHistory) {
            $scope.task = Tasks.get($stateParams.taskId);
            console.log($state.current);
            $scope.fav = function(task) {
                FavTasks.add(task);
            };
            $scope.isFav = function(task) {
                return FavTasks.isFav(task);
            };
            $scope.unFav = function(task) {
                FavTasks.remove(task);
            };
            $scope.start = function(task) {
                $ionicLoading.show({
                    template: 'Creando la jornada de trabajo...'
                });
                Tasks.start(task, SessionService.get('user'))
                        .success(function(response) {
                            $ionicLoading.hide();
                            if (response.result == 0) {
                                console.log(response);
                                $ionicLoading.show({
                                    template: 'Cargando...'
                                });
                                Tasks.load(SessionService.get('user'))
                                        .success(function(data) {
                                            $ionicLoading.hide();
                                            if (data === false) {
                                            } else {
                                                //console.log(data);
                                                Tasks.set(data);
                                            }
                                            //$route.reload();
                                            $ionicHistory.clearCache();
                                            $state.go($state.current, {'taskId': $scope.task.id}, {reload: true});
                                        });
                            } else {
                                alert("Error con la tarea \n");
                                console.log(response);
                            }
                        })
                        .error(function(data) {
                            alert("Error desconocido");
                            $ionicLoading.hide();
                            console.log(data);
                        });
            };
        })

        .controller('TaskPauseCtrl', function($scope, $state, $http, $stateParams, $ionicLoading, Tasks, SessionService, $ionicHistory) {
            $scope.task = Tasks.get($stateParams.taskId);
            $scope.taskData = {
                'task_id': $scope.task.id,
                'work_id': $scope.task.work.id,
                'dpercentage': $scope.task.dpercentage,
            };
            $scope.eval = $scope.$eval;
            $scope.pauseTask = function() {
                if ($scope.taskData.dpercentage == undefined) {
                    $scope.taskData.dpercentage = $scope.task.dpercentage;
                }
                console.log($scope.taskData);
                $ionicLoading.show({
                    template: 'Cerrando la jornada de trabajo...'
                });

                // save the comment. pass in comment data from the form
                // use the function we created in our service
                Tasks.pause($scope.taskData)
                        .success(function(response) {
                            $ionicLoading.hide();
                            if (response.result == 0) {
                                console.log(response);
                                $ionicLoading.show({
                                    template: 'Cargando...'
                                });
                                Tasks.load(SessionService.get('user'))
                                        .success(function(data) {
                                            $ionicLoading.hide();
                                            if (data === false) {
                                            } else {
                                                //console.log(data);
                                                Tasks.set(data);
                                            }
                                            $ionicHistory.clearCache();
                                            $state.go('task.show', {'taskId': $scope.task.id}, {reload: true});
                                        });

                            } else if (response.result == 1) {
                                alert("Error con la jornada \n");
                                console.log(response);
                            } else {
                                alert("Error con la tarea \n");
                                console.log(response);
                            }
                        })
                        .error(function(data) {
                            alert("Error desconocido");
                            $ionicLoading.hide();
                            console.log(data);
                        });
            };
        })

        .controller('TasksCtrl', function($scope, $http, Tasks, FavTasks, $ionicLoading, SessionService) {
            //console.log("1", Tasks.get().length);
            if (Tasks.getall().length == 0) {
                $ionicLoading.show({
                    template: 'Cargando...'
                });
                Tasks.load(SessionService.get('user'))
                        .success(function(data) {
                            $ionicLoading.hide();
                            if (data === false) {
                                $scope.tasks = {};
                            } else {
                                Tasks.set(data);
                                //console.log("2", Tasks.get().length);
                                console.log(data);
                                $scope.tasks = data;
                            }
                        });
            } else {
                $scope.tasks = Tasks.getall();
            }
            $scope.reLoad = function() {
                $ionicLoading.show({
                    template: 'Cargando...'
                });
                Tasks.load(SessionService.get('user'))
                        .success(function(data) {
                            $ionicLoading.hide();
                            if (data === false) {
                                $scope.tasks = {};
                            } else {
                                console.log(data);
                                Tasks.set(data);
                                $scope.tasks = data;
                            }
                        });
            };
            $scope.fav = function(task) {
                FavTasks.add(task);
            };
            $scope.isFav = function(task) {
                return FavTasks.isFav(task);
            };
            $scope.unFav = function(task) {
                FavTasks.remove(task);
            };
        })

        .controller('CostsCtrl', function($scope, $http, $stateParams, Tasks, Costs, $ionicLoading) {
            $ionicLoading.show({
                template: 'Cargando...'
            });
            $scope.task = Tasks.get($stateParams.taskId);
            Costs.load($stateParams.taskId)
                    .success(function(data) {
                        $ionicLoading.hide();
                        if (data === false) {
                            $scope.costs = {};
                        } else {
                            console.log(data);
                            $scope.costs = data;
                        }
                    });

            $scope.reLoad = function() {
                $ionicLoading.show({
                    template: 'Cargando...'
                });
                Costs.load($stateParams.taskId)
                        .success(function(data) {
                            $ionicLoading.hide();
                            if (data === false) {
                                $scope.costs = {};
                            } else {
                                console.log(data);
                                $scope.costs = data;
                            }
                        });
            };
        })
        .controller('CostCtrl', function($scope, $state, $http, $stateParams, $ionicLoading, Tasks, Costs, SessionService, $ionicHistory) {
            $scope.task = Tasks.get($stateParams.taskId);
            $scope.user = SessionService.get('user');
            $scope.costData = {
                'user_id': $scope.user.id,
                'work_id': $scope.task.work.id,
            };
            $scope.eval = $scope.$eval;
            $scope.createCost = function() {

                console.log($scope.costData);
                $ionicLoading.show({
                    template: 'Guardando gasto...'
                });

                // save the comment. pass in comment data from the form
                // use the function we created in our service
                Costs.create($scope.costData)
                        .success(function(response) {
                            $ionicLoading.hide();
                            if (response.result == 0) {
                                console.log(response);
                                $ionicLoading.show({
                                    template: 'Cargando...'
                                });
                                Tasks.load(SessionService.get('user'))
                                        .success(function(data) {
                                            $ionicLoading.hide();
                                            if (data === false) {
                                            } else {
                                                //console.log(data);
                                                Tasks.set(data);
                                            }
                                            $ionicHistory.clearCache();
                                            $state.go('task.show', {'taskId': $scope.task.id}, {reload: true});
                                        });

                            } else {
                                alert("Error creando el gasto \n");
                                console.log(response);
                            }
                        })
                        .error(function(data) {
                            alert("Error desconocido");
                            $ionicLoading.hide();
                            console.log(data);
                        });
            };
        })
        .controller('CommentsCtrl', function($scope, $http, $stateParams, Tasks, Comments, $ionicLoading) {
            $ionicLoading.show({
                template: 'Cargando...'
            });
            $scope.task = Tasks.get($stateParams.taskId);
            Comments.load($stateParams.taskId)
                    .success(function(data) {
                        $ionicLoading.hide();
                        if (data === false) {
                            $scope.comments = {};
                        } else {
                            console.log(data);
                            $scope.comments = data;
                        }
                    });

            $scope.reLoad = function() {
                $ionicLoading.show({
                    template: 'Cargando...'
                });
                Comments.load($stateParams.taskId)
                        .success(function(data) {
                            $ionicLoading.hide();
                            if (data === false) {
                                $scope.comments = {};
                            } else {
                                console.log(data);
                                $scope.comments = data;
                            }
                        });
            };
        })
        .controller('CommentCtrl', function($scope, $state, $http, Camera, $stateParams, $ionicLoading, $cordovaImagePicker, $cordovaFileTransfer, Tasks, Comments, SessionService, $ionicHistory) {
            $scope.task = Tasks.get($stateParams.taskId);
            $scope.user = SessionService.get('user');
            $scope.commentData = {
                'user_id': $scope.user.id,
                'task_id': $scope.task.id,
            };
            $scope.eval = $scope.$eval;

            $scope.getCamera = function() {
                e.preventDefault();
                alert('Getting camera');
                Camera.getPicture({
                    quality: 100,
                    saveToPhotoAlbum: false
                }).then(function(imageURI) {
                    alert(imageURI);
                    $scope.pictureTaken = imageURI;
                }, function(err) {
                    alert(err);
                });
            }

            $scope.getImage = function() {
                e.preventDefault();
                // Image picker will load images according to these settings
                var options = {
                    maximumImagesCount: 1, // Max number of selected images, I'm using only one for this example
                    width: 800,
                    height: 800,
                    quality: 80            // Higher is better
                };

                $cordovaImagePicker.getPictures(options).then(function(results) {
                    // Loop through acquired images
                    for (var i = 0; i < results.length; i++) {
                        console.log('Image URI: ' + results[i]);   // Print image URI
                    }
                }, function(error) {
                    console.log('Error: ' + JSON.stringify(error));    // In case of error
                });
            };
            $scope.createComment = function() {

                console.log($scope.commentData);
                $ionicLoading.show({
                    template: 'Guardando comentario...'
                });

                // save the comment. pass in comment data from the form
                // use the function we created in our service
                Comments.create($scope.commentData)
                        .success(function(response) {
                            $ionicLoading.hide();
                            if (response.result == 0) {
                                console.log(response);
                                $ionicLoading.show({
                                    template: 'Cargando...'
                                });
                                Tasks.load(SessionService.get('user'))
                                        .success(function(data) {
                                            $ionicLoading.hide();
                                            if (data === false) {
                                            } else {
                                                //console.log(data);
                                                Tasks.set(data);
                                            }
                                            $ionicHistory.clearCache();
                                            $state.go('task.show', {'taskId': $scope.task.id}, {reload: true});
                                        });

                            } else {
                                alert("Error creando el commentario \n");
                                console.log(response);
                            }
                        })
                        .error(function(data) {
                            alert("Error desconocido");
                            $ionicLoading.hide();
                            console.log(data);
                        });
            };
        })
        .controller('ProsCtrl', function($scope) {
            $scope.playlists = [
                {title: 'Reggae', id: 1},
                {title: 'Chill', id: 2},
                {title: 'Dubstep', id: 3},
                {title: 'Indie', id: 4},
                {title: 'Rap', id: 5},
                {title: 'Cowbell', id: 6}
            ];
        })

        .controller('ProCtrl', function($scope, $stateParams) {
        });
