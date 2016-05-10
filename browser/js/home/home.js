app.config(function ($stateProvider) {
    $stateProvider.state('home', {
        url: '/beers',
        templateUrl: '/js/products/products.html',
        controller: 'ProductCtrl',
        resolve: {
          products: function(ProductFactory) {
            return ProductFactory.getAll();
          },
          categories: function(CategoryFactory){
              return CategoryFactory.getAll();
          }
        }

    });
});
