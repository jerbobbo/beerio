app.factory('UserFactory', function($http) {
  var userObj = {};

  userObj.getAll = function() {
    console.log('getting all cats');

    return $http.get('/api/users/')
      .then(function(response) {
        console.log(response)
        return response.data;
      });
  };

  userObj.getOne = function(id) {
    return $http.get('/api/users/' + id)
      .then(function(response) {
        return response.data;
      });
  };

  userObj.add = function(user){
    return $http.post('api/users', user)
      .then(function(response){
        console.log(response);
        return response.data;
      });
  };

  return userObj;
});