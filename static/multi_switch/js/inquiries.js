let inquiries = {

    list: [],

    userList: [],

    timerIds: {
      autoUpdating: 0,
    },

    /* 初期処理 */
    init: function(){
        $('#screen-name').text(CONST.SCREEN_NAME.INQUIRIES);
        inquiries.initializeMaterialize();
        inquiries.attachEvents();
        inquiries.changeView(true, 0);
    },

    /**
     * イベント付加
     */
    attachEvents: function() {

        let $container = $('.container');
        /* 詳細画面へ */
        $container.on('click', '.to-detail-icon', function(e){
            let $e = $(e.currentTarget);
            let dataVal = $e.parent().parent().attr('data-val');
            inquiries.changeView(false, parseInt(dataVal));
        });
        /* リスト画面へ */
        $container.on('click', '.btn-back-to-list', function(){
            inquiries.changeView(true, 0);
        });
        /* FAB→ダイアログ */
        $container.on('click', '.btn-new-inquiry', function(){
            inquiries.toggleInquiryDialog(true);
        });
        /* FAB キャンセル ボタン*/
        $('.inquiry-dialog .btn-cancel').on('click', function(){
            inquiries.toggleInquiryDialog(false);
        });
        /* FAB キャンセル 背景*/
        $('.inquiry-dialog').on('click', function(){
            inquiries.toggleInquiryDialog(false);
        });
        /* FAB キャンセル 背景伝播止め*/
        $('.dialog-body').on('click', function(e){
            e.stopPropagation();
        });
        /* FAB 保存 ボタン*/
        $('.inquiry-dialog .btn-save').on('click', function(){
            inquiries.addNewInquiry(function(){
                inquiries.changeView(true, 0);
                inquiries.toggleInquiryDialog(false);
            });
        });

        /* ステータス変更ダイアログ(管理者専用) */
        $container.on('click', '.inquiry-status .status', function(e){
            let userId = parseInt($('#user-id').val());
            let $e = $(e.currentTarget);
            let inquiryStatusNameEn = "";
            let rowId = parseInt($e.parent().parent().find('.inquiry-id').text());
            Base.inquiryStatus.forEach(function(status){
               if($e.hasClass(status.status_en)){
                   inquiryStatusNameEn = status.status_en;
               }
            });
            if(userId === 1){
                inquiries.toggleStatusDialog(true, rowId, inquiryStatusNameEn);
            }
        });

        /* ステータス変更 */
        $('.status-select-button').on('click', function(e){
           let $e = $(e.currentTarget);
           if(!$e.hasClass('selected')){
               $('.status-select-button').removeClass('selected');
               $e.addClass('selected');
           }
        });

        /* ステータス保存 */
        $('.status-dialog-body .dialog-footer .btn-save').on('click', function () {
            Base.toggleLoadingScreen('show');
            let rowId = parseInt($('.status-dialog').attr('data-val'));
            let selectedStatusId = 0;
            $('.status-select-button').each(function(i, e){
               let $e = $(e);
               if($e.hasClass('selected')){
                   Base.inquiryStatus.forEach(function(status){
                       if($e.hasClass(status.status_en)){
                           selectedStatusId = status.id;
                       }
                   });
               };
           });
           inquiries.updateInquiryStatus(rowId, selectedStatusId, function(){
               inquiries.toggleStatusDialog(false, 0, 0);
               libraryTools.popSimpleToast('問い合わせ番号[' + rowId + ']のステータスを更新しました');
               inquiries.changeView(true, 0);
               Base.toggleLoadingScreen('hide');
           });
        });

        /* ステータスダイアログキャンセル*/
        $('.status-dialog-body .dialog-footer .btn-cancel').on('click', function () {
           inquiries.toggleStatusDialog(false, 0, 0);
        });

        /* メッセージ入力エリアにフォーカスがあたったときのリサイズ */
        $container.on('focusin', '#adding-form-detail-contents', inquiries.hideForMessageArea);
        /* メッセージ入力エリアのフォーカスがはずれたときのリサイズ */
        $container.on('focusout', '#adding-form-detail-contents', inquiries.showForMessageArea);
        /* メッセージ入力エリアに何かしら入力しているときのリサイズ */
        $container.on('input', '#adding-form-detail-contents', function(){

            setTimeout(inquiries.setConversationsAreaHeight, 150);
        });


        // コメント欄右送信ボタン
        $container.on('input', '#adding-form-detail-contents', function(e){
            let content = $(e.currentTarget).val();
            if(content){
                $('.inquiries-detail .message-area .buttons .btn-send').removeClass('disabled');
            } else {
                $('.inquiries-detail .message-area .buttons .btn-send').addClass('disabled');
            }
        });
        // コメント送信
        $container.on('click', '.inquiries-detail .message-area .buttons .btn-send', function(e){
            let $e = $(e.currentTarget);
            if(!$e.hasClass('disabled')){
                inquiries.autoUpdatingTimer(false);
                inquiries.addNewComment(function(){
                    $('#adding-form-detail-contents').val("");
                    let rowId = $('.inquiries-detail').attr('data-val');
                    inquiries.getInquiriesList(function(){
                        inquiries.getInquiryDetailsList(rowId, function(){
                            inquiries.setDetail(rowId);
                            inquiries.setConversationsAreaHeight();
                            inquiries.autoUpdatingTimer(true);
                        });
                    });
                });
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
     * 問い合わせ取得API
     */
    getInquiriesList: function(after){
        $.ajax({
            "url": "/multi_switch/api/inquiry_list/",
            "cache": false,
            "dataType": "json",
            "success": function (result) {
                inquiries.list = result;
                after();
            },
            "error": function (e) {
                libraryTools.popSimpleToast('Error:問い合わせ取得APIエラー\r' + e.responseText);
            }
        });
    },

    /**
     * 問い合わせ詳細取得API
     * @param {number} inquiryId - 問い合わせ元ID
     */
    getInquiryDetailsList: function(inquiryId, after){
      $.ajax({
            "url": "/multi_switch/api/inquiry_detail_list/",
            "cache": false,
            "dataType": "json",
            "data": {inquiry:inquiryId},
            "success": function (result) {
                inquiries.details = result;
                after();
            },
            "error": function (e) {
                libraryTools.popSimpleToast('Error:問い合わせ詳細取得APIエラー\r' + e.responseText);
            }
        })
    },

    /**
     * ユーザー情報取得API
     * @param after
     */
    getUserList: function(after){
        $.ajax({
            "url": "/multi_switch/api/user_list/",
            "cache": false,
            "dataType": "json",
            "success": function (result) {
                inquiries.userList = result;
                after();
            },
            "error": function (e) {
                alert('Error:ユーザー情報取得APIエラー\r' + e.responseText);
            }
        });
    },

    /**
     * 問い合わせ新規追加API
     */
    addNewInquiry: function(after){
        let selectedPlace = $('#adding-form-switch-type').children(':selected').text();
        let inputContent = $('#adding-form-contents').val();
        let userId = parseInt($('#user-id').val());
        if(selectedPlace && inputContent){
            let insertData = {
                target: selectedPlace,
                updated_time: datetimeTools.convertToDbFormat(new Date()),
                created_time: datetimeTools.convertToDbFormat(new Date()),
                user: userId,
                status: 5, //まずは「新規」
            }
            $.ajax({
                "url": "/multi_switch/api/inquiry_list/",
                "type": "POST",
                "cache": false,
                "dataType": "json",
                "headers": {
                    "X-CSRFToken": $("input[name='csrfmiddlewaretoken']").val()
                },
                "data": insertData,
                "success": function(result) {
                    inquiries.addFirstComment(result.id, inputContent, function(){
                        libraryTools.popSimpleToast('問い合わせを追加しました。');
                        after();
                    });
                },
                "error": function (e) {
                    alert('Error: 問い合わせ新規追加APIエラー\r' + e.responseText);
                }
            });
        } else {
            libraryTools.popSimpleToast('保存できません。情報が不足しています。');
        }
    },

    /**
     * 情報をリスト表示
     */
    setList: function(){
        $('.signature').hide();
        let $inquiriesBody = $('.inquiries-body');
        $('.inquiry-row').remove();
        inquiries.list.forEach(function(inq){
            let $row = inquiries.createListElement(inq);
            $inquiriesBody.append($row);
        });
    },

    /**
     * リスト要素作成
     * @param {Object} inquiry
     */
    createListElement: function(inquiry){
        let $row = elementTools.createBase('div', ['inquiry-row'], null);
        $row.attr('data-val', inquiry.id);
        let $number = elementTools.createBase('div', ['inquiry-number'], $row);
        let $numberDiv = elementTools.createBase('div', ['inquiry-id'], $number);
        $numberDiv.text(inquiry.id);
        let $status = elementTools.createBase('div', ['inquiry-status'], $number);
        let $statusSpan = elementTools.createBase('span', ['status'], $status);
        let statusName = "未定義";
        let statusClassName = "undefined";
        Base.inquiryStatus.forEach(function(status){
           if(status.id === inquiry.status){
               statusName = status.status;
               statusClassName = status.status_en;
           }
        });
        $statusSpan.addClass(statusClassName).text(statusName);

        let $overview = elementTools.createBase('div', ['inquiry-overview'], $row);
        let $place = elementTools.createBase('div', ['inquiry-place'], $overview);
        $place.text(inquiry.target);
        let $updatedTime = elementTools.createBase('div', ['updated-time'], $overview);
        let updatedTimeObj = new Date(inquiry.updated_time);
        $updatedTime.text(datetimeTools.convertToStringFormat(updatedTimeObj));
        let userId = parseInt($('#user-id').val());
        if(userId === 1){
            // 管理者視点で起票者名の表示
            let $creator = elementTools.createBase('div', ['creator-name'], $overview);
            inquiries.userList.some(function(e, i){
               if(e.id === inquiry.user){
                   $creator.text(e.username);
                   return true;
               }
            });
        }

        let $contents = elementTools.createBase('div', ['inquiry-contents'], $row);
        let $sentence = elementTools.createBase('div', ['sentence'], $contents);
        $sentence.text('---');
        inquiries.details.some(function(det){
           if(inquiry.id === det.inquiry){
               $sentence.text(det.content);
               return true;
           }
        });

        let $toDetail = elementTools.createBase('div', ['inquiry-to-detail'], $row);
        let $detailIcon = elementTools.createBase('div', ['to-detail-icon'], $toDetail);
        let $icon = elementTools.createBase('i', ['material-icons'], $detailIcon);
        $icon.text('comment');

        return $row;
    },

    /**
     * 詳細画面表示
     * @param {number} rowId
     */
    setDetail: function(rowId){
        $('.signature').hide();
        $('.inquiries-detail').attr('data-val', rowId);

        // Basic Info
        // Todo: 要素表示値の初期化挟んでも
        let targetInquiry = [];
        inquiries.list.some(function(inq){
           if(inq.id === rowId){
               targetInquiry = inq;
           }
        });
        $('.info-column .info-row .info-item.inquiry-place .value').text(targetInquiry.target);
        let $status = $('.info-column .info-row .info-item.inquiry-status .value span');
        $status.removeClass('new').removeClass('waiting').removeClass('investigating').removeClass('working').removeClass('completed').removeClass('discontinued');
        let statusName = "未定義";
        let statusClassName = "undefined";
        Base.inquiryStatus.forEach(function(status){
           if(status.id === targetInquiry.status){
               statusName = status.status;
               statusClassName = status.status_en;
           }
        });
        $status.addClass(statusClassName).text(statusName);
        $('.info-column .info-row .info-item.updated-time .value').text(
            datetimeTools.convertToStringFormat(new Date(targetInquiry.updated_time)));
        $('.info-column .info-row .info-item.created-time .value').text(
            datetimeTools.convertToStringFormat(new Date(targetInquiry.created_time)));

        // Detail Balloons
        let $detailRowBody = $('.detail-row-body');
        $detailRowBody.empty();

        let tempDateObj = new Date();
        inquiries.details.forEach(function(det){
            let detDateObj = new Date(det.created_time);
            if(!datetimeTools.compareDate(tempDateObj, detDateObj)){
                inquiries.createDateSignElement(detDateObj);
                tempDateObj = new Date(detDateObj.getTime());
            }
            inquiries.createBalloonElement(det);
        });

        // 吹き出しの数は全部の詳細行要素の数から日付表示を引いた数
        let previousNumber = $('.detail-row').length - $('.detail-row.date').length;
        // 吹き出しの数 !== 取得してきたdetailLogの数なら下スクロール
        if(inquiries.details.length !== previousNumber){
            $detailRowBody.scrollTop(Number.MAX_SAFE_INTEGER);
        }
    },

    /**
     * 吹き出し要素作成
     * @param {Object} detail
     */
    createBalloonElement: function(detail){
        let $detailRowBody = $('.detail-row-body');
        let userId = parseInt($('#user-id').val());
        let adminUserName = $('#admin-user-name').val();
        let $row = elementTools.createBase(
            'div', ['detail-row', detail.user === userId ? 'me': 'others'], $detailRowBody);
        if(detail.user !== userId){
            // 詳細起票者が自分じゃない
            if(userId !== 1){
                // 自分は管理者じゃない（＝起票者は管理者）
                let $profile = elementTools.createBase('div', ['profile'], $row);
                let $profileImage = elementTools.createBase('img', [], $profile);
                $profileImage.attr('src', '/static/multi_switch/img/admin_64.png');
            }else{
                // 自分は管理者である（＝起票者は他ユーザー）
                let $profile = elementTools.createBase('div', ['profile'], $row);
                let $profileImage = elementTools.createBase('img', [], $profile);
                $profileImage.attr('src', '/static/multi_switch/img/user_48.png');
            }
        }
        let $balloon = elementTools.createBase('div', ['balloon'], $row);
        if(detail.user !== userId){
            // 詳細起票者が自分じゃない
            if(userId !== 1){
                // 自分は管理者じゃない（＝起票者は管理者）
                let $userName = elementTools.createBase('div', ['name'], $balloon);
                $userName.text(adminUserName);
            } else {
                // 自分は管理者である（＝起票者は他ユーザー）
                let $userName = elementTools.createBase('div', ['name'], $balloon);
                let counterName = "";
                inquiries.userList.some(function(user){
                    if(user.id === detail.user){
                        counterName = user.username;
                    }
                });
                $userName.text(counterName);
            }
        }
        let $balloonTip = elementTools.createBase('div', ['balloon-tip'], $balloon);
        let $pop = elementTools.createBase('div', ['pop'], $balloon);
        let $popSentence = elementTools.createBase('div', ['sentence'], $pop);
        $popSentence.text(detail.content);
        let $popOption = elementTools.createBase('div', ['option'], $pop);
        let $popOptionTime = elementTools.createBase('div', ['time'], $popOption);
        $popOptionTime.text(datetimeTools.convertToStringFormat(new Date(detail.created_time)).slice(11, -3));
    },

    /**
     * 日付表示要素作成
     * @param dateObj
     */
    createDateSignElement: function(dateObj){
        let $row = elementTools.createBase('div', ['detail-row', 'date'], $('.detail-row-body'));
        let $dateSign = elementTools.createBase('div', ['date-sign'], $row);
        $dateSign.text(datetimeTools.convertJapaneseDateFormat(dateObj));
        if(datetimeTools.compareDate(new Date(), dateObj)){
            $dateSign.text('今日');
        }
    },

    /**
     * 会話エリアの高さを現在の複数要素の高さから算出して調節する
     */
    setConversationsAreaHeight: function(){
        let $container = $('.container');
        let $detailRowBody = $('.detail-row-body');

        let globalBarHeight = parseInt($('.global-bar').css('height').slice(0, -2));
        let basicInfoHeight = ($('.basic-info').css('display') === 'none' && $('.message-area').attr('active') ==="true" ? 0 : parseInt($('.basic-info').css('height').slice(0, -2)));
        let messageAreaHeight = parseInt($('.message-area').css('height').slice(0, -2));
        let height = window.innerHeight - globalBarHeight - basicInfoHeight - messageAreaHeight;

        if(systemTools.isIOS()){
            basicInfoHeight = ($('.basic-info').css('display') === 'none' && $('.message-area').attr('active') ==="false" ? 0 : parseInt($('.basic-info').css('height').slice(0, -2)));
            height = window.innerHeight - globalBarHeight - basicInfoHeight - messageAreaHeight;
            $('body').scrollTop(0);
        }

        console.log('window.innerHeight:' + window.innerHeight);
        console.log('global-bar height:' + globalBarHeight);
        console.log('basic-info height:' + basicInfoHeight);
        console.log('message area height:' + messageAreaHeight);
        console.log('height:' + height);
        console.log('===========================');

        $detailRowBody.css({
            'height': height + 'px',
            'marginTop': ($('.basic-info').css('display') === 'none' ? 0 : parseInt($('.basic-info').css('height').slice(0, -2))) + 'px',
            'marginBottom': messageAreaHeight + 'px',
        });
        $('.detail-row-body').scrollTop(999999);

    },

    /**
     * 問い合わせ詳細初回挿入API
     * @param after
     */
    addFirstComment: function(inquiry_id, input_content, after){
        let insertData = {
            content: input_content,
            updated_time: datetimeTools.convertToDbFormat(new Date()),
            created_time:  datetimeTools.convertToDbFormat(new Date()),
            inquiry: inquiry_id,
            user: parseInt($('#user-id').val()),
        }
        $.ajax({
            "url": "/multi_switch/api/inquiry_detail_list/",
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
                alert('Error: 問い合わせ詳細新規追加APIエラー\r' + e.responseText);
            }
        });

    },

    /**
     * 問い合わせ詳細新規追加API
     * @param after
     */
    addNewComment: function(after){
        let dataVal = $('.inquiries-detail').attr('data-val');
        let userId = parseInt($('#user-id').val());
        let content = $('#adding-form-detail-contents').val();
        if(content){
            let insertData = {
                content: content,
                updated_time: datetimeTools.convertToDbFormat(new Date()),
                created_time:  datetimeTools.convertToDbFormat(new Date()),
                inquiry: dataVal,
                user: userId
            }
            $.ajax({
                "url": "/multi_switch/api/inquiry_detail_list/",
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
                    alert('Error: 問い合わせ詳細新規追加APIエラー\r' + e.responseText);
                }
            });
        }
    },

    /**
     * リスト形式と詳細形式の表示変更
     * @param {boolean} is_list - Trueならリスト、Falseなら詳細
     *
     */
    changeView: function(is_list, rowId){
        Base.toggleLoadingScreen("show");
        if(is_list){
            // リストへ変更
            $('.inquiries-detail').css({
              'display':'none',
            });
            $('.inquiries-body').css({
              'display':'flex',
            });
            // $('body').css({
            //     'height':'initial',
            // });
            inquiries.getUserList(function(){
                inquiries.getInquiriesList(function(){
                    inquiries.getInquiryDetailsList(rowId, function(){
                        inquiries.setList();
                        inquiries.autoUpdatingTimer(false);
                        Base.toggleLoadingScreen("hide");//ロード画面OFF
                        $('.detail-row-body').empty();
                    });
                });
            });
        } else {
            // 詳細へ変更
            $('.inquiries-body').css({
              'display':'none',
            });
            $('.inquiries-detail').css({
              'display':'flex',
            });
            // $('body').height(window.innerHeight);
            inquiries.getUserList(function(){
                inquiries.getInquiriesList(function() {
                    inquiries.getInquiryDetailsList(rowId, function () {
                        inquiries.setDetail(rowId);
                        inquiries.setConversationsAreaHeight();
                        inquiries.autoUpdatingTimer(true);
                        Base.toggleLoadingScreen("hide");//ロード画面OFF
                        inquiries.setConversationsAreaHeight();

                    });
                });
            });
        }
    },

    /**
     * 画面の自動更新タイマー
     * @param {boolean} is_on
     */
    autoUpdatingTimer: function(is_on){
        if(is_on){
            inquiries.timerIds.autoUpdating = setInterval(function(){
                inquiries.getInquiriesList(function() {
                    let inquiryId = parseInt($('.inquiries-detail').attr('data-val'));
                    inquiries.getInquiryDetailsList(inquiryId, function () {
                        inquiries.setDetail(inquiryId);
                    });
                });
            }, 1000);
        } else {
            clearInterval(inquiries.timerIds.autoUpdating);
        }
    },

    /**
     * 問い合わせ作成ダイアログの開閉
     * @param is_open
     */
    toggleInquiryDialog: function(is_open){
        if(is_open){
            $('.inquiry-dialog').show();
        } else {
            $('.inquiry-dialog').hide();
        }
        $('#adding-form-switch-type').val(0);
        $('#adding-form-contents').val("")
        M.textareaAutoResize($('#adding-form-contents'));
    },

    /**
     * メッセージエリアにフォーカスイン(他の要素を隠す)
     */
    hideForMessageArea: function(){
        let $globalBar = $('.global-bar');
        let $basicInfo = $('.basic-info');
        let $container = $('.container');
        let $conversationArea = $('.conversation-area');
        let $detailRowBody = $('.detail-row-body');
        let $messageArea = $('.message-area');
        $basicInfo.hide();
        setTimeout(function(){
            inquiries.setConversationsAreaHeight();

            let globalBarHeight = parseInt($('.global-bar').css('height').slice(0, -2));
            let basicInfoHeight =  ($('.basic-info').css('display') === 'none' && $messageArea.attr('active') === "false" ? 0 : parseInt($('.basic-info').css('height').slice(0, -2)));
            let messageAreaHeight = parseInt($('.message-area').css('height').slice(0, -2));
            let height = window.innerHeight - globalBarHeight - basicInfoHeight - messageAreaHeight;
            if(systemTools.isIOS()){
                height += 24;
                $globalBar.hide();
                $container.css('margin-top', 0);
                // $('body').height(window.innerHeight);
                $('body').scrollTop(0);
                setTimeout(function(){
                    $('.detail-row-body').scrollTop(999999);
                }, 150);
            }
            $detailRowBody.css({
                'height': height + 'px',
                'marginTop': ($('.basic-info').css('display') === 'none' ? 0 : parseInt($('.basic-info').css('height').slice(0, -2))) + 'px',
                'marginBottom': messageAreaHeight + 'px',
            });
            $messageArea.attr('active','true');
        }, 150);
    },

    /**
     * メッセージエリアからフォーカスアウト(他の要素を表示する)
     */
    showForMessageArea: function(){
        let $globalBar = $('.global-bar');
        let $basicInfo = $('.basic-info');
        let $container = $('.container');
        let $conversationArea = $('.conversation-area');
        let $messageArea = $('.message-area');
        // $globalBar.css('position', '');
        $basicInfo.show();
        // $('.message-area').css('position', 'fixed');
        if(systemTools.isIOS()){
            $globalBar.show(100);
            $('.container').css('margin-top', '48px');
        }
        setTimeout(function(){
            inquiries.setConversationsAreaHeight();
            $messageArea.attr('active','false');
        }, 150);

    },

    /**
     * ステータス変更ダイアログ開閉
     * @param is_open
     */
    toggleStatusDialog: function(is_open, rowId, inquiryStatusNameEn){
        $('.status-dialog').attr('data-val', rowId);
        if(is_open){

            $('.status-select-button').removeClass('selected');
            $('.status-dialog').css('display', 'flex');
            $('.status-select-button').each(function(i, e){
               let $e = $(e);
               if($e.hasClass(inquiryStatusNameEn)){
                   $e.addClass('selected');
               }
            });
        } else {
            $('.status-dialog').hide();
        }
    },
    /**
     *
     * @param {function} after
     */
    updateInquiryStatus: function(inquiryId, statusId, after){
            let updateData = {
                updated_time: datetimeTools.convertToDbFormat(new Date()),
                status: statusId,
            }
            $.ajax({
                "url": "/multi_switch/api/inquiry_list/" + inquiryId + "/",
                "type": "PATCH",
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
                    alert('Error: 問い合わせ情報更新APIエラー\r' + e.responseText);
                }
            });
    },

};

Base.init(inquiries.init);