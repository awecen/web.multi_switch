let TimerLogs = {

    /* 全ログ */
    allLogs: null,

    /* アイコン配置制御用 */
    limitsOfEveryLane : [0,0,0,0,0,0],

    /* 初期処理 */
    init: function(){
        $('#screen-name').text(CONST.SCREEN_NAME.LOGS);
        TimerLogs.attachEvents();
        switchTypeTools.getSwitchTypes(function(){
            TimerLogs.getLogs(function(){
                //初期表示は本日分
                let targetDate = new Date();
                TimerLogs.setDateSelectorTitle(targetDate);
                TimerLogs.setIconsToGraph(targetDate);
                Base.toggleLoadingScreen("hide");//ロード画面
            });
        });
        TimerLogs.initializeMaterialize();
        TimerLogs.initializeFlatPickr()  ;

    },

    attachEvents: function(){

        /* 日付セレクタ 前の日付 */
        $('.date-selector .previous-date').on('click', function(e){
            let $ct = $(e.currentTarget);
            if(!$ct.find('i').hasClass('disabled')){
                TimerLogs.moveAnotherDay(true);
            }
        });

        /* 日付セレクタ 次の日付 */
        $('.date-selector .next-date').on('click', function(e){
            let $ct = $(e.currentTarget);
            if(!$ct.find('i').hasClass('disabled')){
                TimerLogs.moveAnotherDay(false);
            }
        });

        /* ログ詳細 ほぞんボタン */
        $('.btn-save').on('click', function(){
            Base.toggleLoadingScreen("show");
            TimerLogs.updateLogInfo($('.log-detail .detail-body').attr('data-val'),
                function(){
                    TimerLogs.getLogs(function(){
                        TimerLogs.setIconsToGraph(
                            new Date($('.date-selector .now-date').attr('data-date')));
                        $('.log-detail').hide();
                        Base.toggleLoadingScreen("hide");
                        libraryTools.popSimpleToast('ログ情報を更新しました。');
                    });
                });
        });

        /* ログ詳細 キャンセルボタン */
        $('.btn-cancel').on('click', function(){
           $('.log-detail').hide();
        });

        /* 背景にも キャンセルボタン と同じ効果*/
        $('.log-detail').on('click', function(){
           $('.log-detail').hide();
        });

        /* 本体くりっくを　背景にでんぱさせない(バブリング解除) */
        $('.log-detail .detail-body').on('click', function(e){
            e.stopPropagation();
        });

        /* アイコン → ログ詳細 */
        $(document).on('click', '.graph-icon', function(e){
            let $tgt = $(e.currentTarget);
            TimerLogs.showLogDetail($tgt.attr('row-id'));
        });
    },

    /* Materialize標準コンポーネントの初期化 */
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
    },

    /* flatpickr 標準コンポーネントの初期化*/
    initializeFlatPickr: function(){
        // flatpickrを起動させるinputのID *classでも可
        $('#adding-form-datetime').flatpickr({
            "locale": "ja",
            "enableTime": true, // タイムピッカーを有効
            // "noCalendar": false, // カレンダーを非表示
            "enableSeconds": true, // '秒' を有効
            "time_24hr": true, // 24時間表示
            "dateFormat": "Y-m-d H:i", // 時間のフォーマット "時:分:秒"
            // "maxDate": new Date(),
            // "defaultDate": new Date(), // タイムピッカーのデフォルトタイム
        });
    },

    /* 全ログ取得 */
    getLogs: function(after){
        $.ajax({
            "url": "/multi_switch/api/log_list/",
            "cache": false,
            "dataType": "json",
            "success": function (result) {
                TimerLogs.allLogs = result;
                after();
            },
            "error": function (e) {
                alert('Error:' + e.responseText);
            }
        });
    },

    /* 日付セレクタの文字 */
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

    /* 日付移動 */
    moveAnotherDay: function(is_previous){
        let i = is_previous ? -1 : 1;
        let $target = $('.date-selector .now-date');
        let dateObj = new Date($target.attr('data-date'));
        dateObj.setDate(dateObj.getDate() + i);
        TimerLogs.setDateSelectorTitle(dateObj);
        TimerLogs.setIconsToGraph(dateObj);
    },

    /* グラフにアイコンを置いていく*/
    setIconsToGraph: function(selectedDateObject){
        // 初期化
        $('.icons').empty();

        // 指定日付分だけ抽出
        let targetLogs = [];
        TimerLogs.allLogs.forEach(function(log){
           if(datetimeTools.compareDate(
               selectedDateObject, new Date(log.switch_time))){
               targetLogs.push(log);
           }
        });

        // 対象ログを日付昇順に並べ替え
        // 日付降順ソート
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

        // 各アイコン配置
        targetLogs.forEach(function(log){
            // アイコンdiv作成
            let $icon = TimerLogs.createIconElement(log.type);
            // メモ引っ張るときに使うID
            $icon.attr('row-id', log.id);
            // 配置位置属性付与
            TimerLogs.addPositionStyleOfIcon($icon, new Date(log.switch_time));
            // 画面上にappend
            $('.log-contents .icons').append($icon);
        });

        // 制御値を初期化
        TimerLogs.limitsOfEveryLane = [0,0,0,0,0,0];

        // 出現アニメーションスタート
        TimerLogs.animateGraphIconAppearing(100);

    },

    /* スイッチのタイプ別DOM要素作成 */
    /* (e.g.) */
    /* <div class="graph-icon milk" style="top:180px;left:40px;"><i></i></div> */
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

    /* アイコン配置位置算出 */
    addPositionStyleOfIcon: function($element, dateObject){
        // Y軸は時分秒から出すだけ
        let top = TimerLogs.calculateYPositionOfIcon(dateObject);
        let left = 0;

        // X軸は重ならないように
        for(let i = 0; 0 < TimerLogs.limitsOfEveryLane.length; i++){
            let limit = TimerLogs.limitsOfEveryLane[i];
            if(limit <= top){
                TimerLogs.limitsOfEveryLane[i] = top + 40;
                left = i * 40;
                break;
            }
        }

        $element.css({
            'top': top + 'px',
            'left': left + 'px',
        });

    },

    /* 時分秒からアイコンDOMの高さを算出*/
    calculateYPositionOfIcon: function(dateObject){
        let h = dateObject.getHours();
        let m = dateObject.getMinutes();
        let s = dateObject.getSeconds();

        return (h * 40) + Math.floor(((m * 60) + s) / 90);
    },

    /* 出現アニメーション */
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

    /* アイコン→メモ表示 */
    showLogDetail: function(rowId){
        // ダイアログ本体に更新時の識別属性を付与
        $('.log-detail .detail-body').attr('data-val', rowId);
        // 対象ログを抽出
        let targetLog = null;
        TimerLogs.allLogs.some(function(log){
           if(log.id === parseInt(rowId)){
               targetLog = log;
           }
        });
        // スイッチタイプ選択肢を作成
        $('#adding-form-switch-type')
            .empty()
            .append($('<option value="" disabled selected>種類を選んでください</option>'))
            .append($('<option switch-type="' + switchTypeTools.getTypeId(CONST.TYPE_ID.MILK, true) + '" value="' + CONST.TYPE_ID.MILK + '">' + CONST.TYPE_NAME.MILK + '</option>'))
            .append($('<option switch-type="' + switchTypeTools.getTypeId(CONST.TYPE_ID.POO, true) + '" value="' + CONST.TYPE_ID.POO + '">' + CONST.TYPE_NAME.POO + '</option>'))
            .append($('<option switch-type="' + switchTypeTools.getTypeId(CONST.TYPE_ID.PEE, true) + '" value="' + CONST.TYPE_ID.PEE + '">' + CONST.TYPE_NAME.PEE + '</option>'))
            .append($('<option switch-type="' + switchTypeTools.getTypeId(CONST.TYPE_ID.FOOD, true) + '" value="' + CONST.TYPE_ID.FOOD + '">' + CONST.TYPE_NAME.FOOD + '</option>'))
            .append($('<option switch-type="' + switchTypeTools.getTypeId(CONST.TYPE_ID.SHOWER, true) + '" value="' + CONST.TYPE_ID.SHOWER + '">' + CONST.TYPE_NAME.SHOWER + '</option>'))
            .append($('<option switch-type="' + switchTypeTools.getTypeId(CONST.TYPE_ID.HELMET, true) + '" value="' + CONST.TYPE_ID.HELMET_ON + '">' + CONST.TYPE_NAME.HELMET_ON + '</option>'))
            .append($('<option switch-type="' + switchTypeTools.getTypeId(CONST.TYPE_ID.HELMET, false) + '" value="' + CONST.TYPE_ID.HELMET_OFF + '">' + CONST.TYPE_NAME.HELMET_OFF + '</option>'))
            .append($('<option switch-type="' + switchTypeTools.getTypeId(CONST.TYPE_ID.NAPPING, true) + '" value="' + CONST.TYPE_ID.NAPPING_ON + '">' + CONST.TYPE_NAME.NAPPING_ON + '</option>'))
            .append($('<option switch-type="' + switchTypeTools.getTypeId(CONST.TYPE_ID.NAPPING, false) + '" value="' + CONST.TYPE_ID.NAPPING_OFF + '">' + CONST.TYPE_NAME.NAPPING_OFF + '</option>'))
            .append($('<option switch-type="' + switchTypeTools.getTypeId(CONST.TYPE_ID.NIGHT, true) + '" value="' + CONST.TYPE_ID.NIGHT_ON + '">' + CONST.TYPE_NAME.NIGHT_ON + '</option>'))
            .append($('<option switch-type="' + switchTypeTools.getTypeId(CONST.TYPE_ID.NIGHT, false) + '" value="' + CONST.TYPE_ID.NIGHT_OFF + '">' + CONST.TYPE_NAME.NIGHT_OFF + '</option>'))

        // 各Inputに表示
        $('#adding-form-switch-type').children('[switch-type="' + targetLog.type + '"]').attr('selected', 'selected');
        let targetLogDatetimeObject = new Date(targetLog.switch_time)
        let datetime_instance = flatpickr('#adding-form-datetime', {
            "locale": "ja",
            "enableTime": true, // タイムピッカーを有効
            // "noCalendar": false, // カレンダーを非表示
            "enableSeconds": true, // '秒' を有効
            "time_24hr": true, // 24時間表示
            "dateFormat": "Y-m-d H:i", // 時間のフォーマット "時:分:秒"
            "maxDate": new Date(),
            "defaultDate": new Date(), // タイムピッカーのデフォルトタイム
        });
        datetime_instance.setDate(targetLogDatetimeObject, null, "Y-m-d H:i");
        if($('.flatpickr-mobile').val()){
            $('.flatpickr-mobile').val($('.flatpickr-mobile').val().slice(0, -3));
        }
        $('#adding-form-datetime-seconds').val(
            datetimeTools.padZero(targetLogDatetimeObject.getSeconds(), 2)
        );
        $('#adding-form-note').val(targetLog.note);

        // ダイアログ表示
        $('.log-detail').show();
    },

    /* ログの更新(API) */
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
    }

};

TimerLogs.init();