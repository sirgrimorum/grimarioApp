angular.module('grimario.services', [])

        .factory('Login', function($http) {
            return {
                auth: function(credentials) {
                    return $http({method: 'POST', url: 'http://grimario.grimorum.com/api/login', params: credentials});
                    return $http({method: 'POST', url: 'http://localhost/grimario/public/api/login', params: credentials});
                },
                logout: function() {
                    return $http({method: 'POST', url: 'http://grimario.grimorum.com/api/logout'});
                    //return $http({method: 'POST', url: 'http://localhost/grimario/public/api/logout'});
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

        .factory('FavTasks', function() {
            // Might use a resource here that returns a JSON array

            // Some fake testing data
            var favtasks = [];

            return {
                all: function() {
                    return favtasks;
                },
                remove: function(task) {
                    favtasks.splice(favtasks.indexOf(task), 1);
                },
                get: function(taskId) {
                    for (var i = 0; i < favtasks.length; i++) {
                        if (favtasks[i].id === parseInt(taskId)) {
                            return favtasks[i];
                        }
                    }
                    return null;
                },
                add: function(task) {
                    var indexO = -1;
                    for (var i = 0; i < favtasks.length; i++) {
                        if (favtasks[i].id === parseInt(task.id)) {
                            indexO = i;
                        }
                    }
                    if (indexO == -1) {
                        console.log("added");
                        favtasks.push(task);
                    } else {
                        console.log("exists", indexO);
                    }
                    return null;
                },
                isFav: function(task) {
                    return favtasks.indexOf(task);
                    for (var i = 0; i < favtasks.length; i++) {
                        if (favtasks[i].id === parseInt(task.id)) {
                            return i;
                        }
                    }
                    return -1;
                }
            };
        })

        .factory('Tasks', function($http) {
            var tasks = [];
            return {
                // get all the comments
                set: function(auxtasks) {
                    tasks = auxtasks;
                    return null;
                },
                getall: function() {
                    return tasks;
                },
                get: function(taskId) {
                    for (var i = 0; i < tasks.length; i++) {
                        if (tasks[i].id === parseInt(taskId)) {
                            return tasks[i];
                        }
                    }
                    return null;
                },
                load: function(user) {
                    return $http({method: 'GET', url: 'http://grimario.grimorum.com/api/tasks', params: {user: user.id}});
                    return $http({method: 'GET', url: 'http://localhost/grimario/public/api/tasks', params: {user: user.id}});
                    //return $http.get('http://localhost/grimario/public/api/tasks');
                },
                pause: function(data) {
                    return $http({method: 'POST', url: 'http://grimario.grimorum.com/api/pautask', params: data});
                    return $http({method: 'POST', url: 'http://localhost/grimario/public/api/pautask', params: data});
                },
                start: function(taskId, user) {
                    return $http({method: 'POST', url: 'http://grimario.grimorum.com/api/starttask', params: {task_id:taskId, user:user.id}});
                    return $http({method: 'POST', url: 'http://localhost/grimario/public/api/starttask', params: {task_id: taskId, user: user.id}});
                },
            }
        })
        .factory('Costs', function($http) {
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
                load: function(taskId) {
                    return $http({method: 'GET', url: 'http://grimario.grimorum.com/api/costs', params: {task: taskId}});
                    return $http({method: 'GET', url: 'http://localhost/grimario/public/api/costs', params: {task: taskId}});
                },
                create: function(data) {
                    return $http({method: 'POST', url: 'http://grimario.grimorum.com/api/createcost', params: data});
                    return $http({method: 'POST', url: 'http://localhost/grimario/public/api/createcost', params: data});
                },
            }
        })
        .factory('Comments', function($http) {
            var comments = [];
            return {
                getall: function() {
                    return comments;
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
                    return $http({method: 'GET', url: 'http://grimario.grimorum.com/api/comments', params: {task: taskId}});
                    //return $http({method: 'GET', url: 'http://localhost/grimario/public/api/comments', params: {task: taskId}});
                },
                create: function(data) {
                    return $http({method: 'POST', url: 'http://grimario.grimorum.com/api/createcomment', params: data});
                    //return $http({method: 'POST', url: 'http://localhost/grimario/public/api/createcomment', params: data});
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
        })

        .factory('Camera', ['$q', function($q) {
                return {
                    getPicture: function(options) {
                        var q = $q.defer();

                        navigator.camera.getPicture(function(result) {
                            // Do any magic you need
                            q.resolve(result);
                        }, function(err) {
                            q.reject(err);
                        }, options);

                        return q.promise;
                    }
                }

            }]);

;