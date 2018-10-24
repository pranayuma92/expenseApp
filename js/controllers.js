angular.module('starter.controllers', [])

.filter('total', function () {
      return function (input, property) {
        var i =  input.length;
          var total = 0;
          while (i--)
            total += input[i][property];
          return total;
      }
    })

.controller('AppCtrl', function($scope, $ionicModal, $timeout,$ionicPopup, $state, $ionicHistory) {
  $scope.logout=function(){

     var confirmPopup = $ionicPopup.confirm({
        title: 'Konfirmasi',
        template: 'Anda yakin ingin logout?',
        buttons: [
          { text: 'Tidak' , type: 'button-positive' },
          { text: 'Ya', type: 'button-positive' , 
          onTap: function(){
             firebase.auth().signOut().then(function() {

              $ionicHistory.nextViewOptions({
                historyRoot: true
              });

              $state.go('login', {}, {location: "replace"});

              }, function(error) {
                 //error
              });
          } 
         }
        ]
      });
  }

})

.controller('LoginCtrl', function($scope, $state, $ionicHistory, firebaseData){
  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {

      $ionicHistory.nextViewOptions({
        historyRoot: true
      });
     
      $state.go('app.playlists', {}, {location: "replace"});

    }
  });

  $scope.$on('$ionicView.enter', function(ev) {
    if(ev.targetScope !== $scope){
      $ionicHistory.clearHistory();
      $ionicHistory.clearCache();
    }
  });

  $scope.loginView = true;
  $scope.signupView = false;

  $scope.changeViewSignUp = function(){
    $scope.loginView = false;
    $scope.signupView = true;
  };

  $scope.changeViewLogin = function(){
    $scope.loginView = true;
    $scope.signupView = false;
  };

  $scope.loginEmail = function(formName,cred) {
    if(formName.$valid) {  // cek jika form sudah valid atau belum
      firebase.auth().signInWithEmailAndPassword(cred.email,cred.password).then(function(result) {

        $ionicHistory.nextViewOptions({
          historyRoot: true
        });
          
        $state.go('app.playlists', {}, {location: "replace"});

        },
        function(error) {
          
        }
      );

    }else{
      
    }
  };

  $scope.signupEmail = function (formName, cred) {

    if (formName.$valid) {  // Check if the form data is valid or not

      firebase.auth().createUserWithEmailAndPassword(cred.email, cred.password).then(function (result) {

        var result = firebase.auth().currentUser;

        result.updateProfile({
          displayName: cred.name,
          photoURL: "default_dp"
        }).then(function() {}, function(error) {});

        firebaseData.refUser().child(result.uid).set({
          telephone: cred.phone,
          name: cred.name,
          email: cred.email
        });

        $ionicHistory.nextViewOptions({
          historyRoot: true
        });
      
        $state.go('app.playlists', {}, {location: "replace"});

      }, function (error) {
          
      });

    }else{
      
    }

  };
})

.controller('PlaylistsCtrl', function($scope, $state, $ionicHistory, firebaseData, $ionicPopup, $firebaseArray,$ionicModal, $firebaseObject) {
  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      $scope.user_info=user;
      uid=user.uid;

      $scope.metaData = $firebaseArray(firebaseData.refMeta().orderByChild('uid').equalTo(uid));

      $scope.removeMeta = function(meta){
        firebaseData.refMeta().child(meta).remove();
        firebaseData.refExpense().child(meta).remove();
        firebaseData.refIncome().child(meta).remove();
      }

      $scope.addMeta = function(){
        $scope.meta = {}; 

        let metaPopup = $ionicPopup.show({
          template:  '<input type="text"   placeholder="Judul" ng-model="meta.title"> <br/> ' +
                  '<input type="text" placeholder="Deskripsi" ng-model="meta.desc"> <br/> ',
          title: 'Tambah expense',
          scope: $scope,
          buttons: [
            { text: 'Tutup',
              type: 'button-positive', },
            {
              text: 'Simpan',
              type: 'button-positive',
              onTap: function(e) {
                if (!$scope.meta.title || !$scope.meta.desc ) {
                  e.preventDefault(); 
                } else {
                  return $scope.meta;
                }
              }
            }
          ]
        });

        metaPopup.then(function(res){

          var today = new Date();
          var dd = today.getDate();
          var mm = today.getMonth()+1; //January is 0!
          var yyyy = today.getFullYear();

          if(dd<10) {
              dd = '0'+dd
          } 

          if(mm<10) {
              mm = '0'+mm
          } 

          currentDate = dd + '-' + mm + '-' + yyyy;

          firebaseData.refMeta().push({
            title: res.title,
            desc: res.desc,
            uid: uid,
            date: currentDate
          })
        });
      }

      $ionicModal.fromTemplateUrl('templates/detail.html', {
        scope: $scope
      }).then(function(modal) {
        $scope.modal = modal;
      });

      $scope.expenseView = true;
      $scope.incomeView = false;

      $scope.changeExpense = function(){
        $scope.expenseView = true;
        $scope.incomeView = false;
      }

      $scope.changeIncome = function(){
        $scope.expenseView = false;
        $scope.incomeView = true;
      }

      $scope.metaDetail = function(meta) {
        $scope.metaObject = $firebaseObject(firebaseData.refMeta().child(meta));
        $scope.expenseData = $firebaseArray(firebaseData.refExpense().child(meta));
        $scope.incomeData = $firebaseArray(firebaseData.refIncome().child(meta));
        $scope.modal.show();
        console.log(meta)
      };

      $scope.addItem = function(metaObject){
        if($scope.expenseView == true){
          console.log('expense')

          $scope.data ={}

        let expensePopup = $ionicPopup.show({
          template:  '<input type="text"   placeholder="Nama Item" ng-model="data.title"> <br/> ' +
                  '<input type="number" placeholder="Nominal" ng-model="data.amount"> <br/> ',   
          title: 'Tambah expense',
          scope: $scope,
          buttons: [
            { text: 'Tutup',
              type: 'button-positive', },
            {
              text: 'Simpan',
              type: 'button-positive',
              onTap: function(e) {
                if (!$scope.data.title || !$scope.data.amount ) {
                  e.preventDefault(); 
                } else {
                  return $scope.data;
                }
              }
            }
          ]
        });

        expensePopup.then(function(res){
          firebaseData.refExpense().child(metaObject).push({
            title: res.title,
            amount: res.amount,
            meta_id: metaObject
          })
        });

        }else{
          console.log('income');
          $scope.data ={}

        let incomePopup = $ionicPopup.show({
          template:  '<input type="text"   placeholder="Nama Item" ng-model="data.title"> <br/> ' +
                  '<input type="number" placeholder="Nominal" ng-model="data.amount"> <br/> ',   
          title: 'Tambah income',
          scope: $scope,
          buttons: [
            { text: 'Tutup',
              type: 'button-positive', },
            {
              text: 'Simpan',
              type: 'button-positive',
              onTap: function(e) {
                if (!$scope.data.title || !$scope.data.amount ) {
                  e.preventDefault(); 
                } else {
                  return $scope.data;
                }
              }
            }
          ]
        });

        incomePopup.then(function(res){
          firebaseData.refIncome().child(metaObject).push({
            title: res.title,
            amount: res.amount,
            meta_id: metaObject
          })
        });
        }
      }

      $scope.editItem = function(metaObject, expense){
        if($scope.expenseView == true){
          console.log(expense.$id)

          $scope.data = expense;

        let expensePopup = $ionicPopup.show({
          template:  '<input type="text"   placeholder="Nama Item" ng-model="data.title"> <br/> ' +
                  '<input type="number" placeholder="Nominal" ng-model="data.amount"> <br/> ',   
          title: 'Edit expense',
          scope: $scope,
          buttons: [
            { text: 'Tutup',
              type: 'button-positive', },
            {
              text: 'Simpan',
              type: 'button-positive',
              onTap: function(e) {
                if (!$scope.data.title || !$scope.data.amount ) {
                  e.preventDefault(); 
                } else {
                  return $scope.data;
                }
              }
            }
          ]
        });

        expensePopup.then(function(res){
          firebaseData.refExpense().child(metaObject).child(expense.$id).update({
            title: res.title,
            amount: res.amount,
          })
        });

        }else{
          console.log('income');
          $scope.data = expense;

        let incomePopup = $ionicPopup.show({
          template:  '<input type="text"   placeholder="Nama Item" ng-model="data.title"> <br/> ' +
                  '<input type="number" placeholder="Nominal" ng-model="data.amount"> <br/> ',   
          title: 'Edit income',
          scope: $scope,
          buttons: [
            { text: 'Tutup',
              type: 'button-positive', },
            {
              text: 'Simpan',
              type: 'button-positive',
              onTap: function(e) {
                if (!$scope.data.title || !$scope.data.amount ) {
                  e.preventDefault(); 
                } else {
                  return $scope.data;
                }
              }
            }
          ]
        });

        incomePopup.then(function(res){
          firebaseData.refIncome().child(metaObject).child(expense.$id).update({
            title: res.title,
            amount: res.amount,
          })
        });
        }
      }

    }else {

      $ionicHistory.nextViewOptions({
        historyRoot: true
      });
      $state.go('login', {}, {location: "replace"});
    }
  });
})

.controller('PlaylistCtrl', function($scope, $stateParams) {
});
