var ALGORITHM = {};

ALGORITHM.COMPARE = function () {
  this.dataList = [];
  this.randomDataList = [];
  this.DATACOUNT = 10000;
};
ALGORITHM.COMPARE.prototype = {
  init: function () {
    var chartData = this.getChartData();
    this.makeChart( chartData );
    this.setDataToTable( chartData );
  },
  getChartData: function () {
    var chartData = [];
    chartData.push([
      '探索回数', 'indexOf関数', 'リニアサーチ', 'バイナリサーチ', 'ハッシュ探索'
      ]);

    var searchCounts = [100, 1000, 10000, 100000];

    for( var i = 0,len = searchCounts.length;i < len;i++ ) {
      chartData.push( this.compare( this.DATACOUNT, searchCounts[i] ) );
    }
    return chartData;
  },
  compare: function ( dataCount, searchCount ) {
    console.log('searchStart! dataCount:' + dataCount + ', searchCount: ' + searchCount);

    var chartRowData = [];
    var process = new PROCESS();
    var searchObject = new ALGORITHM.SEARCH(this.dataList);
    var hashSearchObject = new ALGORITHM.SEARCH(this.randomDataList);
    var dataIndex;

    //探索用のデータ配列生成
    this.makeDataList( dataCount );

    //検索する番号をランダムで生成
    var searchNumberList = [];
    for( var i = 0;i < searchCount;i++ ) {
      var searchNumber = Math.round(Math.random() * dataCount);
      searchNumberList.push(searchNumber);
    }

    //indexOf関数で配列の位置を取得する
    process.start('indexOf');
    for( var i = 0;i < searchCount;i++ ) {
      dataIndex = searchObject.indexOf( searchNumber );
    }
    var timeIndexOf = process.end('indexOf');

    //リニアサーチで配列の位置を取得する
    process.start('linearSearch');
    for( var i = 0;i < searchCount;i++ ) {
      dataIndex = searchObject.linearSearch( searchNumber );
    }
    var timeLinearSearch = process.end('linearSearch');

    //バイナリサーチで配列の位置を取得する
    process.start('binarySearch');
    for( var i = 0;i < searchCount;i++ ) {
      dataIndex = searchObject.binarySearch( searchNumber );
    }
    var timeBinarySearch = process.end('binarySearch');

    //ハッシュ探索法
    process.start('totalHashSearch');
    process.start('makeHash');
    hashSearchObject.makeHashList();
    var makeTime = process.end('makeHash');

    process.start('hashSearch');
    for( var i = 0;i < searchCount;i++ ) {
      dataIndex = hashSearchObject.hashSearch( searchNumber );
    }
    time = process.end('hashSearch');
    var timeHashSearch = process.end('totalHashSearch');

    return [
      searchCount.toString(),
      timeIndexOf,
      timeLinearSearch,
      timeBinarySearch,
      timeHashSearch
    ];
  },
  makeDataList: function ( dataCount ) {
    //検索用のデータ配列を作成
    for (var i = 0; i < dataCount; i++) {
      this.dataList.push(i);
    }

    //Hash検索用のデータ配列を作成
    this.randomDataList = [].concat(this.dataList);
    this.randomDataList.sort(
       function() {
        return Math.random() - 0.5;
       }
    );
  },
  makeChart: function (chartData) {
    google.setOnLoadCallback(function () {
      var data = google.visualization.arrayToDataTable( chartData );
      var options = {
        title: '探索アルゴリズムの探索時間計測 ( x軸:探索回数, y軸:探索時間ミリ秒 )',
        curveType: 'function',
        legend: { position: 'bottom' }
      };

      var chart = new google.visualization.LineChart(document.getElementById('jsc-chart'));
      chart.draw(data, options);
    });
  },
  setDataToTable: function (chartData) {
    $('.datacount').text(this.DATACOUNT);
    $.each( chartData, function (index) {
      if( index === 0 ) return true;

      var searchCountVal = this[0];
      var indexOfVal = this[1];
      var linearSearchVal = this[2];
      var binarySearchVal = this[3];
      var hashSearchVal = this[4];

      $('.searchcount' + index).text(searchCountVal);
      $('.indexof' + index).text(indexOfVal);
      $('.linearsearch' + index).text(linearSearchVal);
      $('.binarysearch' + index).text(binarySearchVal);
      $('.hashsearch' + index).text(hashSearchVal);
    });
  }
};
ALGORITHM.SEARCH = function (dataList) {
  this.dataList = dataList;
};
ALGORITHM.SEARCH.prototype = {
  indexOf: function (num) {
    return this.dataList.indexOf(num);
  },
  linearSearch: function ( num ) {
    var index = -1;
    for( var i = 0, len = this.dataList.length;i < len;i++ ) {
      if( this.dataList[i] === num ) {
        index = i;
        break;
      }
    }
    return index;
  },
  binarySearch: function ( num ) {
    var index = -1;
    var head = 0;
    var tail = this.dataList.length;

    while( head <= tail ) {
      var center = Math.floor(( head + tail ) / 2);
      var centerVal = this.dataList[center];

      if( centerVal === num ) {
        index = center;
        break;
      }
      if( centerVal < num ) {
        head = center + 1;
      }else {
        tail = center - 1;
      }
    }
    return index;
  },
  makeHashList: function () {
    //参考：http://qiita.com/alucky0707/items/10052866719ba5c5f5d7
    var hashList = this.dataList.reduce(function(directory, value, index) {
      directory[value] = (directory[value] || []).concat(index);
      return directory;
    }, {});
    this.hashList = hashList;
  },
  hashSearch: function (num) {
    if( this.hashList === undefined ) {
      this.makeHashList();
    }

    var index = -1;
    if(num in this.hashList) {
      index = this.hashList[num][0];
    }
    return index;
  }
};

var PROCESS = function () {
  this.startDate = {};
  this.endDate = {};
};
PROCESS.prototype = {
  start: function (name) {
    console.time(name);
    this.startDate[name] = new Date();
  },
  end: function (name) {
    console.timeEnd(name);
    var time;
    this.endDate[name] = new Date();
    time = this.endDate[name] - this.startDate[name];
    return time;
  }
};

$(function() {
  new ALGORITHM.COMPARE().init();
});