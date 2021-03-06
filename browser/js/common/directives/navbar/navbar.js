app.directive('navbar', function ($rootScope, AuthService, AUTH_EVENTS, $state) {

    return {
        restrict: 'E',
        scope: {},
        templateUrl: 'js/common/directives/navbar/navbar.html',
        link: function (scope) {

            scope.items = [
                { label: 'Beers', state: 'products' },
                { label: 'About', state: 'about' },
                { label: 'Orders', state: 'orders', auth: true}
            ];

            scope.user = null;

            scope.isLoggedIn = function () {
                return AuthService.isAuthenticated();
            };

            scope.adminAccess = function () {
                return AuthService.isAdmin();
            };

            scope.logout = function () {
                AuthService.logout().then(function () {
                    $state.go('home');
                    $rootScope.$broadcast('refreshCart');
                });
            };

            var setUser = function () {
                AuthService.getLoggedInUser().then(function (user) {
                    console.log('set user:', user);
                    scope.user = user;
                    if (!user) { return }
                    if(user.resetpass){
                        passReset(user)
                    }
                });
            };

            var removeUser = function () {
                scope.user = null;
            };

            var passReset = function (_user) {
                $state.go('passreset',{user:_user});
            };

            setUser();

            $rootScope.$on(AUTH_EVENTS.loginSuccess, setUser);
            //$rootScope.$on(AUTH_EVENTS.needsPassReset, passReset);
            $rootScope.$on(AUTH_EVENTS.logoutSuccess, removeUser);
            $rootScope.$on(AUTH_EVENTS.sessionTimeout, removeUser);

        }

    };

});
