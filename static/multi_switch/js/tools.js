/**
 * 日付関連ツール
 */
datetimeTools = {

    /**
     * newerDateObjectとolderDateObjectとの差分計算
     * @param {Date} newer - 未来日付
     * @param {Date} older - 過去日付
     * @return {{deltaDate: number, deltaHours: number, deltaMinutes: number, deltaSeconds: number}} 差分
     */
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

    /**
     * 繰り上げ処理
     * @param {{hours: number, minutes: number, seconds: number}} delta
     * @returns {{hours: number, minutes: number, seconds: number}} 処理結果
     */
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

    /**
     * 時分秒を秒だけに換算
     * @param {{hours: number, minutes: number, seconds: number}} log
     * @returns {number} 秒換算した値
     */
    convertToSeconds: function(log){
        return log.hours * 60 * 60 + log.minutes * 60 + log.seconds;
    },

    /**
     * 秒を時分秒に換算
     * @param {number} seconds
     * @returns {{hours: number, minutes: number, seconds: number}} 換算後の数値
     */
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

    /**
     * 年月日が一致しているか
     * @param {Date} a
     * @param {Date} b
     * @returns {boolean}
     */
    compareDate: function(a, b){
        return (a.getFullYear() === b.getFullYear() &&
            a.getMonth() === b.getMonth() &&
            a.getDate() === b.getDate());
    },

    /**
     * 数値を指定桁まで0埋め
     * @param {number} number - 対象数値
     * @param {number} digit - 桁数
     * @returns {string}
     */
    padZero: function(number, digit){
        let zeros = '';
        for(let i = 0; i < digit; i++){
            zeros += '0';
        }
        return (zeros + number).slice( -1 * digit);
    },

    /**
     * DB登録用の日付フォーマット文字列へ変換
     * (ex.'2018-01-01T09:00:00+09:00')
     * @param {Date} date
     * @returns {string} DB用文字列
     */
    convertToDbFormat: function(date){
        return date.getFullYear() + "-" +
            datetimeTools.padZero((date.getMonth() + 1), 2) + "-" +
            datetimeTools.padZero(date.getDate(), 2) + "T" +
            datetimeTools.padZero(date.getHours(), 2) + ":" +
            datetimeTools.padZero(date.getMinutes(), 2) + ":" +
            datetimeTools.padZero(date.getSeconds(), 2) +
            ( 0 - (date.getTimezoneOffset() / 60) < 0 ?
                '-' + datetimeTools.padZero((date.getTimezoneOffset() / 60), 2) + ":00"
                : '+' + datetimeTools.padZero((0 - (date.getTimezoneOffset() / 60)), 2) + ":00");
    },

    /**
     * 固定フォーマットへ変換
     * (ex.'2018/01/01 09:00:00')
     * @param {Date} date
     * @returns {string} 変換後文字列
     */
    convertToStringFormat: function(date){
        return date.getFullYear() + "/" +
            datetimeTools.padZero((date.getMonth() + 1), 2) + "/" +
            datetimeTools.padZero(date.getDate(), 2) + " " +
            datetimeTools.padZero(date.getHours(), 2) + ":" +
            datetimeTools.padZero(date.getMinutes(), 2) + ":" +
            datetimeTools.padZero(date.getSeconds(), 2);
    },

    /**
     * 曜日変換
     * @param {number} dayOfWeek
     * @returns {string} 短縮曜日名
     */
    convertWeekdayString: function(dayOfWeek){
        return [ "日", "月", "火", "水", "木", "金", "土" ][dayOfWeek] ;
    },
};

/**
 * 外部ライブラリ利用ツール
 */
libraryTools = {

    /**
     * Materialize : トースター
     * @param {string} str
     */
    popSimpleToast: function(str){
        M.toast({
            'html': str,
        });
    },
};

/**
 * SwitchType操作ツール
 */
switchTypeTools = {
    switchTypes : {},

    /**
     * API利用: Switch Typeを全取得
     * @param {function} after - API成功時の呼び出し関数
     */
    getSwitchTypes: function(after){
        $.ajax({
            "url": "/multi_switch/api/switch_type_list/",
            "cache": false,
            "dataType": "json",
            "success": function (result) {
                switchTypeTools.switchTypes = result;
                after();
            },
            "error": function (e) {
                alert('Error:' + e.responseText);
            }
        });
    },

    /**
     * スイッチタイプIDを返す
     * @param {string} type_name - スイッチタイプ名(eg.'milk')
     * @param {boolean} is_on - スイッチタイプON/OFF
     * @returns {number} スイッチタイプID
     */
    getTypeId: function(type_name, is_on){
        let id = 0;
        switchTypeTools.switchTypes.some(function(switchType){
            if(switchType.name === type_name &&
              switchType.is_on === is_on){
                id = switchType.id;
                return true;
            }
        });
        return id;
    },

    /**
     * スイッチタイプ名を返す
     * @param {number} type_id - スイッチタイプID
     * @returns {{name: string, is_on: string}}
     */
    getTypeName: function(type_id){
        let result = {
            'name': "",
            'is_on': "",
        };
        switchTypeTools.switchTypes.some(function(switchType){
            if(switchType.id === type_id){
                result.name = switchType.name;
                result.is_on = switchType.is_on;
                return true;
            }
        });
        return result;
    },

    /**
     * スイッチタイプ日本語名(CONST登録名)を返す
     * @param {string} type_name - スイッチタイプ名 (eg.'milk')
     * @param {boolean} is_on - ON/OFF
     * @returns {string}
     */
    getJapaneseTypeName: function(type_name, is_on){
        let name = "";
        switch(type_name){
            case CONST.TYPE_ID.MILK:
                name = CONST.TYPE_NAME.MILK;
                break;
            case CONST.TYPE_ID.POO:
                name = CONST.TYPE_NAME.POO;
                break;
            case CONST.TYPE_ID.PEE:
                name = CONST.TYPE_NAME.PEE;
                break;
            case CONST.TYPE_ID.FOOD:
                name = CONST.TYPE_NAME.FOOD;
                break;
            case CONST.TYPE_ID.SHOWER:
                name = CONST.TYPE_NAME.SHOWER;
                break;
            case CONST.TYPE_ID.HELMET:
                if(is_on === true){
                    name = CONST.TYPE_NAME.HELMET_OFF;
                } else if (is_on === false){
                    name = CONST.TYPE_NAME.HELMET_OFF;
                } else {
                    name = CONST.TYPE_NAME.HELMET;
                }
                break;
            case CONST.TYPE_ID.NAPPING:
                if(is_on === true){
                    name = CONST.TYPE_NAME.NAPPING_ON;
                } else if (is_on === false){
                    name = CONST.TYPE_NAME.NAPPING_OFF;
                } else {
                    name = CONST.TYPE_NAME.NAPPING;
                }
                break;
            case CONST.TYPE_ID.NIGHT:
                if(is_on === true){
                    name = CONST.TYPE_NAME.NIGHT_ON;
                } else if (is_on === false){
                    name = CONST.TYPE_NAME.NIGHT_OFF;
                } else {
                    name = CONST.TYPE_NAME.NIGHT;
                }
                break;
        }
        return name;
    },

};