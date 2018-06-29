let Settings = {

    /**
     * 初期処理
     */
    init: function(){
        $('#screen-name').text(Base.userSetting.child_name + CONST.SCREEN_NAME.SETTINGS);
        Base.toggleLoadingScreen("hide");//ロード画面
        Settings.attachEvents();
        Settings.setStoredInfo();
    },

    /**
     * イベント付加
     */
    attachEvents: function(){
        $('.settings-header .btn-save').on('click', function(){
            Base.toggleLoadingScreen('show');
            Settings.updateUserSetting(function(){
                Base.getUserSetting(function(){
                    Settings.setStoredInfo();
                    $('#screen-name').text(Base.userSetting.child_name + CONST.SCREEN_NAME.SETTINGS);
                    Base.toggleLoadingScreen('hide');
                })
            });

        });

        $('.settings-header .btn-cancel').on('click', function(){
           Base.toggleLoadingScreen('show');
           Base.getUserSetting(function(){
               Settings.setStoredInfo();
               $('#screen-name').text(Base.userSetting.child_name + CONST.SCREEN_NAME.SETTINGS);
               Base.toggleLoadingScreen('hide');
           });
        });
    },

    /**
     * 保存されていた設定情報を反映させる
     */
    setStoredInfo: function(){
        // Child Name
        $('.setting-row.child-name .input-field input').val(Base.userSetting.child_name);
        M.updateTextFields();
    },

    /**
     * ユーザー設定更新API
     */
    updateUserSetting: function(after){
       let updateData = {
            "user":Base.userSetting.user,
            "child_name": $('.setting-row.child-name .input-field input').val(),
        };
        $.ajax({
            "url": "/multi_switch/api/user_setting/" + Base.userSetting.id + "/",
            "type": "PUT",
            "cache": false,
            "dataType": "json",
            "headers": {
                "X-CSRFToken": $("input[name='csrfmiddlewaretoken']").val()
            },
            "data": updateData,
            "success": function() {
                libraryTools.popSimpleToast('ユーザー設定を更新しました');
                after();
            },
            "error": function (e) {
                alert('Error: ユーザー設定更新APIエラー\r' + e.responseText);
            }
        });
    }

};

Base.init(Settings.init);