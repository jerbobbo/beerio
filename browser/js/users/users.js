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

  userObj.update = function(user){
      return $http({
            url: '/api/users/' + user._id,
            method: "PUT",
            data: user
      })
        .then(function(_user) {
          return _user.data;
        });
    };

  userObj.softDelete = function(id){
    console.log('okokok');
      return $http({
            url: '/api/users/' + id,
            method: "PUT",
            data: {deleted:true}
        })
        .then(function(_user) {
          return _user.data;
        });
  }

  return userObj;
});