

app.factory('CategoryFactory', function($http) {
  var catObj = {};

  catObj.getAll = function() {

    return $http.get('/api/categories/')
      .then(function(response) {
        return response.data;
      });
  };

  catObj.getOne = function(id) {
    return $http.get('/api/categories/' + id)
      .then(function(response) {
        return response.data;
      });
  };

  catObj.getProducts = function(id){

    return $http.get('/api/categories/' + id+'/products')
      .then(function(response) {
        return response.data;
      });
  }

  return catObj;
});