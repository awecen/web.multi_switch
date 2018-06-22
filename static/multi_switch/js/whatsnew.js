let Whatsnew = {

    /* 初期処理 */
    init: function(){
        $('#screen-name').text(CONST.SCREEN_NAME.WHATSNEW);
        Base.toggleLoadingScreen("hide");//ロード画面
        Whatsnew.showInfo();
    },


    showInfo: function(){

        Whatsnew.appendInfoRowElement('1.0.1', ['「いままでのきろく」画面のグラフX軸内に表示可能なアイコン数の限界バグを修正']);
        Whatsnew.appendInfoRowElement('1.0.0', ['公開＆運用開始']);

    },

    /**
     * 更新内容(1行分)のDOMを作成
     * @param {String} version_number - バージョン番号(e.g. 1.0.1)
     * @param {String[]} features - 内容
     */
    appendInfoRowElement: function(version_number, features){
      // (e.g.)
      //   <div class="new-release-row">
      //       <div class="title">1.0.1</div>
      //       <div class="features">
      //           <div class="feature-item">「いままでのきろく」画面のグラフX軸内に表示可能なアイコン数の限界バグを修正</div>
      //       </div>
      //   </div>
      let $row = $('<div class="new-release-row"></div>');
      let $title = $('<div class="title">' + version_number + '</div>');
      $title.appendTo($row);
      let $features = $('<div class="features"></div>');
      $features.appendTo($row);
      for(let i = 0; i < features.length; i++){
          let $item = $('<div class="feature-item">' + features[i] + '</div>');
          $item.appendTo($features);
      }
      $('.new-release-body').append($row);
    },
};

Whatsnew.init();