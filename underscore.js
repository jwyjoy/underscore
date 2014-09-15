//     Underscore.js 1.6.0
//     http://underscorejs.org
//     (c) 2009-2014 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
//     Underscore may be freely distributed under the MIT license.

(function() {

  // Baseline setup
  // --------------

  // Establish the root object, `window` in the browser, or `exports` on the server.
  var root = this;

  // Save the previous value of the `_` variable.
  var previousUnderscore = root._;

  // Establish the object that gets returned to break out of a loop iteration.
  var breaker = {};

  // Save bytes in the minified (but not gzipped) version:
  var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;

  // Create quick reference variables for speed access to core prototypes.
  var
    push             = ArrayProto.push,
    slice            = ArrayProto.slice,
    concat           = ArrayProto.concat,
    toString         = ObjProto.toString,
    hasOwnProperty   = ObjProto.hasOwnProperty;

  // All **ECMAScript 5** native function implementations that we hope to use
  // are declared here.
  var
    nativeForEach      = ArrayProto.forEach,
    nativeMap          = ArrayProto.map,
    nativeReduce       = ArrayProto.reduce,
    nativeReduceRight  = ArrayProto.reduceRight,
    nativeFilter       = ArrayProto.filter,
    nativeEvery        = ArrayProto.every,
    nativeSome         = ArrayProto.some,
    nativeIndexOf      = ArrayProto.indexOf,
    nativeLastIndexOf  = ArrayProto.lastIndexOf,
    nativeIsArray      = Array.isArray,
    nativeKeys         = Object.keys,
    nativeBind         = FuncProto.bind;

  // Create a safe reference to the Underscore object for use below.
  var _ = function(obj) {
    if (obj instanceof _) return obj;
    if (!(this instanceof _)) return new _(obj);
    this._wrapped = obj;
  };

  // Export the Underscore object for **Node.js**, with
  // backwards-compatibility for the old `require()` API. If we're in
  // the browser, add `_` as a global object via a string identifier,
  // for Closure Compiler "advanced" mode.
  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = _;
    }
    exports._ = _;
  } else {
    root._ = _;
  }

  // Current version.
  _.VERSION = '1.6.0';

  // Collection Functions
  // --------------------

  // The cornerstone, an `each` implementation, aka `forEach`.
  // Handles objects with the built-in `forEach`, arrays, and raw objects.
  // Delegates to **ECMAScript 5**'s native `forEach` if available.
  var each = _.each = _.forEach = function(obj, iterator, context) {
    if (obj == null) return obj;
    if (nativeForEach && obj.forEach === nativeForEach) {
      obj.forEach(iterator, context);
    } else if (obj.length === +obj.length) {
      for (var i = 0, length = obj.length; i < length; i++) {
        if (iterator.call(context, obj[i], i, obj) === breaker) return;
      }
    } else {
      var keys = _.keys(obj);
      for (var i = 0, length = keys.length; i < length; i++) {
        if (iterator.call(context, obj[keys[i]], keys[i], obj) === breaker) return;
      }
    }
    return obj;
  };

  // Return the results of applying the iterator to each element.
  // Delegates to **ECMAScript 5**'s native `map` if available.
  _.map = _.collect = function(obj, iterator, context) {
    var results = [];
    if (obj == null) return results;
    if (nativeMap && obj.map === nativeMap) return obj.map(iterator, context);
    each(obj, function(value, index, list) {
      results.push(iterator.call(context, value, index, list));
    });
    return results;
  };

  var reduceError = 'Reduce of empty array with no initial value';

  // **Reduce** builds up a single result from a list of values, aka `inject`,
  // or `foldl`. Delegates to **ECMAScript 5**'s native `reduce` if available.
  _.reduce = _.foldl = _.inject = function(obj, iterator, memo, context) {
    var initial = arguments.length > 2;
    if (obj == null) obj = [];
    if (nativeReduce && obj.reduce === nativeReduce) {
      if (context) iterator = _.bind(iterator, context);
      return initial ? obj.reduce(iterator, memo) : obj.reduce(iterator);
    }
    each(obj, function(value, index, list) {
      if (!initial) {
        memo = value;
        initial = true;
      } else {
        memo = iterator.call(context, memo, value, index, list);
      }
    });
    if (!initial) throw new TypeError(reduceError);
    return memo;
  };

  // The right-associative version of reduce, also known as `foldr`.
  // Delegates to **ECMAScript 5**'s native `reduceRight` if available.
  _.reduceRight = _.foldr = function(obj, iterator, memo, context) {
    var initial = arguments.length > 2;
    if (obj == null) obj = [];
    if (nativeReduceRight && obj.reduceRight === nativeReduceRight) {
      if (context) iterator = _.bind(iterator, context);
      return initial ? obj.reduceRight(iterator, memo) : obj.reduceRight(iterator);
    }
    var length = obj.length;
    if (length !== +length) {
      var keys = _.keys(obj);
      length = keys.length;
    }
    each(obj, function(value, index, list) {
      index = keys ? keys[--length] : --length;
      if (!initial) {
        memo = obj[index];
        initial = true;
      } else {
        memo = iterator.call(context, memo, obj[index], index, list);
      }
    });
    if (!initial) throw new TypeError(reduceError);
    return memo;
  };



// -----------------------------------------------------------------
// 14/08/05  kono 担当
//
// ここから

/*
find_.find(list, predicate, [context]) Alias: detect

var even = _.find([1, 2, 3, 4, 5, 6], function(num){ return num % 2 == 0; });
=> 2
*/
  // Return the first value which passes a truth test. Aliased as `detect`.
  _.find = _.detect = function(obj, predicate, context) {
    var result;
    // anyなんてものが出てきた
    //
    any(obj, function(value, index, list) {
      // げ、callでてきた
      if (predicate.call(context, value, index, list)) {
        // function(num){ return num % 2 == 0; }
        // contextは基本省略されたもんだと思って
        result = value;
        return true;
      }
    });
    return result;
  };


/*
filter_.filter(list, predicate, [context]) Alias: select

var evens = _.filter([1, 2, 3, 4, 5, 6], function(num){ return num % 2 == 0; });
=> [2, 4, 6]
 */
  // Return all the elements that pass a truth test.
  // Delegates to **ECMAScript 5**'s native `filter` if available.
  // Aliased as `select`.
  _.filter = _.select = function(obj, predicate, context) {

    var results = [];
    if (obj == null) return results;
    if (nativeFilter && obj.filter === nativeFilter) return obj.filter(predicate, context);
    // バリってる

    // each ->  _.each(list, iterator, [context])
    each(obj, function(value, index, list) {
      if ( predicate.call( context, value, index, list)) results.push(value);
    });

    return results;
  };


/*
reject_.reject(list, predicate, [context])

var odds = _.reject([1, 2, 3, 4, 5, 6], function(num){ return num % 2 == 0; });
=> [1, 3, 5]
 */
  // Return all the elements for which a truth test fails.
  _.reject = function(obj, predicate, context) {

    return _.filter(obj, function(value, index, list) {

      // でたcall
      return !predicate.call(context, value, index, list);
      // ん？

    }, context);
    // こういう時にはcontext渡してあげるべきなんだね

  };



// ここまで
//
// -----------------------------------------------------------------



  /// ---> @kosuki
  // Determine whether all of the elements match a truth test.
  // Delegates to **ECMAScript 5**'s native `every` if available.
  // Aliased as `all`.
  // それぞれの要素に対して、関数を適用し、すべての要素がtrueであればtrue、そうでなければfalseを返す。
  //
  // _.every([1, 2, 3, 4, 5, 6], function(v){ return v % 2 == 0;});
  // => false
  _.every = _.all = function(obj, predicate, context) {
    //predicateが定義されてなかったら、デフォルトで定義されているイテレーターを使う
    predicate || (predicate = _.identity);

    var result = true;
    if (obj == null) return result;

    // every は、与えられた callback 関数を、配列に含まれる各要素に対して一度ずつ、callback が偽の値を返す要素が見つかるまで呼び出す
    // 偽の値を返す要素が見つかると、every メソッドはただちに false を返す
    if (nativeEvery && obj.every === nativeEvery) return obj.every(predicate, context);

    // 配列の各要素に対して関数を実行する
    // predicate.call(context, value, index, list)の結果が負の時、resultを負にしてループを抜ける
    each(obj, function(value, index, list) {
      if (!(result = result && predicate.call(context, value, index, list))) return breaker;
    });

    // 二重否定を行って、Boolean型へ変換して返す
    return !!result;
  };

  // Determine if at least one element in the object matches a truth test.
  // Delegates to **ECMAScript 5**'s native `some` if available.
  // Aliased as `any`.
  var any = _.some = _.any = function(obj, predicate, context) {
    predicate || (predicate = _.identity);
    //       ん？

    var result = false;
    if (obj == null) return result;
    // ここはおｋ

    // someは配列の任意の要素に対して、指定されたコールバック関数が true を返すかどうかを判定する
    if (nativeSome && obj.some === nativeSome) return obj.some(predicate, context);

    // var each = _.each = _.forEach = function(obj, iterator, context) {
    each(obj, function(value, index, list) {
      if (result || (result = predicate.call(context, value, index, list))) return breaker;
    });

    return !!result;
    //  ん？
  };

  // ---> @mihyaeru
  // objにtargetが含まれるかを判定する関数
  // Determine if the array or object contains a given value (using `===`).
  // Aliased as `include`.
  _.contains = _.include = function(obj, target) {
    // objがnullだったらtargetを含んでいないのは確実なので即false
    if (obj == null) return false;

    // JSの実装側にindexOf関数があり、objがindexOfを呼べるなら
    // それを使いobj内のtargetのindexを得る
    // objがobjectとだとindexOfはundefinedになる
    // 得られなかった場合はobj.indexOf(target)が-1になる
    // 従ってobj内にtargetが存在すれば真が、なければ偽が返る
    if (nativeIndexOf && obj.indexOf === nativeIndexOf) return obj.indexOf(target) != -1;

    // obj内のいずれかの要素がtargetと===で一致したらtrueが返る
    // anyはすぐ上に書かれている
    return any(obj, function(value) {
      return value === target;
    });
  };

  // ---> @takahashi
  // _.invoke(list, methodName, [*arguments])
  //
  // _.invoke([[5, 1, 7], [3, 2, 1]], 'sort');
  // => [[1, 5, 7], [1, 2, 3]]
  //
  // Invoke a method (with arguments) on every item in a collection.
  // 渡したオブジェクトの要素に指定したメソッドを実行させる
  // 実は3つ目以降にも引数を渡せる その場合は method の引数となる
  // obj の要素の一つを value とすると
  // value.method(args) という感じ
  _.invoke = function(obj, method) {
    // http://www.tohoho-web.com/js/array.htm#slice
    var args = slice.call(arguments, 2);
    // _.isFunction は引数を関数かどうか判定する
    var isFunc = _.isFunction(method);
    return _.map(obj, function(value) {
      // 例えば value = [3,2,1], method = 'sort'の場合
      // 'sort' は文字列だから isFunc は false になる
      // なので value[method] になる value[method].apply(value, args);
      // さらに value[method] は [3,2,1]["sort"]
      // これは [3,2,1].sort と同義
      // つまり [3,2,1].sort.apply([3,2,1], args);
      //
      // http://www.ajaxtower.jp/js/object/index4.html
      return (isFunc ? method : value[method]).apply(value, args);
    });
  };

  // argumentsについて
  // まず arguments は関数を定義したときに自動的に定義されるオブジェクト
  // 引数を [obj, method] という形で持つ
  // 引数として定義している以上に引数を渡すと超過分は切り捨てられるが、arguments は超過分も持つ
  // 配列に姿形は酷似しているが、ただのlengthプロパティを持つオブジェクト


  // ---> @takahashi
  // Convenience version of a common use case of `map`: fetching a property.
  //
  // オブジェクトの指定したプロパティの値を返す
  // ただの_.mapのラッパー
  _.pluck = function(obj, key) {
    // _.property はデフォルトで定義されているイテレーター
    //
    // _.property ->
    // function(obj) {
    //   return obj[key];
    // };
    return _.map(obj, _.property(key));
  };

  // ---> @takahashi
  // Convenience version of a common use case of `filter`: selecting only objects
  // containing specific `key:value` pairs.
  //
  // 対象の配列から条件に合う要素を抽出して配列として返す
  // ただの_.filterのラッパー
  _.where = function(obj, attrs) {
    // _.filter は条件に合うオブジェクトの要素を全て返す
    return _.filter(obj, _.matches(attrs));
  };

  // ---> @takahashi
  // Convenience version of a common use case of `find`: getting the first object
  // containing specific `key:value` pairs.
  //
  // _.where は条件に合う全てを返すのに対し、findWhere は最初の一つだけを返す
  // ただの_.findのラッパー
  _.findWhere = function(obj, attrs) {
    // _.find は条件に合うオブジェクトの要素を１つだけ返す
    return _.find(obj, _.matches(attrs));
  };

  // ---> @kono
  // Return the maximum element or (element-based computation).
  // Can't optimize arrays of integers longer than 65,535 elements.
  // See [WebKit Bug 80797](https://bugs.webkit.org/show_bug.cgi?id=80797)
  //
  // _.max(list, [iterator], [context])
  // sample
  // var stooges = [{name: 'moe',   age: 40},
  //                {name: 'larry', age: 50},
  //                {name: 'curly', age: 60}];
  // _.max(stooges, function(stooge){ return stooge.age; });
  // => {name: 'curly', age: 60};
  _.max = function(obj, iterator, context) {
    // minと動きは同じ
    if (!iterator && _.isArray(obj) && obj[0] === +obj[0] && obj.length < 65535) {
      return Math.max.apply(Math, obj);
      // Math.max() だと、 .max(1,2,3,4,5) と直に入れる必要がとのこと
      // apply関数を使って第二引数に、maxにlistで渡すことが可能になる
      //
      // あと気になったのは、
      // obj[0] === +obj[0] <- この+
      //
    }

    // 返り値と、にInfinityを入れる。
    var result = -Infinity, lastComputed = -Infinity;
    // Infinityとはjsで最大の浮動小数点数を超える数値の定数、グローバルスコープの変数になる
    // Number.POSITIVE_INFINITY の初期値をとのこと

    // foreach
    each(obj, function(value, index, list) {

      var computed = iterator ? iterator.call(context, value, index, list) : value;
      // iteratorを指定していたらcall
      if (computed > lastComputed) {
        // あとは定番の処理
        result = value;
        lastComputed = computed;
      }
    });
    return result;
  };

  // ---> @kono
  // Return the minimum element (or element-based computation).
  //
  // _.min(list, [iterator], [context])
  // sample
  // var numbers = [10, 5, 100, 2, 1000];
  // _.min(numbers);
  // => 2
  //
  // maxと動きは同じ
  _.min = function(obj, iterator, context) {
    if (!iterator && _.isArray(obj) && obj[0] === +obj[0] && obj.length < 65535) {
      return Math.min.apply(Math, obj);
    }
    var result = Infinity, lastComputed = Infinity;
    each(obj, function(value, index, list) {
      var computed = iterator ? iterator.call(context, value, index, list) : value;
      if (computed < lastComputed) {
        result = value;
        lastComputed = computed;
      }
    });

    return result;
  };


  // ---> @jang
  // Shuffle an array, using the modern version of the
  // [Fisher-Yates shuffle](http://en.wikipedia.org/wiki/Fisher–Yates_shuffle).
  _.shuffle = function(obj) {
    var rand;
    var index = 0;
    var shuffled = [];
    each(obj, function(value) {
      rand = _.random(index++);
      shuffled[index - 1] = shuffled[rand];
      shuffled[rand] = value;
    });
    return shuffled;
  };

  // ---> @fadlil -> @mihyaeru
  // objから引数n個の要素をランダムに抽出する
  // Sample **n** random values from a collection.
  // If **n** is not specified, returns a single random element.
  // The internal `guard` argument allows it to work with `map`.
  _.sample = function(obj, n, guard) {
    // nが指定されない場合は要素を1つ返す
    // guardが存在している時(mapと一緒に使った時)も
    if (n == null || guard) {
      // objがobject(perlでいうhashの方)なら値だけの配列にする
      // objectに対しては次のようになるためobjectを判定できる
      // obj.length => undefined
      // +obj.length => NaN
      if (obj.length !== +obj.length) obj = _.values(obj);
      // 要素数-1のindexをランダムに生成し、そのindexの値を返す
      return obj[_.random(obj.length - 1)];
    }

    // objをランダムに並び替えて先頭n個(もしくは1個)を配列で返す
    return _.shuffle(obj).slice(0, Math.max(0, n));
  };

  // 14/08/19
  // @kono
  // An internal function to generate lookup iterators.
  var lookupIterator = function(value) {
    //_.identity ->  デフォルトで定義されているイテレーター
    if (value == null) return _.identity;

    // 問題がなければ、そのまます返す
    if (_.isFunction(value)) return value;

    // オブジェクトから指定プロパティを返すイテレーター
    return _.property(value);
  };

  // 14/08/19
  // @kono
  //
  // 使い方
  // _.sortBy(list, iterator, [context])
  //
  // 例
  // _.sortBy([1, 2, 3, 4, 5, 6], function(num){ return Math.sin(num); });
  // => [5, 4, 6, 3, 1, 2]
  //
  // Sort the object's values by a criterion produced by an iterator.
  _.sortBy = function(obj, iterator, context) {

    // ↑で説明
    iterator = lookupIterator(iterator);

    // オブジェクトの指定したプロパティの値を返す
    return _.pluck( _.map( obj, function(value, index, list) {
      return {
        value: value,
        index: index,
        criteria: iterator.call(context, value, index, list)
      };
    }).sort(function(left, right) {

      // criteriaがぐぐってもわからんち...
      var a = left.criteria;
      var b = right.criteria;

      // leftが大きければ正 , 後は逆 を返す
      if (a !== b) {
        if (a > b || a === void 0) return 1;
        if (a < b || b === void 0) return -1;
        // void 0はundefみたいな
      }

      // ん?
      return left.index - right.index;
    }), 'value');

  };

  // 14/08/19
  // @kosuki
  // An internal function used for aggregate "group by" operations.
  // "グループ化"操作で使用される内部関数
  // function(obj, iterator, context)の関数を返す
  // 引数：behaviorも関数
  var group = function(behavior) {
    return function(obj, iterator, context) {
      // グルーピングした結果を入れる連想配列
      var result = {};

      // iteratorが関数だったら、iteratorを、
      // 関数じゃなかったら、function(obj) { return obj[iterator]; }; という関数を返す
      iterator = lookupIterator(iterator);

      // objの各要素に対して、関数を実行する
      each(obj, function(value, index) {

        var key = iterator.call(context, value, index, obj);

        // グルーピング
        behavior(result, key, value);
      });

      return result;
    };
  };


  // 14/08/19
  // @takano
  // Groups the object's values by a criterion. Pass either a string attribute
  // to group by, or a function that returns the criterion.
  _.groupBy = group(function(result, key, value) {
    _.has(result, key) ? result[key].push(value) : result[key] = [value];
  });

  // 14/08/19
  // @takano
  // Indexes the object's values by a criterion, similar to `groupBy`, but for
  // when you know that your index values will be unique.
  _.indexBy = group(function(result, key, value) {
    result[key] = value;
  });

  // 14/08/19
  // @jang
  // Counts instances of an object that group by a certain criterion. Pass
  // either a string attribute to count by, or a function that returns the
  // criterion.
  _.countBy = group(function(result, key) {
    _.has(result, key) ? result[key]++ : result[key] = 1;
  });


  // 14/08/19
  // @jang
  // Use a comparator function to figure out the smallest index at which
  // an object should be inserted so as to maintain order. Uses binary search.
  _.sortedIndex = function(array, obj, iterator, context) {
    iterator = lookupIterator(iterator);
    var value = iterator.call(context, obj);
    var low = 0, high = array.length;
    while (low < high) {
      var mid = (low + high) >>> 1;
      iterator.call(context, array[mid]) < value ? low = mid + 1 : high = mid;
    }
    return low;
  };


  // @fad
  // Safely create a real, live array from anything iterable.
  _.toArray = function(obj) {
    if (!obj) return [];
    if (_.isArray(obj)) return slice.call(obj);
    if (obj.length === +obj.length) return _.map(obj, _.identity);
    return _.values(obj);
  };

  // @takahashi
  // Return the number of elements in an object.
  // 要素数を返す関数
  // ではなく 配列, 連想配列 のサイズを返す関数
  // javascript の length は要素数ではなく、 最後のインデックス+1 の値を返すため
  _.size = function(obj) {
    // obj が null なら 0 を返す
    if (obj == null) return 0;
    // obj が 配列 ならそのまま length で配列のサイズを返す
    // obj が 連想配列 なら keys で key の配列を取ってきて、そのサイズを返す
    return (obj.length === +obj.length) ? obj.length : _.keys(obj).length;
  };


  // Array Functions
  // ---------------

  // Get the first element of an array. Passing **n** will return the first N
  // values in the array. Aliased as `head` and `take`. The **guard** check
  // allows it to work with `_.map`.
  // 渡した配列の最初からn番目の要素を取り出す
  // n未指定だったら最初の要素だけ取り出す
  _.first = _.head = _.take = function(array, n, guard) {
    // array に指定が無ければ undefined を返す void 0 == undefined
    if (array == null) return void 0;
    // n が未指定 または guard が true(何か値が入っていたら) 最初の要素を返す
    if ((n == null) || guard) return array[0];
    // n が0より小さければ、空の配列を返す
    if (n < 0) return [];
    // n に指定があり、guard が falseなら、最初からn番目までの配列を返す
    return slice.call(array, 0, n);
  };

  // guardの秘密
  // guardのチェックが入っているのは、この_.firstが_.mapのイテレータとして使われた場合を想定しているらしい
  // コードとしては汚いけど、そこは許容
  //
  // _.mapのイテレータとして関数が使われた場合、引数として val, key, obj の3つが渡されることになる
  // ここで問題なのが、_.first の本来求める引数と、_.mapで使われた場合に渡される引数の意味が異なる点にある
  // 例えば、
  // var array = [[1,2,3],[4,5,6]];
  // var array_maped = _.map(array, _.first);
  // とすると、array_mapedには[1,4]と入ってほしいはず
  // しかし、guardのチェックが存在しないと結果は
  // [[], [4]]
  // こうなる

  // Returns everything but the last entry of the array. Especially useful on
  // the arguments object. Passing **n** will return all the values in
  // the array, excluding the last N. The **guard** check allows it to work with
  // `_.map`.
  // 渡した配列の最後からn個の要素以外を返す
  // nが未指定なら、最後の要素以外を返す
  _.initial = function(array, n, guard) {
    // nが未指定 または guard が true なら array.length - 1 なので最後以外
    // nを指定 かつ guard が false なら array.length - n なので最後からn個の要素以外を返す
    return slice.call(array, 0, array.length - ((n == null) || guard ? 1 : n));
  };

  // Get the last element of an array. Passing **n** will return the last N
  // values in the array. The **guard** check allows it to work with `_.map`.
  // 渡した配列の最後からn番目までの要素を返す
  // nが未指定なら、最後の要素だけを返す
  // _.firstの逆版
  _.last = function(array, n, guard) {
    // array が未指定なら、undefinedを返す
    if (array == null) return void 0;
    // nが未指定 または guard がtrueなら、最後の要素を返す
    if ((n == null) || guard) return array[array.length - 1];
    // nに指定があり かつ guard がfalseなら、最後からn番目の要素を返す
    // Math.max(array.length - n, 0) で負の数を指定することを制限している
    return slice.call(array, Math.max(array.length - n, 0));
  };

  // Returns everything but the first entry of the array. Aliased as `tail` and `drop`.
  // Especially useful on the arguments object. Passing an **n** will return
  // the rest N values in the array. The **guard**
  // check allows it to work with `_.map`.
  // 渡した配列の先頭からn番目の要素を取り除いた配列を返す
  // nの指定が無い場合は、先頭の要素を取り除いた配列を返す
  _.rest = _.tail = _.drop = function(array, n, guard) {
    // nが未指定 または guard が true なら先頭の要素を取り除いた配列を返す
    return slice.call(array, (n == null) || guard ? 1 : n);
  };

  // Trim out all falsy values from an array.
  // false、null、0、""、undefined を渡した配列から取り除く
  _.compact = function(array) {
    // _.filterはプレディケイトでtrueと判断された要素のみを配列として返す
    return _.filter(array, _.identity);
  };

  // Internal implementation of a recursive `flatten` function.
  // _.flatten内部から呼ばれる
  var flatten = function(input, shallow, output) {
    // input の要素が全て配列 かつ shallow が trueならば
    if (shallow && _.every(input, _.isArray)) {
      // output.concat(input)
      // _.flatten から呼ばれる場合、outputは[]になる
      // つまり空配列[]と、inputを連結した結果を返す
      // 全部配列ならconcatで連結すれば一次元配列に変換出来るため
      return concat.apply(output, input);
    }
    // input のどれか一つでも配列では無かった場合
    // each でまわしながら 配列か、argumentsか、それ以外かで場合分けする
    each(input, function(value) {
      // value が配列 または arguments なら
      if (_.isArray(value) || _.isArguments(value)) {
        // shallow がtrueなら output にそのまま valueを突っ込む
        // shallow がfalseなら flattenを再起的に呼び出す
        shallow ? push.apply(output, value) : flatten(value, shallow, output);
      } else {
        // それ以外なら value をそのまま output に突っ込む
        output.push(value);
      }
    });
    // 結果を返す
    return output;
  };

  // Flatten out an array, either recursively (by default), or just one level.
  // 多次元配列を一次元化する
  // 三次元から二次元に行きたい(願望
  _.flatten = function(array, shallow) {
    // flattenを呼び出す
    // shallowをtrueに指定すると、arrayが全て配列かどうか調べた後、concatで1階層だけについて処理を行う
    // http://underscorejs.org/#flatten
    return flatten(array, shallow, []);
  };

  // Return a version of the array that does not contain the specified value(s).
  // 渡した配列から、第２引数から指定した値を取り除いた配列を返す
  _.without = function(array) {
    // _.difference は array から 第2引数で渡した配列の要素を取り除いた配列を返す
    // _.without の指定方法を配列に置き換えたバージョン ( call と apply の関係みたいな )
    return _.difference(array, slice.call(arguments, 1));
  };

  // Split an array into two arrays: one whose elements all satisfy the given
  // predicate, and one whose elements all do not satisfy the predicate.
  // 渡した配列をpredicateで評価した後、評価結果で分割した配列として返す
  // _.partition([0,1,2,3,4,5], isOdd);
  // => [[1,3,5],[0,2,4]]
  _.partition = function(array, predicate) {
    // predicateでtrueならpassに、falseならfailの配列に追加される
    var pass = [], fail = [];
    each(array, function(elem) {
      (predicate(elem) ? pass : fail).push(elem);
    });
    return [pass, fail];
  };

  // Produce a duplicate-free version of the array. If the array has already
  // been sorted, you have the option of using a faster algorithm.
  // Aliased as `unique`.
  // 渡した配列の要素の重複を取り除く
  // 配列がソートされている場合にisSortedをtrueにすると、処理が速くなる
  // iteratorを指定すると、重複を取り除く前にarrayの各要素にiteratorを適応する
  _.uniq = _.unique = function(array, isSorted, iterator, context) {
    // isSortedを指定せずにiterator以下を指定したい場合に、引数をずらす
    if (_.isFunction(isSorted)) {
      context = iterator;
      iterator = isSorted;
      isSorted = false;
    }
    // 処理対象の配列に対して、iteratorが指定してあるならmapで処理する
    // iteratorを指定していないならarrayそのまま
    var initial = iterator ? _.map(array, iterator, context) : array;
    var results = [];
    var seen = [];
    each(initial, function(value, index) {
      // isSortedがtrueなら処理速度の速いアルゴリズムで計算する (アルゴリズムの中身はそうなのかぁ程度に見る
      // falseならseenの中にvalueがあるかどうかをcontainsで見る
      // 無ければseenに追加しつつ、resultsにも追加する
      if (isSorted ? (!index || seen[seen.length - 1] !== value) : !_.contains(seen, value)) {
        seen.push(value);
        results.push(array[index]);
      }
    });
    return results;
  };

  // Produce an array that contains the union: each distinct element from all of
  // the passed-in arrays.
  // arraysの和集合を取る (重複を取り除いた形
  _.union = function() {
    // _.flattenでconcatしつつ、_.uniqで重複を取り除く
    return _.uniq(_.flatten(arguments, true));
  };

  // Produce an array that contains every item shared between all the
  // passed-in arrays.
  _.intersection = function(array) {
    var rest = slice.call(arguments, 1);
    return _.filter(_.uniq(array), function(item) {
      return _.every(rest, function(other) {
        return _.contains(other, item);
      });
    });
  };

  // Take the difference between one array and a number of other arrays.
  // Only the elements present in just the first array will remain.
  // 第１引数に渡した配列から、第２引数で渡した配列の要素を取り除く
  _.difference = function(array) {
    // ArrayProto は 元々ある javascript のArrayオブジェクト
    // ただ、sliceすればよいのではと思うけど、よくわがんね
    var rest = concat.apply(ArrayProto, slice.call(arguments, 1));
    // _.filter でその名の通りフィルターをかける
    // _.contains は渡した配列内に、第２引数で指定した値が入っていれば true を返す
    // なので、今回の場合は array から一つずつrestに対して contains して、その値が異なればOKという感じ
    return _.filter(array, function(value){ return !_.contains(rest, value); });
  };

  // Zip together multiple lists into a single array -- elements that share
  // an index go together.
  _.zip = function() {
    var length = _.max(_.pluck(arguments, 'length').concat(0));
    var results = new Array(length);
    for (var i = 0; i < length; i++) {
      results[i] = _.pluck(arguments, '' + i);
    }
    return results;
  };

  // Converts lists into objects. Pass either a single array of `[key, value]`
  // pairs, or two parallel arrays of the same length -- one of keys, and one of
  // the corresponding values.
  _.object = function(list, values) {
    if (list == null) return {};
    var result = {};
    for (var i = 0, length = list.length; i < length; i++) {
      if (values) {
        result[list[i]] = values[i];
      } else {
        result[list[i][0]] = list[i][1];
      }
    }
    return result;
  };

  // If the browser doesn't supply us with indexOf (I'm looking at you, **MSIE**),
  // we need this function. Return the position of the first occurrence of an
  // item in an array, or -1 if the item is not included in the array.
  // Delegates to **ECMAScript 5**'s native `indexOf` if available.
  // If the array is large and already in sort order, pass `true`
  // for **isSorted** to use binary search.
  _.indexOf = function(array, item, isSorted) {
    if (array == null) return -1;
    var i = 0, length = array.length;
    if (isSorted) {
      if (typeof isSorted == 'number') {
        i = (isSorted < 0 ? Math.max(0, length + isSorted) : isSorted);
      } else {
        i = _.sortedIndex(array, item);
        return array[i] === item ? i : -1;
      }
    }
    if (nativeIndexOf && array.indexOf === nativeIndexOf) return array.indexOf(item, isSorted);
    for (; i < length; i++) if (array[i] === item) return i;
    return -1;
  };

  // Delegates to **ECMAScript 5**'s native `lastIndexOf` if available.
  _.lastIndexOf = function(array, item, from) {
    if (array == null) return -1;
    var hasIndex = from != null;
    if (nativeLastIndexOf && array.lastIndexOf === nativeLastIndexOf) {
      return hasIndex ? array.lastIndexOf(item, from) : array.lastIndexOf(item);
    }
    var i = (hasIndex ? from : array.length);
    while (i--) if (array[i] === item) return i;
    return -1;
  };

  // Generate an integer Array containing an arithmetic progression. A port of
  // the native Python `range()` function. See
  // [the Python documentation](http://docs.python.org/library/functions.html#range).
  _.range = function(start, stop, step) {
    if (arguments.length <= 1) {
      stop = start || 0;
      start = 0;
    }
    step = arguments[2] || 1;

    var length = Math.max(Math.ceil((stop - start) / step), 0);
    var idx = 0;
    var range = new Array(length);

    while(idx < length) {
      range[idx++] = start;
      start += step;
    }

    return range;
  };

  // Function (ahem) Functions
  // ------------------

  // Reusable constructor function for prototype setting.
  var ctor = function(){};

  // Create a function bound to a given object (assigning `this`, and arguments,
  // optionally). Delegates to **ECMAScript 5**'s native `Function.bind` if
  // available.
  _.bind = function(func, context) {
    var args, bound;
    if (nativeBind && func.bind === nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
    if (!_.isFunction(func)) throw new TypeError;
    args = slice.call(arguments, 2);
    return bound = function() {
      if (!(this instanceof bound)) return func.apply(context, args.concat(slice.call(arguments)));
      ctor.prototype = func.prototype;
      var self = new ctor;
      ctor.prototype = null;
      var result = func.apply(self, args.concat(slice.call(arguments)));
      if (Object(result) === result) return result;
      return self;
    };
  };

  // Partially apply a function by creating a version that has had some of its
  // arguments pre-filled, without changing its dynamic `this` context. _ acts
  // as a placeholder, allowing any combination of arguments to be pre-filled.
  _.partial = function(func) {
    var boundArgs = slice.call(arguments, 1);
    return function() {
      var position = 0;
      var args = boundArgs.slice();
      for (var i = 0, length = args.length; i < length; i++) {
        if (args[i] === _) args[i] = arguments[position++];
      }
      while (position < arguments.length) args.push(arguments[position++]);
      return func.apply(this, args);
    };
  };

  // Bind a number of an object's methods to that object. Remaining arguments
  // are the method names to be bound. Useful for ensuring that all callbacks
  // defined on an object belong to it.
  _.bindAll = function(obj) {
    var funcs = slice.call(arguments, 1);
    if (funcs.length === 0) throw new Error('bindAll must be passed function names');
    each(funcs, function(f) { obj[f] = _.bind(obj[f], obj); });
    return obj;
  };

  // Memoize an expensive function by storing its results.
  _.memoize = function(func, hasher) {
    var memo = {};
    hasher || (hasher = _.identity);
    return function() {
      var key = hasher.apply(this, arguments);
      return _.has(memo, key) ? memo[key] : (memo[key] = func.apply(this, arguments));
    };
  };

  // Delays a function for the given number of milliseconds, and then calls
  // it with the arguments supplied.
  _.delay = function(func, wait) {
    var args = slice.call(arguments, 2);
    return setTimeout(function(){ return func.apply(null, args); }, wait);
  };

  // Defers a function, scheduling it to run after the current call stack has
  // cleared.
  _.defer = function(func) {
    return _.delay.apply(_, [func, 1].concat(slice.call(arguments, 1)));
  };

  // Returns a function, that, when invoked, will only be triggered at most once
  // during a given window of time. Normally, the throttled function will run
  // as much as it can, without ever going more than once per `wait` duration;
  // but if you'd like to disable the execution on the leading edge, pass
  // `{leading: false}`. To disable execution on the trailing edge, ditto.
  _.throttle = function(func, wait, options) {
    var context, args, result;
    var timeout = null;
    var previous = 0;
    options || (options = {});
    var later = function() {
      previous = options.leading === false ? 0 : _.now();
      timeout = null;
      result = func.apply(context, args);
      context = args = null;
    };
    return function() {
      var now = _.now();
      if (!previous && options.leading === false) previous = now;
      var remaining = wait - (now - previous);
      context = this;
      args = arguments;
      if (remaining <= 0) {
        clearTimeout(timeout);
        timeout = null;
        previous = now;
        result = func.apply(context, args);
        context = args = null;
      } else if (!timeout && options.trailing !== false) {
        timeout = setTimeout(later, remaining);
      }
      return result;
    };
  };

  // Returns a function, that, as long as it continues to be invoked, will not
  // be triggered. The function will be called after it stops being called for
  // N milliseconds. If `immediate` is passed, trigger the function on the
  // leading edge, instead of the trailing.
  _.debounce = function(func, wait, immediate) {
    var timeout, args, context, timestamp, result;

    var later = function() {
      var last = _.now() - timestamp;
      if (last < wait) {
        timeout = setTimeout(later, wait - last);
      } else {
        timeout = null;
        if (!immediate) {
          result = func.apply(context, args);
          context = args = null;
        }
      }
    };

    return function() {
      context = this;
      args = arguments;
      timestamp = _.now();
      var callNow = immediate && !timeout;
      if (!timeout) {
        timeout = setTimeout(later, wait);
      }
      if (callNow) {
        result = func.apply(context, args);
        context = args = null;
      }

      return result;
    };
  };

  // Returns a function that will be executed at most one time, no matter how
  // often you call it. Useful for lazy initialization.
  _.once = function(func) {
    var ran = false, memo;
    return function() {
      if (ran) return memo;
      ran = true;
      memo = func.apply(this, arguments);
      func = null;
      return memo;
    };
  };

  // Returns the first function passed as an argument to the second,
  // allowing you to adjust arguments, run code before and after, and
  // conditionally execute the original function.
  _.wrap = function(func, wrapper) {
    return _.partial(wrapper, func);
  };

  // Returns a function that is the composition of a list of functions, each
  // consuming the return value of the function that follows.
  _.compose = function() {
    var funcs = arguments;
    return function() {
      var args = arguments;
      for (var i = funcs.length - 1; i >= 0; i--) {
        args = [funcs[i].apply(this, args)];
      }
      return args[0];
    };
  };

  // Returns a function that will only be executed after being called N times.
  _.after = function(times, func) {
    return function() {
      if (--times < 1) {
        return func.apply(this, arguments);
      }
    };
  };

  // Object Functions
  // ----------------

  // Retrieve the names of an object's properties.
  // Delegates to **ECMAScript 5**'s native `Object.keys`
  _.keys = function(obj) {
    if (!_.isObject(obj)) return [];
    if (nativeKeys) return nativeKeys(obj);
    var keys = [];
    for (var key in obj) if (_.has(obj, key)) keys.push(key);
    return keys;
  };

  // Retrieve the values of an object's properties.
  _.values = function(obj) {
    var keys = _.keys(obj);
    var length = keys.length;
    var values = new Array(length);
    for (var i = 0; i < length; i++) {
      values[i] = obj[keys[i]];
    }
    return values;
  };

  // Convert an object into a list of `[key, value]` pairs.
  _.pairs = function(obj) {
    var keys = _.keys(obj);
    var length = keys.length;
    var pairs = new Array(length);
    for (var i = 0; i < length; i++) {
      pairs[i] = [keys[i], obj[keys[i]]];
    }
    return pairs;
  };

  // Invert the keys and values of an object. The values must be serializable.
  _.invert = function(obj) {
    var result = {};
    var keys = _.keys(obj);
    for (var i = 0, length = keys.length; i < length; i++) {
      result[obj[keys[i]]] = keys[i];
    }
    return result;
  };

  // Return a sorted list of the function names available on the object.
  // Aliased as `methods`
  _.functions = _.methods = function(obj) {
    var names = [];
    for (var key in obj) {
      if (_.isFunction(obj[key])) names.push(key);
    }
    return names.sort();
  };

  // Extend a given object with all the properties in passed-in object(s).
  _.extend = function(obj) {
    each(slice.call(arguments, 1), function(source) {
      if (source) {
        for (var prop in source) {
          obj[prop] = source[prop];
        }
      }
    });
    return obj;
  };

  // Return a copy of the object only containing the whitelisted properties.
  _.pick = function(obj) {
    var copy = {};
    var keys = concat.apply(ArrayProto, slice.call(arguments, 1));
    each(keys, function(key) {
      if (key in obj) copy[key] = obj[key];
    });
    return copy;
  };

   // Return a copy of the object without the blacklisted properties.
  _.omit = function(obj) {
    var copy = {};
    var keys = concat.apply(ArrayProto, slice.call(arguments, 1));
    for (var key in obj) {
      if (!_.contains(keys, key)) copy[key] = obj[key];
    }
    return copy;
  };

  // Fill in a given object with default properties.
  _.defaults = function(obj) {
    each(slice.call(arguments, 1), function(source) {
      if (source) {
        for (var prop in source) {
          if (obj[prop] === void 0) obj[prop] = source[prop];
        }
      }
    });
    return obj;
  };

  // Create a (shallow-cloned) duplicate of an object.
  _.clone = function(obj) {
    if (!_.isObject(obj)) return obj;
    return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
  };

  // Invokes interceptor with the obj, and then returns obj.
  // The primary purpose of this method is to "tap into" a method chain, in
  // order to perform operations on intermediate results within the chain.
  _.tap = function(obj, interceptor) {
    interceptor(obj);
    return obj;
  };

  // Internal recursive comparison function for `isEqual`.
  var eq = function(a, b, aStack, bStack) {
    // Identical objects are equal. `0 === -0`, but they aren't identical.
    // See the [Harmony `egal` proposal](http://wiki.ecmascript.org/doku.php?id=harmony:egal).
    if (a === b) return a !== 0 || 1 / a == 1 / b;
    // A strict comparison is necessary because `null == undefined`.
    if (a == null || b == null) return a === b;
    // Unwrap any wrapped objects.
    if (a instanceof _) a = a._wrapped;
    if (b instanceof _) b = b._wrapped;
    // Compare `[[Class]]` names.
    var className = toString.call(a);
    if (className != toString.call(b)) return false;
    switch (className) {
      // Strings, numbers, dates, and booleans are compared by value.
      case '[object String]':
        // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
        // equivalent to `new String("5")`.
        return a == String(b);
      case '[object Number]':
        // `NaN`s are equivalent, but non-reflexive. An `egal` comparison is performed for
        // other numeric values.
        return a != +a ? b != +b : (a == 0 ? 1 / a == 1 / b : a == +b);
      case '[object Date]':
      case '[object Boolean]':
        // Coerce dates and booleans to numeric primitive values. Dates are compared by their
        // millisecond representations. Note that invalid dates with millisecond representations
        // of `NaN` are not equivalent.
        return +a == +b;
      // RegExps are compared by their source patterns and flags.
      case '[object RegExp]':
        return a.source == b.source &&
               a.global == b.global &&
               a.multiline == b.multiline &&
               a.ignoreCase == b.ignoreCase;
    }
    if (typeof a != 'object' || typeof b != 'object') return false;
    // Assume equality for cyclic structures. The algorithm for detecting cyclic
    // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.
    var length = aStack.length;
    while (length--) {
      // Linear search. Performance is inversely proportional to the number of
      // unique nested structures.
      if (aStack[length] == a) return bStack[length] == b;
    }
    // Objects with different constructors are not equivalent, but `Object`s
    // from different frames are.
    var aCtor = a.constructor, bCtor = b.constructor;
    if (aCtor !== bCtor && !(_.isFunction(aCtor) && (aCtor instanceof aCtor) &&
                             _.isFunction(bCtor) && (bCtor instanceof bCtor))
                        && ('constructor' in a && 'constructor' in b)) {
      return false;
    }
    // Add the first object to the stack of traversed objects.
    aStack.push(a);
    bStack.push(b);
    var size = 0, result = true;
    // Recursively compare objects and arrays.
    if (className == '[object Array]') {
      // Compare array lengths to determine if a deep comparison is necessary.
      size = a.length;
      result = size == b.length;
      if (result) {
        // Deep compare the contents, ignoring non-numeric properties.
        while (size--) {
          if (!(result = eq(a[size], b[size], aStack, bStack))) break;
        }
      }
    } else {
      // Deep compare objects.
      for (var key in a) {
        if (_.has(a, key)) {
          // Count the expected number of properties.
          size++;
          // Deep compare each member.
          if (!(result = _.has(b, key) && eq(a[key], b[key], aStack, bStack))) break;
        }
      }
      // Ensure that both objects contain the same number of properties.
      if (result) {
        for (key in b) {
          if (_.has(b, key) && !(size--)) break;
        }
        result = !size;
      }
    }
    // Remove the first object from the stack of traversed objects.
    aStack.pop();
    bStack.pop();
    return result;
  };

  // Perform a deep comparison to check if two objects are equal.
  _.isEqual = function(a, b) {
    return eq(a, b, [], []);
  };

  // Is a given array, string, or object empty?
  // An "empty" object has no enumerable own-properties.
  _.isEmpty = function(obj) {
    if (obj == null) return true;
    if (_.isArray(obj) || _.isString(obj)) return obj.length === 0;
    for (var key in obj) if (_.has(obj, key)) return false;
    return true;
  };

  // Is a given value a DOM element?
  _.isElement = function(obj) {
    return !!(obj && obj.nodeType === 1);
  };

  // Is a given value an array?
  // Delegates to ECMA5's native Array.isArray
  _.isArray = nativeIsArray || function(obj) {
    return toString.call(obj) == '[object Array]';
  };

  // Is a given variable an object?
  _.isObject = function(obj) {
    return obj === Object(obj);
  };


// ------------>
  // Add some isType methods: isArguments, isFunction, isString, isNumber, isDate, isRegExp.
  // is系のメソッドをまとめて定義している
  each(['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp'], function(name) {
    // オブジェクトのプロパティにアクセスする方法は2種類
    // 1. obj.property
    // 2. obj["property"]
    //
    // 2つ目を用いることで"文字列"を使ってプロパティにアクセス出来る
    _['is' + name] = function(obj) {
      // obj.toStringと同等
      // オブジェクトの種類をチェック
      return toString.call(obj) == '[object ' + name + ']';
    };
  });

  // Define a fallback version of the method in browsers (ahem, IE), where
  // there isn't any inspectable "Arguments" type.
  if (!_.isArguments(arguments)) {
    _.isArguments = function(obj) {
      return !!(obj && _.has(obj, 'callee'));
    };
  }

  // Optimize `isFunction` if appropriate.
  if (typeof (/./) !== 'function') {
    _.isFunction = function(obj) {
      return typeof obj === 'function';
    };
  }

  // Is a given object a finite number?
  _.isFinite = function(obj) {
    return isFinite(obj) && !isNaN(parseFloat(obj));
  };

  // Is the given value `NaN`? (NaN is the only number which does not equal itself).
  _.isNaN = function(obj) {
    return _.isNumber(obj) && obj != +obj;
  };

  // Is a given value a boolean?
  _.isBoolean = function(obj) {
    return obj === true || obj === false || toString.call(obj) == '[object Boolean]';
  };

  // Is a given value equal to null?
  _.isNull = function(obj) {
    return obj === null;
  };

  // Is a given variable undefined?
  _.isUndefined = function(obj) {
    return obj === void 0;
  };

  // Shortcut function for checking if an object has a given property directly
  // on itself (in other words, not on a prototype).
  _.has = function(obj, key) {
    return hasOwnProperty.call(obj, key);
  };

  // Utility Functions
  // -----------------

  // Run Underscore.js in *noConflict* mode, returning the `_` variable to its
  // previous owner. Returns a reference to the Underscore object.
  _.noConflict = function() {
    root._ = previousUnderscore;
    return this;
  };

  // デフォルトで定義されているイテレーター
  // Keep the identity function around for default iterators.
  _.identity = function(value) {
    return value;
  };

  _.constant = function(value) {
    return function () {
      return value;
    };
  };

  // オブジェクトから指定プロパティを返すイテレーター
  _.property = function(key) {
    return function(obj) {
      return obj[key];
    };
  };

  // Returns a predicate for checking whether an object has a given set of `key:value` pairs.
  //
  // 属性がオブジェクトにマッチするかを返すイテレーター
  // 属性自体がオブジェクトにマッチするか、
  // オブジェクトにその属性が含まれていればマッチする
  _.matches = function(attrs) {
    return function(obj) {
      if (obj === attrs) return true; //avoid comparing an object to itself.
      for (var key in attrs) {
        if (attrs[key] !== obj[key])
          return false;
      }
      return true;
    }
  };

  // Run a function **n** times.
  _.times = function(n, iterator, context) {
    var accum = Array(Math.max(0, n));
    for (var i = 0; i < n; i++) accum[i] = iterator.call(context, i);
    return accum;
  };

  // Return a random integer between min and max (inclusive).
  _.random = function(min, max) {
    if (max == null) {
      max = min;
      min = 0;
    }
    return min + Math.floor(Math.random() * (max - min + 1));
  };

  // A (possibly faster) way to get the current timestamp as an integer.
  _.now = Date.now || function() { return new Date().getTime(); };

  // List of HTML entities for escaping.
  var entityMap = {
    escape: {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;'
    }
  };
  entityMap.unescape = _.invert(entityMap.escape);

  // Regexes containing the keys and values listed immediately above.
  var entityRegexes = {
    escape:   new RegExp('[' + _.keys(entityMap.escape).join('') + ']', 'g'),
    unescape: new RegExp('(' + _.keys(entityMap.unescape).join('|') + ')', 'g')
  };

  // Functions for escaping and unescaping strings to/from HTML interpolation.
  _.each(['escape', 'unescape'], function(method) {
    _[method] = function(string) {
      if (string == null) return '';
      return ('' + string).replace(entityRegexes[method], function(match) {
        return entityMap[method][match];
      });
    };
  });

  // If the value of the named `property` is a function then invoke it with the
  // `object` as context; otherwise, return it.
  _.result = function(object, property) {
    if (object == null) return void 0;
    var value = object[property];
    return _.isFunction(value) ? value.call(object) : value;
  };

  // Add your own custom functions to the Underscore object.
  _.mixin = function(obj) {
    each(_.functions(obj), function(name) {
      var func = _[name] = obj[name];
      _.prototype[name] = function() {
        var args = [this._wrapped];
        push.apply(args, arguments);
        return result.call(this, func.apply(_, args));
      };
    });
  };

  // Generate a unique integer id (unique within the entire client session).
  // Useful for temporary DOM ids.
  var idCounter = 0;
  _.uniqueId = function(prefix) {
    var id = ++idCounter + '';
    return prefix ? prefix + id : id;
  };

  // By default, Underscore uses ERB-style template delimiters, change the
  // following template settings to use alternative delimiters.
  _.templateSettings = {
    evaluate    : /<%([\s\S]+?)%>/g,
    interpolate : /<%=([\s\S]+?)%>/g,
    escape      : /<%-([\s\S]+?)%>/g
  };

  // When customizing `templateSettings`, if you don't want to define an
  // interpolation, evaluation or escaping regex, we need one that is
  // guaranteed not to match.
  var noMatch = /(.)^/;

  // Certain characters need to be escaped so that they can be put into a
  // string literal.
  var escapes = {
    "'":      "'",
    '\\':     '\\',
    '\r':     'r',
    '\n':     'n',
    '\t':     't',
    '\u2028': 'u2028',
    '\u2029': 'u2029'
  };

  var escaper = /\\|'|\r|\n|\t|\u2028|\u2029/g;

  // JavaScript micro-templating, similar to John Resig's implementation.
  // Underscore templating handles arbitrary delimiters, preserves whitespace,
  // and correctly escapes quotes within interpolated code.
  _.template = function(text, data, settings) {
    var render;
    settings = _.defaults({}, settings, _.templateSettings);

    // Combine delimiters into one regular expression via alternation.
    var matcher = new RegExp([
      (settings.escape || noMatch).source,
      (settings.interpolate || noMatch).source,
      (settings.evaluate || noMatch).source
    ].join('|') + '|$', 'g');

    // Compile the template source, escaping string literals appropriately.
    var index = 0;
    var source = "__p+='";
    text.replace(matcher, function(match, escape, interpolate, evaluate, offset) {
      source += text.slice(index, offset)
        .replace(escaper, function(match) { return '\\' + escapes[match]; });

      if (escape) {
        source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
      }
      if (interpolate) {
        source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
      }
      if (evaluate) {
        source += "';\n" + evaluate + "\n__p+='";
      }
      index = offset + match.length;
      return match;
    });
    source += "';\n";

    // If a variable is not specified, place data values in local scope.
    if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';

    source = "var __t,__p='',__j=Array.prototype.join," +
      "print=function(){__p+=__j.call(arguments,'');};\n" +
      source + "return __p;\n";

    try {
      render = new Function(settings.variable || 'obj', '_', source);
    } catch (e) {
      e.source = source;
      throw e;
    }

    if (data) return render(data, _);
    var template = function(data) {
      return render.call(this, data, _);
    };

    // Provide the compiled function source as a convenience for precompilation.
    template.source = 'function(' + (settings.variable || 'obj') + '){\n' + source + '}';

    return template;
  };

  // Add a "chain" function, which will delegate to the wrapper.
  _.chain = function(obj) {
    return _(obj).chain();
  };

  // OOP
  // ---------------
  // If Underscore is called as a function, it returns a wrapped object that
  // can be used OO-style. This wrapper holds altered versions of all the
  // underscore functions. Wrapped objects may be chained.

  // Helper function to continue chaining intermediate results.
  var result = function(obj) {
    return this._chain ? _(obj).chain() : obj;
  };

  // Add all of the Underscore functions to the wrapper object.
  _.mixin(_);

  // Add all mutator Array functions to the wrapper.
  each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      var obj = this._wrapped;
      method.apply(obj, arguments);
      if ((name == 'shift' || name == 'splice') && obj.length === 0) delete obj[0];
      return result.call(this, obj);
    };
  });

  // Add all accessor Array functions to the wrapper.
  each(['concat', 'join', 'slice'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      return result.call(this, method.apply(this._wrapped, arguments));
    };
  });

  _.extend(_.prototype, {

    // Start chaining a wrapped Underscore object.
    chain: function() {
      this._chain = true;
      return this;
    },

    // Extracts the result from a wrapped and chained object.
    value: function() {
      return this._wrapped;
    }

  });

  // AMD registration happens at the end for compatibility with AMD loaders
  // that may not enforce next-turn semantics on modules. Even though general
  // practice for AMD registration is to be anonymous, underscore registers
  // as a named module because, like jQuery, it is a base library that is
  // popular enough to be bundled in a third party lib, but not be part of
  // an AMD load request. Those cases could generate an error when an
  // anonymous define() is called outside of a loader request.
  if (typeof define === 'function' && define.amd) {
    define('underscore', [], function() {
      return _;
    });
  }
}).call(this);
