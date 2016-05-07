app.factory('UserFactory', function($http) {
  var catObj = {};

  catObj.getAll = function() {
    console.log('getting all cats');
    return $http.get('/api/users/')
      .then(function(response) {
        console.log(response)
        return response.data;
      });
  };

  catObj.getOne = function(id) {
    return $http.get('/api/user/' + id)
      .then(function(response) {
        return response.data;
      });
  };


  return catObj;
});