let Base = {

    // 初期処理
    init: function () {
        Base.attachEvents();
        Base.initializeMaterializeComponents();
        Base.initializeLoaderComponents();
    },

    // 各種イベント処理 付加
    attachEvents: function () {

        // App Menu 開閉
        $(document).on('click', '.menu-open-icon', function(){
            Base.toggleAppMenu();
        });
        Base.attachEventsForAppMenu('home', '/multi_switch/');
        Base.attachEventsForAppMenu('logs', '/multi_switch/logs/');
        Base.attachEventsForAppMenu('stat', '/multi_switch/stat/');
        Base.attachEventsForAppMenu('whatsnew', '/multi_switch/whatsnew/');
        Base.attachEventsForAppMenu('print', '/multi_switch/print/');
        Base.attachEventsForAppMenu('settings', '/multi_switch/settings/');

        // 背景押しても
        $(document).on('click', '.app-menu', function(){
            Base.toggleAppMenu();
        });

        // 背景の上のBODYは
        $(document).on('click', '.app-menu .body', function(e){
            e.stopPropagation();
        });

    },

    // app-menu 用イベント付加
    attachEventsForAppMenu: function(appTitle, url){
        // disabled クラスをもっているならイベント付与しない
        if(!$('.app-menu .body .item-row .menu-item.'+ appTitle).hasClass('disabled')){
            $(document).on('click', '.app-menu .body .item-row .menu-item.'+ appTitle , function(){
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
        if($('.app-menu').hasClass('invisible')){
            $('.app-menu').removeClass('invisible');
            $('.app-menu').animate({
                'opacity': '1.0',
            },100, 'swing', function(){
                $('.app-menu .body').animate({
                    'top': '56px',
                }, 50, 'swing', function(){

                });
            })
        }else{
            $('.app-menu .body').animate({
                'top': '-200px',
            },100, 'swing', function(){
                $('.app-menu').animate({
                    'opacity': '0',
                }, 100, 'swing', function(){
                    $('.app-menu').addClass('invisible');
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

}

Base.init();