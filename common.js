window._abyss = window._abyss || {};
window._abyss.gameinfo = (function (gameinfo, $) {
    "use strict";

    gameinfo.ostInit = function () {

        // init setting
        function init(e, ele) { 
            function init(flags) {
                ostTick(flags);
                ostScroll(flags);
            }
            // Offset Initial Setting
            var $offset = e.clientX - ele.offset().left;
            var $rangeWidth = parseInt($offset / ele.width() * 100);
            if ($rangeWidth < 0) {
                init(0);
            } else {
                if ($rangeWidth > 100) {
                    init(100);
                } else {
                    init($rangeWidth);
                }
            }
        }

        // scrooll Setting
        function ostScroll(scrollNum) {
            gameinfo.scPlayer.getDuration(function (scrollWidth) {
                var $scrollAmount = Math.floor(scrollWidth * (scrollNum / 100));
                gameinfo.scPlayer.seekTo($scrollAmount);
            });
        }

        // Progress Tick setting
        function ostTick(tickWidth) {
            var tick = $(".scInfo .scBar .scProgress");
            var tickController = $(".scInfo .scBar .scplaycontrol");
            tick.width(tickWidth + "%");
            tickController.css("left", tickWidth + "%");
        }

        // Declare scPlayer variable
        gameinfo.scPlayer = SC.Widget($(".scMusicPlayer")[0]);
        gameinfo.scPlayUtil = {
            auto_play: true,
            buying: false,
            sharing: false,
            download: false,
            show_artwork: false,
            show_playcount: false,
            show_user: false,
            single_active: false,
            start_track: 0
        };

        // scBg Setting
        gameinfo.scBg = function () {
            var attachBg = {};
            var playerList = $(".scPlayer .scPlayList li");
            playerList.each(function (p, albumTarget) {
                var $albumControl = $(albumTarget).find("a");
                if (!attachBg[$albumControl.data("album")]) {
                    attachBg[$albumControl.data("album")] = [];
                }
                attachBg[$albumControl.data("album")].push({
                    title: $albumControl.text(),
                    duration: $albumControl.data("duration"),
                    album: $albumControl.data("album"),
                    url: $albumControl.data("url")
                });
            });
            return attachBg;
        }();

        // Player Info
        gameinfo.ostInfo = function (data) {
            var sc = $(".scPlayer");
            var scTitle = sc.find(".scInfo .scInfoCont .scInfoTitle");
            var scPlaytime = sc.find(".scInfo .scPlaytime");
            ostTick(0);
            sc.addClass("loading");
            scTitle.text(data.title);
            scPlaytime.text(data.duration);
        }

        // ActivePlayer -- Background is changed by click tab
        gameinfo.activePlayer = function (e, act) {
            var idxActive = e.parent().index();
            $(act).removeClass("on");
            $(act).eq(idxActive).addClass("on");
        }

        // OtherPlayer -- tab1, tab2, tab3 you can change tab's class via click
        gameinfo.otherPlayer = function (others) {
            var idxDisable = others.parent().index();
            var tabClass = "scplayMusic tab" + (idxDisable + 1);
            $(".scplayMusic").attr("class", tabClass);
        }

        // Playing
        gameinfo.playing = function (e) {
            var state = $(e.target).data("scplaycontrol");
            gameinfo.scPlayer.isPaused(function (table) {
                var $that = table;
                if ($that && state == "play") {
                    gameinfo.scPlayer.play();
                } else {
                    if (!$that && state == "pause") {
                        gameinfo.scPlayer.pause();
                    }
                }
            });
            e.preventDefault();
        }

        // Widget Ready
        gameinfo.scPlayer.bind(SC.Widget.Events.READY, function () {
            gameinfo.ostInfo(gameinfo.scBg.balenos[0]);
            $(".scPlayer").removeClass("loading");
        });

        // Widget Play
        gameinfo.scPlayer.bind(SC.Widget.Events.PLAY, function (n) {
            setTimeout(function () {
                $(".scPlayer").removeClass("loading");
            }, 1000);
            $("[data-scplaycontrol=play]").removeClass("on");
            $("[data-scplaycontrol=pause]").addClass("on");
        });

        // Widget Pause
        gameinfo.scPlayer.bind(SC.Widget.Events.PAUSE, function (n) {
            $("[data-scplaycontrol=play]").addClass("on");
            $("[data-scplaycontrol=pause]").removeClass("on");
        });

        // Widget Finish
        gameinfo.scPlayer.bind(SC.Widget.Events.FINISH, function (n) {
            $("[data-scplaycontrol=play]").addClass("on");
            $("[data-scplaycontrol=pause]").removeClass("on");
        });

        // Widget Play Progress
        gameinfo.scPlayer.bind(SC.Widget.Events.PLAY_PROGRESS, function (sc) {
            var $scRelative = Math.floor(sc.relativePosition * 100);
            var holdGesture = $(".scInfo .scBar").hasClass("hold");
            if (!holdGesture) {
                ostTick($scRelative);
            }
        });

        // can move bar icon..
        $(".scInfo .scBar").on({
            mousedown: function (e) {
                var $that = $(this);
                init(e, $that);
                $that.addClass("hold");
                $that.on("mousemove", function (e) {
                    init(e, $that);
                    e.preventDefault();
                });
                e.preventDefault();
            },
            mouseup: function (e) {
                var $that = $(this);
                $that.removeClass("hold");
                $that.off("mousemove");
                e.preventDefault();
            },
            mouseleave: function (e) {
                var $that = $(this);
                $that.removeClass("hold");
                $that.off("mousemove");
                e.preventDefault();
            }
        });

    }

    // function
    gameinfo.init = function () {
        gameinfo.ostInit();
    };


    // when tab triggering you can change activePlayer.. -- core function
    $(document).on("click", ".scPlayListTab .scLink", function (e) {
        var item = $(this);
        $(".scPlayListTab .scLink").attr("aria-selected", "false");
        item.attr("aria-selected", "true");
        gameinfo.activePlayer(item, ".scPlayList");
        gameinfo.otherPlayer(item);
        e.preventDefault();
    });

    // scplayer Controller
    $(document).on("click", "[data-scplaycontrol]", function(e){
        gameinfo.playing(e);
    });

    // Tab Clik Trigger..
    $(document).on("click", ".scPlayList a.scLinkTxt", function (e) {
        var scList = $(".scPlayer .scPlayList li");
        var prev = $(this).parent("li");
        var id = parseInt(prev.index());
        var entry = gameinfo.scBg[$(this).data("album")][id];
        var reload = !prev.hasClass("on");
        if (reload) {
            gameinfo.scPlayer.pause();
            gameinfo.scPlayer.load(entry.url, gameinfo.scPlayUtil);
            gameinfo.ostInfo(entry);
            scList.removeClass("on");
            prev.addClass("on");
        }
        e.preventDefault();
    });

    gameinfo.init();

    return gameinfo;

})(window._abyss.gameinfo || {}, jQuery);

(function () {
    $(document).ready(function () {
        console.log('ready');
    });
})();