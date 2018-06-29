let Whatsnew = {

    SCREEN_NAME: {
        ALL: 'ぜんぶ',
        TOP: 'とっぷ',
        LOGS: 'きろく',
        STAT: 'とうけい',
        WHATSNEW: 'わっつにゅう',
        SETTINGS: 'せってい',
        OTHER: 'その他',
    },

    /* 初期処理 */
    init: function(){
        $('#screen-name').text(CONST.SCREEN_NAME.WHATSNEW);
        Base.toggleLoadingScreen("hide");//ロード画面
        Whatsnew.setInfo();
    },

    /**
     * 表示する情報を入れ込む
     */
    setInfo: function(){
        Whatsnew.appendInfoRowElement('1.7.0', '2018/06/29 19:00', [
            Whatsnew.createInfoObject(Whatsnew.SCREEN_NAME.SETTINGS,
                '新たに追加されました'),
            Whatsnew.createInfoObject(Whatsnew.SCREEN_NAME.SETTINGS,
                '[なまえ]の設定ができるようになりました'),
            Whatsnew.createInfoObject(Whatsnew.SCREEN_NAME.ALL,
                '画面タイトルがユーザー設定の[なまえ]に併せて変わるようになりました'),
        ]);
        Whatsnew.appendInfoRowElement('1.6.1', '2018/06/28 23:00', [
            Whatsnew.createInfoObject(Whatsnew.SCREEN_NAME.STAT,
                '右下からのスイッチ種類切り替えが廃止され、代わりに画面上部のタブから切り替えができるようになった'),
        ]);
        Whatsnew.appendInfoRowElement('1.6.0', '2018/06/28 23:00', [
            Whatsnew.createInfoObject(Whatsnew.SCREEN_NAME.ALL,
                '右上のメニューを開いたあとに黒背景を押した場合でもメニューが閉じるようになった'),
            Whatsnew.createInfoObject(Whatsnew.SCREEN_NAME.ALL,
                'いくつかのクリック動作の不具合が修正された'),
            Whatsnew.createInfoObject(Whatsnew.SCREEN_NAME.STAT,
                'カレンダーから選択した日にちの記録を表示できるようになった（【ひるね】【よるね】も可能）'),
        ]);
        Whatsnew.appendInfoRowElement('1.5.0', '2018/06/28 19:30', [
            Whatsnew.createInfoObject(Whatsnew.SCREEN_NAME.STAT,
                'カレンダーから選択した日にちの記録を表示できるようになった（【へるめっと】のみ）'),
            Whatsnew.createInfoObject(Whatsnew.SCREEN_NAME.STAT,
                'いくつかの統計値計算の不具合が修正された'),
        ]);
        Whatsnew.appendInfoRowElement('1.4.0', '2018/06/27 22:00', [
            Whatsnew.createInfoObject(Whatsnew.SCREEN_NAME.ALL,
                'とうけいデータ画面へ移動できるようになった'),
            Whatsnew.createInfoObject(Whatsnew.SCREEN_NAME.STAT,
                '【へるめっと】【ひるね】【よるね】を切り替えて表示できるようになった'),
        ]);
        Whatsnew.appendInfoRowElement('1.3.1', '2018/06/25 23:00', [
            Whatsnew.createInfoObject(Whatsnew.SCREEN_NAME.TOP,
                'ON/OFFボタンの上下にキャプションが表示されるようになった'),
            Whatsnew.createInfoObject(Whatsnew.SCREEN_NAME.WHATSNEW,
                'デザインが少し変更された'),
            Whatsnew.createInfoObject(Whatsnew.SCREEN_NAME.OTHER,
                '軽微な不具合がいくつか修正された'),
        ]);
        Whatsnew.appendInfoRowElement('1.3.0', '2018/06/25 15:00', [
            Whatsnew.createInfoObject(Whatsnew.SCREEN_NAME.ALL,
                '[へるめっと(休憩)]、[ひるね(終了)]、[よるね(終了)]のアイコン画像が変わった'),
            Whatsnew.createInfoObject(Whatsnew.SCREEN_NAME.TOP,
                '前回スイッチ時間が「今日」「昨日」「おととい」で表示されるようになった'),
            Whatsnew.createInfoObject(Whatsnew.SCREEN_NAME.LOGS,
                'リスト形式のときにアイコンの下にアイコン名称が表示されるようになった'),
            Whatsnew.createInfoObject(Whatsnew.SCREEN_NAME.LOGS,
                'リスト形式で表示中に履歴を更新してもすぐに画面上に反映されない不具合が修正された'),
        ]);
        Whatsnew.appendInfoRowElement('1.2.0', '2018/06/24 22:30', [
            Whatsnew.createInfoObject(Whatsnew.SCREEN_NAME.LOGS,
                'ログの新規追加が出来るようになった'),
            Whatsnew.createInfoObject(Whatsnew.SCREEN_NAME.LOGS,
                '履歴の表示方法を「リスト形式」に切り替えられるようになった'),
        ]);
        Whatsnew.appendInfoRowElement('1.1.0', '2018/06/23 23:00', [
            Whatsnew.createInfoObject(Whatsnew.SCREEN_NAME.LOGS,
                'ログの削除が出来るようになった'),
            Whatsnew.createInfoObject(Whatsnew.SCREEN_NAME.LOGS,
                'グラフ上に表示されるアイコン位置の不具合が修正された'),
            Whatsnew.createInfoObject(Whatsnew.SCREEN_NAME.LOGS,
                'グラフ上に表示されるアイコン画像の不具合が修正された'),
        ]);
        Whatsnew.appendInfoRowElement('1.0.2', '2018/06/22 22:00', [
            Whatsnew.createInfoObject(Whatsnew.SCREEN_NAME.ALL,
                '画面上の外枠を削除して画面横幅いっぱいに表示されるようになった'),
            Whatsnew.createInfoObject(Whatsnew.SCREEN_NAME.ALL,
                'グラフの横幅がディスプレイ幅によって変わるようになった'),
            Whatsnew.createInfoObject(Whatsnew.SCREEN_NAME.ALL,
                '右上のアイコンから開くメニューは薄黒い背景をタップしても閉じるようになった'),
        ]);
        Whatsnew.appendInfoRowElement('1.0.1', '2018/06/21 22:00',[
            Whatsnew.createInfoObject(Whatsnew.SCREEN_NAME.LOGS,
                'グラフのX軸上に表示できるアイコン数の上限を理論上排除した'),
        ]);
        Whatsnew.appendInfoRowElement('1.0.0', '2018/06/21 17:30',[
            Whatsnew.createInfoObject(Whatsnew.SCREEN_NAME.ALL,
                '公開＆運用開始'),
        ]);

    },

    /**
     * 更新内容(1行分)のDOMを作成
     * @param {String} version_number - バージョン番号(e.g. 1.0.1)
     * @param {String} date_string
     * @param {{screen: string, sentence: string}[]} features - 内容
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
      $dateSpan.appendTo($title);

      let $features = $('<div class="features"></div>');
      $features.appendTo($row);
      for(let i = 0; i < features.length; i++){
          let $item = $('<div class="feature-item"></div>');
          $item.appendTo($features);
          let $screen = $('<div class="screen"><i class="material-icons">pets</i> ' + features[i].screen + '</div>');
          $screen.appendTo($item);
          let $sentence = $('<div class="sentence">' + features[i].sentence + '</div>');
          $sentence.appendTo($item);
      }
      $('.new-release-body').append($row);
    },

    /**
     *
     * @param screen {string} - 画面名
     * @param sentence {string} - 文
     * @returns {{screen: string, sentence: string}}
     */
    createInfoObject: function(screen, sentence){
        return {
            screen: screen,
            sentence: sentence,
        }
    },

};

Base.init(Whatsnew.init);