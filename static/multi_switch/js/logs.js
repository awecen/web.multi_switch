let Logs = {

    /**
     * 全ログ
     */
    allLogs: null,

    /**
     * 初期処理
     */
    init: function(){
        $('#screen-name').text(Base.userSetting.child_name + CONST.SCREEN_NAME.LOGS);
        Logs.attachEvents();
        Logs.initializeMaterialize();
        Logs.initializeFlatPickr();
        Logs.changeView("graph");
    },

    /**
     * イベント付加
     */
    attachEvents: function(){

        let $container = $('.container');

        /* 日付セレクタ 前の日付 */
        $('.date-selector .previous-date').on('click', function(e){
            let $ct = $(e.currentTarget);
            if(!$ct.find('i').hasClass('disabled')){
                Logs.moveAnotherDay(true);
            }
        });

        /* 日付セレクタ 次の日付 */
        $('.date-selector .next-date').on('click', function(e){
            let $ct = $(e.currentTarget);
            if(!$ct.find('i').hasClass('disabled')){
                Logs.moveAnotherDay(false);
            }
        });

        /* ログ詳細 さくじょボタン */
        $('.btn-delete').on('click', function(){
            Logs.openDeletionConfirmDialog();
        });

        /* ログ詳細 さくじょしちゃうボタン */
        $('.btn-delete-ok').on('click', function(){
            Base.toggleLoadingScreen("show");
            Logs.deleteLog($('.log-detail .detail-body').attr('data-val'), function(){
                Logs.getLogs(function(){
                    Logs.closeDeletionConfirmDialog(); // 確認ダイアログ非表示
                    $('.log-detail').hide(); // ログ詳細情報ダイアログ非表示
                    Base.toggleLoadingScreen("hide"); // ロード画面非表示
                    let $nowDate = $('.date-selector .now-date');
                    let selectedDateObj = new Date($nowDate.attr('data-date'));
                    Logs.setIconsToGraph(selectedDateObj); // アイコン再描画
                    Logs.setLogsToList(selectedDateObj); // アイコン再描画
                    libraryTools.popSimpleToast('ログを削除しました。');
                });
            });
        });

        /* ログ詳細 さくじょキャンセルボタン */
        $('.btn-delete-cancel').on('click', function(){
            Logs.closeDeletionConfirmDialog();
        });

        /* ログ詳細 ほぞんボタン */
        $('.btn-save').on('click', function(){
            Base.toggleLoadingScreen("show");// ロード画面ON
            let row_id = parseInt($('.log-detail .detail-body').attr('data-val'));
            let validationResults = Logs.validateLogInfo();
            if(validationResults.length === 0){
                // エラー０(＝バリデーションOK)
                if(row_id !== 0) {
                    // 既存履歴の編集
                    Logs.updateLogInfo(row_id, function(){
                        Logs.getLogs(function(){
                            let $nowDate = $('.date-selector .now-date');
                            let selectedDateObj = new Date($nowDate.attr('data-date'));
                            Logs.setIconsToGraph(selectedDateObj); // アイコン再描画
                            Logs.setLogsToList(selectedDateObj); // アイコン再描画
                            $('.log-detail').hide(); // 詳細ダイアログOFF
                            Base.toggleLoadingScreen("hide"); // ロード画面OFF
                            libraryTools.popSimpleToast('ログを更新しました。');
                        });
                    });
                } else {
                    // 新規追加
                    Logs.addNewLog(function(){
                        Logs.getLogs(function(){
                            let $nowDate = $('.date-selector .now-date');
                            let selectedDateObj = new Date($nowDate.attr('data-date'));
                            Logs.setIconsToGraph(selectedDateObj); // アイコン再描画
                            Logs.setLogsToList(selectedDateObj); // アイコン再描画
                            $('.log-detail').hide(); // 詳細ダイアログOFF
                            Base.toggleLoadingScreen("hide"); // ロード画面OFF
                            libraryTools.popSimpleToast('ログを新規追加しました。');
                        });
                    });
                }
            } else {
                validationResults.forEach(function(result){
                    libraryTools.popSimpleToast(result);
                });
                Base.toggleLoadingScreen("hide");
            }

        });

        /* ログ詳細 キャンセルボタン */
        $('.btn-cancel').on('click', function(){
            Logs.openCancelConfirmDialog();
        });

        /* 背景にも キャンセルボタン と同じ効果*/
        $('.log-detail').on('click', function(){
            Logs.openCancelConfirmDialog();
        });

        /* 本体くりっくを　背景にでんぱさせない(バブリング解除) */
        $('.log-detail .detail-body').on('click', function(e){
            e.stopPropagation();
        });

        /* キャンセル OK */
        $('.btn-cancel-ok').on('click', function(e){
            Logs.closeCancelConfirmDialog();
            $('.log-detail').hide();
        });

        /* キャンセル キャンセル */
        $('.btn-cancel-cancel').on('click', function(e){
            Logs.closeCancelConfirmDialog();
        });

        /* アイコン → ログ詳細 */
        $container.on('click', '.graph-icon', function(e){
            let $tgt = $(e.currentTarget);
            Logs.showLogDetail($tgt.attr('row-id'));
        });

        /* FAB しんきついか*/
        $('.btn-new').on('click', function(){
           Logs.showLogDetail(0);
        });

        /* FAB リスト形式へ*/
        $('.btn-change-list').on('click', function(){
            Base.toggleLoadingScreen("show");
            Logs.changeView('list');
        });

        /* FAB グラフ形式へ*/
        $('.btn-change-graph').on('click', function(){
            Base.toggleLoadingScreen("show");
            Logs.changeView('graph');
        });

        /* リスト形式 編集ボタン */
        $container.on('click', '.list-icon.edit', function(e){
            let $tgt = $(e.currentTarget);
            Logs.showLogDetail($tgt.parent().attr('row-id'));
        });

    },

    /**
     * Materialize標準コンポーネントの初期化
     */
    initializeMaterialize: function(){
        let today = new Date();
        // Date Picker
        $('.datepicker').datepicker({
            autoClose: true,
            format: 'yyyy-mm-dd',
            defaultDate: today,
            setDefaultDate: true,
            maxDate: today,
            showDaysInNextAndPreviousMonths: true,
            showMonthAfterYear: true,
            i18n :{
                cancel: 'きゃんせる',
                clear: 'りせっと',
                done: 'けってい',
                months:['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'],
                monthsShort: ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月",'11月', '12月'],
                weekdays: ["日曜日", "月曜日", "火曜日", "水曜日", "木曜日", "金曜日", "土曜日"],
                weekdaysShort:  ["日", "月", "火", "水", "木", "金", "土"],
                weekdaysAbbrev:  ["日", "月", "火", "水", "木", "金", "土"],
            },

        });
        // Floating Action Button
        $('.fixed-action-btn').floatingActionButton({
            hoverEnabled: false,
        });
    },

    /**
     * flatpickr 標準コンポーネントの初期化
     */
    initializeFlatPickr: function(){
        // flatpickrを起動させるinputのID *classでも可
        $('#adding-form-datetime').flatpickr({
            "locale": "ja",
            "enableTime": true, // タイムピッカーを有効
            // "noCalendar": false, // カレンダーを非表示
            "enableSeconds": true, // '秒' を有効
            "time_24hr": true, // 24時間表示
            "dateFormat": "Y/m/d H:i", // 時間のフォーマット "時:分:秒"
            // "maxDate": new Date(),
            // "defaultDate": new Date(), // タイムピッカーのデフォルトタイム
        });
    },

    /**
     * 全ログ取得
     * @param {function} after - コールバック関数
     */
    getLogs: function(after){
        $.ajax({
            "url": "/multi_switch/api/log_list/",
            "cache": false,
            "dataType": "json",
            "success": function (result) {
                Logs.allLogs = result;
                after();
            },
            "error": function (e) {
                alert('Error:' + e.responseText);
            }
        });
    },

    /**
     * 日付セレクタの文字を表示
     * @param {Date} dateObject
     */
    setDateSelectorTitle: function(dateObject) {
        let $target = $('.date-selector .now-date');
        // 制御用属性
        $target.attr('data-date',
            dateObject.getFullYear() + '/' +
            (dateObject.getMonth() + 1) + '/' +
            dateObject.getDate());
        // 表示
        $target.find('.year').text(dateObject.getFullYear() + '年');
        $target.find('.month').text(dateObject.getMonth() + 1);
        $target.find('.day').text(dateObject.getDate());
        $target.find('.weekday').text('(' + datetimeTools.convertWeekdayString(dateObject.getDay()) + ')');
        if (datetimeTools.compareDate(new Date(), dateObject)) {
            // ボタン disabled
            $('.next-date i').addClass('disabled');
        }else{
            // ボタン able
            $('.next-date i').removeClass('disabled');
        }

    },

    /**
     * 日付移動
     * @param {Boolean} is_previous
     */
    moveAnotherDay: function(is_previous){
        let i = is_previous ? -1 : 1;
        let $target = $('.date-selector .now-date');
        let dateObj = new Date($target.attr('data-date'));
        dateObj.setDate(dateObj.getDate() + i);
        Logs.setDateSelectorTitle(dateObj);
        Logs.setIconsToGraph(dateObj);
        Logs.setLogsToList(dateObj);
    },

    /**
     * グラフにアイコンを置いていく
     * @param {Date} selectedDateObject
     */
    setIconsToGraph: function(selectedDateObject){
        // 初期化
        $('.icons').empty();

        // 指定日付分だけ抽出
        let targetLogs = [];
        Logs.allLogs.forEach(function(log){
           if(datetimeTools.compareDate(
               selectedDateObject, new Date(log.switch_time))){
               targetLogs.push(log);
           }
        });

        // 対象ログを日付昇順に並べ替え
        targetLogs.sort(function(a, b){
            //(ソート順に基づき、aはbより小さい)
            if (new Date(a.switch_time) - new Date(b.switch_time) < 0)
                return -1;

            //(ソート順に基づき、aはbより大きい)
            if (new Date(a.switch_time) - new Date(b.switch_time) > 0)
                return 1;

            // aはbと等しい(ここに到達する場合は等しいはずである)
            return 0;
        });

        // 表示位置算出
        Logs.calculateIconPosition(targetLogs);

        // 画面上に表示
        targetLogs.forEach(function(log){
            // アイコンdiv作成
            let $icon = Logs.createIconElement(log.type);
            // メモ引っ張るときに使うID
            $icon.attr('row-id', log.id);
            // 配置位置属性付与
            $icon.css({
                'top': log.top + 'px',
                'left': log.left + 'px',
            });
            // 画面上にappend
            $('.log-contents .icons').append($icon);
        });

        // 出現アニメーションスタート
        Logs.animateGraphIconAppearing(100);

    },

    /**
     * スイッチのタイプ別DOM要素作成
     * (e.g.)
     * <div class="graph-icon milk" style="top:180px;left:40px;"><i></i></div>
     * @param {String} switch_type
     * @returns {*|jQuery|HTMLElement}
     */
    createIconElement: function(switch_type){
        let $div = $('<div></div>');
        switchTypeTools.switchTypes.some(function(type){
            if(type.id === switch_type){
                $div.addClass('graph-icon');

                switch(type.name){
                    case CONST.TYPE_ID.HELMET:
                    case CONST.TYPE_ID.NAPPING:
                    case CONST.TYPE_ID.NIGHT:
                        $div.addClass(type.name + (type.is_on ? "-on" : "-off"));
                        break;
                    default:
                        $div.addClass(type.name);
                }

                $div.append($('<i></i>'));
                return true;
            }
        });
        return $div;
    },

    /**
     * 時分秒からアイコンDOMの高さを算出
     * @param {Date} dateObject
     * @returns {number} - トップ位置
     */
    calculateYPositionOfIcon: function(dateObject){
        let h = dateObject.getHours();
        let m = dateObject.getMinutes();
        let s = dateObject.getSeconds();

        return (h * 40) + Math.floor(((m * 60) + s) / 90) - 20;
    },

    /**
     * アイコン表示位置の計算
     * @param {Array} targetLogs
     */
    calculateIconPosition: function(targetLogs){
        // 各列の高さ占有値
        let laneLimits = [-20];
        for(let i = 0; i < targetLogs.length; i++){
            // 起点
            let baseLog = targetLogs[i];
            let baseDate = new Date(baseLog.switch_time);
            let baseTop = Logs.calculateYPositionOfIcon(baseDate);
            // 列
            let yLane = 1;
            // 高さ占有値配列長分
            for(let j = 0; j < laneLimits.length; j++){
                let limit = laneLimits[j];
                // 高さ占有値が対象ログより小さい
                // ＝配置可能(列決定)
                if(limit <= baseTop) {
                    //高さ占有地を更新してループ脱出
                    laneLimits[j] = baseTop + 40;//アイコンのX位置と高さ
                    break;
                }else{
                    // 配置不可なので次の列へ
                    yLane += 1;
                    // もし次の列の高さ占有値が未定義なら新たに追加してループ脱出
                    if(laneLimits.length - 1 === j){
                        laneLimits.push(baseTop + 40);
                        break;
                    }
                }
            }

            baseLog.top = baseTop;
            baseLog.lane = yLane;
            baseLog.left = 0;
        }

        // グラフ本体の幅
        let graphWidth = Math.floor($('.graph-base').width());

        // 時系列降順
        targetLogs.reverse();
        for(let i = 0; i < targetLogs.length; i++){
            let log = targetLogs[i];
            // 基本は40
            let leftUnit = 40;
            if(graphWidth < log.lane * 40){
                // グラフ幅よりはみ出そうな場合はグラフ幅で除した分
                leftUnit = Math.floor(graphWidth / log.lane);
            }
            // Lane1以外にLeftを設定(Lane1は0)
            while(log.lane !== 1){
                log.left = (log.lane - 1) * leftUnit;
                i += 1;
                log = targetLogs[i];
            }
        }

        targetLogs.reverse();

    },

    /**
     * アイコン出現アニメーション
     * @param {number} duration - 出現間隔(ミリ秒)
     */
    animateGraphIconAppearing: function(duration){
      $('.graph-icon').each(function(i, e){
          let $e = $(e);
          if($e.css('transform') === 'matrix(0, 0, 0, 0, 0, 0)'){
              setTimeout(function(){
                  $e.css('transform', 'scale(1)');
              }, duration * i);
          }
      })
    },

    /**
     * リスト形式の画面にログを反映させる
     * @param {Date} selectedDateObject
     */
    setLogsToList: function(selectedDateObject){
        // 要素初期化
        $('.log-list').empty();

        // 指定日付分だけ抽出
        let targetLogs = [];
        Logs.allLogs.forEach(function(log){
           if(datetimeTools.compareDate(
               selectedDateObject, new Date(log.switch_time))){
               targetLogs.push(log);
           }
        });

        // 対象ログを日付昇順に並べ替え
        targetLogs.sort(function(a, b){
            //(ソート順に基づき、aはbより小さい)
            if (new Date(a.switch_time) - new Date(b.switch_time) < 0)
                return -1;

            //(ソート順に基づき、aはbより大きい)
            if (new Date(a.switch_time) - new Date(b.switch_time) > 0)
                return 1;

            // aはbと等しい(ここに到達する場合は等しいはずである)
            return 0;
        });

        // 画面上に表示
        targetLogs.forEach(function(log){
            // アイコンdiv作成
            let $list_item = Logs.createLogListElement(log.type, new Date(log.switch_time), log.note);
            // メモ引っ張るときに使うID
            $list_item.attr('row-id', log.id);
            // 画面上にappend
            $('.log-list').append($list_item);
        });

        // 出現アニメーションスタート
        Logs.animateLogListAppearing(100);

    },

    /**
     * スイッチのタイプ別リスト形式ログDOM要素作成
     * (e.g.)
     * @param {String} switch_type
     * @param {Date} date
     * @param {String} note
     * @returns {*|jQuery|HTMLElement}
     */
    createLogListElement: function(switch_type, date, note){
        let $div = $('<div></div>');
        $div.addClass('list-row');

        // アクションアイコン
        let $icon_div = $('<div></div>');
        $icon_div.appendTo($div);
        let $icon_img_div = $('<div></div>');
        $icon_img_div.addClass('list-icon');
        switchTypeTools.switchTypes.some(function(type){
            if(type.id === switch_type){

                switch(type.name){
                    case CONST.TYPE_ID.HELMET:
                    case CONST.TYPE_ID.NAPPING:
                    case CONST.TYPE_ID.NIGHT:
                        $icon_img_div.addClass(type.name + (type.is_on ? "-on" : "-off"));
                        break;
                    default:
                        $icon_img_div.addClass(type.name);
                }

                $icon_img_div.append($('<i></i>'));
                return true;
            }
        });
        $icon_img_div.appendTo($icon_div);
        // アイコンのキャプション
        let $icon_caption_div = $('<div></div>');
        $icon_caption_div.addClass('icon-caption');
        let switch_type_object = switchTypeTools.getTypeName(parseInt(switch_type));
        $icon_caption_div.text(switchTypeTools.getJapaneseTypeName(switch_type_object.name, switch_type_object.is_on))
            .appendTo($icon_div);

        // Info
        let $info_div = $('<div></div>');
        $info_div.addClass('info').appendTo($div);

        let $info_date_div = $('<div></div>');
        $info_date_div.addClass('date')
            .text(
            datetimeTools.padZero(date.getHours(), 2) + ":" +
            datetimeTools.padZero(date.getMinutes(), 2) + ":" +
            datetimeTools.padZero(date.getSeconds(), 2)
        ).appendTo($info_div);

        let $info_note_div = $('<div></div>');
        $info_note_div.addClass('note')
            .append(note ? note : "---")
            .appendTo($info_div);

        // Editアイコン
        let $edit_div = $('<div></div>');
        $edit_div.addClass('list-icon edit').appendTo($div);

        let $edit_i = $('<i></i>');
        $edit_i.addClass('medium material-icons')
            .text('create').appendTo($edit_div);

        return $div;
    },

    /**
     * アイコン出現アニメーション
     * @param {number} duration - 出現間隔(ミリ秒)
     */
    animateLogListAppearing: function(duration){
      $('.list-row').each(function(i, e){
          let $e = $(e);
          setTimeout(function(){
              $e.css('display', 'flex')
                  .animate({
                      'paddingTop': '16px',
                      'paddingBottom':'16px',
                  }, duration, 'swing', function(){
                      $e.css({
                          'opacity': '1',
                          'height': 'initial',
                      });
                  });
              }, duration * i);

      });
    },

    /**
     * ログ詳細情報ダイアログの表示
     * @param {number} rowId - 対象ログのid
     */
    showLogDetail: function(rowId){
        // スイッチタイプ選択肢を作成
        let $switchTypeForm = $('#adding-form-switch-type');
        let switchTypeAttributeName = 'switch-type'
        $switchTypeForm.empty()
            .append($('<option value="" disabled selected>種類を選んでください</option>'))
            .append($('<option ' + switchTypeAttributeName + '="' + switchTypeTools.getTypeId(CONST.TYPE_ID.MILK, true) + '" value="' + CONST.TYPE_ID.MILK + '">' + CONST.TYPE_NAME.MILK + '</option>'))
            .append($('<option ' + switchTypeAttributeName + '="' + switchTypeTools.getTypeId(CONST.TYPE_ID.POO, true) + '" value="' + CONST.TYPE_ID.POO + '">' + CONST.TYPE_NAME.POO + '</option>'))
            .append($('<option ' + switchTypeAttributeName + '="' + switchTypeTools.getTypeId(CONST.TYPE_ID.PEE, true) + '" value="' + CONST.TYPE_ID.PEE + '">' + CONST.TYPE_NAME.PEE + '</option>'))
            .append($('<option ' + switchTypeAttributeName + '="' + switchTypeTools.getTypeId(CONST.TYPE_ID.FOOD, true) + '" value="' + CONST.TYPE_ID.FOOD + '">' + CONST.TYPE_NAME.FOOD + '</option>'))
            .append($('<option ' + switchTypeAttributeName + '="' + switchTypeTools.getTypeId(CONST.TYPE_ID.SHOWER, true) + '" value="' + CONST.TYPE_ID.SHOWER + '">' + CONST.TYPE_NAME.SHOWER + '</option>'))
            .append($('<option ' + switchTypeAttributeName + '="' + switchTypeTools.getTypeId(CONST.TYPE_ID.HELMET, false) + '" value="' + CONST.TYPE_ID.HELMET_OFF + '">' + CONST.TYPE_NAME.HELMET_OFF + '</option>'))
            .append($('<option ' + switchTypeAttributeName + '="' + switchTypeTools.getTypeId(CONST.TYPE_ID.HELMET, true) + '" value="' + CONST.TYPE_ID.HELMET_ON + '">' + CONST.TYPE_NAME.HELMET_ON + '</option>'))
            .append($('<option ' + switchTypeAttributeName + '="' + switchTypeTools.getTypeId(CONST.TYPE_ID.NAPPING, true) + '" value="' + CONST.TYPE_ID.NAPPING_ON + '">' + CONST.TYPE_NAME.NAPPING_ON + '</option>'))
            .append($('<option ' + switchTypeAttributeName + '="' + switchTypeTools.getTypeId(CONST.TYPE_ID.NAPPING, false) + '" value="' + CONST.TYPE_ID.NAPPING_OFF + '">' + CONST.TYPE_NAME.NAPPING_OFF + '</option>'))
            .append($('<option ' + switchTypeAttributeName + '="' + switchTypeTools.getTypeId(CONST.TYPE_ID.NIGHT, true) + '" value="' + CONST.TYPE_ID.NIGHT_ON + '">' + CONST.TYPE_NAME.NIGHT_ON + '</option>'))
            .append($('<option ' + switchTypeAttributeName + '="' + switchTypeTools.getTypeId(CONST.TYPE_ID.NIGHT, false) + '" value="' + CONST.TYPE_ID.NIGHT_OFF + '">' + CONST.TYPE_NAME.NIGHT_OFF + '</option>'));

        // ダイアログ本体に更新時の識別属性を付与
        $('.log-detail .detail-body').attr('data-val', rowId);

        // rowId === 0 は新規追加
        if(parseInt(rowId) !== 0) {

            // ダイアログのヘッダーテキストを変更
            $('.detail-body .header').text('りれきをへんしゅうする');

            // 対象ログを抽出
            let targetLog = null;
            Logs.allLogs.some(function (log) {
                if (log.id === parseInt(rowId)) {
                    targetLog = log;
                }
            });


            // スイッチタイプ
            $switchTypeForm.attr('disabled','disabled');
            $switchTypeForm.children('[switch-type="' + targetLog.type + '"]').attr('selected', 'selected');

            // 年月日時分
            let targetLogDatetimeObject = new Date(targetLog.switch_time)
            let datetime_instance = flatpickr('#adding-form-datetime', {
                "locale": "ja",
                "enableTime": true, // タイムピッカーを有効
                // "noCalendar": false, // カレンダーを非表示
                "enableSeconds": true, // '秒' を有効
                "time_24hr": true, // 24時間表示
                "dateFormat": "Y/m/d H:i", // 時間のフォーマット "時:分:秒"
                "maxDate": new Date(),
                "defaultDate": new Date(), // タイムピッカーのデフォルトタイム
            });
            datetime_instance.setDate(targetLogDatetimeObject, null, "Y/m/d H:i");
            if ($('.flatpickr-mobile').val()) {
                $('.flatpickr-mobile').val($('.flatpickr-mobile').val().slice(0, -3));
            }

            // 秒
            $('#adding-form-datetime-seconds').val(
                datetimeTools.padZero(targetLogDatetimeObject.getSeconds(), 2)
            );

            // メモ
            $('#adding-form-note').val(targetLog.note);
            M.textareaAutoResize($('#adding-form-note'));

            // 削除ボタン
            $('.btn-delete').show();

        } else {
            // 新規追加パターン

            // ダイアログのヘッダーテキストを変更
            $('.detail-body .header').text('しんきついか する');

            // スイッチタイプ選べるように
            $switchTypeForm.attr('disabled',false);

            // 時間は今時間がDefault
            let now = new Date();
            let datetime_instance = flatpickr('#adding-form-datetime', {
                "locale": "ja",
                "enableTime": true, // タイムピッカーを有効
                // "noCalendar": false, // カレンダーを非表示
                "enableSeconds": true, // '秒' を有効
                "time_24hr": true, // 24時間表示
                "dateFormat": "Y/m/d H:i", // 時間のフォーマット "時:分:秒"
                "maxDate": now,
                "defaultDate": now, // タイムピッカーのデフォルトタイム
            });
            datetime_instance.setDate(now, null, "Y/m/d H:i");
            $('#adding-form-datetime-seconds').val(
                datetimeTools.padZero(now.getSeconds(), 2)
            );
            if ($('.flatpickr-mobile').val()) {
                $('.flatpickr-mobile').val($('.flatpickr-mobile').val().slice(0, -3));
            }

            // メモは空欄
            $('#adding-form-note').val('');
            M.textareaAutoResize($('#adding-form-note'));

            // 削除ボタンはいらない
            $('.btn-delete').hide();

        }

        // ダイアログ表示
        $('.log-detail').show();
    },

    /**
     * ログの新規追加(API)
     * @param {function} after - コールバック関数
     */
    addNewLog: function(after){
        let type = parseInt($('#adding-form-switch-type').children(':selected').attr('switch-type'));
        let date = new Date($('#adding-form-datetime').val() +":"+ ('0' + $('#adding-form-datetime-seconds').val()).slice(-2));
        let note = $('#adding-form-note').val();

        let insertData = {
            type: type,
            switch_time: datetimeTools.convertToDbFormat(date),
            note: note,
        }
        $.ajax({
            "url": "/multi_switch/api/log_list/",
            "type": "POST",
            "cache": false,
            "dataType": "json",
            "headers": {
                "X-CSRFToken": $("input[name='csrfmiddlewaretoken']").val()
            },
            "data": insertData,
            "success": function() {
                after();
            },
            "error": function (e) {
                alert('Error: ログ新規追加APIエラー\r' + e.responseText);
            }
        });
    },

    /**
     * ログの更新(API)
     * @param {number} rowId - 対象ログのid
     * @param {function} after - コールバック関数
     */
    updateLogInfo: function(rowId, after){
        let type = parseInt($('#adding-form-switch-type').children(':selected').attr('switch-type'));
        let date = new Date($('#adding-form-datetime').val() +":"+ ('0' + $('#adding-form-datetime-seconds').val()).slice(-2));
        let note = $('#adding-form-note').val();

        let updateData = {
            type: type,
            switch_time: datetimeTools.convertToDbFormat(date),
            note: note,
        }
        $.ajax({
            "url": "/multi_switch/api/log_list/" + rowId + "/",
            "type": "PUT",
            "cache": false,
            "dataType": "json",
            "headers": {
                "X-CSRFToken": $("input[name='csrfmiddlewaretoken']").val()
            },
            "data": updateData,
            "success": function() {
                after();
            },
            "error": function (e) {
                alert('Error: ログ更新APIエラー\r' + e.responseText);
            }
        });
    },

    /**
     * ログの削除(API)
     * @param {number} rowId - 対象ログのid
     * @param {function} after - コールバック関数
     */
    deleteLog: function(rowId, after){

        $.ajax({
            "url": "/multi_switch/api/log_list/" + rowId + "/",
            "type": "DELETE",
            "cache": false,
            "dataType": "json",
            "headers": {
                "X-CSRFToken": $("input[name='csrfmiddlewaretoken']").val()
            },
            "success": function() {
                after();
            },
            "error": function (e) {
                alert('Error: ログ削除APIエラー\r' + e.responseText);
            }
        });
    },

    /**
     * 削除確認ダイアログ表示
     */
    openDeletionConfirmDialog: function(){
        $('.confirmation .dialog .contents.delete').show();
        $('.confirmation .dialog .footer .btn-delete-ok').show();
        $('.confirmation .dialog .footer .btn-delete-cancel').show();
        $('.confirmation').show();
    },

    /**
     * 削除確認ダイアログ非表示
     */
    closeDeletionConfirmDialog: function(){
        $('.confirmation').hide();
        $('.confirmation .dialog .contents').hide();
        $('.confirmation .dialog .footer .btn').hide();

    },

    /**
     * キャンセル確認ダイアログ表示
     */
    openCancelConfirmDialog: function(){
        $('.confirmation .dialog .contents.cancel').show();
        $('.confirmation .dialog .footer .btn-cancel-ok').show();
        $('.confirmation .dialog .footer .btn-cancel-cancel').show();
        $('.confirmation').show();
    },

    /**
     * きゃんせる確認ダイアログ非表示
     */
    closeCancelConfirmDialog: function(){
        $('.confirmation').hide();
        $('.confirmation .dialog .contents').hide();
        $('.confirmation .dialog .footer .btn').hide();
    },


    /**
     * 表示形式切り替え
     * @param {String} view_type
     */
    changeView: function(view_type){
        switch(view_type){
            case "graph":
                $('.log-list').empty();
                $('.btn-change-graph').addClass('invisible');
                $('.btn-change-list').removeClass('invisible');
                $('.log-list').hide();
                $('.log-contents').show();

                // グラフ表示 初期処理
                switchTypeTools.getSwitchTypes(function(){
                    Logs.getLogs(function(){
                        let $target = $('.date-selector .now-date');
                        let targetDate = $target.attr('data-date') ? new Date($target.attr('data-date')) : new Date();
                        Logs.setDateSelectorTitle(targetDate);
                        Logs.setIconsToGraph(targetDate);
                        Base.toggleLoadingScreen("hide");//ロード画面OFF
                        $('.fixed-action-btn').floatingActionButton('close');
                    });
                });

                break;
            case "list":
                $('.icons').empty();
                $('.btn-change-graph').removeClass('invisible');
                $('.btn-change-list').addClass('invisible');
                $('.log-list').show();
                $('.log-contents').hide();

                switchTypeTools.getSwitchTypes(function(){
                    Logs.getLogs(function(){
                        let $target = $('.date-selector .now-date');
                        let targetDate = $target.attr('data-date') ? new Date($target.attr('data-date')) : new Date();
                        Logs.setDateSelectorTitle(targetDate);
                        Logs.setLogsToList(targetDate);
                        Base.toggleLoadingScreen("hide");//ロード画面OFF
                        $('.fixed-action-btn').floatingActionButton('close');

                    });
                });
                break;
        }

    },

    /**
     * ログ入力値バリデーション
     * @returns {Array}
     */
    validateLogInfo: function(){
        let results = [];
        let inputType = parseInt($('#adding-form-switch-type').children(':selected').attr('switch-type'));
        let inputDate = new Date($('#adding-form-datetime').val() +":"+ ('0' + $('#adding-form-datetime-seconds').val()).slice(-2));
        let inputNote = $('#adding-form-note').val();
        if(!inputType){
            results.push('すいっちの種類を選択してください');
        }
        if(new Date() - inputDate < 0){
            results.push('未来日時を入力することはできません。');
        }
        return results;
    },

};

// 初期処理
Base.init(Logs.init);