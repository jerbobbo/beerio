app.config(function ($stateProvider) {

    $stateProvider.state('userCreate', {
        url: '/user/create',
        templateUrl: 'js/user/createuser.html',
        controller: 'UserCtrl'
    });

});

app.controller('UserCtrl', function ($scope, UserFactory, $state) {
    $scope.createUser = {};
    $scope.error = null;

    $scope.sendCreateUser = function(user) {
        if (user.password1 != user.password2)  {
            $scope.error = "Passwords do not match";
            return;
        }
        if (user.email && user.password1 && user.password2) {
            var userObj = {
                email: user.email,
                password: user.password1
            };

            UserFactory.createUser(userObj)
                .then(function(user) {
                    $state.go('home');
                })
                .catch(function(err) {
                    if (err.status === 409) {
                        $scope.error = 'Email already exists.';
                        return;
                    }
                    $scope.error = 'Invalid User credentials.';
                });
        } else {
            $scope.error = 'Please fill in all the fields.';
        }
    }

});

app.factory('UserFactory', function($http) {
    var UserFactory = {};

    UserFactory.createUser = function(user) {
        return $http.post('/api/user/', user)
            .then(function(response) {
                return response.data;
            })
    };

    UserFactory.getAll = function() {
    // console.log('getting all cats');

    return $http.get('/api/user/')
      .then(function(response) {
        // console.log(response)
        return response.data;
      });
  };

  UserFactory.getOne = function(id) {
    return $http.get('/api/user/' + id)
      .then(function(response) {
        return response.data;
      });
  };

  UserFactory.update = function(user){
      return $http({
            url: '/api/user/' + user._id,
            method: "PUT",
            data: user
      })
        .then(function(_user) {
          console.log('update put on user response:', _user);
          return _user.data;
        });
    };

  UserFactory.softDelete = function(id){
      return $http({
            url: '/api/user/' + id,
            method: "PUT",
            data: {"deleted":"true"}
        })
        .then(function(_user) {
          console.log('user returned', _user)
          return _user.data;
        });
  };

  UserFactory.passReset = function(id){
      return $http({
            url: '/api/user/' + id,
            method: "PUT",
            data: {"resetpass":"true"}
        })
        .then(function(_user) {
          console.log('user returned', _user)
          return _user.data;
        });
  };

    return UserFactory;
});