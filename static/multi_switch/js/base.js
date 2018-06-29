let Base = {

    /**
     * 初期処理
     * @param {function} after
     */
    init: function(after) {
        Base.attachEvents();
        Base.initializeMaterializeComponents();
        Base.initializeLoaderComponents();
        Base.getUserSetting(function(){
           $('title').html(Base.userSetting.child_name + "すいっち");
           after();
        });
    },

    // 各種イベント処理 付加
    attachEvents: function () {
        let $body = $('.body');

        // App Menu 開閉
        $('.global-bar').on('click', '.menu-open-icon', function(){
            Base.toggleAppMenu();
        });
        Base.attachEventsForAppMenu('home', '/multi_switch/');
        Base.attachEventsForAppMenu('logs', '/multi_switch/logs/');
        Base.attachEventsForAppMenu('stat', '/multi_switch/stat/');
        Base.attachEventsForAppMenu('whatsnew', '/multi_switch/whatsnew/');
        Base.attachEventsForAppMenu('print', '/multi_switch/print/');
        Base.attachEventsForAppMenu('settings', '/multi_switch/settings/');

        // 背景押しても
        $body.on('click', '.app-menu', function(){
            Base.toggleAppMenu();
        });

        // 背景の上のBODYは
        $body.on('click', '.app-menu .app-body', function(e){
            e.stopPropagation();
        });

    },

    // app-menu 用イベント付加
    attachEventsForAppMenu: function(appTitle, url){
        // disabled クラスをもっているならイベント付与しない
        if(!$('.app-menu .app-body .item-row .menu-item.'+ appTitle).hasClass('disabled')){
            $('.body').on('click', '.app-menu .app-body .item-row .menu-item.'+ appTitle , function(){
                window.location.href = url;
            });
        }
    },

    // Materilize 標準コンポーネント初期化
    initializeMaterializeComponents: function(){
      $('.sidenav').sidenav();
    },

    // Loader 標準コンポーネント初期化
    initializeLoaderComponents: function(){
      $('.loader-inner').loaders();
    },

    // ツールパネル開閉
    toggleToolPanel: function(){
        if($('.btn-lever i').text() === 'expand_more'){
            // 開く
            $('.tool-row:gt(0)')
                .css({'display': 'flex'})
                .animate({'height':'128px'}, 300, 'swing', function(){
                    $('.btn-lever i').text('expand_less');
                });
        }else{
            // 閉じる
            $('.tool-row:gt(0)')
                .animate({'height':'0px'}, 300, 'swing', function(){
                    $('.btn-lever i').text('expand_more');
                    $('.tool-row:gt(0)').css({'display': 'none'});
                });
        }
    },

    // App-Menu 開閉
    toggleAppMenu: function(){
        let $appMenu = $('.app-menu');
        if($appMenu.hasClass('invisible')){
            $appMenu.removeClass('invisible');
            $appMenu.animate({
                'opacity': '1.0',
            },100, 'swing', function(){
                $appMenu.find('.app-body').animate({
                    'top': '56px',
                }, 50, 'swing', function(){

                });
            })
        }else{
            $appMenu.find('.app-body').animate({
                'top': '-200px',
            },100, 'swing', function(){
                $appMenu.animate({
                    'opacity': '0',
                }, 100, 'swing', function(){
                    $appMenu.addClass('invisible');
                });
            })
        }
    },

    // ローディング画面 on/off
    toggleLoadingScreen: function(e){
        let $target = $('#loading-overlay');
        if(e === "show"){
        // if($target.hasClass('no-screen')) {
            $target.show();
            $target.animate({'opacity': 1}, 150, 'swing', function () {
                $target.removeClass('no-screen');
            });
        }else {
            $target.animate({'opacity': 0}, 150, 'swing', function () {
                $target.hide();
                $target.addClass('no-screen');
            });
        }
    },

    /**
     * ユーザー設定取得API
     * @param {function} after
     */
    getUserSetting: function(after){
        $.ajax({
            "url": "/multi_switch/api/user_setting/",
            "cache": false,
            "dataType": "json",
            "success": function (result) {
                Base.userSetting = result[0];
                after();
            },
            "error": function (e) {
                alert('Error:ユーザー設定取得APIエラー\r' + e.responseText);
            }
        });
    },
};
