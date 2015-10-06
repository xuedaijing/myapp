// 
// Here is how to define your module 
// has dependent on mobile-angular-ui
// 
var app = angular.module('MobileAngularUiExamples', [
  'ngRoute',
  'mobile-angular-ui',
  
  // touch/drag feature: this is from 'mobile-angular-ui.gestures.js'
  // it is at a very beginning stage, so please be careful if you like to use
  // in production. This is intended to provide a flexible, integrated and and 
  // easy to use alternative to other 3rd party libs like hammer.js, with the
  // final pourpose to integrate gestures into default ui interactions like 
  // opening sidebars, turning switches on/off ..
  'mobile-angular-ui.gestures'
]);

app.run(function($transform) {
  window.$transform = $transform;
});

// 
// You can configure ngRoute as always, but to take advantage of SharedState location
// feature (i.e. close sidebar on backbutton) you should setup 'reloadOnSearch: false' 
// in order to avoid unwanted routing.
// 
app.config(function($routeProvider) {
  $routeProvider.when('/',              {templateUrl: 'home.html', reloadOnSearch: false, controller:'InforCtrl'});
  $routeProvider.when('/questiontype',       {templateUrl: 'questiontype.html', reloadOnSearch: false,controller:'QuesCtrl'}); 
  $routeProvider.when('/userinfo',         {templateUrl: 'userinfo.html', reloadOnSearch: false});
  $routeProvider.when('/editquestion',          {templateUrl: 'editquestion.html', reloadOnSearch: false,controller:'QuesCtrl'});
  $routeProvider.when('/result',      {templateUrl: 'result.html', reloadOnSearch: false});
  $routeProvider.when('/single',      {templateUrl: 'single.html', reloadOnSearch: false});
  $routeProvider.when('/multiple',      {templateUrl: 'multiple.html', reloadOnSearch: false});
  $routeProvider.when('/score',      {templateUrl: 'score.html', reloadOnSearch: false});
  $routeProvider.when('/essay',      {templateUrl: 'essay.html', reloadOnSearch: false});
  $routeProvider.otherwise({redirectTo: '/'});
});

app.controller('InforCtrl',['$scope','$location',function($scope,$location){
	
	
	$scope.start = function(info) {
		// if (info)
		console.log(info);
		// TODO interactions with server
		$location.path('/questiontype');
	}
}]);

app.controller('QuesCtrl',['$scope','$timeout',function($scope,$timeout){
	// var quesItem = {};
	var templates = {"single": 'single.html',"mutiple":"multiple.html","score":"score.html","essay":"essay.html"};
	var type_names = {"single": '单选题',"mutiple":"多选题","score":"打分题","essay":"填空题"};
	// $scope.template = templates.singleSelect;
	var tmp_type;
	// $scope.type = null;
	$scope.changeType = function(type) {
		// console.log(type);
		if (edit_model) {
			var preElem = $('#qcontent'+pre);
			preElem.find('.no-edit').css('display','block');
			preElem.find('.edit-content').css('display','none');
			edit_model=false;
			pre=-1;
			$scope.edit_tmp = null;
			$scope.ques = null;
		}
		edit_model = false;
		tmp_type = type;
		if ($scope.ques) {
			if ($scope.ques.title){
			var cf = confirm('未保存上一题，是否先保存');
			if (cf) {
				$scope.queslist.push($scope.ques);
				$scope.ques = null;
			}
			}
		}
		$scope.template = templates[type];
		// if ()
		$scope.ques = {type:type,type_name:type_names[type]};
		// $scope.type = type;
	}
	
	$scope.addNewAns = function() {
		if (!$scope.ques.options) $scope.ques.options = [];
		if ($scope.ques.options.length>0) {
			var content = $scope.ques.options[$scope.ques.options.length-1].content;
			if (!content || content.length==0) {
				return;
			}
		}
		var c = String.fromCharCode(65+$scope.ques.options.length);
		$scope.ques.options.push({id:c});
	}
	
	var getScoreValue = function() {
		var elem = $('.starRating');
		var value;
		elem.find('input').each(function(index,item){
			// console.log(this.checked);
			if (this.checked) {
				// console.log(arguments);
				value = $(item).attr('value');
			}
			// console.log(1);
		})
		return value|0;
	}
	
	var getSelects = function() {
		var elem = $('#selects');
		var ans;
		elem.find('input[type=checkbox]').each(function(index,item){
			if (this.checked) {
				if (!ans) ans = [];
				ans.push($(item).attr('value'));
			}
		})
		return ans;
	}
	
	var getSingleSelect = function() {
		var elem = $('#selects');
		var ans;
		elem.find('input[type=radio]').each(function(index,item){
			if (this.checked) {
				ans = $(item).attr('value');
			}
		})
		return ans;
	}
	
	var acts = {"single": getSingleSelect,"mutiple":getSelects,"score":getScoreValue,"essay":null};
	
	$scope.removeQues = function(index) {
		// console.log(item.index);
		console.log(index);
		$scope.queslist.splice(index,1);
	}
	
	$scope.ajustOrder = function(index,num) {
		// console.log(arguments);
		console.log(arguments);
		// if ()
		var next = num+index;
		if (next<0) next=0;
		if (next>($scope.queslist.length-1)) next = $scope.queslist.length-1;
		if (next==index) return;
		
		tmp = $scope.queslist[index];
		$scope.queslist[index] = $scope.queslist[next];
		$scope.queslist[next] = tmp;
	}
	
	$scope.addQues = function(ques) {
		// if ($scope.ques)
		// getScoreValue();
		// return;
		if (!ques.title) {
			alert('请填写信息完整');
			return;
		} else {
			ques.title = ques.title.trim();
			if (ques.title.length==0) {
				alert('请填写信息完整');
				return;
			}
		}
		if (acts[ques.type]) {
			var ans = acts[ques.type]();
			if (ans===undefined) {
				alert('请先设置答案');
				return;
			}
			ques.ans = ans;
		}
		if (edit_model) return;
		$scope.queslist.push($scope.ques);
		$scope.ques = null;
		$scope.type = null;
		$scope.template = null;
		// console.log($scope.queslist);
	}
	
	var pre=-1;
	var edit_model = false;
	$scope.showedit = function(index) {
		if (!$scope.queslist[index]) return;
		edit_model = true;
		console.log(index);
		console.log(pre);
		if (index == pre) return;
		$scope.ques = $scope.queslist[index];
		var type = $scope.queslist[index].type;
		if (pre!=-1) {
			var preElem = $('#qcontent'+pre);
			preElem.find('.no-edit').css('display','block');
			preElem.find('.edit-content').css('display','none');
		}
		pre = index;
		var preElem = $('#qcontent'+pre);
		preElem.find('.no-edit').css('display','none');
		preElem.find('.edit-content').css('display','block');
		$scope.edit_tmp = templates[type];
		
	}
}])

// app.controller('QuesEditCtrl',['$scope',function($scope){
	// // console.log($scope.queslist);
	// var templates = {"single": 'single.html',"mutiple":"multiple.html","score":"score.html","essay":"essay.html"};
	// var type_names = {"single": '单选题',"mutiple":"多选题","score":"打分题","essay":"填空题"};
	// // $scope.template = templates.singleSelect;
	// var tmp_type;
	// $scope.changeType = function(type) {
		// // console.log(type);
		// tmp_type = type;
		// if ($scope.ques) {
			// if ($scope.ques.title){
			// var cf = confirm('未保存上一题，是否先保存');
			// if (cf) {
				// $scope.queslist.push($scope.ques);
				// $scope.ques = null;
			// }
			// }
		// }
		// $scope.template = templates[type];
		// // if ()
		// $scope.ques = {type:type,type_name:type_names[type]};
		// // $scope.type = type;
	// }
// }])

// 
// `$touch example`
// 

app.directive('toucharea', ['$touch', function($touch){
  // Runs during compile
  return {
    restrict: 'C',
    link: function($scope, elem) {
      $scope.touch = null;
      $touch.bind(elem, {
        start: function(touch) {
          $scope.touch = touch;
          $scope.$apply();
        },

        cancel: function(touch) {
          $scope.touch = touch;  
          $scope.$apply();
        },

        move: function(touch) {
          $scope.touch = touch;
          $scope.$apply();
        },

        end: function(touch) {
          $scope.touch = touch;
          $scope.$apply();
        }
      });
    }
  };
}]);

//
// `$drag` example: drag to dismiss
//

app.directive('dragToUp',function($drag,$parse,$timeout){
	 return {
    restrict: 'A',
    compile: function(elem, attrs) {
		console.log(attrs);
		// console.log()
      var dismissFn = $parse(attrs.dragToUp);
	  // console.log(dismissFn);
	  // var index = attrs.index
      return function(scope, elem){
        var dismiss = false;
		var dis = 0;
		var num = 0;
        $drag.bind(elem, {
          transform: $drag.TRANSLATE_UP,
          move: function(drag) {
			// console.log(drag.distanceY);
            if( (drag.distanceY+drag.rect.height / 2)<0) {
              dismiss = true;
			  num = Math.floor((-drag.distanceY)/drag.rect.height);
			  dis = (-drag.distanceY)-drag.rect.height*num;
			  if (dis>drag.rect.height / 2) {
				num ++;
			  }
              // elem.addClass('dismiss');
            } else {
              dismiss = false;
              // elem.removeClass('dismiss');
            }
          },
          cancel: function(){
            // elem.removeClass('dismiss');
          },
          end: function(drag) {
            if (dismiss) {
              // elem.addClass('dismitted');
			  // var index = elem.attr('index')|0;
			  // console.log(index);
			  // console.log(scope.ques);
			  // scope.ques.splice(index,1);
              $timeout(function() { 
				drag.reset();
                scope.$apply(function() {
					console.log(dismissFn);
					console.log(scope);
                  dismissFn(scope,{$num:-num});  
                });
              }, 300);
            } else {
              drag.reset();
            }
          }
        });
      };
    }
  };
})

app.directive('dragToDown',function($drag,$parse,$timeout){
	 return {
    restrict: 'A',
    compile: function(elem, attrs) {
		// console.log(attrs);
      var dismissFn = $parse(attrs.dragToDown);
	  // var index = attrs.index
      return function(scope, elem){
        var dismiss = false;
		// var 
		var dis=0;
		var num=0;
        $drag.bind(elem, {
          transform: $drag.TRANSLATE_VERTICAL,
          move: function(drag) {
			// console.log(drag.distanceY);
			// if ((drag.distanceY>0 && drag.distanceY >= drag.rect.height / 2) || (drag.distanceY<0 && (drag.distanceY+drag.rect.height / 2)<0)) {
            if( drag.distanceY >= drag.rect.height / 2) {
              dismiss = true;
              // elem.addClass('dismiss');
			  num = Math.floor(drag.distanceY/drag.rect.height);
			  dis = (drag.distanceY)-drag.rect.height*num;
			  if (dis>drag.rect.height / 2) {
				num ++;
			  }
			  console.log(num);
			  // dis = drag.distanceY;
            } else {
              dismiss = false;
              // elem.removeClass('dismiss');
            }
          },
          cancel: function(){
            // elem.removeClass('dismiss');
          },
          end: function(drag) {
            if (dismiss) {
				// console.log(dis);
              // elem.addClass('dismitted');
			  // var index = elem.attr('index')|0;
			  // console.log(index);
			  // console.log(scope.ques);
			  // scope.ques.splice(index,1);
              $timeout(function() { 
				drag.reset();
                scope.$apply(function() {
                  dismissFn(scope,{$num:num});  
                });
              }, 300);
            } else {
              drag.reset();
            }
          }
        });
      };
    }
  };
})

app.directive('dragToDismiss', function($drag, $parse, $timeout){
  return {
    restrict: 'A',
    compile: function(elem, attrs) {
      // var dismissFn = attrs.dragToDismiss|0;
	  // console.log(dismissFn);
	  // var index = attrs.index
      return function(scope, elem){
        var dismiss = false;
        $drag.bind(elem, {
          transform: $drag.TRANSLATE_RIGHT,
          move: function(drag) {
            if( drag.distanceX >= drag.rect.width / 4) {
              dismiss = true;
              elem.addClass('dismiss');
            } else {
              dismiss = false;
              elem.removeClass('dismiss');
            }
          },
          cancel: function(){
            elem.removeClass('dismiss');
          },
          end: function(drag) {
            if (dismiss) {
              elem.addClass('dismitted');
			  var index = elem.attr('index')|0;
			  console.log(index);
			  console.log(scope.ques);
			  scope.ques.splice(index,1);
              // $timeout(function() { 
                // scope.$apply(function() {
                  // dismissFn(scope);  
                // });
              // }, 300);
            } else {
              drag.reset();
            }
          }
        });
      };
    }
  };
});

//
// Another `$drag` usage example: this is how you could create 
// a touch enabled "deck of cards" carousel. See `carousel.html` for markup.
//
app.directive('carousel', function(){
  return {
    restrict: 'C',
    scope: {},
    controller: function() {
      this.itemCount = 0;
      this.activeItem = null;

      this.addItem = function(){
        var newId = this.itemCount++;
        this.activeItem = this.itemCount === 1 ? newId : this.activeItem;
        return newId;
      };

      this.next = function(){
        this.activeItem = this.activeItem || 0;
        this.activeItem = this.activeItem === this.itemCount - 1 ? 0 : this.activeItem + 1;
      };

      this.prev = function(){
        this.activeItem = this.activeItem || 0;
        this.activeItem = this.activeItem === 0 ? this.itemCount - 1 : this.activeItem - 1;
      };
    }
  };
});

app.directive('carouselItem', function($drag) {
  return {
    restrict: 'C',
    require: '^carousel',
    scope: {},
    transclude: true,
    template: '<div class="item"><div ng-transclude></div></div>',
    link: function(scope, elem, attrs, carousel) {
      scope.carousel = carousel;
      var id = carousel.addItem();
      
      var zIndex = function(){
        var res = 0;
        if (id === carousel.activeItem){
          res = 2000;
        } else if (carousel.activeItem < id) {
          res = 2000 - (id - carousel.activeItem);
        } else {
          res = 2000 - (carousel.itemCount - 1 - carousel.activeItem + id);
        }
        return res;
      };

      scope.$watch(function(){
        return carousel.activeItem;
      }, function(){
        elem[0].style.zIndex = zIndex();
      });
      
      $drag.bind(elem, {
        //
        // This is an example of custom transform function
        //
        transform: function(element, transform, touch) {
          // 
          // use translate both as basis for the new transform:
          // 
          var t = $drag.TRANSLATE_BOTH(element, transform, touch);
          
          //
          // Add rotation:
          //
          var Dx    = touch.distanceX, 
              t0    = touch.startTransform, 
              sign  = Dx < 0 ? -1 : 1,
              angle = sign * Math.min( ( Math.abs(Dx) / 700 ) * 30 , 30 );
          
          t.rotateZ = angle + (Math.round(t0.rotateZ));
          
          return t;
        },
        move: function(drag){
          if(Math.abs(drag.distanceX) >= drag.rect.width / 4) {
            elem.addClass('dismiss');  
          } else {
            elem.removeClass('dismiss');  
          }
        },
        cancel: function(){
          elem.removeClass('dismiss');
        },
        end: function(drag) {
          elem.removeClass('dismiss');
          if(Math.abs(drag.distanceX) >= drag.rect.width / 4) {
            scope.$apply(function() {
              carousel.next();
            });
          }
          drag.reset();
        }
      });
    }
  };
});

app.directive('dragMe', ['$drag', function($drag){
  return {
    controller: function($scope, $element) {
      $drag.bind($element, 
        {
          //
          // Here you can see how to limit movement 
          // to an element
          //
          transform: $drag.TRANSLATE_INSIDE($element.parent()),
          end: function(drag) {
            // go back to initial position
            drag.reset();
          }
        },
        { // release touch when movement is outside bounduaries
          sensitiveArea: $element.parent()
        }
      );
    }
  };
}]);

//
// For this trivial demo we have just a unique MainController 
// for everything
//
app.controller('MainController', function($rootScope, $scope){

	$scope.queslist = [];

	$scope.lostfouce = function(event,value) {
		// console.log(event);
		var target = event.target;
		var parent = $(target).parent();
		if (!value) {
			parent.addClass('has-error');
			return;
		}
		value = value.trim();
		if (value.length==0) {
			parent.addClass('has-error');
		} else {
			parent.removeClass('has-error');
		}
	}
	
  $scope.swiped = function(direction) {
    alert('Swiped ' + direction);
  };

  // User agent displayed in home page
  $scope.userAgent = navigator.userAgent;
  
  // Needed for the loading screen
  $rootScope.$on('$routeChangeStart', function(){
    $rootScope.loading = true;
  });

  $rootScope.$on('$routeChangeSuccess', function(){
    $rootScope.loading = false;
  });

  // Fake text i used here and there.
  $scope.lorem = 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Vel explicabo, aliquid eaque soluta nihil eligendi adipisci error, illum corrupti nam fuga omnis quod quaerat mollitia expedita impedit dolores ipsam. Obcaecati.';

  // 
  // 'Scroll' screen
  // 
  var scrollItems = [];

  for (var i=1; i<=100; i++) {
    scrollItems.push('Item ' + i);
  }

  $scope.scrollItems = scrollItems;

  $scope.bottomReached = function() {
    /* global alert: false; */
    alert('Congrats you scrolled to the end of the list!');
  };

  // 
  // Right Sidebar
  // 
  $scope.chatUsers = [
    { name: 'Carlos  Flowers', online: true },
    { name: 'Byron Taylor', online: true },
    { name: 'Jana  Terry', online: true },
    { name: 'Darryl  Stone', online: true },
    { name: 'Fannie  Carlson', online: true },
    { name: 'Holly Nguyen', online: true },
    { name: 'Bill  Chavez', online: true },
    { name: 'Veronica  Maxwell', online: true },
    { name: 'Jessica Webster', online: true },
    { name: 'Jackie  Barton', online: true },
    { name: 'Crystal Drake', online: false },
    { name: 'Milton  Dean', online: false },
    { name: 'Joann Johnston', online: false },
    { name: 'Cora  Vaughn', online: false },
    { name: 'Nina  Briggs', online: false },
    { name: 'Casey Turner', online: false },
    { name: 'Jimmie  Wilson', online: false },
    { name: 'Nathaniel Steele', online: false },
    { name: 'Aubrey  Cole', online: false },
    { name: 'Donnie  Summers', online: false },
    { name: 'Kate  Myers', online: false },
    { name: 'Priscilla Hawkins', online: false },
    { name: 'Joe Barker', online: false },
    { name: 'Lee Norman', online: false },
    { name: 'Ebony Rice', online: false }
  ];

  //
  // 'Forms' screen
  //  
  $scope.rememberMe = true;
  $scope.email = 'me@example.com';
  
  $scope.login = function() {
    alert('You submitted the login form');
  };

  // 
  // 'Drag' screen
  // 
  $scope.notices = [];
  
  for (var j = 0; j < 10; j++) {
    $scope.notices.push({icon: 'envelope', message: 'Notice ' + (j + 1) });
  }

  $scope.deleteNotice = function(notice) {
    var index = $scope.notices.indexOf(notice);
    if (index > -1) {
      $scope.notices.splice(index, 1);
    }
  };
});