describe('Create User Factory', function() {
  beforeEach(module('FullstackGeneratedApp'));
  var $httpBackend, $controller, UserFactory;
  beforeEach('Get tools', inject(function(_$httpBackend_, _UserFactory_, _$controller_) {
    $httpBackend = _$httpBackend_;
    UserFactory = _UserFactory_;
    $controller = _$controller_;
  }));

  var fakeUserResponse = {
    _id: 'xyz1231123',
    email: 'newuser@user.com',
    password: 'password'
  };

  it('should be an object', function() {
    expect(UserFactory).to.be.an('object');
  });

  it('.createUser makes a call to back end to create user', function() {
    $httpBackend
      .expect('POST', '/api/user/')
      .respond(200, fakeUserResponse);
    UserFactory.createUser({
      email: 'newuser@user.com',
      password: 'password'
    }).then(function(response) {
        expect(response).to.deep.equal(fakeUserResponse);
      })
    $httpBackend.flush();
  });

});
