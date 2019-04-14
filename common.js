'use strict';
$(document).ready(function () {
    // Setting
    function set(event, target) { 
        function set(flags) {
            tick(flags);
            init(flags);
        }
        // Offset Initial Setting
        var $offset = event.clientX - target.offset().left;
        var $rangeWidth = parseInt($offset / target.width() * 100);
        if ($rangeWidth < 0) {
            set(0);
        } else {
            if ($rangeWidth > 100) {
                set(100);
            } else {
                set($rangeWidth);
            }
        }
    }
    // Init Scroll position and player Seeking to that position's playing
    function init(scrollNum) {
        scPlayer.getDuration(function ($makeWidth) {
            var $scrollAmount = Math.floor($makeWidth * (scrollNum / 100));
            scPlayer.seekTo($scrollAmount);
        });
    }
    // Progress Tick setting
    function tick(tickWidth) {
        var $tick = $(".scInfo .scBar .scProgress");
        var $tickController = $(".scInfo .scBar .scplaycontrol");
        $tick.width(tickWidth + "%");
        $tickController.css("left", tickWidth + "%");
    }
    // Thumbnail setting
    function thumb(data) {
        var $sc = $(".scPlayer");
        var $scThumbElement = $sc.find(".scInfo .scThumb .thumb");
        var $titleField = $sc.find(".scInfo .scThumbCont .scThumbDesc");
        var $playTime = $sc.find(".scInfo .scPlaytime");
        tick(0);
        $sc.addClass("loading");
        $scThumbElement.find("span").removeClass("on");
        $scThumbElement.find("." + data.album).addClass("on");
        $titleField.text(data.title);
        $playTime.text(data.duration);
        $(".scGroupBtn [data-volume]").addClass("on");
    }
    // ActivePlayer
    function activePlayer(id, active) {
        var $idxToMakeActive = id.parent().index();
        $(active).removeClass("on");
        $(active).eq($idxToMakeActive).addClass("on");
    }
    // OtherPlayer Class setting
    function otherPlayer(other) {
        var $idxToMakeOther = other.parent().index();
        var $classesLine = "scplayMusic tab" + ($idxToMakeOther + 1);
        $(".scplayMusic").attr("class", $classesLine);
    }
    // UpdatePlayer Sound
    function updatePlayer(event) {
        var $dataReceived = $(event.target);
        scPlayer.getVolume(function (vols) {
            var volumes = vols;
            if (volumes > 0) {
                scPlayer.setVolume(0);
                $dataReceived.removeClass("on").text("?? off");
            } else {
                scPlayer.setVolume(100);
                $dataReceived.addClass("on").text("?? on");
            }
        });
        event.preventDefault();
    }
    // Play Start
    function start(event) {
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
    }
    // Declare scPlayer variable
    var scPlayer = SC.Widget($(".scMusicPlayer")[0]);
    var json = {
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
    // Indexing Cache and 
    var indexCache = function () {
        var $allAttachPoints = {};
        var $playerList = $(".scPlayer .scPlayList li");
        $playerList.each(function (p, albumTarget) {
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
    }();
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
    $(".scGroupBtn [data-volume]").click(updatePlayer);
    $(".scPlayList li").find("a.scLinkTxt").on("click", function (event) {
        var $btn = $(".scPlayer");
        var $dataReceived = $(".scPlayer .scPlayList li");
        var prev = $(this).parent("li");
        var id = parseInt(prev.index());
        var entry = indexCache[$(this).data("album")][id];
        var $reload = !$btn.hasClass("loading") && !prev.hasClass("on");
        if ($reload) {
            scPlayer.pause();
            scPlayer.load(entry.url, json);
            thumb(entry);
            $dataReceived.removeClass("on");
            prev.addClass("on");
        }
        event.preventDefault();
    });
    scPlayer.bind(SC.Widget.Events.READY, function () {
        thumb(indexCache.balenos[0]);
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
            tick($scRelative);
        }
    });
});