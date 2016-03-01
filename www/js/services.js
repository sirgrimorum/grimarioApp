
angular.module('grimario.services', ['lokijs'])

        .factory('Login', function($q, $http, urlBase) {
            var _user;
            return {
                auth: function(credentials) {
                    return $http({method: 'POST', url: urlBase + 'login', params: credentials});
                },
                authG: function(user_info) {
                    return $http({method: 'POST', url: urlBase + 'login2', params: {email: user_info.email}});
                },
                logout: function() {
                    //return $http({method: 'POST', url: 'http://grimario.grimorum.com/api/logout'});
                    return $http({method: 'POST', url: urlBase + 'logout'});
                },
                loadDb: function(_db) {
                    return $q(function(resolve, reject) {
                        //alert("a load tasks");
                        try {
                            _user = _db.getCollection('user');
                            if (!_user) {
                                _user = _db.addCollection('user', {indices: ['id']});
                                _user.ensureUniqueIndex("id");
                                //alert("creaCollection");
                            }
                        } catch (err) {
                            _db.saveDatabase();
                            //alert("db created");
                            _user = _db.addCollection('user', {indices: ['id']});
                            _user.ensureUniqueIndex("id");
                            //alert("creaCollection");
                        }
                        //console.log("datos fav",_favtasks.data);
                        //alert("datos users" + JSON.stringify(_user.data));
                        //favtasks = _favtasks.data;
                        resolve(_user.data);
                    });
                },
                set: function(auxuser) {
                    try {
                        _user.update(auxuser);
                    } catch (err) {
                        _user.insert(auxuser);
                    }
                    return null;
                },
                get: function(userId) {
                    return _user.by('id', userId);
                },
                getByEmail: function(userEmail) {
                    return _user.find({'email': userEmail});
                },
                remove: function(user) {
                    _user.removeWhere({'id': user.id});
                    return null;
                    //return _user.remove(user);
                },
            }
        })

        .factory('SessionService', function() {
            return{
                get: function(key) {
                    return JSON.parse(sessionStorage.getItem(key) || '{}');
                },
                set: function(key, val) {
                    return sessionStorage.setItem(key, JSON.stringify(val));
                },
                unset: function(key) {
                    return sessionStorage.removeItem(key);
                }
            }
        })

        .factory('Datos', ['Loki', function(Loki) {
                var _tasks;
                var _db;
                return {
                    initDB: function() {
                        var options = {};
                        var adapter = new LokiCordovaFSAdapter({"prefix": "loki"});
                        _db = new Loki('grimarioDB'
                                ,
                                {
                                    autosave: true,
                                    autosaveInterval: 1000, // 1 second
                                    persistenceMethod: 'adapter',
                                    persistenceAdapter: adapter
                                }/**/);
                        //alert("aload db");
                        try {
                            _db.loadDatabase(options, function() {
                                //alert("db loaded");
                                _tasks = _db.getCollection('tasks');
                                //return 1;
                            });
                        } catch (err) {
                            _db.saveDatabase();
                            //alert("db created");
                            //return 2;
                        }
                        console.log("_db", _db);
                        return _db;
                        //_db_favtasks.saveDatabase();
                    },
                    get: function() {
                        return _db;
                    },
                    save: function() {
                        _db.saveDatabase();
                        return null;
                    }
                };
            }]
                )

        .factory('Tasks', function($q, $http, urlBase) {
            var _tasks;

            return {
                loadDb: function(_db) {
                    return $q(function(resolve, reject) {
                        //alert("a load tasks");
                        try {
                            _tasks = _db.getCollection('tasks');
                            if (!_tasks) {
                                _tasks = _db.addCollection('tasks', {indices: ['id']});
                                _tasks.ensureUniqueIndex("id");
                                //alert("creaCollection");
                            }
                        } catch (err) {
                            _db.saveDatabase();
                            //alert("db created");
                            _tasks = _db.addCollection('tasks', {indices: ['id']});
                            _tasks.ensureUniqueIndex("id");
                            //alert("creaCollection");
                        }
                        //console.log("datos fav",_favtasks.data);
                        //alert("datos tasks" + JSON.stringify(_tasks.data));
                        //favtasks = _favtasks.data;
                        resolve(_tasks.data);
                    });
                },
                set: function(auxtasks) {
                    var auxtask;
                    //_tasks.removeWhere({'fav': true});
                    _tasks.removeWhere({'fav': false});
                    for (var i = 0; i < auxtasks.length; i++) {
                        auxtask = _tasks.by('id', auxtasks[i].id);
                        if (auxtask) {
                            auxtasks[i].fav = auxtask.fav;
                            try {
                                _tasks.update(auxtasks[i]);
                            } catch (err) {
                                _tasks.insert(auxtasks[i]);
                            }
                        } else {
                            try {
                                _tasks.insert(auxtasks[i]);
                            } catch (err) {
                                _tasks.update(auxtasks[i]);
                            }
                        }
                    }
                    return null;
                },
                getall: function() {
                    return _tasks.data;
                },
                getFavs: function() {
                    console.log("lasfavs", _tasks.find({'fav': true}), _tasks);
                    return _tasks.find({'fav': true});
                },
                get: function(taskId) {
                    return _tasks.by('id', taskId);
                },
                load: function(user) {
                    return $http({method: 'GET', url: urlBase + 'tasks', params: {user: user.id}});
                },
                pause: function(data) {
                    return $http({method: 'POST', url: urlBase + 'pautask', params: data});
                },
                start: function(taskId, user) {
                    return $http({method: 'POST', url: urlBase + 'starttask', params: {task_id: taskId, user: user.id}});
                },
                isFav: function(task) {
                    //console.log("es fav?" + task.id,task,task.fav);
                    return task.fav;
                },
                fav: function(task) {
                    task.fav = true;
                    //_tasks.by('id', task.id).fav=true;
                    _tasks.update(task);
                },
                unFav: function(task) {
                    task.fav = false;
                    //_tasks.by('id', task.id).fav=false;
                    _tasks.update(task);
                }
            }
        })
        .factory('Costs', function($http, urlBase) {
            var costs = [];
            return {
                getall: function() {
                    return costs;
                },
                get: function(costId) {
                    for (var i = 0; i < costs.length; i++) {
                        if (costs[i].id === parseInt(costId)) {
                            return costs[i];
                        }
                    }
                    return null;
                },
                set: function(auxcosts) {
                    costs = auxcosts;
                    return null;
                },
                load: function(taskId) {
                    return $http({method: 'GET', url: urlBase + 'costs', params: {task: taskId}});
                },
                create: function(data) {
                    return $http({method: 'POST', url: urlBase + 'createcost', params: data});
                },
            }
        })
        .factory('Comments', function($http, urlBase, Tasks, $cordovaFileTransfer, $ionicLoading, SessionService, $ionicHistory, $state) {
            var comments = [];
            return {
                getall: function() {
                    return comments;
                },
                set: function(auxcomments) {
                    comments = auxcomments;
                    return null;
                },
                get: function(commentId) {
                    for (var i = 0; i < comments.length; i++) {
                        if (comments[i].id === parseInt(commentId)) {
                            return comments[i];
                        }
                    }
                    return null;
                },
                load: function(taskId) {
                    return $http({method: 'GET', url: urlBase + 'comments', params: {task: taskId}});
                },
                create: function(data) {
                    var image = data.image;
                    data.image = "";
                    var options = {
                        fileKey: "image",
                        fileName: "image.jpeg",
                        chunkedMode: false,
                        mimeType: "image/jpeg",
                        params: data,
                    };

                    $cordovaFileTransfer.upload(urlBase + 'createcomment', image, options).then(function(response) {
                        $ionicLoading.hide();
                        if (response.result == 0) {
                            console.log(response);
                            alert(response.input.image);
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
                            alert("Error creando el commentario \n");
                            console.log(response);
                        } else {
                            alert("Error subiendo la imagen \n");
                            console.log(response);
                        }
                    }, function(err) {
                        alert("Error desconocido" + JSON.stringify(err));
                        $ionicLoading.hide();
                        console.log(err);
                    }, function(progress) {
                        $scope.progresoCarga = (progress.loaded / progress.total) * 100;
                    });

                    //return $http({method: 'POST', url: urlBase + 'createcomment', params: data});
                },
            }
        })

        .service('UserService', function() {
            // For the purpose of this example I will store user data on ionic local storage but you should save it on a database

            var setUser = function(user_data) {
                window.localStorage.starter_google_user = JSON.stringify(user_data);
            };

            var getUser = function() {
                return JSON.parse(window.localStorage.starter_google_user || '{}');
            };

            return {
                getUser: getUser,
                setUser: setUser
            };
        });



;