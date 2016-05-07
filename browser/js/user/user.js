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
                console.log('created user: ', response.data);
                debugger;
                return response.data;
            })
    };

    return UserFactory;
});