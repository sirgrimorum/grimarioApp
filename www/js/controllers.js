angular.module('grimario.controllers', [])

        .controller('WelcomeCtrl', function($scope, $state, Datos, Login, SessionService, $ionicLoading) {
            // Form data for the login modal
            $scope.loginData = {};
            Datos.initDB();
            Login.loadDb(Datos.get()).then(function(users) {
                if (users.length > 0) {
                    $scope.loginData.email = users[0].email;
                    $scope.loginData.password = users[0].password;
                    SessionService.set('auth', true);
                    SessionService.set('user', users[0]);
                    $state.go('task.dash');
                }
            });
            $scope.doLogin = function() {
                $ionicLoading.show({
                    template: 'Autenticando...'
                });
                //console.log('Doing login', $scope.loginData);
                var auth = Login.auth($scope.loginData);
                auth.success(function(response) {
                    //alert(JSON.stringify(response));
                    SessionService.unset('auth');
                    SessionService.unset('tipoAuth');
                    SessionService.unset('user');
                    $ionicLoading.hide();
                    if (response.result == 0) {
                        SessionService.set('auth', true);
                        SessionService.set('tipoAuth', "Mail");
                        SessionService.set('user', response.user);
                        Login.set(response.user);
                        $state.go('task.dash');
                    } else if (response.result == 1) {
                        alert(response.message.email + "\n" + response.message.password);
                    } else {
                        alert(response.message);
                    }
                });
            }

            $scope.showBtnGoogle = true;
            $scope.googleSignIn = function() {
                $ionicLoading.show({
                    template: 'Autenticando...'
                });
                window.plugins.googleplus.trySilentLogin(
                        {
                            //'offline': true, // optional and required for Android only - if set to true the plugin will also return the OAuth access token, that can be used to sign in to some third party services that don't accept a Cross-client identity token (ex. Firebase)
                            //'webApiKey': 'api of web app' // optional API key of your Web application from Credentials settings of your project - if you set it the returned idToken will allow sign in to services like Azure Mobile Services 
                        },
                        function(user_data) {
                            //$ionicLoading.hide();
                            //alert("Listo silent" + JSON.stringify(user_data)); // do something useful instead of alerting
                            var auth = Login.authG(user_data);
                            auth.success(function(response) {
                                //alert(JSON.stringify(response));
                                SessionService.unset('auth');
                                SessionService.unset('tipoAuth');
                                SessionService.unset('user');
                                $ionicLoading.hide();
                                if (response.result == 0) {
                                    SessionService.set('auth', true);
                                    SessionService.set('tipoAuth', "Google");
                                    SessionService.set('user', response.user);
                                    Login.set(response.user);
                                    $state.go('task.dash');
                                } else if (response.result == 1) {
                                    alert(response.message.email + "\n" + response.message.password);
                                } else {
                                    alert(response.message);
                                }
                            });
                        },
                        function(msg) {
                            window.plugins.googleplus.login(
                                    {
                                        'scopes': 'profile',
                                        //'offline': true, // optional, used for Android only - if set to true the plugin will also return the OAuth access token ('oauthToken' param), that can be used to sign in to some third party services that don't accept a Cross-client identity token (ex. Firebase)
                                        //'webApiKey': 'api of web app', // optional API key of your Web application from Credentials settings of your project - if you set it the returned idToken will allow sign in to services like Azure Mobile Services

                                    },
                                    function(user_data) {
                                        //alert("listo -" + user_data.userId + '-' + user_data.email);
                                        var auth = Login.authG(user_data);
                                        auth.success(function(response) {
                                            //alert(JSON.stringify(response));
                                            SessionService.unset('auth');
                                            SessionService.unset('tipoAuth');
                                            SessionService.unset('user');
                                            $ionicLoading.hide();
                                            if (response.result == 0) {
                                                SessionService.set('auth', true);
                                                SessionService.set('tipoAuth', "Google");
                                                SessionService.set('user', response.user);
                                                Login.set(response.user);
                                                $state.go('task.dash');
                                            } else if (response.result == 1) {
                                                alert(response.message.email + "\n" + response.message.password);
                                            } else {
                                                alert(response.message);
                                            }
                                        });
                                    },
                                    function(msg) {
                                        alert("No se pudo iniciar sesión -" + msg);
                                        $ionicLoading.hide();
                                        //$ionicLoading.hide();
                                    }
                            );
                            //alert('error: ' + msg);
                        }
                );

            };
        })

        .controller('AppCtrl', function($scope, $state, SessionService, Login, Datos, Tasks, $ionicLoading, $ionicModal, $timeout) {
            if (SessionService.get('auth') == true) {
                Tasks.loadDb(Datos.get()).then(function(tasks) {
                    console.log("tasks cargadas", tasks);
                });
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
                    Login.remove(SessionService.get('user'));
                    Datos.save();
                    if (SessionService.get('tipoAuth') == "Google") {
                        window.plugins.googleplus.logout(
                                function(msg) {
                                    console.log(msg);
                                    $ionicLoading.hide();
                                    SessionService.unset('auth');
                                    SessionService.unset('tipoAuth');
                                    SessionService.unset('user');
                                    $state.go('welcome');
                                },
                                function(fail) {
                                    alert(fail);
                                }
                        );
                    } else {
                        var logout = Login.logout();
                        logout.success(function(response) {
                            //Login.remove(SessionService.get('user'));
                            console.log(response);
                            SessionService.unset('auth');
                            SessionService.unset('tipoAuth');
                            SessionService.unset('user');
                            $ionicLoading.hide();
                            $state.go('welcome');
                        });
                    }
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

        .controller('DashCtrl', function($scope, Tasks) {
            $scope.tasks = Tasks.getFavs();
            $scope.reLoad = function() {
                $scope.tasks = Tasks.getFavs();
                $scope.$broadcast('scroll.refreshComplete');
            };
            $scope.remove = function(task) {
                Tasks.unFav(task);
            };
            $scope.start = function(task) {
                Tasks.unFav(task);
            };
        })

        .controller('TaskCtrl', function($scope, $state, $stateParams, Tasks, SessionService, $ionicLoading, $ionicHistory) {
            $scope.task = Tasks.get($stateParams.taskId);
            $scope.fav = function(task) {
                Tasks.fav(task);
            };
            $scope.isFav = function(task) {
                return Tasks.isFav(task);
            };
            $scope.unFav = function(task) {
                Tasks.unFav(task);
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
                                                Tasks.set(data.tasks);
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

        .controller('TaskPauseCtrl', function($scope, $state, $http, $filter, $stateParams, $cordovaDatePicker, $ionicLoading, Tasks, SessionService, $ionicHistory) {
            $scope.task = Tasks.get($stateParams.taskId);
            $scope.taskData = {
                'task_id': $scope.task.id,
                'work_id': $scope.task.work.id,
                'dpercentage': $scope.task.dpercentage,
                'start': $scope.task.start,
                'end': "0000-00-00 00:00:00",
            };
            var dateStart = new Date(Date.parse($scope.task.start));
            var dateEnd = new Date(Date.parse("0000-00-00 00:00:00"));
            $scope.fstart = $filter('date')(dateStart, "mediumDate") + " " + $filter('date')(dateStart, "shortTime");
            $scope.fend = $filter('date')(dateEnd, "mediumDate") + " " + $filter('date')(dateEnd, "shortTime");
            $scope.eval = $scope.$eval;
            $scope.selectDate = function(event, tipo) {
                if (tipo == 1) {
                    var msecDate = Date.parse($scope.taskData.start);
                } else {
                    var msecDate = Date.parse($scope.taskData.end);
                }
                event.preventDefault();
                var optionsDp = {
                    date: new Date(msecDate),
                    mode: 'datetime', // or 'time'
                    //minDate: new Date() - 10000,
                    allowOldDates: true,
                    allowFutureDates: false,
                    doneButtonLabel: 'Listo',
                    doneButtonColor: '#F2F3F4',
                    cancelButtonLabel: 'Cancelar',
                    cancelButtonColor: '#000000'
                };
                $cordovaDatePicker.show(optionsDp).then(function(date) {
                    var ffecha = $filter('date')(date, "mediumDate") + " " + $filter('date')(date, "shortTime");
                    //alert(date);
                    if (tipo == 1) {
                        $scope.taskData.start = $filter('date')(date, "yyyy-MM-dd HH:mm:ss");
                        $scope.fstart = ffecha;
                    } else {
                        $scope.taskData.end = $filter('date')(date, "yyyy-MM-dd HH:mm:ss");
                        $scope.fend = ffecha;
                    }
                });
            };
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
                                                Tasks.set(data.tasks);
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

        .controller('TasksCtrl', function($scope, $http, Tasks, $ionicLoading, SessionService) {
            //console.log("1", Tasks.get().length);
            $scope.search = {
                filter: "",
            };
            $scope.filter="";
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
                                Tasks.set(data.tasks);
                                //console.log("2", Tasks.get().length);
                                console.log(data);
                                $scope.tasks = data.tasks;
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
                            $scope.$broadcast('scroll.refreshComplete');
                            if (data === false) {
                                $scope.tasks = {};
                            } else {
                                console.log(data);
                                Tasks.set(data.tasks);
                                $scope.tasks = data.tasks;
                            }
                        });
            };
            $scope.filterTasks = function(task) {
                if ($scope.search.filter != ""){
                    if (task.name.indexOf($scope.search.filter)>=0){
                        return true;
                    }else if(task.proyect.indexOf($scope.search.filter)>=0){
                        return true;
                    }else{
                        return false;
                    }
                }else{
                    return true;
                }
            };
            $scope.clearFilter = function(){
                console.log("1",$scope.search.filter);
                $scope.search.filter="";
                $scope.apply();
                console.log("2",$scope.search.filter);
            };
            $scope.fav = function(task) {
                Tasks.fav(task);
            };
            $scope.isFav = function(task) {
                return Tasks.isFav(task);
            };
            $scope.unFav = function(task) {
                Tasks.unFav(task);
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
                            $scope.$broadcast('scroll.refreshComplete');
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
        .controller('CostCtrl', function($scope, $state, $http, $stateParams, $ionicLoading, $filter, $cordovaDatePicker, Tasks, Costs, SessionService, $ionicHistory) {
            $scope.task = Tasks.get($stateParams.taskId);
            $scope.user = SessionService.get('user');
            $scope.costData = {
                'user_id': $scope.user.id,
                'work_id': $scope.task.work.id,
                'date': $filter('date')(new Date(), "yyyy-MM-dd HH:mm:ss"),
            };
            $scope.ffecha = $filter('date')(new Date(), "mediumDate") + " " + $filter('date')(new Date(), "shortTime");
            $scope.eval = $scope.$eval;
            $scope.selectDate = function(event) {
                var msecDate = Date.parse($scope.costData.date);
                event.preventDefault();
                var optionsDp = {
                    date: new Date(msecDate),
                    mode: 'datetime', // or 'time'
                    //minDate: new Date() - 10000,
                    allowOldDates: true,
                    allowFutureDates: false,
                    doneButtonLabel: 'Listo',
                    doneButtonColor: '#F2F3F4',
                    cancelButtonLabel: 'Cancelar',
                    cancelButtonColor: '#000000'
                };
                $cordovaDatePicker.show(optionsDp).then(function(date) {
                    var ffecha = $filter('date')(date, "mediumDate") + " " + $filter('date')(date, "shortTime");
                    //alert(date);
                    $scope.costData.date = $filter('date')(date, "yyyy-MM-dd HH:mm:ss");
                    $scope.ffecha = ffecha;
                });
            };
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
                                                Tasks.set(data.tasks);
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
                            //console.log(data);
                            $scope.comments = data;
                            Comments.set(data);
                            console.log(Comments.getall());
                        }
                    });
            $scope.reLoad = function() {
                $ionicLoading.show({
                    template: 'Cargando...'
                });
                Comments.load($stateParams.taskId)
                        .success(function(data) {
                            $scope.$broadcast('scroll.refreshComplete');
                            $ionicLoading.hide();
                            if (data === false) {
                                $scope.comments = {};
                            } else {
                                //console.log(data);
                                $scope.comments = data;
                                Comments.set(data);
                                console.log(Comments.getall());
                            }
                        });
            };
        })
        .controller('CommentcCtrl', function($scope, urlBase, $state, $http, $stateParams, $ionicLoading, $cordovaImagePicker, $cordovaFileTransfer, $cordovaCamera, Tasks, Comments, SessionService, $ionicHistory) {
            $scope.task = Tasks.get($stateParams.taskId);
            $scope.user = SessionService.get('user');
            $scope.cargando = 0;
            $scope.commentData = {
                'user_id': $scope.user.id,
                'task_id': $scope.task.id,
                'public': false,
            };
            $scope.eval = $scope.$eval;
            $scope.getCamera = function() {

                var options = {
                    quality: 80,
                    //destinationType: 0, //Camera.DestinationType.DATA_URL,
                    destinationType: 1, //Camera.DestinationType.FILE_URI,
                    //sourceType: Camera.PictureSourceType.CAMERA,
                    allowEdit: true,
                    //encodingType: Camera.EncodingType.JPEG,
                    targetWidth: 800,
                    targetHeight: 800,
                    //popoverOptions: CameraPopoverOptions,
                    saveToPhotoAlbum: false,
                    correctOrientation: true
                };
                $cordovaCamera.getPicture(options).then(function(imageData) {
                    $scope.commentData['image'] = imageData;
                    $scope.pictureTaken = imageData;
                    $scope.image = imageData;
                    //$scope.pictureTaken = "data:image/jpeg;base64," + imageData;
                    //$scope.image = "data:image/jpeg;base64," + imageData;
                    //$scope.commentData['image']="data:image/jpeg;base64," + imageData;
                }, function(err) {
                    // error
                    alert('Error: ' + JSON.stringify(err));
                });
                //$cordovaCamera.cleanup().then(...);
                /*
                 $cordovaCamera.getPicture(options).then(function(imageData) {
                 //var image = document.getElementById('myImage');
                 //image.src = "data:image/jpeg;base64," + imageData;
                 $scope.pictureTaken = "data:image/jpeg;base64," + imageData;
                 }, function(err) {
                 alert('Error: ' + JSON.stringify(err));    // In case of error
                 });
                 */

            }

            $scope.getImage = function() {
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
                        $scope.commentData['image'] = results[i];
                        $scope.pictureTaken = results[i];
                        $scope.image = results[i];
                    }
                }, function(error) {
                    alert('Error: ' + JSON.stringify(error)); // In case of error
                });
            };
            $scope.createComment = function() {

                console.log($scope.commentData);
                //alert($scope.commentData.image);

                /*$ionicLoading.show({
                 template: 'Guardando comentario...'
                 });*/

                // save the comment. pass in comment data from the form
                // use the function we created in our service
                //Comments.create($scope.commentData);
                var options = {
                    fileKey: "image",
                    fileName: "image.jpeg",
                    chunkedMode: false,
                    mimeType: "image/jpeg",
                    params: {
                        'user_id': $scope.commentData.user_id,
                        'task_id': $scope.commentData.task_id,
                        'public': $scope.commentData.public,
                        'commenttype': $scope.commentData.commenttype,
                        'comment': $scope.commentData.comment,
                        'url': $scope.commentData.url,
                    },
                };
                $cordovaFileTransfer.upload(urlBase + 'createcomment', $scope.commentData.image, options).then(function(r) {
                    //$ionicLoading.hide();
                    var response = JSON.parse(r.response);
                    //alert("Llegó \n" + JSON.stringify(response.result));
                    $scope.progresoCarga = 100;
                    if (response.result == 0) {
                        console.log(r);
                        $ionicLoading.show({
                            template: 'Cargando...'
                        });
                        Tasks.load(SessionService.get('user'))
                                .success(function(data) {
                                    $ionicLoading.hide();
                                    if (data === false) {
                                    } else {
                                        //console.log(data);
                                        Tasks.set(data.tasks);
                                    }
                                    $ionicHistory.clearCache();
                                    $state.go('task.show', {'taskId': $scope.task.id}, {reload: true});
                                });
                    } else if (response.result == 1) {
                        alert("Error creando el commentario \n" + JSON.stringify(r.response));
                        console.log(r.response);
                    } else {
                        alert("Error subiendo la imagen \n" + JSON.stringify(r.response));
                        console.log(r.response);
                    }
                }, function(err) {
                    alert("Error desconocido" + JSON.stringify(err));
                    $ionicLoading.hide();
                    console.log(err);
                }, function(progress) {
                    $scope.progresoCarga = (progress.loaded / progress.total) * 100;
                });
            };
        })
        .controller('CommentCtrl', function($scope, $stateParams, $ionicLoading, $cordovaFileOpener2, $cordovaInAppBrowser, Comments) {
            console.log($stateParams.commentId, Comments.getall());
            $scope.comment = Comments.get($stateParams.commentId);
            $scope.abrirUrl = function(url) {
                //alert(url);
                var options = {
                    location: 'no',
                    clearcache: 'yes',
                    toolbar: 'no'
                };
                $cordovaInAppBrowser.open(url, '_system', options)
                        .then(function(event) {
                            //alert("Listo" + JSON.stringify(event));
                        })
                        .catch(function(event) {
                            alert("Error " + JSON.stringify(event));
                        });
            };
            /*
             $scope.downloadProgress = 0;
             $scope.download = function(url) {
             var fileName = $scope.comment.file.substring(url.lastIndexOf('/') + 1);
             var fileExt = $scope.comment.file.substring(url.lastIndexOf('.') + 1);
             $scope.downloadProgress = 0;
             //alert(url);
             
             window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fs) {
             fs.root.getDirectory(cordova.file.externalApplicationStorageDirectory, {create: true},
             function(dirEntry) {
             dirEntry.getFile(fileName, {
             create: true,
             exclusive: false
             },
             function gotFileEntry(fe) {
             var p = fe.toURL();
             fe.remove();
             ft = new FileTransfer();
             ft.download(url, p,
             function(entry) {
             //$ionicLoading.hide();
             alert("bajó-" + JSON.stringify(entry));
             $scope.imgFile = entry.toURL();
             var mimeDoc = "";
             if (fileExt == "doc" || fileExt == "docx") {
             mimeDoc = "application/msword";
             } else if (fileExt == "pdf") {
             mimeDoc = "application/pdf";
             } else if (fileExt == "jpg" || fileExt == "jpeg") {
             mimeDoc = "image/jpeg";
             } else if (fileExt == "xls" || fileExt == "xlsx") {
             mimeDoc = "application/vnd.ms-excel";
             } else if (fileExt == "ppt" || fileExt == "pptx" || fileExt == "pps") {
             mimeDoc = "application/vnd.ms-powerpoint";
             } else if (fileExt == "png") {
             mimeDoc = "image/png";
             } else if (fileExt == "psd") {
             mimeDoc = "image/vnd.adobe.photoshop";
             } else if (fileExt == "3ds") {
             mimeDoc = "image/x-3ds";
             } else if (fileExt == "txt") {
             mimeDoc = "text/plain";
             } else if (fileExt == "mp4" || fileExt == "mp4v" || fileExt == "mpg4") {
             mimeDoc = "text/plain";
             } else if (fileExt == "qt" || fileExt == "mov") {
             mimeDoc = "video/quicktime";
             } else if (fileExt == "avi") {
             mimeDoc = "video/x-msvideo";
             } else {
             mimeDoc = "application/" + fileExt;
             }
             $cordovaFileOpener2.open(
             fs.root.toURL() + entry.fullPath,
             mimeDoc
             ).then(function() {
             alert("listo");
             }, function(err) {
             alert("error: " + JSON.stringify(err));
             });
             },
             function(error) {
             //$ionicLoading.hide();
             alert("Download Error Source -> " + error.source);
             },
             false,
             null
             );
             },
             function() {
             //$ionicLoading.hide();
             alert("Get file failed");
             }
             );
             });
             },
             function() {
             $ionicLoading.hide();
             alert("Request for filesystem failed");
             });
             };/**/

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
