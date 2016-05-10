app.config(function ($stateProvider) {

    $stateProvider.state('passreset', {
        url: '/passreset',
        templateUrl: 'js/passwordreset/passwordreset.html',
        controller: 'passCtrl',
        params: {
             user: null
            }
    });

});

app.controller('passCtrl', function ($scope, UserFactory, $state, $stateParams) {


    $scope.sendPass = function (pass) {

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