app.config(function ($stateProvider) {
    $stateProvider.state('home', {
        url: '/',
        templateUrl: '/js/products/products.html',
        controller: 'ProductCtrl',
        resolve: {
          products: function(ProductFactory) {
            return ProductFactory.getAll()
            .then(function(_products) {
              return _products.slice(0,12);
            });
          },
          categories: function(CategoryFactory){
              return CategoryFactory.getAll();
          }
        }

    });
});
