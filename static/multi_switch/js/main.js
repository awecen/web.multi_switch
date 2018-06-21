let Main = {

    screen_title: "みつき すいっち",

    switchTypes: {},

    allLogs: [],

    latestLogs: {
        'helmet': null,
        'napping': null,
        'night': null,
    },

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

    timerIds: {
        'helmet_now': 0,
        'helmet_on': 0,
        'helmet_off': 0,
        'napping': 0,
        'night': 0,
    },

    temporaryNotes: [],

    /* 初期処理 */
    init: function(){
        $('#screen-name').text(Main.screen_title);
        Main.setShowMoreDisabled(); // attachEventsより前
        Main.attachEvents();
        Main.getSwitchTypes(function(){
            Main.getTemporaryNotes(function(){
                Main.setTemporaryNotes();
            });
            Main.getLogs(function(){
                Main.setInfoAll();
                Base.toggleLoadingScreen("hide");
            });
        });

    },

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
            if(switch_type === 'helmet'){
                // めっとスイッチ
                afterFunction = function(){
                    Main.changeHelmetStatus(is_on);
                    Tools.popSimpleToast(is_on === "false" ? '【へるめっと装着】を解除しました': '【へるめっと装着】を開始しました');
                    Base.toggleLoadingScreen("hide");
                };
            }else if(switch_type === 'napping'){
                // ひるねスイッチ
                afterFunction = function(){
                    Main.changeNappingStatus(is_on);
                    Tools.popSimpleToast(is_on  === "false" ? '【ひるね】を解除しました' : '【ひるね】を記録開始しました' );
                    Base.toggleLoadingScreen("hide");
                };
            }else if(switch_type === 'night'){
                // よるねスイッチ
                afterFunction = function(){
                    Main.changeNightStatus(is_on);
                    Tools.popSimpleToast(is_on  === "false" ? '【よるね】を解除しました' : '【よるね】を記録開始しました');
                    Base.toggleLoadingScreen("hide");
                };
            }else{
                // その他
                afterFunction = function(){
                    Tools.popSimpleToast('【' + Tools.getJapaneseTypeName(switch_type) + '】 を記録しました');
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

    /* くわしく ボタンの active/negative 切り替え */
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

    /* くわしく ボタン 開閉 */
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

    /* 登録API */
    registerLog: function(log_type, is_on, after){
        let newData = {
            "switch_time": Tools.convertToDbFormat(new Date()),
            "note": $('.timer-row[type="' + log_type + '"]')
                .find('.timer-contents')
                .find('.info')
                .find('.basic-info')
                .find('.info-item.note')
                .find('.input')
                .find('textarea')
                .val(),
            "type": Tools.getTypeId(log_type, is_on),
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
                Main.getSwitchTypes(function(){
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

    /* スイッチ種類取得 */
    getSwitchTypes: function(after){
        $.ajax({
            "url": "/multi_switch/api/switch_type_list/",
            "cache": false,
            "dataType": "json",
            "success": function (result) {
                Main.switchTypes = result;
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
                Main.allLogs = result;
                after();
            },
            "error": function (e) {
                alert('Error:' + e.responseText);
            }
        });
    },

    /* Info:ぜんぶ */
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

    /* Info:おっぱい  */
    setInfoMilk: function(){
        let switchType = "milk";

        /* 前回時間 */
        Main.setInfoCommonPreviousTime(switchType);

        /* 本日累計回数 */
        let num = 0;
        Main.allLogs.forEach(function(log){
            // タイプ一致(※on/offについては現状全部onなので)
            let typeId = Tools.getTypeId(switchType, true);
            if(log.type === typeId &&
                Tools.compareDate(new Date(log.switch_time), new Date())){
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

    /* Info:うんち */
    setInfoPoo: function(){
        let switchType = "poo";

        /* 前回時間 */
        Main.setInfoCommonPreviousTime(switchType);

        /* 本日累計回数 */
        let num = 0;
        Main.allLogs.forEach(function(log){
            // タイプ一致(※on/offについては現状全部onなので)
            let typeId = Tools.getTypeId(switchType, true);
            if(log.type === typeId &&
                Tools.compareDate(new Date(log.switch_time), new Date())){
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
            let typeId = Tools.getTypeId(switchType, true);
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

    /* Info:おしっこ */
    setInfoPee: function(){
        let switchType = "pee";

        /* 前回時間 */
        Main.setInfoCommonPreviousTime(switchType);

        /* 本日累計回数 */
        let num = 0;
        Main.allLogs.forEach(function(log){
            // タイプ一致(※on/offについては現状全部onなので)
            let typeId = Tools.getTypeId(switchType, true);
            if(log.type === typeId &&
                Tools.compareDate(new Date(log.switch_time), new Date())){
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

    /* Info:ごはん */
    setInfoFood: function(){
        let switchType = "food";

        /* 前回時間 */
        Main.setInfoCommonPreviousTime(switchType);
    },

    /* Info:おふろ */
    setInfoShower: function(){
        let switchType = "shower";

        /* 前回時間 */
        Main.setInfoCommonPreviousTime(switchType);
    },

    /* Info: へるめっと */
    setInfoHelmet: function(){
        let switchType = "helmet";
        let typeId_on = Tools.getTypeId(switchType, true);
        let typeId_off = Tools.getTypeId(switchType, false);

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
            if(Tools.compareDate(new Date, new Date(log.switch_time))){
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
                delta = Tools.getDelta(new Date(log.switch_time), midnightDateObject);
            } else {
                // その他のログは次(一つ過去)のログとの差分
                let nextLog = totalLogs[i+1];
                delta = Tools.getDelta(new Date(log.switch_time), new Date(nextLog.switch_time));
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
        let on_total_m = Tools.movingUpDeltaValue(on_total);
        let off_total_m = Tools.movingUpDeltaValue(off_total);

        // 画面表示セット
        let $timer_row_switch_type = $('.timer-row[type="' + switchType + '"]');
        let $target_on = $timer_row_switch_type.find('.timer-contents')
                .find('.info')
                .find('.detail-info')
                .find('.info-item.today-on-total')
                .find('.time');
        $target_on.find('.hours').text(Tools.padZero(on_total_m.hours));
        $target_on.find('.minutes').text(Tools.padZero(on_total_m.minutes));
        $target_on.find('.seconds').text(Tools.padZero(on_total_m.seconds));

        let $target_off = $timer_row_switch_type.find('.timer-contents')
                .find('.info')
                .find('.detail-info')
                .find('.info-item.today-off-total')
                .find('.time');
        $target_off.find('.hours').text(Tools.padZero(off_total_m.hours));
        $target_off.find('.minutes').text(Tools.padZero(off_total_m.minutes));
        $target_off.find('.seconds').text(Tools.padZero(off_total_m.seconds));

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

    /* Info: へるめっと(タイマー処理用) */
    setInfoHelmetForTimer: function(){
        let switchType = 'helmet';

        // 最新ログ時刻
        let latestDateObject = new Date(Main.latestLogs.helmet.switch_time);
        let nowDateObject = new Date();
        let delta = Tools.getDelta(nowDateObject, latestDateObject);

        let $timer_row_switch_type  = $('.timer-row[type="' + switchType + '"]');
        let $targetElement = $timer_row_switch_type.find('.timer-contents')
                .find('.info')
                .find('.basic-info')
                .find('.info-item.elapsed-time')
                .find('.time');
        $targetElement.find('.hours').text(Tools.padZero((delta.deltaDate * 24) + delta.deltaHours));
        $targetElement.find('.minutes').text(Tools.padZero(delta.deltaMinutes));
        $targetElement.find('.seconds').text(Tools.padZero(delta.deltaSeconds));

        // ↓↓↓以下、累計時間↓↓↓
        let typeId_on = Tools.getTypeId(switchType, true);
        let comparedDateObject = latestDateObject;
        if(!Tools.compareDate(new Date, latestDateObject)){
            // 最新ログが本日日付じゃない(最後にログを記録してから日をまたいでる)場合
            // 累計時間は本日日付午前0時からの差分を表示する
            comparedDateObject = new Date(new Date().setHours(0,0,0,0));
        }
        let totalDelta = Tools.getDelta(new Date(), comparedDateObject);
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
        let timerTotalForDisplay_m = Tools.movingUpDeltaValue(timerTotalForDisplay);

        // 表示
        let $targetTotal = $timer_row_switch_type.find('.timer-contents')
                .find('.info')
                .find('.detail-info')
                .find('.info-item' + targetTotalClassName)
                .find('.time');
        $targetTotal.find('.hours').text(Tools.padZero(timerTotalForDisplay_m.hours));
        $targetTotal.find('.minutes').text(Tools.padZero(timerTotalForDisplay_m.minutes));
        $targetTotal.find('.seconds').text(Tools.padZero(timerTotalForDisplay_m.seconds));
    },

    /* Info: へるめっと(スイッチ切り替え) */
    changeHelmetStatus: function(is_on){
        let switch_type = 'helmet';

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

    /* Info: ひるね */
    setInfoNapping: function(){
        let switchType = "napping";
        let typeId_on = Tools.getTypeId(switchType, true);
        let typeId_off = Tools.getTypeId(switchType, false);

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
            if(Tools.compareDate(new Date, new Date(log.switch_time))){
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
                delta = Tools.getDelta(new Date(log.switch_time), midnightDateObject);
            } else {
                // その他のログは次(一つ過去)のログとの差分
                let nextLog = totalLogs[i+1];
                delta = Tools.getDelta(new Date(log.switch_time), new Date(nextLog.switch_time));
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
        let on_total_m = Tools.movingUpDeltaValue(on_total);

        // 画面表示セット
        let $target_on = $('.timer-row[type="' + switchType +'"]')
                .find('.timer-contents')
                .find('.info')
                .find('.detail-info')
                .find('.info-item.today-total')
                .find('.time');
        $target_on.find('.hours').text(Tools.padZero(on_total_m.hours));
        $target_on.find('.minutes').text(Tools.padZero(on_total_m.minutes));
        $target_on.find('.seconds').text(Tools.padZero(on_total_m.seconds));

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

    /* Info: ひるね(タイマー処理用) */
    setInfoNappingForTimer: function(){
        let switchType = 'napping';

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
        if(Main.latestLogs.napping.type === Tools.getTypeId(switchType, true)){
            delta = Tools.getDelta(nowDateObject, latestDateObject);
        }

        let $timer_row_switch_type = $('.timer-row[type="' + switchType + '"]');
        let $targetElement = $timer_row_switch_type.find('.timer-contents')
                .find('.info')
                .find('.basic-info')
                .find('.info-item.elapsed-time')
                .find('.time');
        $targetElement.find('.hours').text(Tools.padZero((delta.deltaDate * 24) + delta.deltaHours));
        $targetElement.find('.minutes').text(Tools.padZero(delta.deltaMinutes));
        $targetElement.find('.seconds').text(Tools.padZero(delta.deltaSeconds));

        // ↓↓↓以下、累計時間↓↓↓
        let typeId_on = Tools.getTypeId(switchType, true);

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
        let timerTotalForDisplay_m = Tools.movingUpDeltaValue(timerTotalForDisplay);

        // 表示
        let $targetTotal = $timer_row_switch_type.find('.timer-contents')
                .find('.info')
                .find('.detail-info')
                .find('.info-item' + targetTotalClassName)
                .find('.time');
        $targetTotal.find('.hours').text(Tools.padZero(timerTotalForDisplay_m.hours));
        $targetTotal.find('.minutes').text(Tools.padZero(timerTotalForDisplay_m.minutes));
        $targetTotal.find('.seconds').text(Tools.padZero(timerTotalForDisplay_m.seconds));

    },

    /* Info: ひるね(スイッチ切り替え) */
    changeNappingStatus: function(is_on){
        let switch_type = 'napping';

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
            $status.text('昼寝してない').removeClass('label-success').addClass('label-default');
        } else {
            $status.text('昼寝中').removeClass('label-default').addClass('label-success');
        }
    },

    /* Info: よるね */
    setInfoNight: function(){
        let switchType = "night";
        let typeId_on = Tools.getTypeId(switchType, true);
        let typeId_off = Tools.getTypeId(switchType, false);

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
            if(log.type === Tools.getTypeId(switchType, false)){
                let nextLog = targetLogs[i+1];
                let delta = Tools.getDelta(new Date(log.switch_time), new Date(nextLog.switch_time));
                let deltaTime = {
                    'date': delta.deltaDate,
                    'hours': delta.deltaHours,
                    'minutes': delta.deltaMinutes,
                    'seconds': delta.deltaSeconds,
                }
                totalTimeAsSeconds += Tools.convertToSeconds(deltaTime);
            }

            // 日毎の配列（平均の分母）
            // ログがスイッチONのログ(記録起点)の日付を集計
            if(log.type === Tools.getTypeId(switchType, true)
                &&!Tools.compareDate(log_date_obj, previousDate)){
                logsByDate.push(log_date_obj);
                previousDate = log_date_obj;
            }
        }

        // 合計÷配列長
        let averageAsSeconds
            = Math.floor(totalTimeAsSeconds / logsByDate.length);
        let average = Tools.convertToHMS(averageAsSeconds);

        // 画面表示セット
        let $target_on = $('.timer-row[type="' + switchType +'"]')
                .find('.timer-contents')
                .find('.info')
                .find('.detail-info')
                .find('.info-item.average')
                .find('.time');
        $target_on.find('.hours').text(Tools.padZero(average.hours));
        $target_on.find('.minutes').text(Tools.padZero(average.minutes));
        $target_on.find('.seconds').text(Tools.padZero(average.seconds));

        // 最新ログ→現在時刻 タイマーくるくるスタート
        Main.latestLogs.night = targetLogs[0];
        clearInterval(Main.timerIds.night);
        Main.timerIds.night = setInterval(function(){
            Main.setInfoNightForTimer();
        }, 500);

        // ステータス表示 & ボタン表示
        Main.changeNightStatus(Main.latestLogs.night.type !== typeId_on);

    },

    /* Info: よるね(タイマー処理用) */
    setInfoNightForTimer: function()    {
        let switchType = 'night';

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
        if(Main.latestLogs.night.type === Tools.getTypeId(switchType, true)){
            delta = Tools.getDelta(nowDateObject, latestDateObject);
        }

        let $targetElement = $('.timer-row[type="' + switchType + '"]')
                .find('.timer-contents')
                .find('.info')
                .find('.basic-info')
                .find('.info-item.elapsed-time')
                .find('.time');
        $targetElement.find('.hours').text(Tools.padZero((delta.deltaDate * 24) + delta.deltaHours));
        $targetElement.find('.minutes').text(Tools.padZero(delta.deltaMinutes));
        $targetElement.find('.seconds').text(Tools.padZero(delta.deltaSeconds));

    },

    /* Info: よるね(スイッチ切り替え) */
    changeNightStatus: function(is_on){
        let switch_type = 'night';

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

    /* Info: 前回時間(共通) */
    setInfoCommonPreviousTime: function(switchType){
        let targetLog = "";
        Main.allLogs.some(function(log){
            // タイプ一致(※on/offについては現状全部onなので)
            let typeId = Tools.getTypeId(switchType, true);
            if(log.type === typeId){
                targetLog = log;
                return true;
            }
        });
        $('.timer-row[type="' + switchType + '"]')
                .find('.timer-contents')
                .find('.info')
                .find('.basic-info')
                .find('.info-item.previous-time')
                .find('.time')
                .text(Tools.convertToStringFormat(
                    new Date(targetLog.switch_time)));
    },

    /* 一時メモ 取得API */
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

    /* 一時メモ 画面反映 */
    setTemporaryNotes: function(){
        Main.temporaryNotes.forEach(function(note){
            let type_name = Tools.getTypeName(note.type);
            $('.timer-row[type="' + type_name.name + '"]').find('.note-textarea').val(note.note);
        });
    },

    /* 一時メモ 保存API */
    registerTemporaryNote: function(type_name, note, after){
        let targetNoteId = 0;
        let type_id = Tools.getTypeId(type_name, true);
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
        Main.switchTypes.some(function(switchType){
            if(switchType.name === type_name &&
              switchType.is_on === is_on){
                id = switchType.id;
                return true;
            }
        });
        return id;
    },

    // スイッチタイプの名前を返す
    getTypeName: function(type_id){
        let result = {
            'name': "",
            'is_on': "",
        };
        Main.switchTypes.some(function(switchType){
            if(switchType.id === type_id){
                result.name = switchType.name;
                result.is_on = switchType.is_on;
                return true;
            }
        });
        return result;
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

};

Main.init();