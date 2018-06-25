let Whatsnew = {

    /* 初期処理 */
    init: function(){
        $('#screen-name').text(CONST.SCREEN_NAME.WHATSNEW);
        Base.toggleLoadingScreen("hide");//ロード画面
        Whatsnew.showInfo();
    },

    showInfo: function(){
        Whatsnew.appendInfoRowElement('1.3.0', '2018/06/25 15:00', [
            '【全体】[へるめっと(休憩)]、[ひるね(終了)]、[よるね(終了)]のアイコン画像が変わった',
            '【とっぷ】前回スイッチ時間が「今日」「昨日」「おととい」で表示されるようになった',
            '【きろく】表示がリスト形式の場合に、アイコンの下にアイコン名称が表示されるようになった',
            '【きろく】リスト形式で表示中に履歴を更新してもすぐに画面上に反映されない不具合が修正された'
        ]);
        Whatsnew.appendInfoRowElement('1.2.0', '2018/06/24 22:30', [
            '【きろく】ログの新規追加が出来るようになった',
            '【きろく】履歴の表示方法を「リスト形式」に切り替えられるようになった',
        ]);
        Whatsnew.appendInfoRowElement('1.1.0', '2018/06/23 23:00', [
            '【きろく】ログの削除が出来るようになった',
            '【きろく】グラフ上に表示されるアイコン位置の不具合が修正された',
            '【きろく】グラフ上に表示されるアイコン画像の不具合が修正された'
        ]);
        Whatsnew.appendInfoRowElement('1.0.2', '2018/06/22 22:00', [
            '【全体】画面上の外枠を削除して画面横幅いっぱいに表示されるようになった',
            '【全体】グラフの横幅がディスプレイ幅によって変わるようになった',
            '【全体】右上のアイコンから開くメニューは薄黒い背景をタップしても閉じるようになった'
        ]);
        Whatsnew.appendInfoRowElement('1.0.1', '2018/06/21 22:00',[
            '【きろく】グラフのX軸上に表示できるアイコン数の上限を理論上排除した',
        ]);
        Whatsnew.appendInfoRowElement('1.0.0', '2018/06/21 17:30',[
            '【全体】公開＆運用開始',
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