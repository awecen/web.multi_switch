let Stat = {

    /**
     * 全ログ
     */
    allLogs: null,

    /**
     * 初期処理
     */
    init: function(){
        $('#screen-name').text(CONST.SCREEN_NAME.STAT);
        Stat.attachEvents();
        Stat.initializeMaterialize();
        switchTypeTools.getSwitchTypes(function(){
            Stat.getAllLogs(function(){
                Stat.changeType(CONST.TYPE_ID.HELMET);
            });
        });
    },

    /**
     * イベント付加
     */
    attachEvents: function(){

        /* 月移動 */
        $('.date-selector .btn-move').on('click', function(e){
            let $e = $(e.currentTarget);
            if(!$e.hasClass('disabled')){
                let dataVal = parseInt($e.attr('data-val'));
                let year = $('.date-selector .datetime .year').text();
                let month = $('.date-selector .datetime .month').text();
                let date = new Date();
                date.setFullYear(year);
                date.setMonth(parseInt(month) - dataVal);

                let switch_type = $('.type-title').attr('data-val');
                Stat.setCalendarDate(date, switch_type);
                Stat.setStatisticData(date, switch_type);
            }
        });

        /* FAB 【へるめっと】／【ひるね】／【よるね】*/
        $('.btn-change-view').on('click', function(e){
            let $e = $(e.currentTarget);
            $('.btn-change-view').removeClass('invisible');
            $e.addClass('invisible');
            Base.toggleLoadingScreen("show");
            Stat.changeType($e.attr('data-val'));
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
        $typeTitle.removeClass(CONST.TYPE_ID.HELMET);
        $typeTitle.removeClass(CONST.TYPE_ID.NAPPING);
        $typeTitle.removeClass(CONST.TYPE_ID.NIGHT);
        $typeTitle.addClass(switch_type);
        $typeTitle.attr('data-val', switch_type);
        let $icon = $typeTitle.find('.switch-icon');
        $icon.removeClass(CONST.TYPE_ID.HELMET);
        $icon.removeClass(CONST.TYPE_ID.NAPPING);
        $icon.removeClass(CONST.TYPE_ID.NIGHT);
        $icon.addClass(switch_type);
        let $name = $typeTitle.find('.switch-type-name');
        $name.text(switchTypeTools.getJapaneseTypeName(switch_type, null));
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

        let allOnSumAsSeconds = 0;
        let allOffSumAsSeconds = 0;
        allTotal.forEach(function(log){
            allOnSumAsSeconds += datetimeTools.convertToSeconds(log.on_time);
            allOffSumAsSeconds += datetimeTools.convertToSeconds(log.off_time);
        });

        let monthOnSumAsSeconds = 0;
        let monthOffSumAsSeconds = 0;
        monthTotal.forEach(function(log){
            monthOnSumAsSeconds += datetimeTools.convertToSeconds(log.on_time);
            monthOffSumAsSeconds += datetimeTools.convertToSeconds(log.off_time);
        });



        return {
            all:{
                on : datetimeTools.convertToHMS(Math.floor(allOnSumAsSeconds / allTotal.length)),
                off : datetimeTools.convertToHMS(Math.floor(allOffSumAsSeconds / allTotal.length)),
            },
            month:{
                on : datetimeTools.convertToHMS(Math.floor(monthOnSumAsSeconds / monthTotal.length)),
                off : datetimeTools.convertToHMS(Math.floor(monthOffSumAsSeconds / monthTotal.length)),
            },
        }

    },

    /**
     * カレンダー要素設定
     * @param {Date} date
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
     * @return {[
     *   date : number,
     *   on_time : {hours: number, minutes: number, seconds: number},
     *   off_time : {hours: number, minutes: number, seconds: number}
     * ]}
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
                endDate.setDate(0,0,0,0);
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
        let tempDate = startDateObj.getDate()
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
        targetLogs.forEach(function(log){
           let logDateObj = new Date(log.switch_time);
           if(logDateObj < startDateObj || endDateObj <= logDateObj){
                // 対象ログが範囲外なら
                // 日毎ログを集計用配列に格納
                targetLogsByDate.push({
                   date: tempDate,
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
        });
        targetLogsByDate.push({
           date: tempDate,
           logs: logsByDate.concat(),
        });

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
                on_time: datetimeTools.convertToHMS(on_time_seconds),
                off_time: datetimeTools.convertToHMS(off_time_seconds),
            });

        });

        return totalTimes;
    },

    /**
     * 表示形式切り替え
     * @param {String} view_type
     */
    changeType: function(view_type){
        Stat.setTypeTitle(view_type);
        Stat.setCalendarDate(new Date(), view_type);
        Stat.setStatisticData(new Date(), view_type);
        Base.toggleLoadingScreen("hide");
    },

};

// 初期処理
Stat.init();
