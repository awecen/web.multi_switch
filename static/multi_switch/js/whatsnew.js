let Whatsnew = {

    screen_title: "こうしんりれき",

    /* 初期処理 */
    init: function(){
        $('#screen-name').text(Whatsnew.screen_title);
        Base.toggleLoadingScreen("hide");//ロード画面
    },
};

Whatsnew.init();