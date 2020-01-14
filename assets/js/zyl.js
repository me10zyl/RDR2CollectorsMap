var zyl = {
    valuable: function () {
        return "金币;银币;硬币;美元;鹰币;镍币;分;戒指;耳环;项链;苏格兰;溪梅;十大;加勒比朗姆酒";
    },
    resetInput: function () {
        $(".input-search").val("")
        $(document.querySelector('.input-search')).trigger('input');
        this.save();
    },
    init: function () {
        this.bindEvents();
        this.loadData();
        this.calcSearch();
        this.calcValuable();
    },
    loadData: function () {
        $(".input-search").val(localStorage['zyl-input']);
        $(document.querySelector('.input-search')).trigger('input');
        $("#hideGottenNumber").val(localStorage['hideGottenNumber']);
        let localSha = $.get('https://api.github.com/repos/me10zyl/RDR2CollectorsMap/branches/master', function (data) {
            console.log('localmaster', data);
            $("#current-sha").text(data.commit.sha)
        });
        let remoteSha = $.get('https://api.github.com/repos/jeanropke/RDR2CollectorsMap/branches/master', function (data) {
            console.log('remotemaster', data);
            $("#remote-sha").text(data.commit.sha)
        });
        Promise.all([localSha, remoteSha]).then((commits) => {
            let local = commits[0];
            let remote = commits[1];
            window.commits = commits
            if (local.commit.commit.committer.date >= remote.commit.commit.committer.date) {
                $("#updated").html("<font color='green'>已更新</font>");
            } else {
                $("#updated").html("<font color='red'>未更新</font>");
            }
            $("#remoteShaDate").text("(Local:" + new Date(local.commit.commit.committer.date).toLocaleString() + ",Remote:" + new Date(remote.commit.commit.committer.date).toLocaleString() + ")")
            $("#remoteMsg").text(remote.commit.commit.message)
        })
    },
    bindEvents: function () {
        $(".input-search,#hideGottenNumber").keyup(function () {
            zyl.save();
        });
        $(".addToMap").each(function () {
            this.addEventListener("click", function (e) {
                var category = $(this).closest('.menu-option').data('type');
                if (!$(this).hasClass('enable')) {
                    $(this).addClass('enable')
                    zyl.addToSearch(category);
                } else {
                    $(this).removeClass('enable');
                    zyl.removeToSearch(category);
                }

                e.stopPropagation()
            })
        });
    },
    save: function () {
        localStorage['zyl-input'] = $(".input-search").val();
        localStorage['hideGottenNumber'] = $("#hideGottenNumber").val();
        this.calcSearch();
    },
    calcCollected: function () {
        console.log('calcCollected')
        var allCategories = zyl.getAllCategories();
        $(".menu-option").each(function (e) {
            var type = $(this).data('type');
            if (allCategories.indexOf(type) > -1) {
                var exist = $(this).find("span+.calcAmount");
                var string = zyl.getCollectedAmountOfCategory(type) + "/" + zyl.getTotalSizeOfCategory(type);
                if (exist.length > 0) {
                    exist.find('.nums').text(string)
                    exist.find('.extraInfo').html(zyl.getExtraInfo(type))
                } else {
                    $(this).find("span").after("<div style='margin-left: 10px' class='calcAmount'><span class='nums'>" + string + "</span><span  class='addToMap'>+</span><span class='extraInfo'></span></div>");
                    $(this).find('.extraInfo').html(zyl.getExtraInfo(type))
                }
            }
        })
    },
    getExtraInfo: function (category) {
        let day = $(".menu-option[data-type=" + category + "] .input-day").val();
        let canCollect = MapBase.markers.filter(e => e.category == category && e.day == day);
        let leftCollect = canCollect.filter(e => e.canCollect);
        let missingItems = zyl.getMissingItemsTypes(category);
        var canCollectAll = true;
        for (var i in missingItems) {
            if (canCollect.filter(e => e.text == missingItems[i] || e.subdata == missingItems[i]).length === 0) {
                canCollectAll = false;
                break;
            }
        }
        var stringCanCollectAll = "<font color='#ffd700'>可收集全</font>"
        if (!canCollectAll) {
            stringCanCollectAll = "<font color='red'>不可收集全</font>"
        }
        return "剩余" + leftCollect.length + "(" + stringCanCollectAll + ")";
    },
    getTotalSizeOfCategory: function (category) {
        return $(".menu-hidden[data-type=" + category + "]").find(".collectible-wrapper").length;
    },

    getAllCategories: function () {
        return ['american_flowers', 'card_cups', 'card_swords', 'card_wands', 'card_pentacles', 'lost_bracelet', 'lost_earrings', 'lost_necklaces', 'lost_ring', 'antique_bottles', 'bird_eggs', 'arrowhead', 'family_heirlooms', 'coin']
    },

    getCategoryValues: function (category) {
        return $(".menu-hidden[data-type=" + category + "] span")[0].textContent.match(/\d+/)[0];
    },

    getCollectedAmountOfCategory: function (category) {
        var amount = 0;
        var subdatas = [];
        $.each(MapBase.markers, function (key, marker) {
            var data = marker.subdata || marker.text;
            if (marker.amount > 0 && marker.category == category && subdatas.indexOf(data) == -1) {
                amount += 1;
                subdatas.push(data);
            }
        });
        return amount;
    },

    removeToSearch: function (category) {
        var split = $(".input-search").val().split(";");
        if (split.length > 0) {
            var titles = this.getMissingItems(category);
            split = split.filter(e => titles.indexOf(e) < 0);
            console.log(titles)
            $(".input-search").val(split.join(";"))
            $(document.querySelector('.input-search')).trigger('input');
        }
        zyl.save();
    },

    getMissingItemsTypes: function (category) {
        /*var markerCollected = {

        }
        var categories = [category];
        $.each( MapBase.markers, function(key, marker){
            if(marker.amount == 0 && categories.indexOf(marker.category) > -1){
                var collectible = marker.subdata || marker.text;
                if(collectible.match(/_\d/)){
                    return true;
                }
                var category = marker.category;
                var title = marker.title;
                markerCollected[collectible] = marker;
            }
        });
        var titles = [];
        $.each(markerCollected, function(k, v){
            var collectible = v.subdata || v.text;
            var title = v.title;
            if(title.indexOf('#') > -1){
                title = title.substring(0, title.indexOf('#')).trim();
            }
            title = collectible == 'hawk' ? '鹰蛋' : title;
            if(titles.indexOf(title) == -1) {
                titles.push(title);
            }
        });*/
        var titles = [];
        $(".menu-option[data-type=" + category + "]+.menu-hidden .collectible-wrapper").each(function () {
            var num = $(this).find(".counter-number").text();
            if (num == 0) {
                titles.push($(this).data('type'));
            }
        })
        return titles;
    },


    getMissingItems: function (category) {
        /*var markerCollected = {

        }
        var categories = [category];
        $.each( MapBase.markers, function(key, marker){
            if(marker.amount == 0 && categories.indexOf(marker.category) > -1){
                var collectible = marker.subdata || marker.text;
                if(collectible.match(/_\d/)){
                    return true;
                }
                var category = marker.category;
                var title = marker.title;
                markerCollected[collectible] = marker;
            }
        });
        var titles = [];
        $.each(markerCollected, function(k, v){
            var collectible = v.subdata || v.text;
            var title = v.title;
            if(title.indexOf('#') > -1){
                title = title.substring(0, title.indexOf('#')).trim();
            }
            title = collectible == 'hawk' ? '鹰蛋' : title;
            if(titles.indexOf(title) == -1) {
                titles.push(title);
            }
        });*/
        var titles = [];
        $(".menu-option[data-type=" + category + "]+.menu-hidden .collectible-wrapper").each(function () {
            var num = $(this).find(".counter-number").text();
            if (num == 0) {
                titles.push($(this).find("p[class=collectible]").text());
            }
        })
        return titles;
    },

    calcSearch: function () {
        var val = $(".input-search").val();
        var split = val.split(';');
        var allCategories = this.getAllCategories();
        for (var i in allCategories) {
            var category = allCategories[i];
            var missingItems = this.getMissingItems(category);
            var allEq = true && (missingItems.length > 0);
            missingItems.forEach(function (e) {
                if (split.indexOf(e) < 0) {
                    allEq = false;
                }
            });
            var find = $(".menu-option[data-type=" + category + "]").find(".addToMap");
            if (allEq) {
                find.addClass('enable');
            } else {
                find.removeClass('enable');
            }
        }
    },

    addToSearch: function (category) {
        var titles = this.getMissingItems(category);
        var val = $(".input-search").val();
        var values = val.split(";");
        if (values.length > 0 && val.trim() != "") {
            titles = titles.filter(function (t) {
                return values.indexOf(t) < 0;
            });
            if (titles.length > 0) {
                $(".input-search").val(val + ";" + titles.join(";"))
            }
        } else {
            $(".input-search").val(titles.join(";"))
        }
        $(document.querySelector('.input-search')).trigger('input');
        zyl.save()
    },

    hideGotten: function () {
        var size = $("#hideGottenNumber").val() || 3;
        var allCategories = this.getAllCategories();
        var titles = [];
        for (var i in allCategories) {
            var category = allCategories[i];
            var missingItems = this.getMissingItems(category);
            if ((zyl.getTotalSizeOfCategory(category) - zyl.getCollectedAmountOfCategory(category)) <= size) {
                titles = titles.concat(missingItems);
            }
        }
        $(".input-search").val(titles.join(";"))
        $(document.querySelector('.input-search')).trigger('input');
        zyl.save()
    },

    menuSaved: function () {
        this.calcCollected();
        this.calcValuable();
    },

    getCategoryName: function (category) {
        return $("[data-text='menu." + category + "']").text();
    },

    calcValuable: function () {
        console.log('calcValuable')
        let allCategories = this.getAllCategories();
        let valuables = [];
        for (let allCategoriesKey in allCategories) {
            let category = allCategories[allCategoriesKey];
            let amount = this.getTotalSizeOfCategory(category) - this.getCollectedAmountOfCategory(category);
            valuables.push({
                category: category,
                amount: amount
            })
        }
        valuables.sort((a, b) => {
            let number = a.amount - b.amount;
            if (number == 0) {
                return zyl.getCategoryValues(b.category) - zyl.getCategoryValues(a.category)
            }
            return number;
        })
        $("#valuable").html(valuables.map(e => (zyl.getCategoryName(e.category) + "(" + e.amount + ")")).join("，"));
    }
}

window.onload = zyl.init.bind(zyl)