let Main = {

    /**
     * スイッチ種類
     */
    switchTypes: {},

    /**
     * 全ログ
     */
    allLogs: [],

    /**
     * 最新ログ
     */
    latestLogs: {
        'helmet': null,
        'napping': null,
        'night': null,
    },

    /**
     * 累計計算用
     */
    totalTime: {
        'helmet':{
            'on':{},
            'off':{},
        },
        'napping':{
            'on':{},
        },
        'night':{
            'on':{},
        }
    },

    /**
     * くるくるタイマーID
     */
    timerIds: {
        'helmet_now': 0,
        'helmet_on': 0,
        'helmet_off': 0,
        'napping': 0,
        'night': 0,
    },

    /**
     * 一時保存用メモ
     */
    temporaryNotes: [],

    /**
     * 初期処理
     */
    init: function(){
        $('#screen-name').text(CONST.SCREEN_NAME.MAIN);
        Main.setShowMoreDisabled(); // attachEventsより前
        Main.attachEvents();
        switchTypeTools.getSwitchTypes(function(){
            Main.getTemporaryNotes(function(){
                Main.setTemporaryNotes();
            });
            Main.getLogs(function(){
                Main.setInfoAll();
                Base.toggleLoadingScreen("hide");
            });
        });

    },

    /**
     * イベント付加
     */
    attachEvents: function(){

        /* しょうさい開閉 */
        let $btn_show_more = $('.btn-show-more');
        $btn_show_more.off('click');
        $btn_show_more.on('click', function(e){
            let $e = $(e.currentTarget);
            let $tgt = $e.parent().parent().find('.detail-info');
            Main.toggleDetailInfo($e, $tgt);
        });
        /* くわしく ボタン disabled */
        $('.btn-show-more.disabled').off('click');

        // ボタンぷっしゅ
        let $btn_image = $('.btn-image');
        $btn_image.off('click');
        $btn_image.on('click', function(e){
            Base.toggleLoadingScreen("show");
            let $e = $(e.currentTarget);
            let switch_type = $e.parent().parent().parent().attr('type');
            let is_on = $e.attr('is_on');
            let afterFunction = null;
            if(switch_type === CONST.TYPE_ID.HELMET){
                // めっとスイッチ
                afterFunction = function(){
                    Main.changeHelmetStatus(is_on);
                    libraryTools.popSimpleToast(is_on === "false" ? '【' + CONST.TYPE_NAME.HELMET_ON + '】を解除しました': '【' + CONST.TYPE_NAME.HELMET_ON + '】を開始しました');
                    Base.toggleLoadingScreen("hide");
                };
            }else if(switch_type === CONST.TYPE_ID.NAPPING){
                // ひるねスイッチ
                afterFunction = function(){
                    Main.changeNappingStatus(is_on);
                    libraryTools.popSimpleToast(is_on  === "false" ? '【' + CONST.TYPE_NAME.NAPPING + '】を解除しました' : '【' + CONST.TYPE_NAME.NAPPING + '】を記録開始しました' );
                    Base.toggleLoadingScreen("hide");
                };
            }else if(switch_type === CONST.TYPE_ID.NIGHT){
                // よるねスイッチ
                afterFunction = function(){
                    Main.changeNightStatus(is_on);
                    libraryTools.popSimpleToast(is_on  === "false" ? '【' + CONST.TYPE_NAME.NIGHT + '】を解除しました' : '【' + CONST.TYPE_NAME.NIGHT + '】を記録開始しました');
                    Base.toggleLoadingScreen("hide");
                };
            }else{
                // その他
                afterFunction = function(){
                    libraryTools.popSimpleToast('【' + switchTypeTools.getJapaneseTypeName(switch_type) + '】 を記録しました');
                    Base.toggleLoadingScreen("hide");
                };
            }
            Main.registerLog(switch_type, is_on === "true", afterFunction);
        });
        // ボタンぷっしゅ disabled
        $('.btn-image.disabled').off('click');

        /* めも一時保存 */
        $(document).on('change', '.note-textarea', function(e){
            let $e = $(e.currentTarget);
            let note = $e.val();
            let type = $e.parent().parent().parent().parent().parent().parent().attr('type');
            Main.registerTemporaryNote(type, note, function(){
                Main.getTemporaryNotes(function(){
                    Main.setTemporaryNotes();
                });
            });
        });


    },

    /**
     * [くわしく] ボタンの active/negative 切り替え
     */
    setShowMoreDisabled: function(){
        $('.detail-info').each(function(index, detail){
            /* 詳細情報項目が一つもないならボタンnegative */
            let $detail = $(detail);
            if($detail.children().length === 0) {
                let $btn = $(detail).parent().parent().parent().find('.btn-show-more');
                $btn.addClass('disabled');
            }
        });
    },

    /**
     * [くわしく] ボタン 開閉
     * @param $e
     * @param $div
     */
    toggleDetailInfo: function($e, $div){
        if($div.hasClass('invisible')){
            $div.removeClass('invisible');
            $div.animate({
                'height': ($div.children().length * 28) + 'px',
            }, 200,'swing',  function(){
                $e.find('i').text('expand_less');
            });
            $div.animate({
                'opacity': '1',
            }, 100, 'swing', function(){});

        }else{
            $div.animate({
                'opacity': '0',
            }, 100, 'swing', function(){});
            $div.animate({
                'height': '0',
            }, 200,'swing',  function(){
                $div.addClass('invisible');
                $e.find('i').text('expand_more');
            });
        }
    },

    /**
     * ログ登録API
     * @param {string} log_type - スイッチ種類
     * @param {Boolean} is_on - スイッチON/OFF
     * @param {function} after - コールバック関数
     */
    registerLog: function(log_type, is_on, after){
        let newData = {
            "switch_time": datetimeTools.convertToDbFormat(new Date()),
            "note": $('.timer-row[type="' + log_type + '"]')
                .find('.timer-contents')
                .find('.info')
                .find('.basic-info')
                .find('.info-item.note')
                .find('.input')
                .find('textarea')
                .val(),
            "type": switchTypeTools.getTypeId(log_type, is_on),
        };

        // 新規作成API
        $.ajax({
            "url": "/multi_switch/api/log_list/",
            "type": "POST",
            "cache": false,
            "dataType": "json",
            "headers": {
                "X-CSRFToken": $("input[name='csrfmiddlewaretoken']").val()
            },
            "data": newData,
            "success": function() {
                // メモ欄を空欄にする
                Main.registerTemporaryNote(log_type, '', function(){
                    Main.getTemporaryNotes(function(){
                       Main.setTemporaryNotes();
                    });
                });

                // 最新情報再取得
                switchTypeTools.getSwitchTypes(function(){
                    Main.getLogs(function(){
                        Main.setInfoAll();
                    });
                });

                after();
            },
            "error": function (e) {
                alert('Error: ログ新規追加APIエラー\r' + e.responseText);

            }
        });
    },

    /**
     * 全ログ取得API
     * @param {function} after - コールバック関数
     */
    getLogs: function(after){
        $.ajax({
            "url": "/multi_switch/api/log_list/",
            "cache": false,
            "dataType": "json",
            "success": function (result) {
                Main.allLogs = result;
                after();
            },
            "error": function (e) {
                alert('Error:' + e.responseText);
            }
        });
    },

    /**
     *  全項目情報表示
     */
    setInfoAll: function(){
        Main.setInfoMilk();
        Main.setInfoPoo();
        Main.setInfoPee();
        Main.setInfoFood();
        Main.setInfoShower();
        Main.setInfoHelmet();
        Main.setInfoNapping();
        Main.setInfoNight();
    },

    /**
     * 【共通】前回時間取得
     */
    setInfoCommonPreviousTime: function(switchType){
        let targetLog = "";
        Main.allLogs.some(function(log){
            // タイプ一致(※on/offについては現状全部onなので)
            let typeId = switchTypeTools.getTypeId(switchType, true);
            if(log.type === typeId){
                targetLog = log;
                return true;
            }
        });

        // きょう、きのう、おととい変換
        let logDateObject = new Date(targetLog.switch_time)
        let displayDate = datetimeTools.convertJapaneseDesignation(logDateObject);
        // それより前なら日付そのまま表示
        let dateTimeString = datetimeTools.convertToStringFormat(logDateObject);
        let displayDatetime = displayDate ? displayDate + ' ' + dateTimeString.slice(-8) : dateTimeString;

        // DOM要素に反映
        $('.timer-row[type="' + switchType + '"]')
                .find('.timer-contents')
                .find('.info')
                .find('.basic-info')
                .find('.info-item.previous-time')
                .find('.time')
                .text(displayDatetime);
    },

    /**
     * 【おっぱい/みるく】情報表示
     */
    setInfoMilk: function(){
        let switchType = CONST.TYPE_ID.MILK;

        /* 前回時間 */
        Main.setInfoCommonPreviousTime(switchType);

        /* 本日累計回数 */
        let num = 0;
        Main.allLogs.forEach(function(log){
            // タイプ一致(※on/offについては現状全部onなので)
            let typeId = switchTypeTools.getTypeId(switchType, true);
            if(log.type === typeId &&
                datetimeTools.compareDate(new Date(log.switch_time), new Date())){
                num += 1;
            }
        });
        $('.timer-row[type="' + switchType + '"]')
                .find('.timer-contents')
                .find('.info')
                .find('.detail-info')
                .find('.info-item.today-total')
                .find('.value')
                .text(num + 'かい');
    },

    /**
     * 【うんち】情報表示
     */
    setInfoPoo: function(){
        let switchType = CONST.TYPE_ID.POO;

        /* 前回時間 */
        Main.setInfoCommonPreviousTime(switchType);

        /* 本日累計回数 */
        let num = 0;
        Main.allLogs.forEach(function(log){
            // タイプ一致(※on/offについては現状全部onなので)
            let typeId = switchTypeTools.getTypeId(switchType, true);
            if(log.type === typeId &&
                datetimeTools.compareDate(new Date(log.switch_time), new Date())){
                num += 1;
            }
        });

        let $timer_row_switch_type = $('.timer-row[type="' + switchType + '"]');
        $timer_row_switch_type.find('.timer-contents')
                .find('.info')
                .find('.detail-info')
                .find('.info-item.today-total')
                .find('.value')
                .text(num + 'かい');

        /* 連続記録日数 */
        let con = 1;
        let doDate = "";
        Main.allLogs.forEach(function(log){
            // タイプ一致(※on/offについては現状全部onなので)
            let typeId = switchTypeTools.getTypeId(switchType, true);
            if(log.type === typeId){
                if(!doDate){
                    doDate = new Date(log.switch_time);
                } else {
                    let logDate = new Date(log.switch_time);
                    let delta = doDate.getDate() - logDate.getDate();
                    switch(delta){
                        case 0://同日付
                            break;
                        case 1://連続記録対象
                            doDate = logDate;
                            con += 1;
                            break;
                        default://その他
                            break;
                    }
                }
            }
        });
        $timer_row_switch_type.find('.timer-contents')
                .find('.info')
                .find('.detail-info')
                .find('.info-item.continuation')
                .find('.value')
                .text(con + 'にち');
    },

    /**
     * 【おしっこ】情報表示
     */
    setInfoPee: function(){
        let switchType = CONST.TYPE_ID.PEE;

        /* 前回時間 */
        Main.setInfoCommonPreviousTime(switchType);

        /* 本日累計回数 */
        let num = 0;
        Main.allLogs.forEach(function(log){
            // タイプ一致(※on/offについては現状全部onなので)
            let typeId = switchTypeTools.getTypeId(switchType, true);
            if(log.type === typeId &&
                datetimeTools.compareDate(new Date(log.switch_time), new Date())){
                num += 1;
            }
        });
        $('.timer-row[type="' + switchType + '"]')
                .find('.timer-contents')
                .find('.info')
                .find('.detail-info')
                .find('.info-item.today-total')
                .find('.value')
                .text(num + 'かい');
    },

    /**
     * 【ごはん】情報表示
     */
    setInfoFood: function(){
        let switchType = CONST.TYPE_ID.FOOD;

        /* 前回時間 */
        Main.setInfoCommonPreviousTime(switchType);
    },

    /**
     * 【おふろ/しゃわー】情報表示
     */
    setInfoShower: function(){
        let switchType = CONST.TYPE_ID.SHOWER;

        /* 前回時間 */
        Main.setInfoCommonPreviousTime(switchType);
    },

    /**
     * 【へるめっと】情報表示
     */
    setInfoHelmet: function(){
        let switchType = CONST.TYPE_ID.HELMET;
        let typeId_on = switchTypeTools.getTypeId(switchType, true);
        let typeId_off = switchTypeTools.getTypeId(switchType, false);

        // 対象ログ抽出
        let targetLogs = [];
        Main.allLogs.forEach(function(log){
            // タイプ一致

            if(log.type === typeId_on
                || log.type === typeId_off){
                // on / off どちらも回収
                targetLogs.push(log);
            }
        });

        //日付降順ソート
        targetLogs.sort(function(a, b){
            //(ソート順に基づき、aはbより小さい)
            if (new Date(a.switch_time) - new Date(b.switch_time) < 0)
                return 1;

            //(ソート順に基づき、aはbより大きい)
            if (new Date(a.switch_time) - new Date(b.switch_time) > 0)
                return -1;

            // aはbと等しい(ここに到達する場合は等しいはずである)
            return 0;
        });

        /* 累計計算 */
        let totalLogs = [];

        // 本日分ログを抽出
        targetLogs.forEach(function(log){
            if(datetimeTools.compareDate(new Date, new Date(log.switch_time))){
                totalLogs.push(log);
            }
        });

        let on_total = {
            'hours': 0,
            'minutes': 0,
            'seconds': 0,
        };
        let off_total = {
            'hours': 0,
            'minutes': 0,
            'seconds': 0,
        };

        // 累計計算
        for(let i = 0; i < totalLogs.length; i++){
            let log = totalLogs[i];
            let delta = {};

            // 差分計算
            if(i === totalLogs.length - 1){
                // 最後のログは午前０時との差分
                let midnightDateObject = new Date(new Date(log.switch_time).setHours(0, 0, 0, 0));
                delta = datetimeTools.getDelta(new Date(log.switch_time), midnightDateObject);
            } else {
                // その他のログは次(一つ過去)のログとの差分
                let nextLog = totalLogs[i+1];
                delta = datetimeTools.getDelta(new Date(log.switch_time), new Date(nextLog.switch_time));
            }

            // 積み上げ計算
            if(log.type === typeId_off){
                // ログがONということは、その直前まではOFFだったということ
                on_total.hours += delta.deltaHours;
                on_total.minutes += delta.deltaMinutes;
                on_total.seconds += delta.deltaSeconds;
            } else {
                // 逆もまた然り
                off_total.hours += delta.deltaHours;
                off_total.minutes += delta.deltaMinutes;
                off_total.seconds += delta.deltaSeconds;
            }
        }

        // 繰り上げ処理
        let on_total_m = datetimeTools.movingUpDeltaValue(on_total);
        let off_total_m = datetimeTools.movingUpDeltaValue(off_total);

        // 画面表示セット
        let $timer_row_switch_type = $('.timer-row[type="' + switchType + '"]');
        let $target_on = $timer_row_switch_type.find('.timer-contents')
                .find('.info')
                .find('.detail-info')
                .find('.info-item.today-on-total')
                .find('.time');
        $target_on.find('.hours').text(datetimeTools.padZero(on_total_m.hours, 2));
        $target_on.find('.minutes').text(datetimeTools.padZero(on_total_m.minutes, 2));
        $target_on.find('.seconds').text(datetimeTools.padZero(on_total_m.seconds, 2));

        let $target_off = $timer_row_switch_type.find('.timer-contents')
                .find('.info')
                .find('.detail-info')
                .find('.info-item.today-off-total')
                .find('.time');
        $target_off.find('.hours').text(datetimeTools.padZero(off_total_m.hours, 2));
        $target_off.find('.minutes').text(datetimeTools.padZero(off_total_m.minutes, 2));
        $target_off.find('.seconds').text(datetimeTools.padZero(off_total_m.seconds, 2));

        // タイマー処理用
        Main.totalTime.helmet.on = on_total_m;
        Main.totalTime.helmet.off = off_total_m;

        // 最新ログ→現在時刻 タイマーくるくるスタート
        Main.latestLogs.helmet = targetLogs[0];
        clearInterval(Main.timerIds.helmet);
        Main.timerIds.helmet = setInterval(function(){
            Main.setInfoHelmetForTimer();
        }, 500);

        // ステータス表示 & ボタン表示
        Main.changeHelmetStatus(Main.latestLogs.helmet.type !== typeId_on);
    },

    /**
     * 【へるめっと】タイマー処理用
     */
    setInfoHelmetForTimer: function(){
        let switchType = CONST.TYPE_ID.HELMET;

        // 最新ログ時刻
        let latestDateObject = new Date(Main.latestLogs.helmet.switch_time);
        let nowDateObject = new Date();
        let delta = datetimeTools.getDelta(nowDateObject, latestDateObject);

        let $timer_row_switch_type  = $('.timer-row[type="' + switchType + '"]');
        let $targetElement = $timer_row_switch_type.find('.timer-contents')
                .find('.info')
                .find('.basic-info')
                .find('.info-item.elapsed-time')
                .find('.time');
        $targetElement.find('.hours').text(datetimeTools.padZero((delta.deltaDate * 24) + delta.deltaHours, 2));
        $targetElement.find('.minutes').text(datetimeTools.padZero(delta.deltaMinutes, 2));
        $targetElement.find('.seconds').text(datetimeTools.padZero(delta.deltaSeconds, 2));

        // ↓↓↓以下、累計時間↓↓↓
        let typeId_on = switchTypeTools.getTypeId(switchType, true);
        let comparedDateObject = latestDateObject;
        if(!datetimeTools.compareDate(new Date, latestDateObject)){
            // 最新ログが本日日付じゃない(最後にログを記録してから日をまたいでる)場合
            // 累計時間は本日日付午前0時からの差分を表示する
            comparedDateObject = new Date(new Date().setHours(0,0,0,0));
        }
        let totalDelta = datetimeTools.getDelta(new Date(), comparedDateObject);
        // 表示する要素のクラス名(タイマーで動かす方だけで十分なので)
        let targetTotalClassName = "";

        // 表示用の値(タイマーで動かす方だけで十分なので)
        let timerTotalForDisplay = {
            'hours': 0,
            'minutes': 0,
            'seconds': 0,
        };
        // タイマーで動かす方をセット
        if(Main.latestLogs.helmet.type === typeId_on){
            targetTotalClassName = '.today-on-total';
            timerTotalForDisplay.hours = Main.totalTime.helmet.on.hours + totalDelta.deltaHours;
            timerTotalForDisplay.minutes = Main.totalTime.helmet.on.minutes + totalDelta.deltaMinutes;
            timerTotalForDisplay.seconds = Main.totalTime.helmet.on.seconds + totalDelta.deltaSeconds;
        } else {
            targetTotalClassName = '.today-off-total';
            timerTotalForDisplay.hours = Main.totalTime.helmet.off.hours + totalDelta.deltaHours;
            timerTotalForDisplay.minutes = Main.totalTime.helmet.off.minutes + totalDelta.deltaMinutes;
            timerTotalForDisplay.seconds = Main.totalTime.helmet.off.seconds + totalDelta.deltaSeconds;
        }
        let timerTotalForDisplay_m = datetimeTools.movingUpDeltaValue(timerTotalForDisplay);

        // 表示
        let $targetTotal = $timer_row_switch_type.find('.timer-contents')
                .find('.info')
                .find('.detail-info')
                .find('.info-item' + targetTotalClassName)
                .find('.time');
        $targetTotal.find('.hours').text(datetimeTools.padZero(timerTotalForDisplay_m.hours, 2));
        $targetTotal.find('.minutes').text(datetimeTools.padZero(timerTotalForDisplay_m.minutes, 2));
        $targetTotal.find('.seconds').text(datetimeTools.padZero(timerTotalForDisplay_m.seconds, 2));
    },

    /**
     * 【へるめっと】スイッチ ON/OFF 切替
     * @param {Boolean} is_on
     */
    changeHelmetStatus: function(is_on){
        let switch_type = CONST.TYPE_ID.HELMET;

        // ボタン切り替え
        let $timer_row_switch_type = $('.timer-row[type="' + switch_type + '"]');
        if(is_on){
            $timer_row_switch_type.find('.btn-image[is_on="' + true + '"]').removeClass('disabled');
            $timer_row_switch_type.find('.btn-image[is_on="' + false + '"]').addClass('disabled');
        } else {
            $timer_row_switch_type.find('.btn-image[is_on="' + true + '"]').addClass('disabled');
            $timer_row_switch_type.find('.btn-image[is_on="' + false + '"]').removeClass('disabled');
        }
        Main.attachEvents();

        // ステータス表示切り替え
        let $status = $timer_row_switch_type.find('.info-item.status')
            .find('.value')
            .find('span');
        if(is_on){
            $status.text('休憩中').removeClass('label-success').addClass('label-warning');
        } else {
            $status.text('装着中').removeClass('label-warning').addClass('label-success');
        }

    },

    /**
     * 【ひるね】情報表示
     */
    setInfoNapping: function(){
        let switchType = CONST.TYPE_ID.NAPPING;
        let typeId_on = switchTypeTools.getTypeId(switchType, true);
        let typeId_off = switchTypeTools.getTypeId(switchType, false);

        // 対象ログ抽出
        let targetLogs = [];
        Main.allLogs.forEach(function(log){
            // タイプ一致
            if(log.type === typeId_on
                || log.type === typeId_off){
                // on / off どちらも回収
                targetLogs.push(log);
            }
        });

        //日付降順ソート
        targetLogs.sort(function(a, b){
            //(ソート順に基づき、aはbより小さい)
            if (new Date(a.switch_time) - new Date(b.switch_time) < 0)
                return 1;

            //(ソート順に基づき、aはbより大きい)
            if (new Date(a.switch_time) - new Date(b.switch_time) > 0)
                return -1;

            // aはbと等しい(ここに到達する場合は等しいはずである)
            return 0;
        });

        /* 累計計算 */
        let totalLogs = [];

        // 本日分ログを抽出
        targetLogs.forEach(function(log){
            if(datetimeTools.compareDate(new Date, new Date(log.switch_time))){
                totalLogs.push(log);
            }
        });

        let on_total = {
            'hours': 0,
            'minutes': 0,
            'seconds': 0,
        };

        // 累計計算
        for(let i = 0; i < totalLogs.length; i++){
            let log = totalLogs[i];
            let delta = {};

            // 差分計算
            if(i === totalLogs.length - 1){
                // 最後のログは午前０時との差分
                let midnightDateObject = new Date(new Date(log.switch_time).setHours(0, 0, 0, 0));
                delta = datetimeTools.getDelta(new Date(log.switch_time), midnightDateObject);
            } else {
                // その他のログは次(一つ過去)のログとの差分
                let nextLog = totalLogs[i+1];
                delta = datetimeTools.getDelta(new Date(log.switch_time), new Date(nextLog.switch_time));
            }

            // 積み上げ計算
            if(log.type === typeId_off){
                // ログがONということは、その直前まではOFFだったということ
                on_total.hours += delta.deltaHours;
                on_total.minutes += delta.deltaMinutes;
                on_total.seconds += delta.deltaSeconds;
            }
        }

        // 繰り上げ処理
        let on_total_m = datetimeTools.movingUpDeltaValue(on_total);

        // 画面表示セット
        let $target_on = $('.timer-row[type="' + switchType +'"]')
                .find('.timer-contents')
                .find('.info')
                .find('.detail-info')
                .find('.info-item.today-total')
                .find('.time');
        $target_on.find('.hours').text(datetimeTools.padZero(on_total_m.hours, 2));
        $target_on.find('.minutes').text(datetimeTools.padZero(on_total_m.minutes, 2));
        $target_on.find('.seconds').text(datetimeTools.padZero(on_total_m.seconds, 2));

        // タイマー処理用
        Main.totalTime.napping.on = on_total_m;

        // 最新ログ→現在時刻 タイマーくるくるスタート
        Main.latestLogs.napping = targetLogs[0];
        clearInterval(Main.timerIds.napping);
        Main.timerIds.napping = setInterval(function(){
            Main.setInfoNappingForTimer();
        }, 500);

        // ステータス表示 & ボタン表示
        Main.changeNappingStatus(Main.latestLogs.napping.type !== typeId_on);
    },

    /**
     * 【ひるね】タイマー処理用
     */
    setInfoNappingForTimer: function(){
        let switchType = CONST.TYPE_ID.NAPPING;

        // 最新ログ時刻
        let latestDateObject = new Date(Main.latestLogs.napping.switch_time);
        let nowDateObject = new Date();
        let delta = {
            'deltaDate': 0,
            'deltaHours': 0,
            'deltaMinutes': 0,
            'deltaSeconds': 0,
        };

        // スイッチ・オンのときだけ タイマーでくるくるする
        // (おふのときは 0加算 をくるくるしてる)
        if(Main.latestLogs.napping.type === switchTypeTools.getTypeId(switchType, true)){
            delta = datetimeTools.getDelta(nowDateObject, latestDateObject);
        }

        let $timer_row_switch_type = $('.timer-row[type="' + switchType + '"]');
        let $targetElement = $timer_row_switch_type.find('.timer-contents')
                .find('.info')
                .find('.basic-info')
                .find('.info-item.elapsed-time')
                .find('.time');
        $targetElement.find('.hours').text(datetimeTools.padZero((delta.deltaDate * 24) + delta.deltaHours, 2));
        $targetElement.find('.minutes').text(datetimeTools.padZero(delta.deltaMinutes, 2));
        $targetElement.find('.seconds').text(datetimeTools.padZero(delta.deltaSeconds, 2));

        // ↓↓↓以下、累計時間↓↓↓
        let typeId_on = switchTypeTools.getTypeId(switchType, true);

        // 表示用の値
        let timerTotalForDisplay = {
            'hours': Main.totalTime.napping.on.hours,
            'minutes': Main.totalTime.napping.on.minutes,
            'seconds': Main.totalTime.napping.on.seconds,
        };

        // タイマーで動かすものセット
        let targetTotalClassName = '.today-total';
        if(Main.latestLogs.napping.type === typeId_on) {
            timerTotalForDisplay.hours += delta.deltaHours;
            timerTotalForDisplay.minutes += delta.deltaMinutes;
            timerTotalForDisplay.seconds += delta.deltaSeconds;
        }
        let timerTotalForDisplay_m = datetimeTools.movingUpDeltaValue(timerTotalForDisplay);

        // 表示
        let $targetTotal = $timer_row_switch_type.find('.timer-contents')
                .find('.info')
                .find('.detail-info')
                .find('.info-item' + targetTotalClassName)
                .find('.time');
        $targetTotal.find('.hours').text(datetimeTools.padZero(timerTotalForDisplay_m.hours, 2));
        $targetTotal.find('.minutes').text(datetimeTools.padZero(timerTotalForDisplay_m.minutes, 2));
        $targetTotal.find('.seconds').text(datetimeTools.padZero(timerTotalForDisplay_m.seconds, 2));

    },

    /**
     * 【ひるね】スイッチ ON/OFF 切替
     * @param {Boolean} is_on
     */
    changeNappingStatus: function(is_on){
        let switch_type = CONST.TYPE_ID.NAPPING;

        // ボタン切り替え
        let $timer_row_switch_type = $('.timer-row[type="' + switch_type + '"]');
        let $btn_on = $timer_row_switch_type.find('.btn-image[is_on="' + true + '"]');
        let $btn_off = $timer_row_switch_type.find('.btn-image[is_on="' + false + '"]');

        if(is_on){
            $btn_on.removeClass('disabled');
            $btn_on.find('img').attr('src', '')
            $btn_off.addClass('disabled');

        } else {
            $btn_on.addClass('disabled');
            $btn_off.removeClass('disabled');
        }
        Main.attachEvents();

        // ステータス表示切り替え
        let $status = $timer_row_switch_type.find('.info-item.status')
            .find('.value')
            .find('span');
        if(is_on){
            $status.text('昼寝してない').removeClass('label-success').addClass('label-default');
        } else {
            $status.text('昼寝中').removeClass('label-default').addClass('label-success');
        }
    },

   /**
     * 【よるね】情報表示
     */
    setInfoNight: function(){
        let switchType = CONST.TYPE_ID.NIGHT;
        let typeId_on = switchTypeTools.getTypeId(switchType, true);
        let typeId_off = switchTypeTools.getTypeId(switchType, false);

        // 対象ログ抽出
        let targetLogs = [];
        Main.allLogs.forEach(function(log){
            // タイプ一致
            if(log.type === typeId_on
                || log.type === typeId_off){
                // on / off どちらも回収
                targetLogs.push(log);
            }
        });

        //日付降順ソート
        targetLogs.sort(function(a, b){
            //(ソート順に基づき、aはbより小さい)
            if (new Date(a.switch_time) - new Date(b.switch_time) < 0)
                return 1;

            //(ソート順に基づき、aはbより大きい)
            if (new Date(a.switch_time) - new Date(b.switch_time) > 0)
                return -1;

            // aはbと等しい(ここに到達する場合は等しいはずである)
            return 0;
        });

        /* 平均計算 */

        // 全ログの合計時間算出
        let totalTimeAsSeconds = 0;
        let logsByDate = [];
        let previousDate = new Date(1);
        for(let i = 0; i < targetLogs.length; i++){
            let log = targetLogs[i];
            let log_date_obj = new Date(log.switch_time);
            // ログがスイッチOFFなら計算対象
            // = ON→OFF の差分を取る
            if(log.type === switchTypeTools.getTypeId(switchType, false)){
                let nextLog = targetLogs[i+1];
                let delta = datetimeTools.getDelta(new Date(log.switch_time), new Date(nextLog.switch_time));
                let deltaTime = {
                    'date': delta.deltaDate,
                    'hours': delta.deltaHours,
                    'minutes': delta.deltaMinutes,
                    'seconds': delta.deltaSeconds,
                }
                totalTimeAsSeconds += datetimeTools.convertToSeconds(deltaTime);
            }

            // 日毎の配列（平均の分母）
            // ログがスイッチONのログ(記録起点)の日付を集計
            if(log.type === switchTypeTools.getTypeId(switchType, true)
                &&!datetimeTools.compareDate(log_date_obj, previousDate)){
                logsByDate.push(log_date_obj);
                previousDate = log_date_obj;
            }
        }

        // 合計÷配列長
        let averageAsSeconds
            = Math.floor(totalTimeAsSeconds / logsByDate.length);
        let average = datetimeTools.convertToHMS(averageAsSeconds);

        // 画面表示セット
        let $target_on = $('.timer-row[type="' + switchType +'"]')
                .find('.timer-contents')
                .find('.info')
                .find('.detail-info')
                .find('.info-item.average')
                .find('.time');
        $target_on.find('.hours').text(datetimeTools.padZero(average.hours, 2));
        $target_on.find('.minutes').text(datetimeTools.padZero(average.minutes, 2));
        $target_on.find('.seconds').text(datetimeTools.padZero(average.seconds, 2));

        // 最新ログ→現在時刻 タイマーくるくるスタート
        Main.latestLogs.night = targetLogs[0];
        clearInterval(Main.timerIds.night);
        Main.timerIds.night = setInterval(function(){
            Main.setInfoNightForTimer();
        }, 500);

        // ステータス表示 & ボタン表示
        Main.changeNightStatus(Main.latestLogs.night.type !== typeId_on);

    },

    /**
     * 【よるね】タイマー処理用
     */
    setInfoNightForTimer: function()    {
        let switchType = CONST.TYPE_ID.NIGHT;

        // 最新ログ時刻
        let latestDateObject = new Date(Main.latestLogs.night.switch_time);
        let nowDateObject = new Date();
        let delta = {
            'deltaDate': 0,
            'deltaHours': 0,
            'deltaMinutes': 0,
            'deltaSeconds': 0,
        };

        // スイッチ＝オンのときだけタイマーが動くように
        if(Main.latestLogs.night.type === switchTypeTools.getTypeId(switchType, true)){
            delta = datetimeTools.getDelta(nowDateObject, latestDateObject);
        }

        let $targetElement = $('.timer-row[type="' + switchType + '"]')
                .find('.timer-contents')
                .find('.info')
                .find('.basic-info')
                .find('.info-item.elapsed-time')
                .find('.time');
        $targetElement.find('.hours').text(datetimeTools.padZero((delta.deltaDate * 24) + delta.deltaHours, 2));
        $targetElement.find('.minutes').text(datetimeTools.padZero(delta.deltaMinutes, 2));
        $targetElement.find('.seconds').text(datetimeTools.padZero(delta.deltaSeconds, 2));

    },

    /**
     * 【よるね】スイッチ ON/OFF 切替
     * @param {Boolean} is_on
     */
    changeNightStatus: function(is_on){
        let switch_type = CONST.TYPE_ID.NIGHT;

        // ボタン切り替え
        let $timer_row_switch_type = $('.timer-row[type="' + switch_type + '"]');
        if(is_on){
            $timer_row_switch_type.find('.btn-image[is_on="' + true + '"]').removeClass('disabled');
            $timer_row_switch_type.find('.btn-image[is_on="' + false + '"]').addClass('disabled');
        } else {
            $timer_row_switch_type.find('.btn-image[is_on="' + true + '"]').addClass('disabled');
            $timer_row_switch_type.find('.btn-image[is_on="' + false + '"]').removeClass('disabled');
        }
        Main.attachEvents();

        // ステータス表示切り替え
        let $status = $timer_row_switch_type.find('.info-item.status')
            .find('.value')
            .find('span');
        if(is_on){
            $status.text('夜寝してない').removeClass('label-success').addClass('label-default');
        } else {
            $status.text('夜寝中').removeClass('label-default').addClass('label-success');
        }
    },

    /**
     *  一時メモ 取得API
     * @param {function} after
     */
    getTemporaryNotes: function(after){
        $.ajax({
            "url": "/multi_switch/api/note_list/",
            "type": "GET",
            "cache": false,
            "dataType": "json",
            "headers": {
                "X-CSRFToken": $("input[name='csrfmiddlewaretoken']").val()
            },
            "success": function(result) {
                Main.temporaryNotes = result;
                after();
            },
            "error": function (e) {
                alert('Error: 一時保存メモ取得APIエラー\r' + e.responseText);

            }
        });
    },

    /**
     * 一時メモ 画面反映
     */
    setTemporaryNotes: function(){
        Main.temporaryNotes.forEach(function(note){
            let type_name = switchTypeTools.getTypeName(note.type);
            let $targetTextarea = $('.timer-row[type="' + type_name.name + '"]').find('.note-textarea');
            $targetTextarea.val(note.note);
            M.textareaAutoResize($targetTextarea);
        });
    },

    /**
     *  一時メモ 保存API
     * @param {string} type_name - スイッチ種類
     * @param {string} note - メモ
     * @param {function} after - コールバック関数
     */
    registerTemporaryNote: function(type_name, note, after){
        let targetNoteId = 0;
        let type_id = switchTypeTools.getTypeId(type_name, true);
        Main.temporaryNotes.some(function(note){
            if(note.type === type_id){
                targetNoteId = note.id;
                return true;
            }
        });

        let updateData = {
          'type': type_id,
          'note': note,
        };

        // 更新API
        $.ajax({
            "url": "/multi_switch/api/note_list/" + targetNoteId + "/",
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
                alert('Error: 一時保存メモ更新APIエラー\r' + e.responseText);

            }
        });
    },
};

Main.init();