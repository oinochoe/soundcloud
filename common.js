window._abyss = window._abyss || {};
window._abyss.gameinfo = (function (gameinfo, $) {
    "use strict";

    gameinfo.init = function () {
        scplayInit();
        scplayDuration();
        scBar();
        activePlayer();
        otherPlayer();
        scPlaying();
    }

    gameinfo.initOST = function () {
        $(".scInfo .scBar").on({
            mousedown: function (event) {
                var $that = $(this);
                set(event, $that);
                $that.addClass("hold");
                $that.on("mousemove", function (event) {
                    set(event, $that);
                    event.preventDefault();
                });
                event.preventDefault();
            },
            mouseup: function (event) {
                var $that = $(this);
                $that.removeClass("hold");
                $that.off("mousemove");
                event.preventDefault();
            },
            mouseleave: function (event) {
                var $that = $(this);
                $that.removeClass("hold");
                $that.off("mousemove");
                event.preventDefault();
            }
        });
    }

    gameinfo.play = function(){}
    
    var anyung = function () {
        alert('안녕');
    }

    // Offset Initial Setting
    function scplayInit(pos, target) {
        function set (flags) {
            scBar(flags);
            scplayDuration(flags);
        }
        var scOffset = pos.clientX - target.offset().left;
        var sctickPos = parseInt(scOffset / target.width() * 100);
        if (sctickPos < 0) {
            set(0);
        } else {
            if (sctickPos > 100) {
                set(100);
            } else {
                set(sctickPos);
            }
        }
    };

    // Playing Duration
    function scplayDuration(durationNum) {
        scPlayer.getDuration(function (makeWidth) {
            var durationAmount = Math.floor(makeWidth * (durationNum / 100));
            scPlayer.seekTo(durationAmount);
        });
    };

    // Progress Tick Setting
    var scBar = function(tickWidth) {
        var scProgress = $(".scInfo .scBar .scProgress");
        var $tickController = $(".scInfo .scBar .scplaycontrol");
        scProgress.width(tickWidth + "%");
        $tickController.css("left", tickWidth + "%");
    };

    // Active Player
    function activePlayer(target, active) {
        var indexActive = target.parent().index();
        $(active).removeClass("on");
        $(active).eq(indexActive).addClass("on");
    };

    // Other Player
    function otherPlayer(other) {
        var indexOther = other.parent().index();
        var tabClassIndex = "scplayMusic tab" + (indexOther + 1);
        $(".scplayMusic").attr("class", tabClassIndex);
    };

    // Whether scPlaying is Paused or Playing
    function scPlaying(event) {
        var $state = $(event.target).data("scplaycontrol");
        scPlayer.isPaused(function (table) {
            var $that = table;
            if ($that && $state == "play") {
                scPlayer.play();
            } else {
                if (!$that && $state == "pause") {
                    scPlayer.pause();
                }
            }
        });
        event.preventDefault();
    };

    // scPlayer
    var scPlayer = SC.Widget($(".scMusicPlayer")[0]);
    var scPlayerUtil = {
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

    // Indexing Cache
    var indexCache = function () {
        var $allAttachPoints = {};
        var $playerList = $(".scPlayer .scPlayList li");
        $playerList.each(function (albumTarget) {
            var $albumControl = $(albumTarget).find("a");
            if (!$allAttachPoints[$albumControl.data("album")]) {
                $allAttachPoints[$albumControl.data("album")] = [];
            }
            $allAttachPoints[$albumControl.data("album")].push({
                title: $albumControl.text(),
                duration: $albumControl.data("duration"),
                album: $albumControl.data("album"),
                url: $albumControl.data("url")
            });
        });
        return $allAttachPoints;
    };

    $(".scInfo .scBar").on({
        mousedown: function (event) {
            var $that = $(this);
            set(event, $that);
            $that.addClass("hold");
            $that.on("mousemove", function (event) {
                set(event, $that);
                event.preventDefault();
            });
            event.preventDefault();
        },
        mouseup: function (event) {
            var $that = $(this);
            $that.removeClass("hold");
            $that.off("mousemove");
            event.preventDefault();
        },
        mouseleave: function (event) {
            var $that = $(this);
            $that.removeClass("hold");
            $that.off("mousemove");
            event.preventDefault();
        }
    });

    var $link = $("#fansiteTab");
    $link.find(".scLink").on("click", function (event) {
        var id = $(this);
        $link.find("li").removeClass("on").find(".scLink").attr("aria-selected", "false");
        id.parent().addClass("on").find(".scLink").attr("aria-selected", "true");
        activePlayer(id, "[data-fansitekit]");
        event.preventDefault();
    });

    $(".scPlayListTab").on("click", ".scLink", function (event) {
        var item = $(this);
        $(".scPlayListTab .scLink").attr("aria-selected", "false");
        item.attr("aria-selected", "true");
        activePlayer(item, ".scPlayList");
        otherPlayer(item);
        event.preventDefault();
    });

    $("[data-scplaycontrol]").click(start);

    $(".scPlayList li").find("a.scLinkTxt").on("click", function (event) {
        var $btn = $(".scPlayer");
        var $dataReceived = $(".scPlayer .scPlayList li");
        var prev = $(this).parent("li");
        var id = parseInt(prev.index());
        var entry = indexCache[$(this).data("album")][id];
        var $reload = !$btn.hasClass("loading") && !prev.hasClass("on");
        if ($reload) {
            scPlayer.pause();
            scPlayer.load(entry.url, scPlayerUtil);
            $dataReceived.removeClass("on");
            prev.addClass("on");
        }
        event.preventDefault();
    });
    scPlayer.bind(SC.Widget.Events.READY, function () {        
        $(".scPlayer").removeClass("loading");
    });
    scPlayer.bind(SC.Widget.Events.PLAY, function (n) {
        setTimeout(function () {
            $(".scPlayer").removeClass("loading");
        }, 1000);
        $("[data-scplaycontrol=play]").addClass("on");
        $("[data-scplaycontrol=pause]").removeClass("on");
    });
    scPlayer.bind(SC.Widget.Events.PAUSE, function (n) {
        $("[data-scplaycontrol=play]").removeClass("on");
        $("[data-scplaycontrol=pause]").addClass("on");
    });
    scPlayer.bind(SC.Widget.Events.FINISH, function (n) {
        $("[data-scplaycontrol=play]").removeClass("on");
        $("[data-scplaycontrol=pause]").removeClass("on");
    });
    scPlayer.bind(SC.Widget.Events.PLAY_PROGRESS, function (sc) {
        var $scRelative = Math.floor(sc.relativePosition * 100);
        var holdGesture = $(".scInfo .scBar").hasClass("hold");
        if (!holdGesture) {
            scBar($scRelative);
        }
    });

    gameinfo.init();
    return gameinfo;
})(window._abyss.gameinfo || {}, jQuery);

(function(){
    $(document).ready(function() {
        console.log('redady');
    });
})();