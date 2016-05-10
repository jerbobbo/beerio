app.config(function ($stateProvider) {


    $stateProvider
    .state('passreset', {
        url: '/passreset/:tokenid',
        templateUrl: 'js/passwordreset/passwordreset.html',
        controller: 'passCtrl',
        params: {
             user: null
            }
    })
    .state('forgotpassword', {
        url: '/forgotpassword',
        templateUrl: 'js/passwordreset/forgotpassword.html',
        controller: 'forgotPassCtrl',
        params: {
             user: null
            }
    });

});


app.controller('forgotPassCtrl', function ($scope, $http) {

    $scope.sendEmail = function(passObj) {
        $http.put('/api/user/forgot/password', passObj)
            .then(function(resp) {
                debugger;
            });
    }
    


});

app.controller('passCtrl', function ($scope, UserFactory, $state, $stateParams) {
    debugger;

    $scope.sendPass = function (pass) {
        debugger;
        console.log($stateParams.user);
        console.log(pass.new);
        var _user=$stateParams.user;
        _user.passwordreset=false;
        _user.password=pass.new;

        return UserFactory.update(_user)
                .then(function(user){
                    console.log('returned user:',user)
                    $state.go('home');
                });
    };

});