let TimerLogs = {

    /* 全スイッチタイプ */
    switchTypes: null,

    /* 全ログ */
    allLogs: null,

    /* アイコン配置制御用 */
    limitsOfEveryLane : [0,0,0,0,0,0],

    /* 初期処理 */
    init: function(){
        $('#screen-name').text('いままでのきろく');
        TimerLogs.attachEvents();
        TimerLogs.getSwitchTypes(function(){
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
                        Tools.popSimpleToast('ログ情報を更新しました。');
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

    /* スイッチ種類取得 */
    getSwitchTypes: function(after){
        $.ajax({
            "url": "/multi_switch/api/switch_type_list/",
            "cache": false,
            "dataType": "json",
            "success": function (result) {
                TimerLogs.switchTypes = result;
                after();
            },
            "error": function (e) {
                alert('Error:' + e.responseText);
            }
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
        $target.find('.weekday').text('(' + Tools.convertWeekdayString(dateObject.getDay()) + ')');
        if (Tools.compareDate(new Date(), dateObject)) {
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
           if(Tools.compareDate(
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
        TimerLogs.switchTypes.some(function(type){
            if(type.id === switch_type){
                $div.addClass('graph-icon')

                switch(type.name){
                    case 'helmet':
                    case 'napping':
                    case 'night':
                        $div.addClass(type.name + (type.is_on ? "-on" : "-off"));
                        break;
                    default:
                        $div.addClass(type.name);
                };

                $div.append($('<i></i>'));
                return true;
            }
        })
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

        let height = (h * 40) + Math.floor(((m * 60) + s) / 90);
        return height;
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
            .append($('<option switch-type="' + Tools.getTypeId('milk', true) + '" value="milk">みるく</option>'))
            .append($('<option switch-type="' + Tools.getTypeId('poo', true) + '" value="poo">うんち</option>'))
            .append($('<option switch-type="' + Tools.getTypeId('pee', true) + '" value="pee">おしっこ</option>'))
            .append($('<option switch-type="' + Tools.getTypeId('food', true) + '" value="food">ごはん</option>'))
            .append($('<option switch-type="' + Tools.getTypeId('shower', true) + '" value="shower">しゃわー</option>'))
            .append($('<option switch-type="' + Tools.getTypeId('helmet', true) + '" value="helmet-on">へるめっと(装着)</option>'))
            .append($('<option switch-type="' + Tools.getTypeId('helmet', false) + '" value="helmet-off">へるめっと(休憩)</option>'))
            .append($('<option switch-type="' + Tools.getTypeId('napping', true) + '" value="napping-on">ひるね(開始)</option>'))
            .append($('<option switch-type="' + Tools.getTypeId('napping', false) + '" value="napping-off">ひるね(終了)</option>'))
            .append($('<option switch-type="' + Tools.getTypeId('night', true) + '" value="night-on">よるね(開始)</option>'))
            .append($('<option switch-type="' + Tools.getTypeId('night', false) + '" value="night-off">よるね(終了)</option>'))

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
            Tools.padZero(targetLogDatetimeObject.getSeconds())
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
            switch_time: Tools.convertToDbFormat(date),
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


let Tools = {
    // タイマー用数値の0パディング
    padZero: function(number){
       return ( '00' + number ).slice( -2 );
    },

    // DB登録用DateTimeフォーマットへ変換
    convertToDbFormat: function(date){
        return date.getFullYear() + "-" +
            Tools.padZero((date.getMonth() + 1)) + "-" +
            Tools.padZero(date.getDate()) + "T" +
            Tools.padZero(date.getHours()) + ":" +
            Tools.padZero(date.getMinutes()) + ":" +
            Tools.padZero(date.getSeconds()) +
            ( 0 - (date.getTimezoneOffset() / 60) < 0 ?
                '-' + Tools.padZero(date.getTimezoneOffset() / 60) + ":00"
                : '+' + Tools.padZero(0 - (date.getTimezoneOffset() / 60)) + ":00");
    },

    // 表示用フォーマット(yyyy/MM/DD HH:MM:SS)
    convertToStringFormat: function(date){
        return date.getFullYear() + "/" +
            Tools.padZero(date.getMonth() + 1) + "/" +
            Tools.padZero(date.getDate()) + " " +
            Tools.padZero(date.getHours()) + ":" +
            Tools.padZero(date.getMinutes()) + ":" +
            Tools.padZero(date.getSeconds());
    },

    // Materializeのトースター
    popSimpleToast: function(str){
        M.toast({
            'html': str,
        });
    },

    // スイッチタイプのIDを返す（登録用）
    getTypeId: function(type_name, is_on){
        let id = 0;
        TimerLogs.switchTypes.some(function(switchType){
            if(switchType.name === type_name &&
              switchType.is_on === is_on){
                id = switchType.id;
                return true;
            }
        });
        return id;
    },

    // 年月日一致確認
    compareDate: function(a, b){
        return (a.getFullYear() === b.getFullYear() &&
            a.getMonth() === b.getMonth() &&
            a.getDate() === b.getDate());
    },

    getJapaneseTypeName: function(type_name){
        let name = "";
        switch(type_name){
            case 'milk':
                name = 'おっぱい';
                break;
            case 'poo':
                name = 'うんち';
                break;
            case 'pee':
                name = 'おしっこ';
                break;
            case 'food':
                name = 'ごはん';
                break;
            case 'shower':
                name = 'おふろ';
                break;
            case 'helmet':
                name = 'へるめっと';
                break;
            case 'napping':
                name = 'ひるね';
                break;
            case 'night':
                name = 'よるね';
                break;
        }
        return name;
    },

    // newerDateObjectとolderDateObjectとの差分取得
    getDelta: function(newer, older){

        let dd = newer.getDate() - older.getDate();
        let dh = newer.getHours() - older.getHours();
        let dm = newer.getMinutes() - older.getMinutes();
        let ds = newer.getSeconds() - older.getSeconds();

        // 負値調節(秒)
        if(ds < 0){
          ds += 60;
          dm -= 1;
        }

        // 負値調節(分)
        if(dm < 0){
            dm += 60;
            dh -= 1;
        }

        // 負値調節(時)
        if(dh < 0){
            dh += 24;
            dd -= 1;
        }

        return {
            deltaDate : dd,
            deltaHours : dh,
            deltaMinutes : dm,
            deltaSeconds : ds,
        };

    },

    // 繰り上げ処理
    movingUpDeltaValue: function(delta){
         let result = {
            hours : 0,
            minutes : 0,
            seconds : 0,
        };

        result.hours = delta.hours + (delta.minutes / 60 | 0);
        result.minutes = delta.minutes % 60 + (delta.seconds / 60 | 0);
        result.seconds = delta.seconds % 60;

        return result;
    },

    // 秒換算 ([hours, minutes, seconds])
    convertToSeconds: function(log){
        return log.hours * 60 * 60 + log.minutes * 60 + log.seconds;
    },

    // 秒から時分秒へ換算
    convertToHMS: function(seconds){
        let h = seconds / 3600 | 0;
        let m = (seconds - (h * 3600)) / 60 | 0;
        let s = seconds - (h * 3600) - (m * 60);

        return {
            'hours': h,
            'minutes': m,
            'seconds': s,
        };
    },

    // 曜日変換
    convertWeekdayString: function(dayOfWeek){
        return [ "日", "月", "火", "水", "木", "金", "土" ][dayOfWeek] ;
    },

};

TimerLogs.init();