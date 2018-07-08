let Stat = {

    /**
     * 全ログ
     */
    allLogs: null,

    /**
     * 初期処理
     */
    init: function(){
        $('#screen-name').text(Base.userSetting.child_name + CONST.SCREEN_NAME.STAT);
        Stat.attachEvents();
        Stat.initializeMaterialize();
        switchTypeTools.getSwitchTypes(function(){
            Stat.getAllLogs(function(){
                Stat.changeType(new Date(), CONST.TYPE_ID.HELMET);
            });
        });

    },

    /**
     * イベント付加
     */
    attachEvents: function()    {

        let $dateSelector = $('.date-selector');
        let $dateChanger = $('.date-changer');

        /* 月移動 */
        $dateSelector.find('.btn-move').on('click', function(e){
            let $e = $(e.currentTarget);
            if(!$e.hasClass('disabled')){
                let dataVal = parseInt($e.attr('data-val'));
                let $dateTime = $dateSelector.find('.datetime');
                let year = $dateTime.find('.year').text();
                let month = $dateTime.find('.month').text();
                let date = new Date();
                date.setFullYear(year);
                date.setMonth(parseInt(month) - dataVal);

                let switch_type = $('.type-title').attr('data-val');
                Stat.setCalendarDate(date, switch_type);
                Stat.setStatisticData(date, switch_type);
            }
        });

        /* タイプタブ 【へるめっと】／【ひるね】／【よるね】*/
        $('.type-tab-item').on('click', function(e){
            let $e = $(e.currentTarget);
            Base.toggleLoadingScreen("show");
            if($('.detail-content').css('display') === 'none'){
                // カレンダーモードのFAB
                let $dateTime = $dateSelector.find('.datetime');
                let year = $dateTime.find('.year').text();
                let month = $dateTime.find('.month').text();
                let day = 1;
                let selectedDate = year + '/' + month + '/' + day;
                let selectedDateObj = new Date(selectedDate);
                Stat.changeType(selectedDateObj, $e.attr('data-val'));
            } else {
                // グラフモードのFAB
                let $dateTime = $dateChanger.find('.datetime');
                let year = $dateTime.find('.year').text();
                let month = $dateTime.find('.month').text();
                let day = $dateTime.find('.date') ?
                    $dateTime.find('.date').text() : 1;
                let selectedDate = year + '/' + month + '/' + day;
                let selectedDateObj = new Date(selectedDate);
                Stat.changeType(selectedDateObj, $e.attr('data-val'));
            }
        });

        /* 日付選択 */
        $('.container').on('click', '.calendar-row.date .cell', function(e){
        　  let $e = $(e.currentTarget);
            if(!($e.hasClass('none') || $e.hasClass('future'))){
                let date = $e.find('.day').text();
                let $dateTime = $dateSelector.find('.datetime');
                let year = $dateTime.find('.year').text();
                let month = $dateTime.find('.month').text();
                let selected_date = year + '/' + month + '/' + date;
                let switch_type = $('.type-title').attr('data-val');
                let selected_date_object = new Date(selected_date);
                Base.toggleLoadingScreen('show');
                Stat.moveToDetailStat(selected_date_object, switch_type);
                $('.body').scrollTop(0);
                $('html,body').scrollTop(0);
                $(document).scrollTop(0);
                Base.toggleLoadingScreen('hide');
            }
        });

        /* カレンダーに戻る */
        $('.btn-back-to-calendar').on('click', function(){
            Base.toggleLoadingScreen('show');
            $('.detail-content').hide();
            let $dateTime = $dateChanger.find('.datetime');
            let year = $dateTime.find('.year').text();
            let month = $dateTime.find('.month').text();
            let day = $dateTime.find('.date') ?
                $dateTime.find('.date').text() : 1;
            let selectedDate = year + '/' + month + '/' + day;
            let selectedDateObj = new Date(selectedDate);
            let switch_type = $('.type-title').attr('data-val');
            switchTypeTools.getSwitchTypes(function(){
                Stat.getAllLogs(function(){
                    Stat.changeType(selectedDateObj, switch_type);
                    Base.toggleLoadingScreen('hide');
                    $('.body').scrollTop(0);
                    $('html,body').scrollTop(0);
                    $(document).scrollTop(0);
                    $('.calendar-content').show();
                });
            });
        });

        /* 日付移動 */
        $('.date-changer .btn-move').on('click', function(e){
            let $e = $(e.currentTarget);
            if(!$e.hasClass('disabled')){
                let dataVal = parseInt($e.attr('data-val'));
                let year = $('.date-changer .datetime .year').text();
                let month = $('.date-changer .datetime .month').text();
                let date = $('.date-changer .datetime .date').text();
                let dateObj = new Date();
                dateObj.setFullYear(year);
                dateObj.setMonth(parseInt(month) - 1);
                dateObj.setDate(date);
                dateObj.setDate(dateObj.getDate() + 1 - dataVal);
                let switch_type = $('.type-title').attr('data-val');
                Stat.setDetailGraph(dateObj, switch_type);
            }
        });
    },

    /**
     * Materialize標準コンポーネントの初期化
     */
    initializeMaterialize: function(){
        // Floating Action Button
        $('.fixed-action-btn').floatingActionButton({
            hoverEnabled: false,
        });
    },

    /**
     * 全ログ取得
     * @param {function} after - コールバック関数
     */
    getAllLogs: function(after){
        $.ajax({
            "url": "/multi_switch/api/log_list/",
            "cache": false,
            "dataType": "json",
            "success": function (result) {
                Stat.allLogs = result;
                after();
            },
            "error": function (e) {
                alert('全ログ取得APIエラー\r' + e.responseText);
            }
        });
    },

    /**
     * 画面上部のタイプ名称を設定
     * @param {String} switch_type
     */
    setTypeTitle: function(switch_type){
        let $typeTitle = $('.type-title');
        $typeTitle.attr('data-val', switch_type);
        $('.type-tab-item').each(function(i, e){
            let $e = $(e);
            if($e.hasClass(switch_type)){
                $e.addClass('selected');
            }else{
                $e.removeClass('selected');
            }
        });
    },

    /**
     * 集計データ設定
     * @param {Date} date
     * @param {String} switch_type
     */
    setStatisticData: function(date, switch_type){
        let averages = Stat.calculateAverage(date, switch_type);
        // 全平均(装着)
        let all_on = datetimeTools.padZero(averages.all.on.hours, 2) + ":" +
            datetimeTools.padZero(averages.all.on.minutes, 2) + ":" +
            datetimeTools.padZero(averages.all.on.seconds, 2);
        $('.stat-data .stat-column.total-all .content .on .time').text(all_on);
        // 全平均(休憩)
        let all_off = datetimeTools.padZero(averages.all.off.hours, 2) + ":" +
            datetimeTools.padZero(averages.all.off.minutes, 2) + ":" +
            datetimeTools.padZero(averages.all.off.seconds, 2);
        $('.stat-data .stat-column.total-all .content .off .time').text(all_off);
        // 当月平均(装着)
        let month_on = datetimeTools.padZero(averages.month.on.hours, 2) + ":" +
            datetimeTools.padZero(averages.month.on.minutes, 2) + ":" +
            datetimeTools.padZero(averages.month.on.seconds, 2);
        $('.stat-data .stat-column.total-month .content .on .time').text(month_on);
        // 当月平均(休憩)
        let month_off = datetimeTools.padZero(averages.month.off.hours, 2) + ":" +
            datetimeTools.padZero(averages.month.off.minutes, 2) + ":" +
            datetimeTools.padZero(averages.month.off.seconds, 2);
        $('.stat-data .stat-column.total-month .content .off .time').text(month_off);

        // スイッチタイプ別表示切り替え
        if(switch_type === CONST.TYPE_ID.HELMET){
            $('.stat-data .stat-column .content .on .status-label').removeClass('invisible');
            $('.stat-data .stat-column .content .off').removeClass('invisible');
        }else{
            $('.stat-data .stat-column .content .on .status-label').addClass('invisible');
            $('.stat-data .stat-column .content .off').addClass('invisible');
        }
    },

    /**
     * * 平均データ算出
     * @param {Date} selected_date
     * @param {String} switch_type
     * @returns {{
     *   all: {
     *     on: string,
     *     off: string
     *   },
     *   month: {
     *     on: string,
     *     off: string
     *   }
     * }}
     */
    calculateAverage: function(selected_date, switch_type){
        let allTotal = Stat.calculateTotalOfLogs(null, switch_type);
        let monthTotal = Stat.calculateTotalOfLogs(selected_date, switch_type);

        // 本日日付分があれば排除(全平均)
        let allTotalWoToday = [];
        allTotal.forEach(function(log){
            if(!datetimeTools.compareDate(log.dateObj, new Date())){
                allTotalWoToday.push(log);
            }
        });

        // 本日日付分があれば排除(当月平均)
        let monthTotalWoToday = [];
        monthTotal.forEach(function(log){
            if(!datetimeTools.compareDate(log.dateObj, new Date())){
                monthTotalWoToday.push(log);
            }
        });

        // 集計(全平均)
        let allOnSumAsSeconds = 0;
        let allOffSumAsSeconds = 0;
        allTotalWoToday.forEach(function(log){
            allOnSumAsSeconds += datetimeTools.convertToSeconds(log.on_time);
            allOffSumAsSeconds += datetimeTools.convertToSeconds(log.off_time);
        });

        // 集計(当月平均)
        let monthOnSumAsSeconds = 0;
        let monthOffSumAsSeconds = 0;
        monthTotalWoToday.forEach(function(log){
            monthOnSumAsSeconds += datetimeTools.convertToSeconds(log.on_time);
            monthOffSumAsSeconds += datetimeTools.convertToSeconds(log.off_time);
        });

        return {
            all:{
                on : allOnSumAsSeconds ? datetimeTools.convertToHMS(Math.floor(allOnSumAsSeconds / allTotalWoToday.length)) : {hours:0, minutes:0, seconds:0},
                off : allOffSumAsSeconds ? datetimeTools.convertToHMS(Math.floor(allOffSumAsSeconds / allTotalWoToday.length)) : {hours:0, minutes:0, seconds:0},
            },
            month:{
                on : monthOnSumAsSeconds ? datetimeTools.convertToHMS(Math.floor(monthOnSumAsSeconds / monthTotalWoToday.length)) : {hours:0, minutes:0, seconds:0},
                off : monthOffSumAsSeconds ? datetimeTools.convertToHMS(Math.floor(monthOffSumAsSeconds / monthTotalWoToday.length)) : {hours:0, minutes:0, seconds:0},
            },
        }

    },

    /**
     * カレンダー要素設定
     * @param {Date} date
     * @param {String} switch_type
     */
    setCalendarDate: function(date, switch_type){
        let monthByWeek = Stat.calculateMonthByWeek(new Date(date.getTime()));
        let totalLogs = Stat.calculateTotalOfLogs(date, switch_type);

        // 年月表示セット
        let year = date.getFullYear();
        let month = date.getMonth() + 1;
        $('.date-selector .datetime .year').text(year);
        $('.date-selector .datetime .month').text(datetimeTools.padZero(month, 2));

        // 月移動ボタンセット
        let now = new Date();
        if(date.getFullYear() === now.getFullYear()
            && date.getMonth() === now.getMonth()){
            $('.date-selector .btn-move.btn-next').addClass('disabled');
        } else {
            $('.date-selector .btn-move.btn-next').removeClass('disabled');
        }

        // 日付セット
        $('.stat-calendar .calendar-row.date').remove();
        monthByWeek.forEach(function(week){// 週行
            let $row = $('<div class="calendar-row date"></div>');
            $row.appendTo($('.stat-calendar'));
            // 週内、日にち
            week.forEach(function(day){
                let $cell = $('<div class="cell"></div>');
                if(day === 0){
                    $cell.addClass('none');
                } else {
                    let targetLog = "";
                    totalLogs.some(function(log){
                        if(log.date === day){
                            targetLog = log;
                            return true;
                        }
                    });
                    let on_time = "00:00:00";
                    let off_time = "00:00:00";
                    if(targetLog) {
                        on_time =
                            datetimeTools.padZero(targetLog.on_time.hours, 2) + ":" +
                            datetimeTools.padZero(targetLog.on_time.minutes, 2) + ":" +
                            datetimeTools.padZero(targetLog.on_time.seconds, 2);
                        off_time =
                            datetimeTools.padZero(targetLog.off_time.hours, 2) + ":" +
                            datetimeTools.padZero(targetLog.off_time.minutes, 2) + ":" +
                            datetimeTools.padZero(targetLog.off_time.seconds, 2);
                    }

                    // 未来日付色分けCSS用クラス
                    let month = date.getMonth();
                    let dateObject = new Date();
                    dateObject.setMonth(month);
                    dateObject.setDate(day);
                    if(new Date() - dateObject < 0){
                        $cell.addClass('future');
                    }
                    // 本日日付色分けCSS用クラス
                    if(datetimeTools.compareDate(new Date, dateObject)){
                        $cell.addClass('today');
                    }
                    // 偶数奇数色分けCSS用クラス
                    if((day % 2) === 0){
                        $cell.addClass('even');
                    } else {
                        $cell.addClass('odd');
                    }
                    // 数値要素作成
                    let $day = $('<div class="day">' + day + '</div>');
                    $day.appendTo($cell);
                    let $on_time, $off_time;
                    // スイッチタイプ別表示切り替え
                    if(switch_type === CONST.TYPE_ID.HELMET){
                        $on_time = $('<div class="total-time on"><span>●</span>' + on_time + '</div>');
                        $off_time = $('<div class="total-time off"><span>●</span>' + off_time + '</div>');
                    } else {
                        $on_time = $('<div class="total-time on"><span class="invisible">●</span>' + on_time + '</div>');
                        $off_time = $('<div class="total-time off invisible"><span>●</span>' + off_time + '</div>');
                    }
                    $on_time.appendTo($cell);
                    $off_time.appendTo($cell);
                }
                $cell.appendTo($row);

            });
        });

        // 出現アニメーション
        let $date_cells = $('.calendar-row.date').find('.cell');
        let duration = 50;
        $date_cells.each(function(i, e){
          let $e = $(e);
          setTimeout(function(){
              $e.css('opacity', '1');
          }, duration * i);

        });
    },

    /**
     * 当月の週と日にちを算出
     * @param {Date} date
     * @returns {Array} monthByWeek
     */
    calculateMonthByWeek: function(date){
      let monthByWeek = [];
        // 月初
        date.setDate(1);
        // 月初の曜日
        let weekday = date.getDay();
        let month = date.getMonth();

        let week = [];
        for(let i = 0; i < weekday; i++){
            week.push(0);
        }
        while(month === date.getMonth()){
            week.push(date.getDate());
            if(date.getDay() === 6){
                monthByWeek.push(week.concat());
                week = [];
            }
            // 1日進める
            date.setDate(date.getDate() + 1);
        }

        // 月末が土曜日じゃなかった場合
        if(week.length !== 0){
            // 最後の行の次月日付分を補填
            for(let i = week.length; i < 7 ; i++){
                week.push(0);
            }
            // 最後の行を追加
            monthByWeek.push(week.concat());
        }

        return monthByWeek;
    },

    /**
     * ログ内のトータル時間計算
     * @param {String} type_id
     * @param {Date} selected_date
     * @return {Array}
     */
    calculateTotalOfLogs: function(selected_date, type_id){
        // 対象ログの抽出(スイッチタイプ)
        let targetLogsBySwitchType = [];
        Stat.allLogs.forEach(function(log){
           if(log.type === switchTypeTools.getTypeId(type_id, true)
               || log.type === switchTypeTools.getTypeId(type_id, false)) {
                targetLogsBySwitchType.push(log);
           }
        });

        // さらに当月分指定があれば当月分を抽出
        let targetLogs = [];
        if(selected_date){
            targetLogsBySwitchType.forEach(function(log){
                // ログの日付
                let logDate = new Date(log.switch_time);
                // 範囲判定用:開始日時
                let startDate = new Date(selected_date.getTime());
                startDate.setDate(1);
                startDate.setHours(0,0,0,0);
                if(type_id === CONST.TYPE_ID.NIGHT){
                    // 【よるね】は12時が区切りなので
                    startDate.setHours(12,0,0,0);
                }
                // 範囲判定用:終了日時
                let endDate = new Date(selected_date.getTime());
                endDate.setMonth(endDate.getMonth() + 1);
                endDate.setDate(1);
                endDate.setHours(0,0,0,0);
                if(type_id === CONST.TYPE_ID.NIGHT){
                    // 【よるね】は12時が区切りなので
                    endDate.setHours(12,0,0,0);
                }
                // 範囲内判定
                if(startDate <= logDate && logDate < endDate){
                    targetLogs.push(log);
                }
            });
        } else {
            targetLogs = targetLogsBySwitchType.concat();
        }

        // 日付昇順ソート
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

        // 日毎ログ集計用配列
        let targetLogsByDate = [];
        // 判定用開始日付
        let startDateObj = new Date();
        // 判定用終了日付
        let endDateObj = new Date();
        let tempDate = startDateObj.getDate();
        if(targetLogs.length !== 0){
            // 判定用日付に対象ログの最初のログ情報をまずセット
            startDateObj = new Date(targetLogs[0].switch_time);
            endDateObj = new Date(targetLogs[0].switch_time);
            tempDate = startDateObj.getDate();
            startDateObj.setHours(0,0,0,0);
            endDateObj.setDate(endDateObj.getDate() + 1);
            endDateObj.setHours(0,0,0,0);
            if(type_id === CONST.TYPE_ID.NIGHT){
                // 【よるね】は12時が区切りなので
                startDateObj.setHours(12,0,0,0);
                endDateObj.setHours(12,0,0,0)
            }
        }
        // 日毎ログ
        let logsByDate = [];
        for(let i = 0; i < targetLogs.length ; i++){
            let log = targetLogs[i];
            let logDateObj = new Date(log.switch_time);
            if(logDateObj < startDateObj || endDateObj <= logDateObj){
                // 対象ログが範囲外なら
                // 日毎ログを集計用配列に格納
                targetLogsByDate.push({
                   date: tempDate,
                   dateObj: logDateObj,
                   logs: logsByDate.concat(),
                });

                // 判定用日付更新
                startDateObj = new Date(log.switch_time);
                endDateObj = new Date(log.switch_time);
                tempDate = startDateObj.getDate();
                startDateObj.setHours(0,0,0,0);
                endDateObj.setDate(endDateObj.getDate() + 1);
                endDateObj.setHours(0,0,0,0);
                if(type_id === CONST.TYPE_ID.NIGHT){
                    // 【よるね】は12時が区切りなので
                    startDateObj.setHours(12,0,0,0);
                    endDateObj.setHours(12,0,0,0)
                }
                // 日毎ログも初期化
                logsByDate = [];
            }
            logsByDate.push(log);
            if(i === targetLogs.length - 1){
                targetLogsByDate.push({
                   date: tempDate,
                   dateObj: logDateObj,
                   logs: logsByDate.concat(),
                });
            }
        }

        // 日付ごとの累計時間を算出
        let totalTimes = [];
        targetLogsByDate.forEach(function(logsByDate){
            // 累計ON(秒)
            let on_time_seconds = 0;
            // 累計OFF(秒)
            let off_time_seconds = 0;
            // 日付数字
            let date = logsByDate.date;
            // 日毎ログループ
            for(let i = 0; i < logsByDate.logs.length; i++){
                let log = logsByDate.logs[i];
                let logDateObj = new Date(log.switch_time);
                let targetLogDateObj;
                if(i === 0){
                    // 最初のログは0時0分から
                    targetLogDateObj = new Date(logDateObj.getTime());
                    targetLogDateObj.setHours(0,0,0,0);
                    if(type_id === CONST.TYPE_ID.NIGHT){
                        // 【よるね】は12時が区切りなので
                        targetLogDateObj.setHours(12,0,0,0);
                    }
                } else {
                    // その他は前のログ時間から
                    targetLogDateObj = new Date(logsByDate.logs[i - 1].switch_time);
                }

                // 差分算出
                let delta = datetimeTools.getDelta(
                        logDateObj, targetLogDateObj
                );
                // 差分を秒換算
                let deltaSeconds = datetimeTools.convertToSeconds({
                    hours: delta.deltaHours,
                    minutes: delta.deltaMinutes,
                    seconds: delta.deltaSeconds,
                });
                // ON／OFFどちらかに振り分け
                if(!switchTypeTools.getTypeName(log.type).is_on){
                    on_time_seconds += deltaSeconds;
                } else {
                    off_time_seconds += deltaSeconds;
                }
                // 日毎ログ内の最後のログ
                if(i === logsByDate.logs.length - 1){
                    let tomorrowObj = new Date(logDateObj.getTime());
                    tomorrowObj.setHours(0,0,0,0);
                    tomorrowObj.setDate(tomorrowObj.getDate() + 1);
                    if(type_id === CONST.TYPE_ID.NIGHT){
                        // 【よるね】は12時が区切りなので
                        tomorrowObj.setHours(12,0,0,0);
                    }
                    let lastTargetDateObj = tomorrowObj;
                    if(new Date() <= tomorrowObj){
                        // 比較対象が現在より未来日時なら
                        // 比較対象は現在日時とする
                        lastTargetDateObj = new Date();
                    }
                    let lastDelta = datetimeTools.getDelta(
                        lastTargetDateObj, logDateObj);
                    let lastDeltaSeconds = datetimeTools.convertToSeconds({
                        hours: lastDelta.deltaHours,
                        minutes: lastDelta.deltaMinutes,
                        seconds: lastDelta.deltaSeconds,
                    });

                    if(switchTypeTools.getTypeName(log.type).is_on){
                        on_time_seconds += lastDeltaSeconds;
                    } else {
                        off_time_seconds += lastDeltaSeconds;
                    }

                }
            }

            totalTimes.push({
                date: date,
                dateObj: logsByDate.dateObj,
                on_time: datetimeTools.convertToHMS(on_time_seconds),
                off_time: datetimeTools.convertToHMS(off_time_seconds),
            });

        });

        return totalTimes;
    },

    /**
     * 表示形式切り替え
     * @param {Date} selected_date
     * @param {String} view_type
     */
    changeType: function(selected_date, view_type){
        Stat.setTypeTitle(view_type);
        Stat.setCalendarDate(selected_date, view_type);
        Stat.setStatisticData(selected_date, view_type);
        Stat.setDetailGraph(selected_date, view_type);
        Base.toggleLoadingScreen("hide");
    },

    /**
     * 日毎詳細グラフへ移動
     */
    moveToDetailStat: function(selected_date, switch_type){
        $('.calendar-content').hide();
        $('.detail-content').css('display', 'flex');
        Stat.setDetailGraph(selected_date, switch_type);
    },

    /**
     * グラフに情報を設定
     * @param {Date} selected_date
     * @param {String} switch_type
     */
    setDetailGraph: function(selected_date, switch_type){
        // 日付表示
        $('.date-changer .datetime .year').text(selected_date.getFullYear());
        $('.date-changer .datetime .month').text(datetimeTools.padZero(selected_date.getMonth() + 1 , 2));
        $('.date-changer .datetime .date').text(datetimeTools.padZero(selected_date.getDate(), 2));

        // 日付移動ボタンセット
        let nowObj = new Date();
        if(datetimeTools.compareDate(selected_date, nowObj)){
            $('.date-changer .btn-move.btn-next').addClass('disabled');
        } else {
            $('.date-changer .btn-move.btn-next').removeClass('disabled');
        }

        // グラフ目盛り変更
        Stat.changeGraphScale(switch_type);

        // 情報格納要素変更
        Stat.changeDetailInfo(switch_type);

        // 対象ログ格納用配列
        let targetLogs = [];
        // 対象ログ抽出
        Stat.allLogs.forEach(function(log){
           if(log.type === switchTypeTools.getTypeId(switch_type, true)
               || log.type === switchTypeTools.getTypeId(switch_type, false)) {
                let logDateObj = new Date(log.switch_time);
                let startDateObj = new Date(selected_date);
                startDateObj.setHours(0,0,0,0);
                if(switch_type === CONST.TYPE_ID.NIGHT){
                    // 【よるね】は12時区切り
                    startDateObj.setHours(12, 0, 0, 0);
                }
                let endDateObj = new Date(selected_date);
                endDateObj.setDate(endDateObj.getDate() + 1);
                endDateObj.setHours(0,0,0,0);
                if(switch_type === CONST.TYPE_ID.NIGHT){
                    // 【よるね】は12時区切り
                    endDateObj.setHours(12, 0, 0, 0);
                }
                if(startDateObj <= logDateObj && logDateObj < endDateObj){
                    targetLogs.push(log);
                }
           }
        });
         // 日付昇順ソート
        targetLogs.sort(function(a, b){
            if (new Date(a.switch_time) - new Date(b.switch_time) < 0)
                return -1;
            if (new Date(a.switch_time) - new Date(b.switch_time) > 0)
                return 1;
            return 0;
        });

        // 対象ログの要素を作成してグラフに配置していく
        let $basement = $('.detail-body .graph .graph-body .graph-basement');
        $basement.empty();
        let tempDateObj;
        for(let i = 0; i < targetLogs.length; i++){
            let log = targetLogs[i];
            // 要素height計算
            if(!tempDateObj){
                tempDateObj = new Date(log.switch_time);
                tempDateObj.setHours(0,0,0,0);
                if(switch_type === CONST.TYPE_ID.NIGHT){
                    // 【よるね】は12時区切り
                    tempDateObj.setHours(12, 0, 0, 0);
                }

            }
            let logDateObj = new Date(log.switch_time);
            let delta = datetimeTools.getDelta(logDateObj, tempDateObj);
            let deltaSeconds = datetimeTools.convertToSeconds({
                hours: delta.deltaHours,
                minutes: delta.deltaMinutes,
                seconds: delta.deltaSeconds,
            });
            let height = deltaSeconds * 0.0075; //1秒:0.0075px

            // 要素作成
            let $bar = $('<div class="graph-bar"></div>');
            $bar.addClass(switch_type);
            $bar.addClass(!switchTypeTools.getTypeName(log.type).is_on ? 'on' : 'off');
            $bar.css('height', height + 'px');
            $bar.appendTo($basement);
            // 次ログへの基準を渡す
            tempDateObj = new Date(logDateObj.getTime());

            // 最後のログの場合、日付変更時刻までの要素も作成する
            if(i === targetLogs.length - 1){
                let targetDateObj = new Date(logDateObj.getTime());
                targetDateObj.setHours(0,0,0,0);
                if(switch_type === CONST.TYPE_ID.NIGHT){
                    // 【よるね】は12時区切り
                    targetDateObj.setHours(12, 0, 0, 0);
                }
                targetDateObj.setDate(targetDateObj.getDate() + 1);
                // 対象日時が未来日時の場合は対象を現在日時に変更する
                if(new Date() < targetDateObj){
                    targetDateObj = new Date();
                }
                let delta = datetimeTools.getDelta(targetDateObj, tempDateObj);
                let deltaSeconds = datetimeTools.convertToSeconds({
                    hours: delta.deltaHours,
                    minutes: delta.deltaMinutes,
                    seconds: delta.deltaSeconds,
                });
                let height = deltaSeconds * 0.0075; //1秒:0.0075px

                // 要素作成
                let $bar = $('<div class="graph-bar"></div>');
                $bar.addClass(switch_type);
                $bar.addClass(switchTypeTools.getTypeName(log.type).is_on ? 'on' : 'off');
                $bar.css('height', height + 'px');
                $bar.appendTo($basement);
            }
        }

        // 出現アニメーション
        Stat.startGraphAppearingAnimation(1200);

        // 累計
        let calculatedDate = Stat.getDetailInfo(selected_date, switch_type, targetLogs);
        $('.info-row.total-on .data .time').text(
            datetimeTools.padZero(calculatedDate.on_time.hours, 2) + ":" +
            datetimeTools.padZero(calculatedDate.on_time.minutes, 2) + ":" +
            datetimeTools.padZero(calculatedDate.on_time.seconds, 2)
        );
        $('.info-row.total-off .data .time').text(
            datetimeTools.padZero(calculatedDate.off_time.hours, 2) + ":" +
            datetimeTools.padZero(calculatedDate.off_time.minutes, 2) + ":" +
            datetimeTools.padZero(calculatedDate.off_time.seconds, 2)
        );
        $('.info-row.off-number .data .number').text(
            datetimeTools.padZero(calculatedDate.off_number, 2)
        );

    },

    /**
     * 指定日付だけの累計情報
     * @param {Date} selected_date
     * @param {String} switch_type
     * @param {Array} logs
     */
    getDetailInfo: function(selected_date, switch_type, logs){
        // 累計ON(秒)
        let on_time_seconds = 0;
        // 累計OFF(秒)
        let off_time_seconds = 0;
        // OFF回数
        let off_number = 0;
        // 日毎ログループ
        for(let i = 0; i < logs.length; i++){
            let log = logs[i];
            let logDateObj = new Date(log.switch_time);
            let targetLogDateObj;
            if(i === 0){
                // 最初のログは0時0分から
                targetLogDateObj = new Date(logDateObj.getTime());
                targetLogDateObj.setHours(0,0,0,0);
                if(switch_type === CONST.TYPE_ID.NIGHT){
                    // 【よるね】は12時が区切りなので
                    targetLogDateObj.setHours(12,0,0,0);
                }
            } else {
                // その他は前のログ時間から
                targetLogDateObj = new Date(logs[i - 1].switch_time);
            }

            // 差分算出
            let delta = datetimeTools.getDelta(
                    logDateObj, targetLogDateObj
            );
            // 差分を秒換算
            let deltaSeconds = datetimeTools.convertToSeconds({
                hours: delta.deltaHours,
                minutes: delta.deltaMinutes,
                seconds: delta.deltaSeconds,
            });
            // ON／OFFどちらかに振り分け
            if(!switchTypeTools.getTypeName(log.type).is_on){
                on_time_seconds += deltaSeconds;
            } else {
                off_number += 1;
                off_time_seconds += deltaSeconds;
            }
            // 日毎ログ内の最後のログ
            if(i === logs.length - 1){
                let tomorrowObj = new Date(logDateObj.getTime());
                tomorrowObj.setHours(0,0,0,0);
                tomorrowObj.setDate(tomorrowObj.getDate() + 1);
                if(switch_type === CONST.TYPE_ID.NIGHT){
                    // 【よるね】は12時が区切りなので
                    tomorrowObj.setHours(12,0,0,0);
                }
                let lastTargetDateObj = tomorrowObj;
                if(new Date() <= tomorrowObj){
                    // 比較対象が現在より未来日時なら
                    // 比較対象は現在日時とする
                    lastTargetDateObj = new Date();
                }
                let lastDelta = datetimeTools.getDelta(
                    lastTargetDateObj, logDateObj);
                let lastDeltaSeconds = datetimeTools.convertToSeconds({
                    hours: lastDelta.deltaHours,
                    minutes: lastDelta.deltaMinutes,
                    seconds: lastDelta.deltaSeconds,
                });

                if(switchTypeTools.getTypeName(log.type).is_on){
                    on_time_seconds += lastDeltaSeconds;
                } else {
                    off_time_seconds += lastDeltaSeconds;
                }

            }
        }

        return {
            on_time: datetimeTools.convertToHMS(on_time_seconds),
            off_time: datetimeTools.convertToHMS(off_time_seconds),
            off_number: off_number,
        }
    },

    /**
     * スイッチタイプ別グラフ目盛り(時間)変更
     * @param switch_type
     */
    changeGraphScale: function(switch_type){
        let $scale = $('.detail-content .scroll-area .detail-body .graph .graph-scale');
        $scale.empty();
        if(switch_type === CONST.TYPE_ID.NIGHT){
            // 【よるね】は12時区切り
            $scale.append($('<div class="th0">12:00</div>'));
            $scale.append($('<div class="th2">13:00</div>'));
            $scale.append($('<div class="th2">14:00</div>'));
            $scale.append($('<div class="th1">15:00</div>'));
            $scale.append($('<div class="th2">16:00</div>'));
            $scale.append($('<div class="th2">17:00</div>'));
            $scale.append($('<div class="th1">18:00</div>'));
            $scale.append($('<div class="th2">19:00</div>'));
            $scale.append($('<div class="th2">20:00</div>'));
            $scale.append($('<div class="th1">21:00</div>'));
            $scale.append($('<div class="th2">22:00</div>'));
            $scale.append($('<div class="th2">23:00</div>'));
            $scale.append($('<div class="th1"> 0:00</div>'));
            $scale.append($('<div class="th2"> 1:00</div>'));
            $scale.append($('<div class="th2"> 2:00</div>'));
            $scale.append($('<div class="th1"> 3:00</div>'));
            $scale.append($('<div class="th2"> 4:00</div>'));
            $scale.append($('<div class="th2"> 5:00</div>'));
            $scale.append($('<div class="th1"> 6:00</div>'));
            $scale.append($('<div class="th2"> 7:00</div>'));
            $scale.append($('<div class="th2"> 8:00</div>'));
            $scale.append($('<div class="th1"> 9:00</div>'));
            $scale.append($('<div class="th2">10:00</div>'));
            $scale.append($('<div class="th2">11:00</div>'));
            $scale.append($('<div class="th1">12:00</div>'));
        } else {
            $scale.append($('<div class="th0"> 0:00</div>'));
            $scale.append($('<div class="th2"> 1:00</div>'));
            $scale.append($('<div class="th2"> 2:00</div>'));
            $scale.append($('<div class="th1"> 3:00</div>'));
            $scale.append($('<div class="th2"> 4:00</div>'));
            $scale.append($('<div class="th2"> 5:00</div>'));
            $scale.append($('<div class="th1"> 6:00</div>'));
            $scale.append($('<div class="th2"> 7:00</div>'));
            $scale.append($('<div class="th2"> 8:00</div>'));
            $scale.append($('<div class="th1"> 9:00</div>'));
            $scale.append($('<div class="th2">10:00</div>'));
            $scale.append($('<div class="th2">11:00</div>'));
            $scale.append($('<div class="th1">12:00</div>'));
            $scale.append($('<div class="th2">13:00</div>'));
            $scale.append($('<div class="th2">14:00</div>'));
            $scale.append($('<div class="th1">15:00</div>'));
            $scale.append($('<div class="th2">16:00</div>'));
            $scale.append($('<div class="th2">17:00</div>'));
            $scale.append($('<div class="th1">18:00</div>'));
            $scale.append($('<div class="th2">19:00</div>'));
            $scale.append($('<div class="th2">20:00</div>'));
            $scale.append($('<div class="th1">21:00</div>'));
            $scale.append($('<div class="th2">22:00</div>'));
            $scale.append($('<div class="th2">23:00</div>'));
            $scale.append($('<div class="th1">24:00</div>'));
        }

    },

    /**
     * スイッチタイプ別Info表示変更
     * @param switch_type
     */
    changeDetailInfo: function(switch_type){
        let $detailInfo = $('.detail-content .scroll-area .detail-body .detail-info');
        $detailInfo.empty();

        // 合計 キャプション
        let $totalCaption = $('<div class="info-row caption">とーたる</div>');
        $totalCaption.appendTo($detailInfo);

        // 合計 ON
        let $totalOnRow = $('<div class="info-row total-on"></div>');
        $totalOnRow.appendTo($detailInfo);
        let $totalOnTitle = $('<div class="title"></div>');
        $totalOnTitle.appendTo($totalOnRow);
        if(switch_type === CONST.TYPE_ID.HELMET){
            $totalOnTitle.append($('<span class="status-label on">装着</span>'));
        }else{
            $totalOnTitle.text(' ');
        }
        let $totalOnData = $('<div class="data"></div>');
        $totalOnData.appendTo($totalOnRow);
        $totalOnData.append($('<span class="time">00:00:00</span>'));

        // 合計 OFF
        let $totalOffRow = $('<div class="info-row total-off"></div>');
        if(switch_type === CONST.TYPE_ID.HELMET){
            $totalOffRow.appendTo($detailInfo);
        }
        let $totalOffTitle = $('<div class="title"></div>');
        $totalOffTitle.appendTo($totalOffRow);
        if(switch_type === CONST.TYPE_ID.HELMET){
            $totalOffTitle.append($('<span class="status-label off">休憩</span>'));
        }
        let $totalOffData = $('<div class="data"></div>');
        $totalOffData.appendTo($totalOffRow);
        $totalOffData.append($('<span class="time">00:00:00</span>'));

        // 回数 キャプション
        let $numberCaption;
        if(switch_type === CONST.TYPE_ID.HELMET){
            $numberCaption = $('<div class="info-row caption">休憩回数</div>');
        } else {
            $numberCaption = $('<div class="info-row caption">かいすう</div>');
        }
        $numberCaption.appendTo($detailInfo);

        // 回数 Data
        let $numberRow = $('<div class="info-row off-number">');
        $numberRow.appendTo($detailInfo);
        let $numberTitle = $('<div class="title"><span>&nbsp;</span></div>');
        $numberTitle.appendTo($numberRow);
        let $numberData = $('<div class="data"><span class="number">00</span><span class="counter">かい</span></div>');
        $numberData.appendTo($numberRow);
    },

    /**
     * グラフ表示アニメーション
     */
    startGraphAppearingAnimation: function(duration){
        let $graphCover = $('.graph-cover');
        $graphCover.css({
            'top': '0px',
            'height': '648px',
        });
        $graphCover.animate({
            'top': '648px',
            'height': '0px',
        }, duration, 'swing');
    },



};

// 初期処理
Base.init(Stat.init);
