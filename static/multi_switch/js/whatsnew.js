let Whatsnew = {

    /* 初期処理 */
    init: function(){
        $('#screen-name').text(CONST.SCREEN_NAME.WHATSNEW);
        Base.toggleLoadingScreen("hide");//ロード画面
    },
};

Whatsnew.init();