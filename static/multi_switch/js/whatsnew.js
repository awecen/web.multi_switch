let Whatsnew = {

    /* 初期処理 */
    init: function(){
        $('#screen-name').text(CONST.SCREEN_NAME.WHATSNEW);
        Base.toggleLoadingScreen("hide");//ロード画面
        Whatsnew.showInfo();
    },

    showInfo: function(){
        Whatsnew.appendInfoRowElement('1.2.0', '2018/06/24 22:30', [
            'きろく画面でログの新規追加が出来るようになった',
            'きろく画面の表示方法を「グラフ形式」と「リスト形式」とで切り替えられるようになった',
        ]);
        Whatsnew.appendInfoRowElement('1.1.0', '2018/06/23 23:00', [
            'きろく画面でログの削除が出来るようになった',
            'グラフ上に表示されるアイコン位置の不具合を修正した',
            'グラフ上に表示されるアイコン画像の不具合を修正した'
        ]);
        Whatsnew.appendInfoRowElement('1.0.2', '2018/06/22 22:00', [
            '画面上の外枠を削除して画面横幅いっぱいに表示するように変更した',
            'グラフの横幅がディスプレイ幅によって変わるようになった',
            '右上のアイコンから開くメニューは薄黒い背景をタップしても閉じるようになった'
        ]);
        Whatsnew.appendInfoRowElement('1.0.1', '2018/06/21 22:00',[
            '「いままでのきろく」画面のグラフX軸内に表示可能なアイコン数の限界バグを修正',
        ]);
        Whatsnew.appendInfoRowElement('1.0.0', '2018/06/21 17:30',[
            '公開＆運用開始',
        ]);

    },

    /**
     * 更新内容(1行分)のDOMを作成
     * @param {String} version_number - バージョン番号(e.g. 1.0.1)
     * @param {String[]} features - 内容
     */
    appendInfoRowElement: function(version_number, date_string, features){
      // (e.g.)
      //   <div class="new-release-row">
      //       <div class="title">1.0.1</div>
      //       <div class="features">
      //           <div class="feature-item">「いままでのきろく」画面のグラフX軸内に表示可能なアイコン数の限界バグを修正</div>
      //       </div>
      //   </div>
      let $row = $('<div class="new-release-row"></div>');
      let $title = $('<div class="title"></div>');
      $title.appendTo($row);

      let $titleSpan =  $('<span>' + version_number + '</span>');
      let $dateSpan =  $('<span class="date">' + date_string + '</span>');
      $titleSpan.appendTo($title);
      $dateSpan.appendTo($title)

      let $features = $('<div class="features"></div>');
      $features.appendTo($row);
      for(let i = 0; i < features.length; i++){
          let $item = $('<div class="feature-item"></div>');
          $item.appendTo($features);
          let $mark = $('<div>◆</div>');
          $mark.appendTo($item);
          let $sentence = $('<div class="sentence">' + features[i] + '</div>');
          $sentence.appendTo($item);
      }
      $('.new-release-body').append($row);
    },
};

Whatsnew.init();